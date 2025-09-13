import type { GameState } from '@core/model/GameState';
import type { IGameNetwork } from './IGameNetwork';
import { onState, sendAction, joinRoom, close } from '@net/socket';
import { Server as IOServer } from 'socket.io';

export class MultiplayerNetwork implements IGameNetwork {

  joinRoom(roomId: string): void {
    joinRoom(roomId);
  }

  onState(cb: (state: GameState) => void) {
    onState(cb);
  }

  sendAction(action: any) {
    // On envoie la cible au serveur, c'est le serveur qui anime le déplacement
    sendAction(action);
  }

  close(): void {
    close();
  }

  pause(): void {
    throw new Error('Method not implemented.');
  }

  resume(): void {
    throw new Error('Method not implemented.');
  }
}
