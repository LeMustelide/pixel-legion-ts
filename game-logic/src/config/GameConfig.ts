/**
 * Configuration globale du jeu
 * Centralise les paramètres ajustables et les performances
 */

export const GameConfig = {
  // Paramètres de spawn
  SPAWN: {
    INTERVAL_SECONDS: 3,
    PIXELS_PER_SPAWN: 15,
    MAX_GROUPS_PER_PLAYER: 2,
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
