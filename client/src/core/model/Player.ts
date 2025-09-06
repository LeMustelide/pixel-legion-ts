// src/core/model/Player.ts
import { PixelGroup } from './PixelGroup';

export class Player {
  public id: string;
  public x: number;
  public y: number;
  public selected = false;
  public speed = 100; // pixels/seconde
  public target: { x: number, y: number } | null = null;
  public spawnPixelSpeed = 2;
  public pixelGroups: PixelGroup[] = [];

  constructor(id: string, x = 0, y = 0) {
    this.id = id;
    this.x  = x;
    this.y  = y;
  }

  /** Met à jour la position depuis le serveur */
  updateFromServer(x: number, y: number, target?: { x: number, y: number }) {
    this.x = x;
    this.y = y;
    if (target) this.target = target;
  }

  /** Pour la prédiction locale (client-side prediction) */
  moveLocal(targetX: number, targetY: number) {
    this.target = { x: targetX, y: targetY };
  }

  /** Sélection / désélection */
  setSelected(sel: boolean) {
    this.selected = sel;
  }
  
}
