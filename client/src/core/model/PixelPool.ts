/**
 * Système de pooling pour les pixels
 * Optimise la gestion mémoire en réutilisant les objets SimplePixel
 */

interface Position {
    x: number;
    y: number;
}

// Simple pixel data object
class SimplePixel {
    x!: number;
    y!: number;
    startX!: number;
    startY!: number;
    moveRadius!: number;
    moveSpeed!: number;
    color!: string;
    targetPos!: Position | null;

    constructor(x: number = 0, y: number = 0, moveRadius: number = 5, color: string = "#fff") {
        this.reset(x, y, moveRadius, color);
    }

    reset(x: number, y: number, moveRadius: number, color: string = "#fff"): void {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.moveRadius = moveRadius;
        this.moveSpeed = 0.2;
        this.color = color;
        this.targetPos = null;
    }

    /**
     * Génère une nouvelle position cible aléatoire
     */
    generateTarget(): void {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * this.moveRadius;
        this.targetPos = {
            x: this.startX + Math.cos(angle) * radius,
            y: this.startY + Math.sin(angle) * radius,
        };
    }

    /**
     * Met à jour la position vers la cible
     */
    updatePosition(): void {
        if (!this.targetPos) {
            this.generateTarget();
            return;
        }

        const dx = this.targetPos.x - this.x;
        const dy = this.targetPos.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 2) {
            const nx = dx / dist;
            const ny = dy / dist;
            this.x += nx * this.moveSpeed;
            this.y += ny * this.moveSpeed;
        } else {
            this.targetPos = null;
        }
    }
}

/**
 * Pool manager pour les pixels
 */
class PixelPool {
    private pool: SimplePixel[];
    private maxSize: number;

    constructor() {
        this.pool = [];
        this.maxSize = 1000; // Limite pour éviter une croissance excessive
    }

    /**
     * Récupère un pixel du pool ou en crée un nouveau
     */
    get(x: number, y: number, moveRadius: number, color: string): SimplePixel {
        let pixel: SimplePixel;
        if (this.pool.length > 0) {
            pixel = this.pool.pop()!;
            pixel.reset(x, y, moveRadius, color);
        } else {
            pixel = new SimplePixel(x, y, moveRadius, color);
        }
        return pixel;
    }

    /**
     * Remet un pixel dans le pool
     */
    release(pixel: SimplePixel): void {
        if (this.pool.length < this.maxSize) {
            this.pool.push(pixel);
        }
    }

    /**
     * Libère un tableau de pixels
     */
    releaseAll(pixels: SimplePixel[]): void {
        pixels.forEach(pixel => this.release(pixel));
    }

    /**
     * Vide le pool
     */
    clear(): void {
        this.pool.length = 0;
    }

    /**
     * Retourne la taille actuelle du pool
     */
    size(): number {
        return this.pool.length;
    }
}

// Instance singleton
const pixelPool = new PixelPool();

// Export des fonctions d'interface
export function getPooledPixel(x: number, y: number, moveRadius: number, color: string): SimplePixel {
    return pixelPool.get(x, y, moveRadius, color);
}

export function releasePixel(pixel: SimplePixel): void {
    pixelPool.release(pixel);
}

export function releasePixels(pixels: SimplePixel[]): void {
    pixelPool.releaseAll(pixels);
}

export function clearPixelPool(): void {
    pixelPool.clear();
}

export function getPoolSize(): number {
    return pixelPool.size();
}

export { SimplePixel };