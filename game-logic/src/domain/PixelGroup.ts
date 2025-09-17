import { getPooledPixel, SimplePixel } from "./PixelPool";
import type { Movable } from "./Movable";

/**
 * PixelGroup devient "movable" : on lui ajoute une position centrale (x,y),
 * une target et une vitesse. Lorsqu'on déplace le groupe, on translate tous les
 * pixels en conséquence puis on laisse leur mouvement organique continuer.
 */
export class PixelGroup implements Movable {
  public id: string;
  public pixelCount: number;
  public pixels: SimplePixel[] = [];
  public pixelMoveRadius: number;
  public spreadRadius: number;
  public distributionType: 'circle' | 'cluster' = 'circle';
  // Marqueur de destruction (pour retirer proprement après update combat)
  public destroyed: boolean = false;

  // Position centrale du groupe
  public x: number = 0;
  public y: number = 0;
  // Centre calculé (centroïde réel des pixels) - recalculé chaque updatePixels
  private cx: number = 0;
  private cy: number = 0;

  // Movement target for the whole group
  private target: { x: number; y: number } | null = null;
  private speed: number = 80; // pixels / seconde (ajustable)
  // Accumulateur pour dégâts fractionnaires (ex: 2.4 dmg -> 2 maintenant, 0.4 conservé)
  private damageRemainder: number = 0;

  constructor(pixelCount: number, pixelInstance: SimplePixel[] = [], x: number = 0, y: number = 0) {
    this.id = crypto.randomUUID();
    this.pixelCount = pixelCount;
    this.pixelMoveRadius = this._calculatePixelMoveRadius(
      pixelCount,
      pixelInstance.length
    );
    this.spreadRadius = this._calculateSpreadRadius(pixelCount);
    this.x = x;
    this.y = y;
  }
  
  initializePixels(color: string = "red"): void {
    // Initialisation des pixels avec une distribution plus intelligente
    for (let i = 0; i < this.pixelCount; i++) {
      let offsetX: number;
      let offsetY: number;
      
      if (this.distributionType === 'circle') {
        // Distribution en cercle avec variation
        const angle = Math.random() * Math.PI * 2;
        // On utilise une distribution en racine carrée pour une meilleure répartition
        const radius = Math.sqrt(Math.random()) * this.spreadRadius;
        offsetX = Math.cos(angle) * radius;
        offsetY = Math.sin(angle) * radius;
      } else {
        // Distribution en clusters (groupes plus denses)
        // Diviser l'espace en secteurs
        const clusterCount = Math.max(1, Math.floor(this.pixelCount / 20));
        const clusterIndex = Math.floor(Math.random() * clusterCount);
        const clusterAngle = (clusterIndex / clusterCount) * Math.PI * 2;
        const clusterRadius = this.spreadRadius * 0.8;
        
        // Position de base du cluster
        const clusterX = Math.cos(clusterAngle) * clusterRadius * 0.5;
        const clusterY = Math.sin(clusterAngle) * clusterRadius * 0.5;
        
        // Ajout d'une variation à l'intérieur du cluster
        offsetX = clusterX + (Math.random() * 20 - 10);
        offsetY = clusterY + (Math.random() * 20 - 10);
      }
      
      // Position relative to group center
      const px = getPooledPixel(offsetX, offsetY, this.pixelMoveRadius, color);
      this.pixels.push(px);
    }
  }

  /**
   * Déplace le groupe vers une cible (interface Movable)
   */
  setTarget(x: number, y: number) {
    this.target = { x, y };
  }

  update(dt: number): void {
    // Move group center towards target if any
    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) {
        // snap to target
        const deltaX = this.target.x - this.x;
        const deltaY = this.target.y - this.y;
        this.translatePixels(deltaX, deltaY);
        this.x = this.target.x;
        this.y = this.target.y;
        this.target = null;
      } else {
        const move = Math.min(this.speed * dt, dist);
        const nx = (dx / dist) * move;
        const ny = (dy / dist) * move;
        this.translatePixels(nx, ny);
        this.x += nx;
        this.y += ny;
      }
    }

    // Puis on met à jour le mouvement organique des pixels
    this.updatePixels(dt);
  }

  /**
   * Translate tous les pixels du groupe d'un delta donné
   */
  private translatePixels(dx: number, dy: number) {
    for (const pixel of this.pixels) {
      pixel.x += dx;
      pixel.y += dy;
      pixel.startX += dx;
      pixel.startY += dy;
      // Recentre aussi la target individuelle pour conserver le comportement
      if (pixel.targetPos) {
        pixel.targetPos.x += dx;
        pixel.targetPos.y += dy;
      }
    }
  }

  /**
   * Calcule le rayon de mouvement individuel des pixels
   */
  _calculatePixelMoveRadius(
    pixelCount: number,
    instanceLength: number
  ): number {
    // Calcul ajusté pour un mouvement plus limité quand il y a beaucoup de pixels
    const count = pixelCount || instanceLength;
    const radius = 3 * Math.sqrt(count) / Math.max(1, Math.log10(count) * 0.5);
    const maxRadius = 20;
    return Math.min(radius, maxRadius);
  }
  
  /**
   * Calcule le rayon de distribution initial des pixels
   */
  _calculateSpreadRadius(pixelCount: number): number {
    // Plus il y a de pixels, plus la zone de spread est grande
    const radius = 10 + Math.sqrt(pixelCount) * 2;
    return Math.min(radius, 60); // Limite à 60px
  }

  /**
   * Met à jour les positions de tous les pixels du groupe
   * @param dt Delta time en secondes
   */
  updatePixels(dt: number): void {
    if (this.pixels.length === 0) return;
    // Met à jour les pixels puis recalcule un centroïde réaliste
    let sumX = 0;
    let sumY = 0;
    for (const pixel of this.pixels) {
      pixel.updatePosition(dt);
      sumX += pixel.x;
      sumY += pixel.y;
    }
    this.cx = sumX / this.pixels.length;
    this.cy = sumY / this.pixels.length;
  }

  /** Inflige des dégâts (perte de pixels) au groupe. Retourne le nombre de pixels détruits. */
  applyDamage(rawDamage: number): number {
    if (this.destroyed || this.pixelCount <= 0) return 0;
    if (rawDamage <= 0) return 0;
    // Ajoute la fraction restante précédente
    let effective = rawDamage + this.damageRemainder;
    const whole = Math.floor(effective);
    this.damageRemainder = effective - whole;
    const loss = Math.min(this.pixelCount, whole);
    if (loss <= 0) return 0;

    this.pixelCount -= loss;
    // Retire réellement des pixels du tableau pour que le rendu client reflète la perte
    // Simple: splice depuis la fin
    for (let i = 0; i < loss; i++) {
      this.pixels.pop();
    }

    if (this.pixelCount <= 0) {
      this.pixelCount = 0;
      this.destroyed = true;
      this.pixels.length = 0;
      this.damageRemainder = 0;
    }
    return loss;
  }

  /** Distance euclidienne aux centres */
  distanceTo(other: PixelGroup): number {
    // Utilise d'abord le centroïde dynamique si disponible, sinon le centre logique
    const ax = this.pixels.length > 0 ? this.cx : this.x;
    const ay = this.pixels.length > 0 ? this.cy : this.y;
    const bx = other.pixels.length > 0 ? (other as any).cx ?? other.x : other.x;
    const by = other.pixels.length > 0 ? (other as any).cy ?? other.y : other.y;
    const dx = bx - ax;
    const dy = by - ay;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
