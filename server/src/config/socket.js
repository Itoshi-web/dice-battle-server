import { Server } from 'socket.io';

export function configureSocket(httpServer) {
  return new Server(httpServer, {
    cors: {
      origin: [
        'https://lambent-nasturtium-dbb11c.netlify.app',
        'http://localhost:5173'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket']
  });
}