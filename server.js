import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors({
  origin: [
    'https://lambent-nasturtium-dbb11c.netlify.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
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

// Game state management
const rooms = new Map();
const playerSessions = new Map();

function initializeGameState(players) {
  return {
    players: players.map(p => ({
      id: p.id,
      username: p.username,
      eliminated: false,
      firstMove: true,
      cells: Array(players.length).fill().map(() => ({
        stage: 0,
        isActive: false,
        bullets: 0
      }))
    })),
    currentPlayer: 0,
    lastRoll: null,
    gameLog: [{
      type: 'firstMove',
      player: players[0].username,
      message: `${players[0].username}'s turn! Roll a 1 to start.`
    }]
  };
}

// Socket handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('rejoinRoom', ({ roomId, username }) => {
    const session = playerSessions.get(username);
    if (session && rooms.has(session.roomId)) {
      const room = rooms.get(session.roomId);
      const playerIndex = room.players.findIndex(p => p.username === username);
      
      if (playerIndex !== -1) {
        room.players[playerIndex].id = socket.id;
        socket.join(roomId);
        socket.emit('rejoinSuccess', { room });
        socket.to(roomId).emit('playerRejoined', { username });
      }
    }
  });

  socket.on('quickMatch', ({ username }) => {
    let availableRoom = null;
    for (const [roomId, room] of rooms.entries()) {
      if (!room.started && room.players.length < room.maxPlayers && !room.password) {
        availableRoom = room;
        break;
      }
    }

    if (!availableRoom) {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      availableRoom = {
        id: roomId,
        maxPlayers: 4,
        password: null,
        players: [],
        started: false
      };
      rooms.set(roomId, availableRoom);
    }

    availableRoom.players.push({
      id: socket.id,
      username,
      ready: false
    });

    socket.join(availableRoom.id);
    socket.emit('roomCreated', { room: availableRoom });
    socket.to(availableRoom.id).emit('playerJoined', { room: availableRoom });

    playerSessions.set(username, {
      socketId: socket.id,
      roomId: availableRoom.id
    });
  });

  socket.on('createRoom', ({ maxPlayers, password, username }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = {
      id: roomId,
      maxPlayers,
      password,
      players: [{
        id: socket.id,
        username,
        ready: false
      }],
      started: false
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit('roomCreated', { room });

    playerSessions.set(username, {
      socketId: socket.id,
      roomId
    });
  });

  socket.on('joinRoom', ({ roomId, password, username }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.started) {
      socket.emit('error', { message: 'Game already started' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    if (room.password && room.password !== password) {
      socket.emit('error', { message: 'Invalid password' });
      return;
    }

    room.players.push({
      id: socket.id,
      username,
      ready: false
    });

    socket.join(roomId);
    io.to(roomId).emit('playerJoined', { room });

    playerSessions.set(username, {
      socketId: socket.id,
      roomId
    });
  });

  socket.on('toggleReady', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.ready = !player.ready;
      io.to(roomId).emit('roomUpdated', { room });
    }
  });

  socket.on('startGame', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.players.length < 2) {
      socket.emit('error', { message: 'Not enough players' });
      return;
    }

    if (!room.players.every(p => p.ready)) {
      socket.emit('error', { message: 'Not all players are ready' });
      return;
    }

    room.started = true;
    room.gameState = initializeGameState(room.players);
    io.to(roomId).emit('gameStarted', { gameState: room.gameState });
  });

  socket.on('gameAction', ({ roomId, action, data }) => {
    const room = rooms.get(roomId);
    if (!room || !room.started) return;

    // Process game action and update state
    io.to(roomId).emit('gameStateUpdated', { gameState: room.gameState });
  });

  socket.on('sendEmote', ({ roomId, emote }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      socket.to(roomId).emit('emote', {
        username: player.username,
        emote
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit('playerLeft', {
            room,
            username: player.username
          });
        }
        break;
      }
    }
  });
});

// Root route to handle requests to '/'
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Dice Battle Server!');
});

// Health check endpoint for deployment
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
