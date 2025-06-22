import type { GameEvent } from '../../types/GameEvent';
import { Player } from './Player';

export interface GameState {
  players: Map<string, Player>;
}