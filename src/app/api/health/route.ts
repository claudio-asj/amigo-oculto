import { NextResponse } from "next/server";
import { connection } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  await connection();
  db().prepare("SELECT 1").get();
  return NextResponse.json({ ok: true });
}
