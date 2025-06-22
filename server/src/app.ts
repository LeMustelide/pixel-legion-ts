import express from 'express';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { GameRoom } from './modules/game/GameRoom';

const app = express();
app.use(express.json());              // pour parser les JSON body si besoin
app.use(express.static('public'));    // tes assets front éventuels

// HTTP + WebSocket
const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: '*' },             // à restreindre en prod
});

// Redis Adapter pour le scale-out
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const pubClient = new Redis(REDIS_PORT, REDIS_HOST);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

// Gestion des rooms
const rooms = new Map<string, GameRoom>();

io.on('connection', (socket) => {
  console.log(`🔌 ${socket.id} connecté`);

  socket.on('join', (roomId: string) => {
    console.log(`🔍 ${socket.id} rejoint la room ${roomId}`);
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new GameRoom(roomId, io));
    }
    rooms.get(roomId)!.addPlayer(socket);
  });

  socket.on('action', (action) => {
    // on récupère la room (autre que la room "socket.id")
    const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (roomId && rooms.has(roomId)) {
      rooms.get(roomId)!.handleAction(socket.id, action);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ ${socket.id} déconnecté`);
    // cleanup
    for (const [roomId, room] of rooms.entries()) {
      room.removePlayer(socket.id);
      if (room.isEmpty()) {
        room.close();
        rooms.delete(roomId);
      }
    }
  });
});

export { app, httpServer };
