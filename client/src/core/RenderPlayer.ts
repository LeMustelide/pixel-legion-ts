import { Player } from './model/Player';
import { Interpolator2D } from './utils/Interpolator2D';

/**
 * Wrapper d'affichage pour un joueur, utilisé côté client uniquement.
 * Gère l'interpolation (smoothing) pour un rendu fluide.
 * 
 * PRINCIPE IMPORTANT : La vitesse de déplacement est indépendante de la fréquence de tick.
 * - Côté serveur : utilise le temps réel écoulé (Date.now())
 * - Côté client : interpolation basée sur le temps, pas sur les frames
 */
export class RenderPlayer {
  public playerRef: Player;
  public renderX: number;
  public renderY: number;
  // Interpolateur générique réutilisable
  private interpolator: Interpolator2D;

  constructor(player: Player) {
    this.playerRef = Player.fromSerialized(player, player.id);
    this.renderX = player.x;
    this.renderY = player.y;
    this.interpolator = new Interpolator2D(player.x, player.y, 500);
  }  
  /** Met à jour la position cible quand on reçoit des données du serveur */
  updateServerPosition(x: number, y: number) {
    this.interpolator.setTarget(x, y);
  }

  /** Appelée à chaque frame côté client */
  smoothUpdate() {
    const v = this.interpolator.getValue();
    this.renderX = v.x;
    this.renderY = v.y;
  }
}
