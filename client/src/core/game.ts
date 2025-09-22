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
  private currentPlayerId: string = 'localPlayer';
  // Pointer / hold-to-move state
  private isPointerDown: boolean = false;
  private pointerX: number = 0;
  private pointerY: number = 0;
  private pointerHoldSendIntervalMs: number = 100; // send move every X ms while held
  private lastPointerMoveSend: number = 0;

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

    // Subscribe to joined event if network exposes it
    if ((this.network as any).onJoined) {
      (this.network as any).onJoined((id: string) => {
        this.currentPlayerId = id;
      });
    }

    // Configuration du ticker pour un rendu optimal
    this.app.ticker.add(() => this.update());
    this.app.ticker.maxFPS = 60;
    this.app.ticker.minFPS = 30;

    this.setupInput();
  }

  private identifyCurrentPlayer() {
    // Prefer explicit local id if provided by the network
    const localId = this.network.getLocalPlayerId();
    if (localId) {
      this.currentPlayerId = localId;
      return;
    }

    // Fallback : premier joueur connu
    const playerIds = Object.keys(this.renderPlayers);
    this.currentPlayerId = playerIds.length > 0 ? playerIds[0] : 'localPlayer';
  }

  private setupInput() {
    this.app.canvas.addEventListener("pointerdown", (evt: PointerEvent) => {
      const rect = this.app.canvas.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;

      const selectedEntity = this.renderer.getHoveredEntity(this.currentPlayerId);
      if (selectedEntity) {
        this.renderPlayers[this.currentPlayerId]?.playerRef.selectEntity(selectedEntity);
        this.network.sendAction({ type: "select", payload: { selectedEntity }});
        return;
      }

      this.isPointerDown = true;
      this.pointerX = x;
      this.pointerY = y;
      this.lastPointerMoveSend = 0;
      this.network.sendAction({ type: "move", payload: { x, y } });

      try { (evt.target as HTMLElement).setPointerCapture(evt.pointerId); } catch (e) { /* ignore */ }
    });

    this.app.canvas.addEventListener("pointermove", (evt: PointerEvent) => {
      const rect = this.app.canvas.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      this.pointerX = x;
      this.pointerY = y;
      this.handleMouseMove(x, y);
    });

    const endPointer = (evt?: PointerEvent) => {
      this.isPointerDown = false;
      if (evt && evt.pointerId != null) {
        try { (evt.target as HTMLElement).releasePointerCapture(evt.pointerId); } catch (e) { /* ignore */ }
      }
    };

    this.app.canvas.addEventListener("pointerup", endPointer);
    this.app.canvas.addEventListener("pointercancel", endPointer);
    
    this.app.canvas.addEventListener("contextmenu", (evt) => {
      evt.preventDefault();
    });
    
    this.app.canvas.addEventListener("keydown", (evt) => {
      if (evt.key === "p" || evt.key === "P") {
        this.network.joinRoom("default");
      }
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
    // Effets de tirs/attaques entre groupes proches
    this.renderer.renderAttackBeams(this.renderPlayers);
    // Nettoyage des pixels orphelins
    this.renderer.cleanupPixels(this.renderPlayers);

    // While pointer is held, periodically send move intentions to follow the pointer
    if (this.isPointerDown) {
      const now = performance.now();
      if (now - this.lastPointerMoveSend >= this.pointerHoldSendIntervalMs) {
        this.lastPointerMoveSend = now;
        this.network.sendAction({ type: "move", payload: { x: this.pointerX, y: this.pointerY } });
      }
    }
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
