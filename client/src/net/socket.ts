import { io, Socket } from 'socket.io-client';
import type { GameState } from '@core/model/GameState';

let socket: Socket;

export function connect() {
  if (socket) {
    console.warn('Socket déjà connecté');
    return socket;
  }
  if (!import.meta.env.VITE_SERVER_URL) {
    throw new Error('VITE_SERVER_URL n\'est pas défini dans l\'environnement');
  }
  socket = io(import.meta.env.VITE_SERVER_URL as string);

  socket.on('connect', () => {
    console.log('Connecté au serveur, id=', socket.id);
  });

  return socket;
}

export function onState(cb: (state: GameState) => void) {
  socket.on('state', cb);
}

export function sendAction(action: any) {
  socket.emit('action', action);
}
