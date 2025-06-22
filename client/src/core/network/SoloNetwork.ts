// src/net/SoloNetwork.ts

import type { GameState } from '@core/model/GameState';
import type { IGameNetwork } from './IGameNetwork';
import { SoloServer }   from 'pixel-legion-game-logic';
import { Player } from '@core/model/Player';
import { PixelGroup } from '@core/model/PixelGroup';
import { SimplePixel } from '@core/model/PixelPool';

export class SoloNetwork implements IGameNetwork {
  private solo: SoloServer;
  private stateCb?: (state: GameState) => void;

  constructor() {
    // On instancie SoloServer en lui fournissant le callback onState
    this.solo = new SoloServer((state) => {
      // À chaque tick, SoloServer appelle ce callback
      if (this.stateCb) {
        // Convert the serialized state back to GameState format
        const gameState: GameState = {
          players: {} as Record<string, Player>
        };
        // Transform plain object players back to Map<string, Player>
        for (const [playerId, playerData] of Object.entries(state.players)) {
          const player = new Player(playerId, playerData.x, playerData.y);
          if (playerData.pixelGroups) {
            player.pixelGroups = playerData.pixelGroups.map((groupData: any) => {
              const group = new PixelGroup(groupData.pixelCount);
              group.pixels = groupData.pixels.map((p: any) => {
                // Utilise le constructeur ou une factory selon ta structure
                return new SimplePixel(p.x, p.y, p.color); // ou new Pixel(p.x, p.y, p.color, ...)
              });
              return group;
            });
          }
          gameState.players[playerId] = player;
        }
        this.stateCb(gameState);
      }
    });
  }

  /** En solo, pas de notion de room – on peut reset l’état si besoin */
  joinRoom(_roomId: string): void {
    // Optionnel : this.solo.dispose(); this.solo = new SoloServer(this.stateCb!);
  }

  /** Réception des états depuis SoloServer */
  onState(cb: (state: GameState) => void): void {
    this.stateCb = cb;
  }

  /** Envoi d’action → SoloServer.handleAction sous le capot */
  sendAction(action: any): void {
    this.solo.sendClientAction(action);
  }

  /** Stoppe la boucle de tick solo */
  close(): void {
    this.solo.dispose();
  }
}
