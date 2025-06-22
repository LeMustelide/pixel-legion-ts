// src/modules/game/handlers/ActionHandler.ts

// src/modules/game/handlers/ActionHandler.ts
import type { GameAction } from '../dtos/actions';
import { GameService } from '../GameService';

export interface ActionHandler<A extends GameAction = GameAction> {
  /** 
   * @param room    L’instance de la room (état + broadcasteurs)
   * @param clientId  ID du socket qui a envoyé l’action
   * @param action  L’action typée
   */
  handle(room: GameService, clientId: string, action: A): void;
}
