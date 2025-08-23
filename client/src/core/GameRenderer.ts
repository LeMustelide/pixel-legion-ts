import { Container, Graphics } from 'pixi.js';
import { RenderPlayer } from './RenderPlayer';
import { SimplePixel } from './model/PixelPool';
import type { PixelGroup } from './model/PixelGroup';

export class GameRenderer {
  private container: Container;
  private playerGraphics: Record<string, Graphics> = {};
  private pixelGraphics: Map<SimplePixel, Graphics> = new Map();
  private hoveredPlayerId: string | null = null;
  private hoveredPixelGroup: any = null;
  private polygonGraphics: Graphics | null = null;

  constructor(container: Container) {
    this.container = container;
  }
  renderPlayers(players: Record<string, RenderPlayer>) {
    // Ajoute ou met à jour les joueurs
    for (const [id, player] of Object.entries(players)) {
      let gfx = this.playerGraphics[id];
      if (!gfx) {
        gfx = new Graphics();
        this.container.addChild(gfx);
        this.playerGraphics[id] = gfx;
      }
      
      // Efface le contenu précédent
      gfx.clear();
      
      // Applique l'effet d'hover si c'est le joueur survolé
      const isHovered = this.hoveredPlayerId === id;
      
      if (isHovered) {
        // Effet d'hover : contour lumineux
        gfx.circle(0, 0, 12).stroke({ width: 2, color: 0x00ff00, alpha: 0.8 });
        // Joueur avec une teinte plus claire
        gfx.rect(-8, -8, 16, 16).fill(0xffff88);
      } else {
        // Rendu normal
        gfx.rect(-8, -8, 16, 16).fill(0xffffff);
      }
      
      // Force les positions flottantes pour un rendu plus smooth
      gfx.x = player.renderX;
      gfx.y = player.renderY;
    }
    
    // Supprime les joueurs disparus
    for (const id of Object.keys(this.playerGraphics)) {
      if (!(id in players)) {
        this.container.removeChild(this.playerGraphics[id]);
        delete this.playerGraphics[id];
      }
    }
  }

  removePlayer(id: string) {
    const gfx = this.playerGraphics[id];
    if (gfx) {
      this.container.removeChild(gfx);
      delete this.playerGraphics[id];
    }
  }

  /** Rendre tous les PixelGroups d'un joueur */
  renderPlayerPixels(renderPlayer: RenderPlayer) {
    if (!renderPlayer.ref.pixelGroups || renderPlayer.ref.pixelGroups.length === 0) {
      return;
    }
    renderPlayer.ref.pixelGroups.forEach((group: PixelGroup) => {
      const isGroupHovered = this.hoveredPixelGroup === group;
      this.renderPixelGroup(group, isGroupHovered);
      
      // Si le groupe est survolé, affiche le polygone d'enveloppe
      if (isGroupHovered) {
        this.renderGroupPolygon(group);
        console.log(`Rendering polygon for group`);
      } else {
        console.log(`Clearing polygon for group`);
      }
    });
    
    // Si aucun groupe n'est survolé, supprime le polygone
    if (!this.hoveredPixelGroup) {
      this.clearPolygon();
    }
  }

  /** Rendre un PixelGroup entier */
  private renderPixelGroup(group: PixelGroup, isHovered: boolean = false) {
    group.pixels.forEach((pixel: SimplePixel) => {
      this.renderPixel(pixel, isHovered);
    });
  }

  /** Rendre un pixel individuel */
  private renderPixel(pixel: SimplePixel, isHovered: boolean = false) {
    let gfx = this.pixelGraphics.get(pixel);
    
    if (!gfx) {
      // Créer un nouveau graphique pour ce pixel
      gfx = new Graphics();
      gfx.circle(0, 0, 3); // Rayon de 3 pixels
      gfx.fill(pixel.color);
      
      this.container.addChild(gfx);
      this.pixelGraphics.set(pixel, gfx);
    }

    // Mettre à jour la position
    gfx.x = pixel.x;
    gfx.y = pixel.y;
  }

  /** Nettoyer les pixels qui ne sont plus utilisés par aucun joueur */
  cleanupPixels(allRenderPlayers: Record<string, RenderPlayer>) {
    const activePixels = new Set<SimplePixel>();
    // Récupérer tous les pixels actifs de tous les joueurs
    for (const renderPlayer of Object.values(allRenderPlayers)) {
      if (renderPlayer.ref.pixelGroups) {
        renderPlayer.ref.pixelGroups.forEach((group: PixelGroup) => {
          group.pixels.forEach((pixel: SimplePixel) => {
            activePixels.add(pixel);
          });
        });
      }
    }
    // Supprimer les graphiques des pixels inactifs
    for (const [pixel, gfx] of this.pixelGraphics.entries()) {
      if (!activePixels.has(pixel)) {
        this.container.removeChild(gfx);
        gfx.destroy();
        this.pixelGraphics.delete(pixel);
      }
    }
  }
  /** Nettoyer tous les pixels d'un joueur spécifique */
  removePlayerPixels(renderPlayer: RenderPlayer) {
    if (!renderPlayer.ref.pixelGroups) return;

    renderPlayer.ref.pixelGroups.forEach((group: PixelGroup) => {
      group.pixels.forEach((pixel: SimplePixel) => {
        const gfx = this.pixelGraphics.get(pixel);
        if (gfx) {
          this.container.removeChild(gfx);
          gfx.destroy();
          this.pixelGraphics.delete(pixel);
        }
      });
    });
  }

