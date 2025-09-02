import { Application } from "pixi.js";
import { GameRenderer } from "./GameRenderer";
import type { GameState } from "./model/GameState";
import type { IGameNetwork } from "./network/IGameNetwork";
import { RenderPlayer } from "./RenderPlayer";
import { StateSynchronizer } from "./StateSynchronizer";

export class Game {
  app: Application;
  renderer: GameRenderer;
  network: IGameNetwork;
  private stateSynchronizer: StateSynchronizer;
  private stateCallback: ((state: GameState) => void) | null = null;
  private renderPlayers: Record<string, RenderPlayer> = {};
  private currentPlayerId: string | null = null;

  constructor(container: HTMLDivElement, network: IGameNetwork) {
    this.app = new Application();
    this.renderer = new GameRenderer(this.app.stage);
    this.network = network;
    this.stateSynchronizer = new StateSynchronizer(this.renderer, this.renderPlayers);
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

    this.stateCallback = (state: GameState) => {
      this.identifyCurrentPlayer();
      this.stateSynchronizer.sync(state);
    };
    this.network.onState(this.stateCallback);

    // Configuration du ticker pour un rendu optimal
    this.app.ticker.add(() => this.update());
    this.app.ticker.maxFPS = 60;
    this.app.ticker.minFPS = 30;

    this.setupInput();
  }


  private identifyCurrentPlayer() {
    // En mode solo, le joueur courant est toujours 'localPlayer'
    if (this.network.constructor.name === 'SoloNetwork') {
      this.currentPlayerId = 'localPlayer';
    } else {
      // En mode multijoueur, on pourrait avoir un ID spécifique 
      // Pour l'instant, on prend le premier joueur (à améliorer selon votre logique)
      const playerIds = Object.keys(this.renderPlayers);
      this.currentPlayerId = playerIds.length > 0 ? playerIds[0] : null;
    }
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
    
    // Gestionnaires d'événements pour l'effet d'hover
    this.app.canvas.addEventListener("mousemove", (evt) => {
      const rect = this.app.canvas.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      this.handleMouseMove(x, y);
    });
    
    this.app.canvas.addEventListener("mouseleave", () => {
      this.handleMouseLeave();
    });
    
    this.app.canvas.tabIndex = 0;
  }

  private handleMouseMove(x: number, y: number) {
    if (!this.currentPlayerId) return;
    
    // Délègue la gestion de l'hover au renderer
    this.renderer.handleMouseMove(x, y, this.currentPlayerId, this.renderPlayers);
  }

  private handleMouseLeave() {
    // Désactive tous les effets d'hover
    this.renderer.clearAllHover();
  }

  private update() {
    for (const renderPlayer of Object.values(this.renderPlayers)) {
      renderPlayer.smoothUpdate();
    }
    // Force le re-rendu à chaque frame
    this.renderer.renderPlayers(this.renderPlayers);

    // Rendu des pixels pour chaque joueur
    for (const renderPlayer of Object.values(this.renderPlayers)) {
      this.renderer.renderPlayerPixels(renderPlayer);
    }
    // Nettoyage des pixels orphelins
    this.renderer.cleanupPixels(this.renderPlayers);
  }

  public pause() {
    this.app.stop();
    this.network.pause();
  }

  public resume() {
    this.app.start();
    this.network.resume();
  }
}
