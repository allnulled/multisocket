const Multisocket = require('./multisocket');

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