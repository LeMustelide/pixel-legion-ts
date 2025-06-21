import { Container, Graphics } from 'pixi.js';
import type { Player } from './model/Player';

export class GameRenderer {
  private container: Container;
  private playerGraphics: Record<string, Graphics> = {};

  constructor(container: Container) {
    this.container = container;
  }

  renderPlayers(players: Record<string, Player>) {
    // Ajoute ou met à jour les joueurs
    for (const [id, player] of Object.entries(players)) {
      let gfx = this.playerGraphics[id];
      if (!gfx) {
        console.log(`Création du joueur ${id}`);
        gfx = new Graphics();
        gfx.rect(-8, -8, 16, 16).fill(0xffffff);
        console.log(this.container.children);
        this.container.addChild(gfx);
        console.log(this.container.children);
        console.log(`Joueur ${id} ajouté`);
        console.log(`Position du joueur ${id} : (${player.x}, ${player.y})`);
        this.playerGraphics[id] = gfx;
      }
      gfx.position.set(player.x, player.y);
      // Optionnel : changer la couleur si c'est le joueur local, etc.
    }
    // Supprime les joueurs disparus
    for (const id of Object.keys(this.playerGraphics)) {
      if (!(id in players)) {
        this.container.removeChild(this.playerGraphics[id]);
        delete this.playerGraphics[id];
      }
    }
  }

  
}
