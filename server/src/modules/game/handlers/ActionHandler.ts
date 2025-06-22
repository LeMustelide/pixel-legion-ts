// src/modules/game/handlers/ActionHandler.ts

import { GameAction } from '../dtos/actions';
import { GameRoom } from '../GameRoom';

export interface ActionHandler<A extends GameAction = GameAction> {
  /** 
   * @param room    L’instance de la room (état + broadcasteurs)
   * @param clientId  ID du socket qui a envoyé l’action
   * @param action  L’action typée
   */
  handle(room: GameRoom, clientId: string, action: A): void;
}
