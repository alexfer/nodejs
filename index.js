import {v4 as uuidv4} from 'uuid';
import {WebSocketServer} from 'ws';
import scanAll from './scanner.js';
import {Base64} from 'js-base64';
import decrypt from "./decryptor.js";

const port = process.env.WEBSOCKET_PORT;

const wss = new WebSocketServer({
    port: process.env.WEBSOCKET_PORT || 9000,
    perMessageDeflate: false
});

const clients = new Map();

wss.on('connection', (ws) => {
    ws.on('error', console.error);

    const id = uuidv4();
    const metadata = {id};

    clients.set(ws, metadata);

    ws.on('message', (messageAsString) => {
        const data = JSON.parse(messageAsString);

        data.hash = Base64.decode(data.hash);
        data.hash = decrypt(data.hash, process.env.ALGORITHM, process.env.SECRET_KEY);
        const metadata = clients.get(ws);
        data.sender = metadata.id;

        const processRequest = async (data) => {
            const result = await scanAll(data.hash);
            const keys = Object.keys(result);

            [...clients.keys()].forEach((client) => {
                if (client.readyState === ws.OPEN) {
                    client.send(JSON.stringify({
                        hash: data.hash,
                        sender: data.hash,
                        notify: JSON.parse(keys.length > 0 ? result[data.hash] : '[]')
                    }));
                }
            });

        };
        processRequest(data).then(() => void (0));
    });
});

console.log("server started on port: %d", port);