  /** Gère l'hover basé sur la position de la souris */
  handleMouseMove(mouseX: number, mouseY: number, currentPlayerId: string, renderPlayers: Record<string, RenderPlayer>) {
    if (!currentPlayerId) return;

    // Vérifie si la souris survole le joueur courant
    const isHoveringPlayer = this.isHoveringPlayer(mouseX, mouseY, currentPlayerId, renderPlayers);
    
    // Trouve le groupe de pixels survolé (s'il y en a un)
    const hoveredGroup = this.getHoveredPixelGroup(mouseX, mouseY, currentPlayerId, renderPlayers);
    
    // Met à jour les états d'hover
    this.setPlayerHover(currentPlayerId, isHoveringPlayer);
    this.setHoveredPixelGroup(hoveredGroup && !isHoveringPlayer ? hoveredGroup : null);
  }

  /** Désactive tous les effets d'hover */
  clearAllHover() {
    this.hoveredPlayerId = null;
    this.setHoveredPixelGroup(null);
  }

  /** Définit l'état d'hover pour un joueur spécifique */
  private setPlayerHover(playerId: string, isHovered: boolean) {
    if (isHovered) {
      this.hoveredPlayerId = playerId;
    } else if (this.hoveredPlayerId === playerId) {
      this.hoveredPlayerId = null;
    }
  }

  /** Définit le groupe de pixels actuellement survolé */
  private setHoveredPixelGroup(group: any) {
    this.hoveredPixelGroup = group;
    if (!group) {
      this.clearPolygon();
    }
  }

  /** Vérifie si la souris survole un joueur */
  private isHoveringPlayer(mouseX: number, mouseY: number, playerId: string, renderPlayers: Record<string, RenderPlayer>): boolean {
    const renderPlayer = renderPlayers[playerId];
    if (!renderPlayer) return false;
    
    const playerX = renderPlayer.renderX;
    const playerY = renderPlayer.renderY;
    const playerSize = 16; // Taille du joueur (16x16 pixels)
    
    return mouseX >= playerX - playerSize / 2 && 
           mouseX <= playerX + playerSize / 2 &&
           mouseY >= playerY - playerSize / 2 && 
           mouseY <= playerY + playerSize / 2;
  }

  /** Trouve le groupe de pixels survolé */
  private getHoveredPixelGroup(mouseX: number, mouseY: number, playerId: string, renderPlayers: Record<string, RenderPlayer>): any {
    const renderPlayer = renderPlayers[playerId];
    if (!renderPlayer || !renderPlayer.ref.pixelGroups) return null;
    
    for (const group of renderPlayer.ref.pixelGroups) {
      if (this.isHoveringPixelGroup(mouseX, mouseY, group)) {
        return group;
      }
    }
    return null;
  }

  /** Vérifie si la souris survole un groupe de pixels */
  private isHoveringPixelGroup(mouseX: number, mouseY: number, group: any): boolean {
    if (!group.pixels || group.pixels.length === 0) return false;
    
    // Calcule l'enveloppe convexe du groupe de pixels
    const convexHull = this.calculateConvexHull(group.pixels);
    if (convexHull.length < 3) return false; // Un polygone a besoin d'au moins 3 points
    
    // Vérifie si le point de la souris est à l'intérieur du polygone
    return this.isPointInPolygon(mouseX, mouseY, convexHull);
  }

  /** Dessine le polygone d'enveloppe convexe autour d'un groupe de pixels */
  private renderGroupPolygon(group: any) {
    if (!group.pixels || group.pixels.length < 3) return;
    
    // Calcule l'enveloppe convexe à chaque frame pour le mouvement en temps réel
    const convexHull = this.calculateConvexHull(group.pixels);
    if (convexHull.length < 3) return;
    
    // Supprime l'ancien polygone et en crée un nouveau à chaque frame
    // C'est nécessaire pour forcer PIXI.js à mettre à jour l'affichage
    if (this.polygonGraphics) {
      this.container.removeChild(this.polygonGraphics);
      this.polygonGraphics.destroy();
    }
    
    // Crée un nouveau graphique à chaque frame
    this.polygonGraphics = new Graphics();
    this.container.addChild(this.polygonGraphics);
    
    // Animation de couleur pour visualiser la mise à jour en temps réel
    const time = Date.now() * 0.001; // Convertit en secondes
    const colorVariation = Math.sin(time * 4) * 0.3 + 0.7; // Oscille entre 0.4 et 1.0
    
    // Dessine le polygone avec des lignes de délimitation animées
    this.polygonGraphics.poly(convexHull).stroke({ 
      width: 2, 
      color: 0x00ff00, 
      alpha: colorVariation * 0.8 
    });
    
    // Optionnel : remplissage semi-transparent
    this.polygonGraphics.poly(convexHull).fill({ 
      color: 0x00ff00, 
      alpha: 0.1 
    });
  }

