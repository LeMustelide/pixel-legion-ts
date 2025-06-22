import express from 'express';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { GameService } from 'pixel-legion-game-logic';
import Redis from 'ioredis';

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
const rooms = new Map<string, GameService>();

io.on('connection', socket => {
    socket.on('join', roomId => {
      socket.join(roomId);
      if (!rooms.has(roomId)) {
        const svc = new GameService(
          state => io.to(roomId).emit('state', state),
          () => {}  // en multi, c’est le socket qui émet ses actions
        );
        rooms.set(roomId, svc);
      }
      rooms.get(roomId)!.addPlayer(socket.id);
    });

    socket.on('action', action => {
      for (const [roomId, svc] of rooms) {
        if (socket.rooms.has(roomId)) {
          svc.handleAction(socket.id, action);
        }
      }
    });

    socket.on('disconnect', () => {
      for (const [roomId, svc] of rooms) {
        svc.removePlayer(socket.id);
        if (svc.isEmpty()) {
          svc.dispose();
          rooms.delete(roomId);
        }
      }
    });
  });

export { app, httpServer };
