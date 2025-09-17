import { GameRenderer } from "./GameRenderer";
import { RenderPlayer } from "./RenderPlayer";
import type { GameState } from "./model/GameState";
import { Player } from "./model/Player";

export class StateSynchronizer {
  private renderer: GameRenderer;
  private renderPlayers: Record<string, RenderPlayer>;

  constructor(renderer: GameRenderer, renderPlayers: Record<string, RenderPlayer>) {
    this.renderer = renderer;
    this.renderPlayers = renderPlayers;
  }

  sync(state: GameState) {
    // Ajoute ou met à jour les RenderPlayer
    for (const [playerId, playerData] of Object.entries(state.players)) {
      if (!this.renderPlayers[playerId]) {
        this.renderPlayers[playerId] = new RenderPlayer(playerData);
      } else {
        // Met à jour seulement la position pour le smoothing
        this.renderPlayers[playerId].updateServerPosition(playerData.x, playerData.y);
        
        // Met à jour les autres propriétés sans écraser la référence si pas nécessaire
        if (this.renderPlayers[playerId].playerRef.selected !== playerData.selected) {
          this.renderPlayers[playerId].playerRef.selected = playerData.selected;
        }
        
        this.renderPlayers[playerId].playerRef = Player.fromSerialized(playerData);
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

