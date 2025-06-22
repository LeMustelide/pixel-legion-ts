// src/modules/game/dtos/actions.ts

export interface MovePayload   { x: number; y: number; }
export interface AttackPayload { targetId: string; }

// On mappe chaque “type” sur son payload
export type ActionPayloads = {
  move:   MovePayload;
  attack: AttackPayload;
};

// On génère automatiquement le type discriminé
export type GameAction =
  { [K in keyof ActionPayloads]: { type: K; payload: ActionPayloads[K] } }[keyof ActionPayloads];
