import { getPooledPixel, SimplePixel } from "./PixelPool";

export class PixelGroup {
  public pixelCount: number;
  public pixels: SimplePixel[] = [];
  public pixelMoveRadius: number;
  public distributionType?: string; // Ajout pour compatibilité serveur

  constructor(pixelCount: number = 100, pixelInstance: SimplePixel[] = []) {
    this.pixelCount = pixelCount;
    this.pixelMoveRadius = this._calculatePixelMoveRadius(
      pixelCount,
      pixelInstance.length
    );
  }
  
  initializePixels(color: string = "red"): void {
    // Initialisation des pixels
    for (let i = 0; i < this.pixelCount; i++) {
      const offsetX = Math.random() * 50 - 25;
      const offsetY = Math.random() * 50 - 25;
      console.log(`Pixel ${i}: offsetX=${offsetX}, offsetY=${offsetY}`);
      const px = getPooledPixel(offsetX, offsetY, 10, color);
      this.pixels.push(px);
    }
  }

  /**
   * Calcule le rayon de mouvement des pixels
   */
  _calculatePixelMoveRadius(
    pixelCount: number,
    instanceLength: number
  ): number {
    const radius = 3 * Math.sqrt(pixelCount || instanceLength);
    const maxRadius = 30;
    return Math.min(radius, maxRadius);
  }
}
