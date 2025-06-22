import type { GameState } from '@core/model/GameState';
import type { IGameNetwork } from './IGameNetwork';
import { SoloServer } from './SoloServer';

export class SoloNetwork implements IGameNetwork {
  private server: SoloServer;
  private tickInterval: any;

  constructor() {
    this.server = new SoloServer();
    this.tickInterval = setInterval(() => this.server.update(0.05), 50); // 20 FPS
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
