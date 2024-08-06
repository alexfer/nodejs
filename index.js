const redis = require('redis');
const port = process.env.WEBSOCKET_PORT;
const path = process.env.REDIS_PATH;

const client = redis.createClient({
    socket: {
        path: path
    }
});

let collection = {};

const scan = async (match = '*') => {
    await client.connect();
    console.info('Connected to Redis server');
    const keys = await client.sendCommand(["keys", match]);

    for (const [key, value] of Object.entries(keys)) {
        const val = await client.get(value);
        collection[key] = JSON.parse(val);
    }

    await client.quit();
    console.info('Disconnected');
}

const WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({port: port});

console.log('Server started on port: ' + port);

wss.onmessage = (event) => {
    console.log(`Received ${event.data}`);
};
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        let data = JSON.parse(message);
        scan(data.omit + ':*').then(() => console.log(`Scan complete`));
        ws.send(JSON.stringify(collection));
    });
});