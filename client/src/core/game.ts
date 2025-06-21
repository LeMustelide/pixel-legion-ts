import { Application } from 'pixi.js';
import { GameRenderer } from './GameRenderer';
import type { GameState } from './model/GameState';
import type { IGameNetwork } from './network/IGameNetwork';

export class Game {
  app: Application;
  renderer: GameRenderer;
  network: IGameNetwork;
  private stateCallback: ((state: GameState) => void) | null = null;

  constructor(container: HTMLDivElement, network: IGameNetwork) {
    this.app = new Application();
    this.renderer = new GameRenderer(this.app.stage);
    this.network = network;
    this.init(container);
  }

  setNetwork(network: IGameNetwork) {
    this.network = network;
    // Rebranche le callback d'état si déjà défini
    if (this.stateCallback) {
      this.network.onState(this.stateCallback);
    }
  }

  private async init(container: HTMLDivElement) {
    await this.app.init({backgroundColor: 0x000000, resizeTo: container});
    container.appendChild(this.app.canvas);

    this.network.onState((state: GameState) => this.syncState(state));

    this.app.ticker.add((dt) => this.update(dt.elapsedMS / 1000));
    this.app.ticker.maxFPS = 60;
    this.setupInput();
  }

  private syncState(state: GameState) {
    this.renderer.renderPlayers(state.players);
    // Sauvegarde le callback pour pouvoir le rebrancher
    this.stateCallback = (s) => this.syncState(s);
  }

  private setupInput() {
    this.app.canvas.addEventListener('click', (evt) => {
      const rect = this.app.canvas.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      this.network.sendAction({ type: 'move', payload: { x, y } });
    });
  }

  private update(dt: number) {
    // Animation du déplacement en solo
    if (typeof (this.network as any).update === 'function') {
      (this.network as any).update(dt);
    }
  }
}
