import { Player } from './Player';

interface GameState {
  players: Record<string, Player>;
}