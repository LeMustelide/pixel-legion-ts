// src/modules/game/domain/GameState.ts

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
    }
  }

  /** sérialise l’état pour le client */
  snapshot() {
    return {
      players: Object.fromEntries(
        Array.from(this.players.entries()).map(([id, p]) => [
          id,
          {
            x: p.x,
            y: p.y,
            pixelGroups: p.pixelGroups.map(pg => ({
              pixelCount: pg.pixelCount,
              pixels: pg.pixels.map(pixel => ({
                x: pixel.x,
                y: pixel.y,
                color: pixel.color,
              })),
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
