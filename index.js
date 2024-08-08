const redis = require('redis');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');

const port = process.env.WEBSOCKET_PORT;
const path = process.env.REDIS_PATH;

const client = redis.createClient({
    socket: {
        path: path
    }
});

const scan = async (match = '*') => {
    await client.connect();
    //console.info('Connected to Redis server');
    const keys = await client.sendCommand(["keys", match + ':*']);
    const count = keys.keys();
    const buffer = {};
    for (const [key, value] of Object.entries(keys)) {
        const val = await client.get(value);
        const data = value.split(':');
        buffer[data[0]] = val;
    }
    await client.quit();
    //console.info('Redis disconnected');
    return buffer;
}

const wss = new WebSocket.Server({port: port});
const clients = new Map();

console.log('Server started on port: %d', port);

wss.on('connection', (ws) => {
    const id = uuidv4();
    const metadata = {id};

    clients.set(ws, metadata);

    ws.on('message', (messageAsString) => {
        const data = JSON.parse(messageAsString);
        const metadata = clients.get(ws);
        data.sender = metadata.id;

        const processRequest = async (data) => {
            const result = await scan(data.hash);
            const keys = Object.keys(result);

            [...clients.keys()].forEach((client) => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify({
                        hash: data.hash,
                        sender: data.hash,
                        notify: JSON.parse(keys.length > 0 ? result[data.hash] : '[]')
                    }));
                }
            });
        };
        processRequest(data).then(() => void(0));
    });
});
console.log("wss up");