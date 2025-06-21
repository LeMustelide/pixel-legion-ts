// src/core/model/Player.ts
export class Player {
  public id: string;
  public x: number;
  public y: number;
  public selected = false;

  constructor(id: string, x = 0, y = 0) {
    this.id = id;
    this.x  = x;
    this.y  = y;
  }

  /** Met à jour la position depuis le serveur */
  updateFromServer(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /** Pour la prédiction locale (client-side prediction) */
  moveLocal(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /** Sélection / désélection */
  setSelected(sel: boolean) {
    this.selected = sel;
  }
}
