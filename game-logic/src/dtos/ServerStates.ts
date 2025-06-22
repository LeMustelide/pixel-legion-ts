export interface ServerState {
  players: Record<string, { x: number; y: number }>;
}