import { NextResponse, type NextRequest } from "next/server";
import { body, handle, setSessionCookie } from "@/lib/http";
import { join } from "@/lib/rooms";

export function POST(req: NextRequest, ctx: RouteContext<"/api/rooms/[id]/join">) {
  return handle(async () => {
    const { id } = await ctx.params;
    const token = join(id, await body(req));
    const res = NextResponse.json({ ok: true });
    setSessionCookie(res, req, id, token);
    return res;
  });
}
