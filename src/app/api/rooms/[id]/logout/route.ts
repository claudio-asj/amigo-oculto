import { NextResponse, type NextRequest } from "next/server";
import { cookieName, handle, sessionToken } from "@/lib/http";
import { logout } from "@/lib/rooms";

export function POST(req: NextRequest, ctx: RouteContext<"/api/rooms/[id]/logout">) {
  return handle(async () => {
    const { id } = await ctx.params;
    logout(sessionToken(req, id));
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(cookieName(id));
    return res;
  });
}
