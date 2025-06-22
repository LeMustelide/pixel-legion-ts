import type { GameState } from '@core/model/GameState';
import type { IGameNetwork } from './IGameNetwork';
import { SoloServer } from './SoloServer';

export class SoloNetwork implements IGameNetwork {
  private server: SoloServer;
  private tickInterval: any;
  private lastTickTime: number = Date.now();

  constructor() {
    this.server = new SoloServer();
    this.tickInterval = setInterval(() => this.tick(), 100); // Même fréquence que le serveur multi
  }
  private tick() {
    const now = Date.now();
    const dt = (now - this.lastTickTime) / 1000; // Temps réel en secondes
    this.lastTickTime = now;
    this.server.update(dt);
  }

  close(): void {
    clearInterval(this.tickInterval);
  }

  joinRoom(roomId: string): void {
    throw new Error('Method not implemented.');
  }

  onState(cb: (state: GameState) => void) {
    console.log(cb);
    this.server.onState(cb);
  }

  sendAction(action: any) {
    console.log('Sending action:', action);
    this.server.handleAction(action);
  }
}
