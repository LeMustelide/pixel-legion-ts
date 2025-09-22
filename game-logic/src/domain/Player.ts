// src/modules/game/domain/Player.ts

import { GameConfig } from "../config/GameConfig";
import { PixelGroup } from "./PixelGroup";
import type { Movable } from "./Movable";
import type { SelectedEntity } from "../dtos/actions";

// Future ready: allow new selectable kinds without changing handlers
type SelectionResolver = (
  player: Player,
  sel: Exclude<SelectedEntity, null>
) => Movable | null;

export class Player implements Movable {
  private id: string;
  public x: number;
  public y: number;
  public color: string = "#ff4d4d"; // default, overridden at addPlayer
  // private selected = false;
  private speed = 100; // pixels/seconde
  private target: { x: number; y: number } | null = null;
  public pixelGroups: PixelGroup[] = [];
  public selectedEntity: SelectedEntity = null;
  // Index pour accès O(1) si besoin (reconstruit à l'ajout). Pour l'instant simple map.
  private pixelGroupsIndex: Map<string, PixelGroup> = new Map();
  // Table de résolution par kind
  private selectionResolvers: Record<string, SelectionResolver> = {
    pixelGroup: (player, sel) => {
      if (sel.kind !== "pixelGroup") return null;
      return player.pixelGroupsIndex.get(sel.id) || null;
    },
    self: (player, sel) => {
      if (sel.kind !== "self") return null;
      return player; // the player is also Movable
    },
  } as const;

  selectEntity(target: SelectedEntity) {
    this.selectedEntity = target;
  }

  clearSelection() {
    this.selectedEntity = null;
  }

  constructor(id: string, x = 0, y = 0, color?: string) {
    this.id = id;
    this.x = x;
    this.y = y;
    if (color) this.color = color;
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
  /**
   * Spawn un nouveau groupe de pixels avec options avancées
   * @param pixelCount Nombre de pixels à spawner
   * @param color Couleur des pixels
   */
  spawnPixelGroup(
    pixelCount: number = 25,
    color?: string
  ): PixelGroup | null {
    if (this.pixelGroups.length >= GameConfig.SPAWN.MAX_GROUPS_PER_PLAYER) {
      return null;
    }
    const group = new PixelGroup(pixelCount, [], this.x, this.y);
    group.initializePixels(color ?? this.color);
    // Positionner les pixels autour du joueur
    group.pixels.forEach((pixel) => {
      pixel.x += this.x;
      pixel.y += this.y;
      pixel.startX += this.x;
      pixel.startY += this.y;
    });
    this.pixelGroups.push(group);
    this.pixelGroupsIndex.set(group.id, group);
    return group;
  }

  /* GETTER AND SETTER */

  getId(): string {
    return this.id;
  }

  setTarget(x: number, y: number) {
    this.target = { x, y };
  }

  /**
   * Résout l'entité sélectionnée actuelle vers un Movable (player, groupe, etc.).
   * Retourne null si aucune sélection valide.
   * Ajout d'un nouveau type => ajouter une entrée dans selectionResolvers.
   */
  getSelectedMovable(): Movable | null {
    if (!this.selectedEntity) return null;
    const kind = this.selectedEntity.kind;
    const resolver = this.selectionResolvers[kind];
    if (!resolver) return null;
    return resolver(this, this.selectedEntity);
  }
}
