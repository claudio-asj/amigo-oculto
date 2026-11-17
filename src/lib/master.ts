import "server-only";
import { db } from "./db";
import { AppError } from "./rooms";
import { hashToken, safeEqual } from "./security";

// Painel geral do dono do site. A senha vem de MASTER_PASSWORD (nunca no código:
// o repositório é público). Sem a variável, o painel fica desligado.
//
// De propósito NÃO mostra quem tirou quem: o site promete que ninguém vê isso.

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const fails = new Map<string, { count: number; until: number }>();

export function assertMaster(password: unknown, ip: string) {
  const expected = process.env.MASTER_PASSWORD;
  if (!expected) throw new AppError("Painel desligado.", 404);

  const now = Date.now();
  const f = fails.get(ip);
  if (f && f.until > now) {
    const min = Math.ceil((f.until - now) / 60000);
    throw new AppError(`Muitas tentativas erradas. Espere ${min} minutos.`, 429);
  }
  const ok =
    typeof password === "string" && safeEqual(hashToken(password), hashToken(expected));
  if (!ok) {
    const count = (f?.count ?? 0) + 1;
    fails.set(ip, count >= MAX_FAILS ? { count: 0, until: now + LOCK_MS } : { count, until: 0 });
    throw new AppError("Senha errada.", 401);
  }
  fails.delete(ip);
}

type RoomRow = {
  id: string;
  name: string;
  budget: string | null;
  event_date: string | null;
  drawn_at: number | null;
  created_at: number;
};

type ParticipantRow = {
  id: string;
  room_id: string;
  name: string;
  wishlist: string;
  created_at: number;
  sessions: number;
};

export type MasterRoom = {
  id: string;
  name: string;
  budget: string | null;
  eventDate: string | null;
  createdAt: number;
  drawnAt: number | null;
  participants: { id: string; name: string; wishlist: string; joinedAt: number; sessions: number }[];
};

export function masterOverview() {
  const rooms = db()
    .prepare("SELECT id, name, budget, event_date, drawn_at, created_at FROM rooms ORDER BY created_at DESC")
    .all() as RoomRow[];
  const people = db()
    .prepare(
      `SELECT p.id, p.room_id, p.name, p.wishlist, p.created_at,
              (SELECT COUNT(*) FROM sessions s WHERE s.participant_id = p.id) AS sessions
       FROM participants p ORDER BY p.created_at`,
    )
    .all() as ParticipantRow[];

  const byRoom = new Map<string, MasterRoom["participants"]>();
  for (const p of people) {
    const list = byRoom.get(p.room_id) ?? [];
    list.push({ id: p.id, name: p.name, wishlist: p.wishlist, joinedAt: p.created_at, sessions: p.sessions });
    byRoom.set(p.room_id, list);
  }

  const list: MasterRoom[] = rooms.map((r) => ({
    id: r.id,
    name: r.name,
    budget: r.budget,
    eventDate: r.event_date,
    createdAt: r.created_at,
    drawnAt: r.drawn_at,
    participants: byRoom.get(r.id) ?? [],
  }));

  return {
    stats: {
      rooms: rooms.length,
      drawn: rooms.filter((r) => r.drawn_at !== null).length,
      participants: people.length,
      wishlists: people.filter((p) => p.wishlist.trim()).length,
    },
    rooms: list,
  };
}
