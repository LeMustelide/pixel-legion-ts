/**
 * Configuration globale du jeu
 * Centralise les paramètres ajustables et les performances
 */

export const GameConfig = {
  // Paramètres de spawn
  SPAWN: {
    INTERVAL_SECONDS: 3,
    PIXELS_PER_SPAWN: 15,
    MAX_GROUPS_PER_PLAYER: 10,
  },
  // Paramètres joueur
  PLAYERS: {
    // Palette cyclée à l'arrivée des joueurs
    COLORS: [
      "#ff4d4d", // rouge
      "#4da6ff", // bleu
      "#8cff66", // vert
      "#ffcc00", // jaune
      "#cc66ff", // violet
      "#00e6e6", // cyan
    ],
  },
  
  // Combat / Attaque automatique entre groupes de joueurs différents
  ATTACK: {
    // Distance maximale entre centres de groupes pour engager le combat
    RANGE: 100, // pixels
    // NOUVELLE FORMULE : dégâts par seconde = attacker.pixelCount * PIXEL_DAMAGE_FACTOR
    PIXEL_DAMAGE_FACTOR: 0.25, // 0.25 => 40 pixels infligent 10 pixels/sec
    // (Déprécié) Ancienne formule à base de BASE_DPS + N * DPS_PER_PIXEL
    BASE_DPS: 2,          // deprecated
    DPS_PER_PIXEL: 0.10,  // deprecated
    MIN_DPS: 1,           // deprecated
    // Limite de perte de pixels par tick pour lisser la disparition (0 = illimité)
    MAX_PIXEL_LOSS_PER_TICK: 0,
  },
  
  // Paramètres de performance
  PERFORMANCE: {
    // Si true, ajuste automatiquement le nombre de pixels en fonction des FPS
    ADAPTIVE_QUALITY: true,
    TARGET_FPS: 60,
    MIN_FPS: 30,
    // Nombre max de pixels affichables simultanément (tous joueurs confondus)
    MAX_TOTAL_PIXELS: 10000,
  },
  
  // Paramètres visuels des pixels
  PIXELS: {
    DEFAULT_MOVE_SPEED: 0.2,
    MAX_MOVE_SPEED: 0.5,
    DEFAULT_WOBBLE_AMPLITUDE: 0.3,
    MAX_WOBBLE_AMPLITUDE: 0.8,
    WOBBLE_SPEED_MIN: 0.5,
    WOBBLE_SPEED_MAX: 2.5,
  },
  
  // Fonctions utilitaires
  getPerformanceScale(): number {
    // À implémenter : mesure de la performance actuelle pour scaling dynamique
    // Cette fonction pourrait être appelée périodiquement pour ajuster la qualité
    return 1.0; // Par défaut, échelle normale
  }
};
