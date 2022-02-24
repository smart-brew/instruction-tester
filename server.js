const WebSocketServer = require('ws').WebSocketServer;
const cors = require('cors');
const express = require('express');

const PORT = 8000;
const WS_PORT = 8001;

const server = express();

// fix cors
server.use(cors());

// parse application/x-www-form-urlencoded
server.use(express.urlencoded({ extended: false }));

// parse application/json
server.use(express.json());

// serve GUI
server.use(express.static('build'));

// backend server start
server.listen(PORT, () => {
  console.log('HTTP Server is running on PORT:', PORT);
});

// WS start
const wss = new WebSocketServer({ port: WS_PORT }, () => {
  console.log('WS Server is running on PORT:', WS_PORT);
});

const clients = [];

wss.on('connection', (ws) => {
  const wsClient = ws;
  console.log('Client connected');
  clients.push(wsClient);

  wsClient.on('message', (message) => {
    const data = JSON.parse(message.toString());
    wsClient.moduleId = data.isMaster ? 'master' : data.moduleId;
    wsClient.isMaster = data.isMaster;
    console.log('Sprava prijata cez websocket!');
    console.log(data);

    // send message to all children
    if (wsClient.isMaster) {
      clients.forEach((module) => {
        if (module?.moduleId && module?.moduleId == data?.moduleId) {
          console.log('sending to module: ' + module?.moduleId);
          module.send(JSON.stringify(data));
        }
      });
    }

    if (!wsClient.isMaster) {
      clients.forEach((module) => {
        // eslint-disable-next-line eqeqeq
        if (module?.moduleId && module?.moduleId === 'master') {
          console.log('sending to master: ' + module?.moduleId);
          module.send(JSON.stringify(data));
        }
      });
    }
  });

  wsClient.send(
    JSON.stringify({ message: 'WS has succesfully connected to server' })
  );

  wsClient.isAlive = true;
  wsClient.on('pong', () => {
    wsClient.isAlive = true;
  });
});

// keepalive for WS clients
setInterval(() => {
  clients.forEach((client) => {
    const wsClient = client;

    if (!wsClient.isAlive) {
      console.log(
        `Client "${wsClient.moduleId}" not alive, closing websocket!`
      );

      wsClient.terminate();
      const index = clients.indexOf(wsClient);
      if (index > -1) {
        clients.splice(index, 1);
      }
      return;
    }
    wsClient.isAlive = false;
    wsClient.ping();
  });
}, 10000);
