import { Player } from "../model/Player";
import type { GameState } from "../model/GameState";

function animatePlayerToTarget(player: Player, dt: number) {
  if (!player.target) return;
  const dx = player.target.x - player.x;
  const dy = player.target.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) {
    player.x = player.target.x;
    player.y = player.target.y;
    player.target = null;
    return;
  }

  const move = Math.min(player.speed * dt, dist);
  player.x += (dx / dist) * move;
  player.y += (dy / dist) * move;
}

export class SoloServer {
  private state: GameState;
  private listeners: Array<(state: GameState) => void> = [];

  constructor() {
    this.state = { players: { local: new Player("local", 400, 300) } };
  }

  /** Simule la réception d'une action client (ex: move) */
  handleAction(action: any) {
    if (action.type === "move" && this.state.players["local"]) {
      // On définit la cible, le serveur anime la position à chaque tick
      this.state.players["local"].target = {
        x: action.payload.x,
        y: action.payload.y,
      };
    }
  }
  /** Appelée à chaque frame pour animer les déplacements */
  update(dt: number) {
    // Utilise le dt réel passé par le game loop au lieu d'un dt fixe
    for (const player of Object.values(this.state.players)) {
      animatePlayerToTarget(player, dt);
    }
    this.emit();
  }

  /** Permet au client de s'abonner à l'état du jeu */
  onState(cb: (state: GameState) => void) {
    this.listeners.push(cb);
    cb(this.state); // Appel initial
  }

  private emit() {
    for (const cb of this.listeners) {
      cb(this.state);
    }
  }
}
