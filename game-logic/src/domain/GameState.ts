// src/modules/game/domain/GameState.ts

import type { ServerState } from "../dtos/ServerStates";
import { Player } from "./Player";

export class GameState {
  private players = new Map<string, Player>();

  addPlayer(id: string) {
    this.players.set(id, new Player(id));
  }

  removePlayer(id: string) {
    this.players.delete(id);
  }

  getPlayer(id: string): Player | null {
    return this.players.get(id) || null;
  }

  getPlayers() {
    return this.players;
  }
  /** appelée à chaque tick */
  updatePhysics(dt: number) {
    for (const player of this.players.values()) {
      player.update(dt); // dt = temps écoulé en secondes depuis le dernier tick
      
      // Mise à jour des mouvements : mettre à jour d'abord les groupes (déplacement global),
      // puis les pixels organiques à l'intérieur des groupes (appelé depuis update()).
      for (const pixelGroup of player.pixelGroups) {
        // PixelGroup now exposes update(dt) which handles group translation + pixel updates
        (pixelGroup as any).update(dt);
      }
    }
  }

  /** sérialise l’état pour le client */
  snapshot(): ServerState {
    return {
      players: Object.fromEntries(
        Array.from(this.players.entries()).map(([id, p]) => [
          id,
          {
            // Include the player id so the client can reconstruct Player.id
            id,
            x: p.x,
            y: p.y,
            pixelGroups: p.pixelGroups.map(pg => ({
              id: pg.id,
              pixelCount: pg.pixelCount,
              pixels: pg.pixels.map(pixel => ({
                x: pixel.x,
                y: pixel.y,
                color: pixel.color,
              })),
              distributionType: pg.distributionType,
            })),
          },
        ])
      ),
    };
  }

  isEmpty() {
    return this.players.size === 0;
  }
}
