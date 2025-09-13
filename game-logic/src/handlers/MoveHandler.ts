// src/modules/game/handlers/MoveHandler.ts

// src/modules/game/handlers/MoveHandler.ts
import type { ActionHandler } from './ActionHandler';
import type { GameAction } from '../dtos/actions';
import { GameService } from '../GameService';

export class MoveHandler implements ActionHandler<Extract<GameAction, { type: 'move' }>> {
  handle(room: GameService, clientId: string, action: { type: 'move'; payload: { x: number; y: number } }) {
    const player = room.getPlayer(clientId);
    if (!player) return;
    player.setTarget(action.payload.x, action.payload.y);
    // player.moveTo(action.payload.x, action.payload.y);
    // (optionnel) broadcast immédiat à d’autres joueurs si besoin
  }
}
