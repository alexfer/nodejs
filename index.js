let keys = {};
let cursor = '0';
const redis = require('redis');
const port = process.env.WEBSOCKET_PORT || 3000;
const client = redis.createClient({
    socket: {
        path: process.env.REDIS_PATH
    }
});
const scan = async (match = '*') => {
    await client.connect();
    console.log('Connected to Redis server...');
    await client.keys('mess:*', function (err, k) {
        if (err) return console.log(err);

        for(let i = 0, len = k.length; i < len; i++) {
            console.log(k[i]);
            keys[k[i]] = k[i];
        }
    });
    await client.quit();
    console.log('Disconnected!');
    return keys;
}

const WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({port: port});

console.log('Server started on port: ' + port);

wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        scan('mess_').then((result, keys) => {
            console.log(result, keys);
        });
        ws.send('Websocket server received from client: ' + message);
    });
});