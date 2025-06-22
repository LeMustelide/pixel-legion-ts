import type { Player } from './model/Player';

/**
 * Wrapper d'affichage pour un joueur, utilisé côté client uniquement.
 * Gère l'interpolation (smoothing) pour un rendu fluide.
 * 
 * PRINCIPE IMPORTANT : La vitesse de déplacement est indépendante de la fréquence de tick.
 * - Côté serveur : utilise le temps réel écoulé (Date.now())
 * - Côté client : interpolation basée sur le temps, pas sur les frames
 */
export class RenderPlayer {
  public ref: Player;
  public renderX: number;
  public renderY: number;
    // Variables pour l'interpolation temporelle
  private currentTargetX: number;
  private currentTargetY: number;
  private previousTargetX: number;
  private previousTargetY: number;
  private interpolationStartTime: number;
  private interpolationDuration: number = 100; // ms, durée d'interpolation fixe indépendante de la fréquence serveur
  private hasNewTarget: boolean = false;

  constructor(player: Player) {
    this.ref = player;
    this.renderX = player.x;
    this.renderY = player.y;
    this.currentTargetX = player.x;
    this.currentTargetY = player.y;
    this.previousTargetX = player.x;
    this.previousTargetY = player.y;
    this.interpolationStartTime = Date.now();
  }  /** Met à jour la position cible quand on reçoit des données du serveur */
  updateServerPosition(x: number, y: number) {
    // Vérifier si c'est vraiment une nouvelle position
    const deltaX = Math.abs(x - this.currentTargetX);
    const deltaY = Math.abs(y - this.currentTargetY);
    
    if (deltaX > 0.1 || deltaY > 0.1) {      
      // La position actuelle devient l'ancienne cible
      this.previousTargetX = this.renderX; // Position visuelle actuelle
      this.previousTargetY = this.renderY;
      
      // Nouvelle cible
      this.currentTargetX = x;
      this.currentTargetY = y;
      
      // Redémarre l'interpolation
      this.interpolationStartTime = Date.now();
      this.hasNewTarget = true;
    }
  }

  /** Appelée à chaque frame côté client */
  smoothUpdate(dt: number) {
    if (!this.hasNewTarget) {
      return; // Pas de mouvement en cours
    }

    const now = Date.now();
    const elapsed = now - this.interpolationStartTime;
    const progress = Math.min(elapsed / this.interpolationDuration, 1.0);
      // Fonction d'easing pour un mouvement plus naturel (ease-out)
    // const easedProgress = 1 - Math.pow(1 - progress, 3);
    
    // Test avec interpolation linéaire pure pour débugger
    const easedProgress = progress;
    
    // Interpolation linéaire avec easing
    this.renderX = this.previousTargetX + (this.currentTargetX - this.previousTargetX) * easedProgress;
    this.renderY = this.previousTargetY + (this.currentTargetY - this.previousTargetY) * easedProgress;
    
    // Fin de l'interpolation
    if (progress >= 1.0) {
      this.renderX = this.currentTargetX;
      this.renderY = this.currentTargetY;
      this.hasNewTarget = false;
    }
  }
}
