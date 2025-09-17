// src/modules/game/dtos/actions.ts

export interface MovePayload   { x: number; y: number; }
export interface AttackPayload { targetId: string; }
/** DTO envoyé depuis le client pour la sélection d'une entité */
export type SelectedEntity = { kind: 'self' } | { kind: 'pixelGroup'; id: string } | null;
export interface SelectPayload { selectedEntity: SelectedEntity }

// On mappe chaque “type” sur son payload
export type ActionPayloads = {
  move:   MovePayload;
  attack: AttackPayload;
  select: SelectPayload;
};

// On génère automatiquement le type discriminé
export type GameAction =
  { [K in keyof ActionPayloads]: { type: K; payload: ActionPayloads[K] } }[keyof ActionPayloads];
