// src/modules/game/domain/Player.ts

import { PixelGroup } from "./PixelGroup";

// Import de la configuration depuis le client (si accessible) ou créer une config partagée
const SPAWN_CONFIG = {
  SPAWN_INTERVAL_SECONDS: 3,
  PIXELS_PER_SPAWN: 50, // Augmentation du nombre de pixels par spawn
};

export class Player {
  private id: string;
  public x: number;
  public y: number;
  // private selected = false;
  private speed = 100; // pixels/seconde
  private target: { x: number; y: number } | null = null;
  private _spawnTimer: number = 0;
  private _spawnInterval: number = SPAWN_CONFIG.SPAWN_INTERVAL_SECONDS;
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
  /** 
   * Spawn un nouveau groupe de pixels avec options avancées
   * @param pixelCount Nombre de pixels à spawner
   * @param color Couleur des pixels
   * @param distributionType Type de distribution (circle ou cluster)
   */
  spawnPixelGroup(pixelCount: number = 100, color: string = "red", distributionType: 'circle' | 'cluster' = 'circle'): PixelGroup {
    const group = new PixelGroup(pixelCount);
    group.distributionType = distributionType;
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

  /**
   * Tick de spawn automatique de PixelGroup.
   * À appeler à chaque tick serveur (solo ou multi).
   * Gère un timer interne pour chaque joueur.
   */
    tickSpawn(dt: number) {
    this._spawnTimer += dt;
    if (this._spawnTimer >= this._spawnInterval) {
      this._spawnTimer = 0;

      console.log(`Spawning pixel group for player ${this.id} (${this.pixelGroups.length})`);
      
      // Alterner entre les types de distribution pour plus de variété visuelle
      const distributionType = Math.random() > 0.5 ? 'circle' : 'cluster';
      
      // Spawn avec configuration dynamique
      this.spawnPixelGroup(SPAWN_CONFIG.PIXELS_PER_SPAWN, "red", distributionType);
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
