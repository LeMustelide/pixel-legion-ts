// src/modules/game/domain/Player.ts

import { PixelGroup } from "./PixelGroup";

export class Player {
  private id: string;
  public x: number;
  public y: number;
  // private selected = false;
  private speed = 100; // pixels/seconde
  private target: { x: number; y: number } | null = null;
  private _spawnTimer: number = 0;
  private _spawnInterval: number = 1; // secondes entre chaque spawn
  public pixelGroups: PixelGroup[] = [];

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

  /** Spawn un nouveau groupe de pixels */
  spawnPixelGroup(pixelCount: number = 100, color: string = "red"): PixelGroup {
    const group = new PixelGroup(pixelCount);
    group.initializePixels(color);
    // Positionner les pixels autour du joueur
    group.pixels.forEach(pixel => {
      pixel.x += this.x;
      pixel.y += this.y;
    });
    this.pixelGroups.push(group);
    return group;
  }

  /**
   * Tick de spawn automatique de PixelGroup.
   * À appeler à chaque tick serveur (solo ou multi).
   * Gère un timer interne pour chaque joueur.
   */
  

  tickSpawn(dt: number) {
    this._spawnTimer += dt;
    if (this._spawnTimer >= this._spawnInterval) {
      this._spawnTimer = 0;
      console.log(`Spawning pixel group for player ${this.id}`);
      // Tu peux personnaliser le nombre/couleur ici ou le passer en paramètre
      this.spawnPixelGroup(100, "red");
    }
  }

  /* GETTER AND SETTER */

  getId(): string {
    return this.id;
  }

  setTarget(x: number, y: number) {
    this.target = { x, y };
  }
}
