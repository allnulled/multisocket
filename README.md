# multisocket

Manage socket.io and socket.io-client communications and events from the same JavaScript class.

## Installation

```sh
npm i -s @allnulled/multisocket
```

## Usage

```js
const Multisocket = require('@allnulled/multisocket');

const $msServer = new Multisocket(true, 3000);
Configure_server: {
  $msServer.server.register('test', (data, $eventClient) => {
    $eventClient.send({
      type: 'response',
      message: 'Respuesta del servidor'
    });
  });
}

const $msClient = new Multisocket(false, 3000, 'http://localhost:3000');
Configure_client: {
  $msClient.client.register('response', (data) => {
    console.log('Cliente recibió:', data);
  });
}

Hello: {
  $msClient.client.send({
    type: 'test',
    message: '¡Hola servidor!'
  });
}
```

## API

```js
class MultisocketClient {

  constructor(multisocket) {
    this.multisocket = multisocket;
    this.events = {};
  }

  send(data, headers = {}) {
    this.multisocket.socketClient.emit("MultisocketEvent", { data, headers, });
  }

  register(eventType, dispatcher) {
    if(!(eventType in this.events)) {
      this.events[eventType] = [];
    }
    this.events[eventType].push(dispatcher);
  }

  dispatch(eventItem) {
    if(typeof eventItem === "string") {
      console.log("MultisocketEvent on client of type message: " + eventItem);
    } else {
      // @TODO: complete
      if (eventItem && eventItem.data) {
        const eventType = eventItem.data.type;
        if (eventType in this.events) {
          this.events[eventType].forEach(dispatcher => dispatcher.call(this, eventItem.data));
        }
      }
    }
  }

}

class MultisocketServer {

  constructor(multisocket) {
    this.multisocket = multisocket;
    this.events = {};
  }

  send(data, headers = {}) {
    this.multisocket.socketClient.emit("MultisocketEvent", { data, headers, });
  }

  register(eventType, dispatcher) {
    if(!(eventType in this.events)) {
      this.events[eventType] = [];
    }
    this.events[eventType].push(dispatcher);
  }

  dispatch(eventItem, socketClient) {
    if(typeof eventItem === "string") {
      console.log("MultisocketEvent on server of type message: " + eventItem);
    } else {
      // @TODO: complete
      if (eventItem && eventItem.data) {
        const eventType = eventItem.data.type;
        if (eventType in this.events) {
          this.events[eventType].forEach(dispatcher => dispatcher.call(this, eventItem.data, socketClient));
        }
      }
    }
  }

}

class MultisocketServerEventClient {

  constructor(multisocket, serverEventClient) {
    this.multisocket = multisocket;
    this.events = {};
    this.client = serverEventClient;
  }

  send(data, headers = {}) {
    this.client.emit("MultisocketEvent", { data, headers, });
  }

  register(eventType, dispatcher) {
    if(!(eventType in this.events)) {
      this.events[eventType] = [];
    }
    this.events[eventType].push(dispatcher);
  }

  dispatch(eventItem, socketClient) {
    if(typeof eventItem === "string") {
      console.log("MultisocketEvent on server of type message: " + eventItem);
    } else {
      // @TODO: complete
      if (eventItem && eventItem.data) {
        const eventType = eventItem.data.type;
        if (eventType in this.events) {
          this.events[eventType].forEach(dispatcher => dispatcher.call(this, eventItem.data, socketClient));
        }
      }
    }
  }

}

class Multisocket {
  constructor(isServer = false, port = 3000, serverUrl = '') {
    this.isServer = isServer;
    this.port = port;
    this.serverUrl = serverUrl;

    // Propiedades para los objetos de servidor HTTP, servidor Socket.io y cliente Socket.io
    this.httpServer = null;
    this.socketServer = null;
    this.socketClient = null;
    this.client = new MultisocketClient(this);
    this.server = new MultisocketServer(this);

    if (this.isServer) {
      this.startServer();
    } else {
      this.startClient();
    }
  }

  // Inicia el servidor socket.io
  startServer() {
    this.httpServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Servidor en ejecución');
    });

    this.socketServer = socketIo(this.httpServer);

    this.socketServer.on('connection', (socket) => {
      console.log('Cliente conectado');
      socket.on('MultisocketEvent', (data) => {
        console.log('Mensaje del cliente:', data);
        const temporaryClient = new MultisocketServerEventClient(this, socket);
        this.server.dispatch(data, temporaryClient);
      });

      socket.emit('MultisocketEvent', '¡Hola desde el servidor!');

      socket.on('disconnect', () => {
        console.log('Cliente desconectado');
      });
    });

    this.httpServer.listen(this.port, () => {
      console.log(`Servidor escuchando en http://localhost:${this.port}`);
    });
  }

  // Inicia el cliente socket.io
  startClient() {
    this.socketClient = ioClient(this.serverUrl);

    this.socketClient.on('connect', () => {
      console.log('Conectado al servidor');
      this.socketClient.emit('MultisocketEvent', '¡Hola desde el cliente!');
    });

    this.socketClient.on('MultisocketEvent', (data) => {
      console.log('Mensaje del servidor:', data);
      this.client.dispatch(data);
    });

    this.socketClient.on('connect_error', (err) => {
      console.error('Error de conexión:', err);
    });
  }
}

Multisocket.default = Multisocket;

module.exports = Multisocket;
```