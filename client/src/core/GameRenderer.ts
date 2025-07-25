import { Container, Graphics } from 'pixi.js';
import { RenderPlayer } from './RenderPlayer';
import { SimplePixel } from './model/PixelPool';
import type { PixelGroup } from './model/PixelGroup';

export class GameRenderer {
  private container: Container;
  private playerGraphics: Record<string, Graphics> = {};
  private pixelGraphics: Map<SimplePixel, Graphics> = new Map();

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

  /** Rendre tous les PixelGroups d'un joueur */
  renderPlayerPixels(renderPlayer: RenderPlayer) {
    if (!renderPlayer.ref.pixelGroups || renderPlayer.ref.pixelGroups.length === 0) {
      return;
    }

    renderPlayer.ref.pixelGroups.forEach((group: PixelGroup) => {
      this.renderPixelGroup(group);
    });
  }

  /** Rendre un PixelGroup entier */
  private renderPixelGroup(group: PixelGroup) {
    group.pixels.forEach((pixel: SimplePixel) => {
      this.renderPixel(pixel);
    });
  }

  /** Rendre un pixel individuel */
  private renderPixel(pixel: SimplePixel) {
    let gfx = this.pixelGraphics.get(pixel);
    
    if (!gfx) {
      // Créer un nouveau graphique pour ce pixel
      gfx = new Graphics();
      gfx.circle(0, 0, 3); // Rayon de 3 pixels
      gfx.fill(pixel.color);
      
      this.container.addChild(gfx);
      this.pixelGraphics.set(pixel, gfx);
    }

    // Mettre à jour la position
    gfx.x = pixel.x;
    gfx.y = pixel.y;
  }

  /** Nettoyer les pixels qui ne sont plus utilisés par aucun joueur */
  cleanupPixels(allRenderPlayers: Record<string, RenderPlayer>) {
    const activePixels = new Set<SimplePixel>();
    // Récupérer tous les pixels actifs de tous les joueurs
    for (const renderPlayer of Object.values(allRenderPlayers)) {
      if (renderPlayer.ref.pixelGroups) {
        renderPlayer.ref.pixelGroups.forEach((group: PixelGroup) => {
          group.pixels.forEach((pixel: SimplePixel) => {
            activePixels.add(pixel);
          });
        });
      }
    }
    // Supprimer les graphiques des pixels inactifs
    for (const [pixel, gfx] of this.pixelGraphics.entries()) {
      if (!activePixels.has(pixel)) {
        this.container.removeChild(gfx);
        gfx.destroy();
        this.pixelGraphics.delete(pixel);
      }
    }
  }
  /** Nettoyer tous les pixels d'un joueur spécifique */
  removePlayerPixels(renderPlayer: RenderPlayer) {
    if (!renderPlayer.ref.pixelGroups) return;

    renderPlayer.ref.pixelGroups.forEach((group: PixelGroup) => {
      group.pixels.forEach((pixel: SimplePixel) => {
        const gfx = this.pixelGraphics.get(pixel);
        if (gfx) {
          this.container.removeChild(gfx);
          gfx.destroy();
          this.pixelGraphics.delete(pixel);
        }
      });
    });
  }
}
