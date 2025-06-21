import { io, Socket } from 'socket.io-client';

export interface ServerState {
  players: Record<string, { x: number; y: number }>;
  // … autres données de jeu
}

let socket: Socket;

export function connect() {
  socket = io(import.meta.env.VITE_SERVER_URL as string);

  socket.on('connect', () => {
    console.log('Connecté au serveur, id=', socket.id);
  });

  return socket;
}

export function onState(cb: (state: ServerState) => void) {
  socket.on('state', cb);
}

export function sendAction(action: any) {
  socket.emit('action', action);
}
