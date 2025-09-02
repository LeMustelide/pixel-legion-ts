import { GameRenderer } from "./GameRenderer";
import { RenderPlayer } from "./RenderPlayer";
import type { GameState } from "./model/GameState";

export class StateSynchronizer {
  private renderer: GameRenderer;
  private renderPlayers: Record<string, RenderPlayer>;

  constructor(renderer: GameRenderer, renderPlayers: Record<string, RenderPlayer>) {
    this.renderer = renderer;
    this.renderPlayers = renderPlayers;
  }

  sync(state: GameState) {
    // Ajoute ou met à jour les RenderPlayer
    for (const [id, player] of Object.entries(state.players)) {
      if (!this.renderPlayers[id]) {
        this.renderPlayers[id] = new RenderPlayer(player);
      } else {
        // Met à jour seulement la position pour le smoothing
        this.renderPlayers[id].updateServerPosition(player.x, player.y);

        // Met à jour les autres propriétés sans écraser la référence si pas nécessaire
        if (this.renderPlayers[id].ref.selected !== player.selected) {
          this.renderPlayers[id].ref.selected = player.selected;
        }

        this.renderPlayers[id].ref.pixelGroups = player.pixelGroups;
      }
    }

    // Supprime les RenderPlayer obsolètes
    for (const id of Object.keys(this.renderPlayers)) {
      if (!(id in state.players)) {
        // Nettoie aussi le rendu graphique
        this.renderer.removePlayer(id);
        delete this.renderPlayers[id];
      }
    }
  }
}

