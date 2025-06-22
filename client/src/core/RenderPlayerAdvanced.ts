import type { Player } from './model/Player';

/**
 * Version avancée du RenderPlayer avec prédiction et compensation de lag
 */
export class RenderPlayerAdvanced {
  public ref: Player;
  public renderX: number;
  public renderY: number;
  
  // Variables pour l'interpolation avancée
  private targetX: number;
  private targetY: number;
  private lastServerX: number;
  private lastServerY: number;
  private serverTimestamp: number = 0;
  private lastUpdateTime: number = 0;
  
  // Prédiction de mouvement
  private velocityX: number = 0;
  private velocityY: number = 0;
  private interpolationSpeed: number = 200;

  constructor(player: Player) {
    this.ref = player;
    this.renderX = player.x;
    this.renderY = player.y;
    this.targetX = player.x;
    this.targetY = player.y;
    this.lastServerX = player.x;
    this.lastServerY = player.y;
    this.lastUpdateTime = Date.now();
  }

  /** Met à jour la position cible avec prédiction de mouvement */
  updateServerPosition(x: number, y: number, timestamp?: number) {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000;
    
    if (deltaTime > 0 && (Math.abs(x - this.lastServerX) > 0.1 || Math.abs(y - this.lastServerY) > 0.1)) {
      // Calcule la vélocité basée sur le mouvement serveur
      this.velocityX = (x - this.lastServerX) / deltaTime;
      this.velocityY = (y - this.lastServerY) / deltaTime;
      
      // Si on a un timestamp serveur, on peut compenser le lag
      if (timestamp) {
        const lagCompensation = (now - timestamp) / 1000;
        this.targetX = x + this.velocityX * lagCompensation;
        this.targetY = y + this.velocityY * lagCompensation;
      } else {
        this.targetX = x;
        this.targetY = y;
      }
      
      this.lastServerX = x;
      this.lastServerY = y;
      this.lastUpdateTime = now;
    }
  }

  /** Appelée à chaque frame côté client avec prédiction */
  smoothUpdate(dt: number) {
    // Prédiction basée sur la vélocité actuelle
    const predictedX = this.targetX + this.velocityX * dt * 0.1; // Facteur conservateur
    const predictedY = this.targetY + this.velocityY * dt * 0.1;
    
    const dx = predictedX - this.renderX;
    const dy = predictedY - this.renderY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Si on est très proche, on s'y téléporte
    if (distance < 1) {
      this.renderX = predictedX;
      this.renderY = predictedY;
      return;
    }
    
    // Interpolation adaptative : plus rapide si on est loin
    const adaptiveSpeed = this.interpolationSpeed * (1 + Math.min(distance / 100, 2));
    const moveDistance = Math.min(adaptiveSpeed * dt, distance);
    const moveRatio = moveDistance / distance;
    
    this.renderX += dx * moveRatio;
    this.renderY += dy * moveRatio;
  }
}
