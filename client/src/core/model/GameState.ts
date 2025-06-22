import { Player } from './Player';

export interface GameState {
  players: Record<string, Player>;
}