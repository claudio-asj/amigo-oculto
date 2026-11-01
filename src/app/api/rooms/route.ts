import { NextResponse, type NextRequest } from "next/server";
import { body, handle } from "@/lib/http";
import { createRoom } from "@/lib/rooms";

export function POST(req: NextRequest) {
  return handle(async () => NextResponse.json(createRoom(await body(req))));
}
