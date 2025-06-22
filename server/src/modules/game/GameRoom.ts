// src/modules/game/GameRoom.ts

import { Server } from 'socket.io';
import { GameAction } from './dtos/actions';
import { MoveHandler } from './handlers/MoveHandler';

import { GameState } from './domain/GameState';
import { Player } from './domain/Player';

export class GameRoom {
  private handlers: Record<string, any>;
  private state = new GameState();
  private tickInterval: NodeJS.Timeout;
  private lastTickTime: number = Date.now();

  constructor(private roomId: string, private io: Server) {
    // Instancie tous tes handlers dans une map
    this.handlers = {
      move:   new MoveHandler(),
    };

    // Boucle de simulation
    this.tickInterval = setInterval(() => this.tick(), 100);
  }

  addPlayer(socket: any) {
    this.state.addPlayer(socket.id);
    this.emitState();
  }

  removePlayer(socketId: string) {
    this.state.removePlayer(socketId);
  }

  /** Appelée par socket.on('action', action) */
  handleAction(clientId: string, action: GameAction) {
    const handler = this.handlers[action.type];
    if (handler) handler.handle(this, clientId, action);
  }  private tick() {
    const now = Date.now();
    const dt = (now - this.lastTickTime) / 1000; // Temps réel écoulé en secondes
    this.lastTickTime = now;
    
    this.state.updatePhysics(dt);    // collisions, IA, etc.
    this.emitState();
  }

  private emitState() {
    this.io.to(this.roomId).emit('state', this.state.snapshot());
  }

  /** Helpers pour les handlers */
  getPlayer(id: string): Player | null {
    return this.state.getPlayer(id);
  }

  close() {
    clearInterval(this.tickInterval);
  }

  isEmpty() {
    return this.state.isEmpty();
  }
}
