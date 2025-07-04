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
     * Génère une nouvelle position cible aléatoire dans le rayon défini
     */
    generateTarget(): void {
        const angle = Math.random() * Math.PI * 2;
        // Utiliser entre 50% et 100% du rayon pour une distribution plus naturelle
        const radius = (0.5 + Math.random() * 0.5) * this.moveRadius;
        this.targetPos = {
            x: this.startX + Math.cos(angle) * radius,
            y: this.startY + Math.sin(angle) * radius,
        };
    }

    /**
     * Met à jour la position vers la cible avec mouvement organique
     */
    updatePosition(dt: number = 0.016): void {
        if (!this.targetPos) {
            this.generateTarget();
            return;
        }

        // Calculer la direction de base vers la cible
        const dx = this.targetPos.x - this.x;
        const dy = this.targetPos.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.5) {
            // Direction de base
            let nx = dx / dist;
            let ny = dy / dist;
            
            // Normaliser à nouveau
            // const length = Math.sqrt(nx * nx + ny * ny);
            // nx /= length;
            // ny /= length;
            
            // Calculer la distance à parcourir
            const moveDistance = this.moveSpeed * dt * 60; // Ajustement en fonction du dt
            
            // Appliquer le mouvement
            this.x += nx * moveDistance;
            this.y += ny * moveDistance;
            
            // Vérifier si la particule sort du rayon autorisé
            const distFromStart = Math.sqrt(
                Math.pow(this.x - this.startX, 2) + 
                Math.pow(this.y - this.startY, 2)
            );
            
            if (distFromStart > this.moveRadius) {
                // Ramener la particule à la limite du cercle
                const ratio = this.moveRadius / distFromStart;
                this.x = this.startX + (this.x - this.startX) * ratio;
                this.y = this.startY + (this.y - this.startY) * ratio;
                
                // Générer une nouvelle cible
                this.targetPos = null;
            }
        } else {
            // Arrivé à la cible, on en génère une nouvelle
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
        this.maxSize = 10000; // Augmentation pour gérer plus de particules
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