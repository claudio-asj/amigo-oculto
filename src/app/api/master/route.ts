import { NextResponse, type NextRequest } from "next/server";
import { body, handle } from "@/lib/http";
import { assertMaster, masterOverview } from "@/lib/master";

export function POST(req: NextRequest) {
  return handle(async () => {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    assertMaster((await body(req)).password, ip);
    return NextResponse.json(masterOverview());
  });
}
