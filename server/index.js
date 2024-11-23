import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import 'dotenv/config';

import { configureSocket } from './src/config/socket.js';
import { setupSocketHandlers } from './src/handlers/socketHandlers.js';

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
const io = configureSocket(httpServer);
setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});