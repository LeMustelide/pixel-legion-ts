export interface SerializedPixel {
  x: number;
  y: number;
  color: string;
}

export interface SerializedPixelGroup {
  id?: string; // inclure si vous avez un id côté serveur
  pixelCount: number;
  pixels: SerializedPixel[];
  distributionType: string;
}

export interface SerializedPlayer {
  id?: string;
  x: number;
  y: number;
  pixelGroups: SerializedPixelGroup[];
}

export type SerializedSelectedTarget =
  | { kind: 'self' }
  | { kind: 'pixelGroup'; id: string };

export interface SerializedPlayer {
  id?: string;
  x: number;
  y: number;
  pixelGroups: SerializedPixelGroup[];
  selectedTarget?: SerializedSelectedTarget | null;
}
 
export interface ServerState {
  players: Record<string, SerializedPlayer>;
}