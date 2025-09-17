// src/modules/game/domain/GameState.ts

import type { ServerState } from "../dtos/ServerStates";
import { Player } from "./Player";
import { GameConfig } from "../config/GameConfig";
import { PixelGroup } from "./PixelGroup";

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
    // 1. Mouvements
    for (const player of this.players.values()) {
      player.update(dt);
      for (const pixelGroup of player.pixelGroups) {
        (pixelGroup as any).update(dt);
      }
    }

    // 2. Combat automatique entre groupes de joueurs différents
    this.processGroupCombat(dt);

    // 3. Nettoyage : retirer les groupes détruits
    for (const player of this.players.values()) {
      if (player.pixelGroups.length === 0) continue;
      player.pixelGroups = player.pixelGroups.filter(g => !g.destroyed);
    }
  }

  private processGroupCombat(dt: number) {
    const playersArray = Array.from(this.players.values());
    if (playersArray.length < 2) return; // pas de combat solo

    const range = GameConfig.ATTACK.RANGE;
    const pixelFactor = GameConfig.ATTACK.PIXEL_DAMAGE_FACTOR;
    const maxLossPerTick = GameConfig.ATTACK.MAX_PIXEL_LOSS_PER_TICK;

    // Pour éviter double comptage, on crée une liste de toutes les paires inter-joueurs
    for (let i = 0; i < playersArray.length; i++) {
      const pa = playersArray[i];
      for (let j = i + 1; j < playersArray.length; j++) {
        const pb = playersArray[j];
        // Examine chaque pair de groupes actifs
        for (const ga of pa.pixelGroups) {
          if (ga.destroyed || ga.pixelCount <= 0) continue;
          for (const gb of pb.pixelGroups) {
            if (gb.destroyed || gb.pixelCount <= 0) continue;
            const dist = ga.distanceTo(gb);
            if (dist <= range) {
              this.resolveGroupVsGroup(ga, gb, dt, pixelFactor, maxLossPerTick);
            }
          }
        }
      }
    }
  }

  private resolveGroupVsGroup(
    ga: PixelGroup,
    gb: PixelGroup,
    dt: number,
    pixelFactor: number,
    maxLossPerTick: number
  ) {
    // Nouvelle formule proportionnelle : dégâts = pixelCount * factor
    let damageToB = ga.pixelCount * pixelFactor * dt;
    let damageToA = gb.pixelCount * pixelFactor * dt;

    if (maxLossPerTick > 0) {
      damageToB = Math.min(damageToB, maxLossPerTick);
      damageToA = Math.min(damageToA, maxLossPerTick);
    }

    ga.applyDamage(damageToA);
    gb.applyDamage(damageToB);
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
