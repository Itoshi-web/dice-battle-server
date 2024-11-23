import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors({
  origin: [
    'https://lambent-nasturtium-dbb11c.netlify.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

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

// ... rest of your socket.io logic ...

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});