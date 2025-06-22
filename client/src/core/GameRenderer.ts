import { Container, Graphics } from 'pixi.js';
import type { Player } from './model/Player';
import { RenderPlayer } from './RenderPlayer';

export class GameRenderer {
  private container: Container;
  private playerGraphics: Record<string, Graphics> = {};

  constructor(container: Container) {
    this.container = container;
  }
  renderPlayers(players: Record<string, RenderPlayer>) {
    // Ajoute ou met à jour les joueurs
    for (const [id, player] of Object.entries(players)) {
      let gfx = this.playerGraphics[id];
      if (!gfx) {
        gfx = new Graphics();
        gfx.rect(-8, -8, 16, 16).fill(0xffffff);
        this.container.addChild(gfx);
        this.playerGraphics[id] = gfx;
      }
      
      // Force les positions flottantes pour un rendu plus smooth
      // Utilise directement les propriétés x/y au lieu de position.set()
      gfx.x = player.renderX;
      gfx.y = player.renderY;
    }
    // Supprime les joueurs disparus
    for (const id of Object.keys(this.playerGraphics)) {
      if (!(id in players)) {
        this.container.removeChild(this.playerGraphics[id]);
        delete this.playerGraphics[id];
      }
    }
  }

  removePlayer(id: string) {
    const gfx = this.playerGraphics[id];
    if (gfx) {
      this.container.removeChild(gfx);
      delete this.playerGraphics[id];
    }
  }
}
