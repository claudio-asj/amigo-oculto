import { NextResponse, type NextRequest } from "next/server";
import { handle, sessionToken } from "@/lib/http";
import { getPublicRoom, myView, participantFromSession } from "@/lib/rooms";

export function GET(req: NextRequest, ctx: RouteContext<"/api/rooms/[id]/me">) {
  return handle(async () => {
    const { id } = await ctx.params;
    const room = getPublicRoom(id);
    const p = participantFromSession(id, sessionToken(req, id));
    return NextResponse.json(
      { room, me: p ? myView(id, p) : null },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}