  /** Supprime le polygone d'enveloppe */
  private clearPolygon() {
    if (this.polygonGraphics) {
      this.container.removeChild(this.polygonGraphics);
      this.polygonGraphics.destroy();
      this.polygonGraphics = null;
    }
  }

  /** Calcule l'enveloppe convexe d'un ensemble de points avec plus de détails */
  private calculateConvexHull(pixels: any[]): { x: number, y: number }[] {
    if (pixels.length < 3) return pixels.map(p => ({ x: p.x, y: p.y }));
    
    // Pour des petits groupes, utilise une approche plus simple qui capture plus de points
    if (pixels.length <= 10) {
      return this.calculateBoundaryPoints(pixels);
    }
    
    // Pour des groupes plus grands, utilise l'algorithme de Graham standard
    // Trouve le point le plus bas (en cas d'égalité, le plus à gauche)
    let bottomPoint = pixels[0];
    for (const pixel of pixels) {
      if (pixel.y > bottomPoint.y || (pixel.y === bottomPoint.y && pixel.x < bottomPoint.x)) {
        bottomPoint = pixel;
      }
    }
    
    // Trie les points par angle polaire par rapport au point de base
    const sortedPixels = pixels
      .filter(p => p !== bottomPoint)
      .map(p => ({ x: p.x, y: p.y, angle: Math.atan2(p.y - bottomPoint.y, p.x - bottomPoint.x) }))
      .sort((a, b) => a.angle - b.angle);
    
    // Construit l'enveloppe convexe
    const hull = [{ x: bottomPoint.x, y: bottomPoint.y }];
    
    for (const point of sortedPixels) {
      // Supprime les points qui créent un virage à droite
      while (hull.length > 1 && this.crossProduct(
        hull[hull.length - 2], 
        hull[hull.length - 1], 
        point
      ) <= 0) {
        hull.pop();
      }
      hull.push({ x: point.x, y: point.y });
    }
    
    return hull;
  }

  /** Calcule des points de contour pour de petits groupes */
  private calculateBoundaryPoints(pixels: any[]): { x: number, y: number }[] {
    const points = pixels.map(p => ({ x: p.x, y: p.y }));
    
    // Trouve les extrêmes dans chaque direction
    const bounds = {
      minX: Math.min(...points.map(p => p.x)),
      maxX: Math.max(...points.map(p => p.x)),
      minY: Math.min(...points.map(p => p.y)),
      maxY: Math.max(...points.map(p => p.y))
    };
    
    // Trouve les points les plus proches des extrêmes
    const extremePoints = [];
    
    // Point le plus à gauche
    extremePoints.push(points.find(p => p.x === bounds.minX) || points[0]);
    // Point le plus en haut
    extremePoints.push(points.find(p => p.y === bounds.minY) || points[0]);
    // Point le plus à droite
    extremePoints.push(points.find(p => p.x === bounds.maxX) || points[0]);
    // Point le plus en bas
    extremePoints.push(points.find(p => p.y === bounds.maxY) || points[0]);
    
    // Supprime les doublons et trie par angle
    const uniquePoints = extremePoints.filter((point, index, arr) => 
      arr.findIndex(p => p.x === point.x && p.y === point.y) === index
    );
    
    if (uniquePoints.length < 3) {
      return points; // Retourne tous les points si pas assez d'extrêmes
    }
    
    // Centre de masse pour le tri
    const centerX = uniquePoints.reduce((sum, p) => sum + p.x, 0) / uniquePoints.length;
    const centerY = uniquePoints.reduce((sum, p) => sum + p.y, 0) / uniquePoints.length;
    
    // Trie par angle autour du centre
    uniquePoints.sort((a, b) => {
      const angleA = Math.atan2(a.y - centerY, a.x - centerX);
      const angleB = Math.atan2(b.y - centerY, b.x - centerX);
      return angleA - angleB;
    });
    
    return uniquePoints;
  }

  /** Calcule le produit vectoriel pour déterminer l'orientation */
  private crossProduct(a: { x: number, y: number }, b: { x: number, y: number }, c: { x: number, y: number }): number {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }

  /** Vérifie si un point est à l'intérieur d'un polygone (algorithme ray casting) */
  private isPointInPolygon(x: number, y: number, polygon: { x: number, y: number }[]): boolean {
    let inside = false;
    const n = polygon.length;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }
}
