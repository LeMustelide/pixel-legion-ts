// src/core/model/Player.ts
export class Player {
  public id: string;
  public x: number;
  public y: number;
  public selected = false;
  public speed = 100; // pixels/seconde
  public target: { x: number, y: number } | null = null;

  constructor(id: string, x = 0, y = 0) {
    this.id = id;
    this.x  = x;
    this.y  = y;
  }

  /** Met à jour la position depuis le serveur */
  updateFromServer(x: number, y: number, target?: { x: number, y: number }) {
    this.x = x;
    this.y = y;
    if (target) this.target = target;
  }

  /** Pour la prédiction locale (client-side prediction) */
  moveLocal(targetX: number, targetY: number) {
    this.target = { x: targetX, y: targetY };
  }

  /** Avance le joueur vers sa cible selon sa vitesse et le temps écoulé */
  update(dt: number) {
    if (!this.target) return;
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) {
      this.x = this.target.x;
      this.y = this.target.y;
      this.target = null;
      return;
    }
    const move = Math.min(this.speed * dt, dist);
    this.x += (dx / dist) * move;
    this.y += (dy / dist) * move;
  }

  /** Sélection / désélection */
  setSelected(sel: boolean) {
    this.selected = sel;
  }
}
