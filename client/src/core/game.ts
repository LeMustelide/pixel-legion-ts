import { Application } from "pixi.js";
import { GameRenderer } from "./GameRenderer";
import type { GameState } from "./model/GameState";
import type { IGameNetwork } from "./network/IGameNetwork";
import { RenderPlayer } from "./RenderPlayer";

export class Game {
  app: Application;
  renderer: GameRenderer;
  network: IGameNetwork;
  private stateCallback: ((state: GameState) => void) | null = null;
  private renderPlayers: Record<string, RenderPlayer> = {};

  constructor(container: HTMLDivElement, network: IGameNetwork) {
    this.app = new Application();
    this.renderer = new GameRenderer(this.app.stage);
    this.network = network;
    this.init(container);
  }

  setNetwork(network: IGameNetwork) {
    if (this.network && typeof this.network.close === "function") {
      this.network.close();
    }
    this.network = network;
    if (this.stateCallback) {
      this.network.onState(this.stateCallback);
    }
  }
  private async init(container: HTMLDivElement) {
    await this.app.init({
      backgroundColor: 0x000000,
      resizeTo: container,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    container.appendChild(this.app.canvas);

    this.network.onState((state: GameState) => this.syncState(state));

    // Configuration du ticker pour un rendu optimal
    this.app.ticker.add(() => this.update());
    this.app.ticker.maxFPS = 60;
    this.app.ticker.minFPS = 30;

    this.setupInput();
  }
  private syncState(state: GameState) {
    // Ajoute ou met à jour les RenderPlayer
    for (const [id, player] of Object.entries(state.players)) {
      if (!this.renderPlayers[id]) {
        this.renderPlayers[id] = new RenderPlayer(player);
      } else {
        // Met à jour seulement la position pour le smoothing
        this.renderPlayers[id].updateServerPosition(player.x, player.y);

        // Met à jour les autres propriétés sans écraser la référence si pas nécessaire
        if (this.renderPlayers[id].ref.selected !== player.selected) {
          this.renderPlayers[id].ref.selected = player.selected;
        }

        console.log(`[DEBUG] Player ${id} PIXELS: ${player.pixelGroups.length}`);
        
        this.renderPlayers[id].ref.pixelGroups = player.pixelGroups;
      }
        
    }
    // Supprime les RenderPlayer obsolètes
    for (const id of Object.keys(this.renderPlayers)) {
      if (!(id in state.players)) {
        // Nettoie aussi le rendu graphique
        this.renderer.removePlayer(id);
        delete this.renderPlayers[id];
      }
    }
    // Le rendu se fait maintenant dans update() pour être synchronisé à 60 FPS
    this.stateCallback = (s) => this.syncState(s);
  }

  private setupInput() {
    this.app.canvas.addEventListener("click", (evt) => {
      const rect = this.app.canvas.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      this.network.sendAction({ type: "move", payload: { x, y } });
    });
    this.app.canvas.addEventListener("contextmenu", (evt) => {
      evt.preventDefault();
    });
    this.app.canvas.addEventListener("keydown", (evt) => {
      if (evt.key === "p" || evt.key === "P") {
        this.network.joinRoom("default");
      }
    });
    this.app.canvas.tabIndex = 0;
  }

  private update() {
    for (const renderPlayer of Object.values(this.renderPlayers)) {
      renderPlayer.smoothUpdate();
    }
    // Force le re-rendu à chaque frame
    this.renderer.renderPlayers(this.renderPlayers); // Rendu des joueurs et leurs pixels
    this.renderer.renderPlayers(this.renderPlayers);

    // Rendu des pixels pour chaque joueur
    for (const renderPlayer of Object.values(this.renderPlayers)) {
      this.renderer.renderPlayerPixels(renderPlayer);
    }
    // Nettoyage des pixels orphelins
    this.renderer.cleanupPixels(this.renderPlayers);
  }
}
