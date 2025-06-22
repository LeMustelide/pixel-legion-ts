// src/modules/game/domain/Player.ts

export class Player {
    private id: string;
    private x: number;
    private y: number;
    private selected = false;
    private speed = 100; // pixels/seconde
    private target: { x: number; y: number } | null = null;

    constructor(id: string, x = 0, y = 0) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    moveTo(x: number, y: number) {
        // tu peux ajouter de la logique : vitesse max, collisions…
        this.x = x;
        this.y = y;
    }

    /** Met à jour la position depuis le serveur */
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

    /* GETTER AND SETTER */

    getId(): string {
        return this.id;
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    setTarget(x: number, y: number) {
        this.target = { x, y };
    }
}
