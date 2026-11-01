import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { AppError } from "./rooms";

export const cookieName = (roomId: string) => `ao_${roomId}`;

export function sessionToken(req: NextRequest, roomId: string) {
  return req.cookies.get(cookieName(roomId))?.value;
}

export function setSessionCookie(res: NextResponse, req: NextRequest, roomId: string, token: string) {
  const https =
    req.headers.get("x-forwarded-proto") === "https" || req.nextUrl.protocol === "https:";
  res.cookies.set(cookieName(roomId), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: https,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function body(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    const b = await req.json();
    return b && typeof b === "object" ? b : {};
  } catch {
    return {};
  }
}

export function handle(fn: () => Promise<NextResponse> | NextResponse) {
  return Promise.resolve()
    .then(fn)
    .catch((e) => {
      if (e instanceof AppError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      console.error(e);
      return NextResponse.json({ error: "Erro inesperado. Tente de novo." }, { status: 500 });
    });
}
