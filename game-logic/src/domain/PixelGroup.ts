import { getPooledPixel, SimplePixel } from "./PixelPool";

export class PixelGroup {
  public pixelCount: number;
  public pixels: SimplePixel[] = [];
  public pixelMoveRadius: number;
  public spreadRadius: number;
  public distributionType: 'circle' | 'cluster' = 'circle';

  constructor(pixelCount: number = 100, pixelInstance: SimplePixel[] = []) {
    this.pixelCount = pixelCount;
    this.pixelMoveRadius = this._calculatePixelMoveRadius(
      pixelCount,
      pixelInstance.length
    );
    this.spreadRadius = this._calculateSpreadRadius(pixelCount);
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
      
      const px = getPooledPixel(offsetX, offsetY, this.pixelMoveRadius, color);
      this.pixels.push(px);
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
    for (const pixel of this.pixels) {
      pixel.updatePosition(dt);
    }
  }
}
