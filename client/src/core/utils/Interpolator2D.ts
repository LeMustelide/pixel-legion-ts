/**
 * Generic time-based 2D interpolator (independent from frame rate).
 * - Call setTarget(x, y) when a new server position arrives
 * - Call getValue(now?) each frame to get the smoothed position
 */
export class Interpolator2D {
  private current: { x: number; y: number };
  private start: { x: number; y: number };
  private target: { x: number; y: number };
  private startTime: number;
  private duration: number; // ms
  private epsilon = 0.1;

  constructor(initialX: number, initialY: number, durationMs = 500) {
    this.current = { x: initialX, y: initialY };
    this.start = { x: initialX, y: initialY };
    this.target = { x: initialX, y: initialY };
    this.startTime = Date.now();
    this.duration = durationMs;
  }

  setTarget(x: number, y: number) {
    if (Math.abs(x - this.target.x) < this.epsilon && Math.abs(y - this.target.y) < this.epsilon) {
      return;
    }
    // Restart interpolation from current value
    this.start = { x: this.current.x, y: this.current.y };
    this.target = { x, y };
    this.startTime = Date.now();
  }

  /** Linear easing by default; replace for ease-out if desired */
  private ease(t: number) {
    // return 1 - Math.pow(1 - t, 3); // easeOutCubic
    return t; // linear
  }

  /** Update and return current interpolated value */
  getValue(now: number = Date.now()): { x: number; y: number } {
    const elapsed = now - this.startTime;
    const progress = Math.max(0, Math.min(1, this.duration <= 0 ? 1 : elapsed / this.duration));
    const k = this.ease(progress);
    this.current = {
      x: this.start.x + (this.target.x - this.start.x) * k,
      y: this.start.y + (this.target.y - this.start.y) * k,
    };
    return this.current;
  }

  /** Snap without interpolation (useful for initialization) */
  snapTo(x: number, y: number) {
    this.current = { x, y };
    this.start = { x, y };
    this.target = { x, y };
    this.startTime = Date.now();
  }
}
