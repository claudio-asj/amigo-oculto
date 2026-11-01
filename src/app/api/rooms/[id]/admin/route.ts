import { NextResponse, type NextRequest } from "next/server";
import { body, handle } from "@/lib/http";
import { AppError, assertAdmin, draw, getPublicRoom, removeParticipant } from "@/lib/rooms";

/**
 * Organizer actions. Note: there is deliberately NO action that returns
 * the draw results — not even the organizer can see who got whom.
 */
export function POST(req: NextRequest, ctx: RouteContext<"/api/rooms/[id]/admin">) {
  return handle(async () => {
    const { id } = await ctx.params;
    const b = await body(req);
    assertAdmin(id, b.token);
    switch (b.action) {
      case "get":
        break;
      case "remove":
        removeParticipant(id, b.participantId);
        break;
      case "draw":
        draw(id);
        break;
      default:
        throw new AppError("Ação inválida.");
    }
    return NextResponse.json({ room: getPublicRoom(id) });
  });
}
