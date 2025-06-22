// src/net/SoloNetwork.ts

import type { GameState } from '@core/model/GameState';
import type { IGameNetwork } from './IGameNetwork';
import { SoloServer }   from 'pixel-legion-game-logic';

export class SoloNetwork implements IGameNetwork {
  private solo: SoloServer;
  private stateCb?: (state: GameState) => void;

  constructor() {
    // On instancie SoloServer en lui fournissant le callback onState
    this.solo = new SoloServer((state) => {
      // À chaque tick, SoloServer appelle ce callback
      if (this.stateCb) {
        this.stateCb(state);
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
