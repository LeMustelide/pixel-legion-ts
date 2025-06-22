// src/modules/game/handlers/MoveHandler.ts

import { ActionHandler } from './ActionHandler';
import { GameAction }    from '../dtos/actions';
import { GameRoom }      from '../GameRoom';

export class MoveHandler implements ActionHandler<Extract<GameAction, { type: 'move' }>> {
  handle(room: GameRoom, clientId: string, action: { type: 'move'; payload: { x: number; y: number } }) {
    const player = room.getPlayer(clientId);
    console.log(`Player ${clientId} moving to (${action.payload.x}, ${action.payload.y})`);
    if (!player) return;
    player.setTarget(action.payload.x, action.payload.y);
    // player.moveTo(action.payload.x, action.payload.y);
    // (optionnel) broadcast immédiat à d’autres joueurs si besoin
  }
}
