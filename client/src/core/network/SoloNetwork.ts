// src/net/SoloNetwork.ts

import type { GameState } from '@core/model/GameState';
import type { IGameNetwork } from './IGameNetwork';
import { SoloServer }   from 'pixel-legion-game-logic';
import { Player } from '@core/model/Player';

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
          // Utiliser la factory pour reconstruire proprement et éviter `any`
          // On fournit playerId en fallback pour éviter un id vide
          const player = Player.fromSerialized(playerData as any, playerId);
          gameState.players[playerId] = player;
        }
        this.stateCb(gameState);
      }
    });
  }

  getLocalPlayerId(): string | null {
    return 'localPlayer';
  }

  onJoined(cb: (id: string) => void): void {
    cb(this.getLocalPlayerId()!);
  }

  /** Met en pause la logique du jeu */
  pause(): void {
    this.solo.pause();
  }

  /** Reprend la logique du jeu après une pause */
  resume(): void {
    this.solo.resume();
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
