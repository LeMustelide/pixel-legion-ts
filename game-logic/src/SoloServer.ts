// src/modules/game/SoloServer.ts

import { GameService, type StateCallback } from './GameService';
import type { GameAction } from './dtos/actions';

/**
 * SoloServer : wrapper "offline" autour de GameService
 * - Reçoit un callback onState pour propager les états à ton front.
 * - Réinjecte localement les actions du joueur dans le même moteur de jeu.
 */
export class SoloServer {
  private svc: GameService;
  private readonly playerId = 'localPlayer';

  /**
   * @param onState  callback appelé à chaque tick avec le state à afficher
   */
  constructor(onState: StateCallback) {    // Instancie GameService en lui passant :
    // - onState  : pour remonter le state au front
    // - tickRateMs : intervalle de tick
    this.svc = new GameService(
      (state) => onState(state),
      50, // tick toutes les 50ms
    );

    // Ajoute le joueur local dès le départ
    this.svc.addPlayer(this.playerId);
  }

  /**
   * À appeler depuis ton front (clic, clavier…) pour envoyer une action
   */
  public sendClientAction(action: GameAction) {
    this.svc.handleAction(this.playerId, action);
  }

  /**
   * Stoppe la boucle de tick si tu quittes le mode solo
   */
  public dispose() {
    this.svc.dispose();
  }

  /**
   * Met en pause la logique du jeu
   */
  public pause(): void {
    this.svc.dispose();
  }

  /**
   * Reprend la logique du jeu après une pause
   */
  public resume(): void {
    this.svc.resume();
  }   
}
