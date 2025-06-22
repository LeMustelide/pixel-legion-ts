// packages/game-logic/src/index.ts

// — Actions & Payloads —  
export * from './dtos/actions';

// — Domain models —  
export { Player } from './domain/Player';
export { GameState } from './domain/GameState';

// — Core service & solo wrapper —  
export { GameService } from './GameService';
export { SoloServer } from './SoloServer';

// — Helper type: forme de l’état émis à chaque tick —  
import { GameState as _GS } from './domain/GameState';
export type ServerState = ReturnType<_GS['snapshot']>;
