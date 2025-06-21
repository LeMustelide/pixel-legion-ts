import type { GameState } from '@core/model/GameState';
import type { IGameNetwork } from './IGameNetwork';
import { onState, sendAction } from '@net/socket';

export class MultiplayerNetwork implements IGameNetwork {
  onState(cb: (state: GameState) => void) {
    onState(cb);
  }
  sendAction(action: any) {
    // On envoie la cible au serveur, c'est le serveur qui anime le déplacement
    sendAction(action);
  }
}
