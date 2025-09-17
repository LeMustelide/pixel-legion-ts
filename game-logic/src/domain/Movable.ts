export interface Movable {
  setTarget(x: number, y: number): void;
  update(dt: number): void;
}
