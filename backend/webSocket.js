// webSocket.js
const WebSocket = require('ws');

let wss;

const initializeWebSocketServer = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
      console.log('Received:', message);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
};

const broadcastRandomNumber = (randomNumber) => {
  if (!wss) {
    console.error('WebSocket server not initialized');
    return;
  }
  console.log(`Broadcasting random number: ${randomNumber}`);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
        // console.log("client information: ", client);
      client.send(JSON.stringify({ type: 'RANDOM_NUMBER', data: randomNumber }));
    }
  });
};

module.exports = {
  initializeWebSocketServer,
  broadcastRandomNumber
};
