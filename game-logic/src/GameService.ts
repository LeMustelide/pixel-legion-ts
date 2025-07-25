// src/modules/game/GameService.ts

import { GameState } from "./domain/GameState";
import type { GameAction } from "./dtos/actions";
import type { ActionHandler } from "./handlers/ActionHandler";
import { MoveHandler } from "./handlers/MoveHandler";

/**
 * Callback appelé à chaque tick avec l’état sérialisé.
 */
export type StateCallback = (state: ReturnType<GameState["snapshot"]>) => void;

/**
 * Permet, si nécessaire, d’émettre des actions côté réseau.
 * En pratique, souvent inutilisé en mode solo ou multi (les
 * handlers peuvent directement agir sur le state).
 */
export type ActionSender = (clientId: string, action: GameAction) => void;

/**
 * GameService : le cœur de la simulation, totalement indépendant
 * du transport (WebSocket, HTTP, offline…).
 */
export class GameService {
  private state = new GameState();
  private handlers: Record<string, ActionHandler>;
  private tickInterval: ReturnType<typeof setInterval>;
  private lastTickTime: number = Date.now();

  // Ajout : timers de spawn par joueur
  private spawnTimers: Map<string, number> = new Map();
  private readonly SPAWN_INTERVAL_SECONDS = 3;
  private readonly PIXELS_PER_SPAWN = 50;

  /**
   * @param onState    callback pour recevoir l’état à chaque tick
   * @param sendAction callback facultatif pour renvoyer des actions
   * @param tickRateMs intervalle de tick en millisecondes (défaut 50ms = 20 FPS)
   */
  private onState: StateCallback;
  private tickRateMs: number;

  constructor(onState: StateCallback, tickRateMs = 50) {
    this.onState = onState;
    this.tickRateMs = tickRateMs;

    // Instanciation de tous les handlers d’actions supportées
    this.handlers = {
      move: new MoveHandler(),
    };

    // Démarre la boucle de simulation
    this.tickInterval = setInterval(() => this.tick(), this.tickRateMs);
  }

  /** Ajoute un nouveau joueur à l’état */
  public addPlayer(clientId: string) {
    this.state.addPlayer(clientId);
    this.spawnTimers.set(clientId, 0); // Initialiser le timer de spawn pour ce joueur
  }

  /** Retire un joueur de l’état */
  public removePlayer(clientId: string) {
    this.state.removePlayer(clientId);
    this.spawnTimers.delete(clientId); // Nettoyer le timer de spawn
  }

  /**
   * Reçoit une action d’un client et la dispatch vers le handler adapté.
   * @param clientId identifiant du joueur
   * @param action   action reçue
   */
  public handleAction(clientId: string, action: GameAction) {
    const handler = this.handlers[action.type];
    if (handler) {
      handler.handle(this, clientId, action);
    }
  }

  /** Boucle principale : mise à jour physique/IA, puis émission d’état */
  private tick() {
    const now = Date.now();
    const dt = (now - this.lastTickTime) / 1000; // Temps réel écoulé en secondes
    this.lastTickTime = now;

    // Gestion du spawn des PixelGroup pour chaque joueur, sans jamais effacer ceux des autres
    for (const [id, player] of this.state.getPlayers().entries()) {
      // Initialiser le timer si besoin
      if (!this.spawnTimers.has(id)) {
        this.spawnTimers.set(id, 0);
      }
      let timer = this.spawnTimers.get(id) ?? 0;
      timer += dt;
      if (timer >= this.SPAWN_INTERVAL_SECONDS) {
        timer = 0;
        player.spawnPixelGroup(this.PIXELS_PER_SPAWN, "red");
        console.log(`Spawning pixel group for player ${id} (${player.pixelGroups.length})`);
      }
      this.spawnTimers.set(id, timer);
    }

    this.state.updatePhysics(dt);
    const snapshot = this.state.snapshot();
    this.onState(snapshot);
  }

  /** Stoppe la boucle de simulation */
  public dispose() {
    clearInterval(this.tickInterval);
  }

  /**
   * Helper exposé aux handlers pour accéder à un joueur.
   * @param clientId identifiant du joueur
   */
  public getPlayer(clientId: string) {
    return this.state.getPlayer(clientId);
  }

  /**
   * Vérifie si l'état du jeu est vide (aucun joueur).
   * @return true si l'état est vide, false sinon.
   * */
  public isEmpty(): boolean {
    return this.state.isEmpty();
  }
}
