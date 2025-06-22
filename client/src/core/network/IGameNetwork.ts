import type { GameState } from '@core/model/GameState';

export interface IGameNetwork {
  onState(cb: (state: GameState) => void): void;
  sendAction(action: any): void;
  joinRoom(roomId: string): void;
  close(): void;
}
