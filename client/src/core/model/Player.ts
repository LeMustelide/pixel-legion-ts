// src/core/model/Player.ts
import type { Selectable } from '@core/interface/Selectable';
import { PixelGroup } from './PixelGroup';
import { SimplePixel } from './PixelPool';

export class Player implements Selectable {
  public id: string;
  public x: number;
  public y: number;
  public target: { x: number, y: number } | null = null;
  public pixelGroups: PixelGroup[] = [];
  public selectedEntity: { kind: "player" | "pixelGroup"; id: string } | null = null;

  constructor(id: string, x = 0, y = 0) {
    this.id = id;
    this.x  = x;
    this.y  = y;
  }

  /** Reconstruit un Player à partir d'un objet sérialisé côté serveur */
  static fromSerialized(data: any, fallbackId?: string): Player {
    // Use data.id if present, otherwise fallback to provided key (if any)
    const id = data.id ?? fallbackId ?? '';
    const p = new Player(id, data.x ?? 0, data.y ?? 0);
    if (data.pixelGroups && Array.isArray(data.pixelGroups)) {
      p.pixelGroups = data.pixelGroups.map((g: any) => {
        const group = new PixelGroup(g.pixelCount ?? 0);
        if (g.id) group.id = g.id;
        if (Array.isArray(g.pixels)) {
          group.pixels = g.pixels.map((px: any) => new SimplePixel(px.x, px.y, px.moveRadius, px.color));
          group.pixelCount = group.pixels.length;
        }
        return group;
      });
    }
    return p;
  }

  hydrate(data: any) {
    this.x = data.x ?? this.x;
    this.y = data.y ?? this.y;
    this.target = data.target ?? this.target;
    if (data.pixelGroups && Array.isArray(data.pixelGroups)) {
      this.pixelGroups = data.pixelGroups.map((g: any) => {
        const group = new PixelGroup(g.pixelCount ?? 0);
        if (g.id) group.id = g.id;
        if (Array.isArray(g.pixels)) {
          group.pixels = g.pixels.map((px: any) => new SimplePixel(px.x, px.y, px.moveRadius, px.color));
          group.pixelCount = group.pixels.length;
        }
        return group;
      });
    }
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

  selectEntity(target: { kind: "player" | "pixelGroup"; id: string } | null) {
    this.selectedEntity = target;
  }
  
}
