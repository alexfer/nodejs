const port = process.env.PORT || 3000;

const WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({port: port});

console.log('Server started on port: ' + port);

wss.on('connection', function (ws) {
    console.log('Connection started');
    ws.on('message', function (message) {
        console.log('Received from client: %s', message);
        ws.send('Server received from client: ' + message);
    });
});