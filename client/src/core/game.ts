import { Application, Graphics, Assets, Sprite } from 'pixi.js';
import { onState, sendAction } from '@net/socket';
import type { Player } from './model/Player';

interface GameState {
  players: Record<string, Player>;
}

export class Game {
  app: Application;
  units: Record<string, Graphics> = {};

  constructor(container: HTMLDivElement) {
    this.app = new Application();
    this.init(container);
  }

  private async init(container: HTMLDivElement) {
    await this.app.init({backgroundColor: 0x000000, resizeTo: container});

    container.appendChild(this.app.canvas);

    // Écoute du state venant du serveur
    // onState((state: any) => this.syncState(state));

    // Boucle de rendu
    this.app.ticker.add((dt) => this.update(dt.elapsedMS / 1000));
    this.app.ticker.maxFPS = 60; // Limite à 60 FPS

    // Input souris / clavier
    this.setupInput();
  }

  private syncState(state: GameState) {
    // Met à jour/crée les unités
    for (const [id, { x, y }] of Object.entries(state.players)) {
      if (!this.units[id]) {
        const gfx = new Graphics();
        gfx.beginFill(0x00ff00).drawRect(-4, -4, 8, 8).endFill();
        this.app.stage.addChild(gfx);
        this.units[id] = gfx;
      }
      this.units[id].position.set(x, y);
    }
    // Supprime les unités disparues
    for (const id of Object.keys(this.units)) {
      if (!(id in state.players)) {
        this.app.stage.removeChild(this.units[id]);
        delete this.units[id];
      }
    }
  }

  private setupInput() {
    this.app.canvas.addEventListener('click', (evt) => {
      const rect = this.app.canvas.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      sendAction({ type: 'move', payload: { x, y } });
    });
  }

  private update(dt: number) {
    // Exemple : gestion locale, effets, particules, etc.
  }
}
