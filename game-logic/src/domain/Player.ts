// src/modules/game/domain/Player.ts

import { GameConfig } from "../config/GameConfig";
import { PixelGroup } from "./PixelGroup";

export class Player {
  private id: string;
  public x: number;
  public y: number;
  // private selected = false;
  private speed = 100; // pixels/seconde
  private target: { x: number; y: number } | null = null;
  public pixelGroups: PixelGroup[] = [];
  public selectedEntity: 

  constructor(id: string, x = 0, y = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  moveTo(x: number, y: number) {
    // tu peux ajouter de la logique : vitesse max, collisions…
    this.x = x;
    this.y = y;
  }

  /** Met à jour la position depuis le serveur */
  update(dt: number) {
    if (!this.target) return;
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) {
      this.x = this.target.x;
      this.y = this.target.y;
      this.target = null;
      return;
    }
    const move = Math.min(this.speed * dt, dist);
    this.x += (dx / dist) * move;
    this.y += (dy / dist) * move;
  }
  /** 
   * Spawn un nouveau groupe de pixels avec options avancées
   * @param pixelCount Nombre de pixels à spawner
   * @param color Couleur des pixels
   */
  spawnPixelGroup(pixelCount: number = 25, color: string = "red"): PixelGroup | null {
    if (this.pixelGroups.length >= GameConfig.SPAWN.MAX_GROUPS_PER_PLAYER) {
      return null;
    }
    const group = new PixelGroup(pixelCount);
    group.initializePixels(color);
    // Positionner les pixels autour du joueur
    group.pixels.forEach(pixel => {
      pixel.x += this.x;
      pixel.y += this.y;
      pixel.startX += this.x;
      pixel.startY += this.y;
    });
    this.pixelGroups.push(group);
    return group;
  }

  /* GETTER AND SETTER */

  getId(): string {
    return this.id;
  }

  setTarget(x: number, y: number) {
    this.target = { x, y };
  }
}
