import type { GameState } from '@core/model/GameState';

export interface IGameNetwork {
  getLocalPlayerId(): string | null;
  onJoined(cb: (id: string) => void): void;
  onState(cb: (state: GameState) => void): void;
  sendAction(action: any): void;
  joinRoom(roomId: string): void;
  close(): void;
  /**
   * Met en pause la logique du jeu.
   * En solo, cela stoppe la boucle de tick.
   * En multijoueur, cela n'est pas pris en charge
   */
  pause(): void;
  resume(): void;
}
