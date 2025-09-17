// src/modules/game/handlers/MoveHandler.ts

// src/modules/game/handlers/MoveHandler.ts
import type { ActionHandler } from "./ActionHandler";
import type { GameAction, SelectedEntity } from "../dtos/actions";
import { GameService } from "../GameService";

export class SelectHandler
  implements ActionHandler<Extract<GameAction, { type: "select" }>>
{
  handle(
    room: GameService,
    clientId: string,
    action: { type: "select"; payload: { selectedEntity: SelectedEntity } }
  ) {
    const player = room.getPlayer(clientId);
    if (!player) return;
    const sel = action.payload.selectedEntity;
    player.selectEntity(sel);
  }
}
