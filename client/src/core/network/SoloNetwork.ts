import type { GameState } from '@core/model/GameState';
import type { IGameNetwork } from './IGameNetwork';
import { SoloServer } from './SoloServer';

export class SoloNetwork implements IGameNetwork {
  private server: SoloServer;

  constructor() {
    this.server = new SoloServer();
  }

  onState(cb: (state: GameState) => void) {
    console.log(cb);
    this.server.onState(cb);
  }

  sendAction(action: any) {
    console.log('Sending action:', action);
    this.server.handleAction(action);
  }

  update(dt: number) {
    this.server.update(dt);
  }
}
