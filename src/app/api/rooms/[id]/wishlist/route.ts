import { NextResponse, type NextRequest } from "next/server";
import { AppError, participantFromSession, setWishlist } from "@/lib/rooms";
import { body, handle, sessionToken } from "@/lib/http";

export function PUT(req: NextRequest, ctx: RouteContext<"/api/rooms/[id]/wishlist">) {
  return handle(async () => {
    const { id } = await ctx.params;
    const p = participantFromSession(id, sessionToken(req, id));
    if (!p) throw new AppError("Entre na sala primeiro.", 401);
    setWishlist(p.id, (await body(req)).wishlist);
    return NextResponse.json({ ok: true });
  });
}
