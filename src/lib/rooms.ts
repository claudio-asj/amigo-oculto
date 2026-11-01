import "server-only";
import crypto from "node:crypto";
import { db, tx } from "./db";
import {
  hashPin,
  hashToken,
  normalizeName,
  randomToken,
  roomId,
  safeEqual,
  shuffle,
  verifyPin,
} from "./security";

export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

type RoomRow = {
  id: string;
  name: string;
  budget: string | null;
  event_date: string | null;
  admin_token_hash: string;
  drawn_at: number | null;
  created_at: number;
};

type ParticipantRow = {
  id: string;
  room_id: string;
  name: string;
  name_norm: string;
  pin_hash: string;
  wishlist: string;
  failed_logins: number;
  locked_until: number;
};

export type PublicRoom = {
  id: string;
  name: string;
  budget: string | null;
  eventDate: string | null;
  drawn: boolean;
  participants: { id: string; name: string }[];
};

const MAX_FAILED_LOGINS = 5;
const LOCK_MS = 15 * 60 * 1000;
export const MIN_PARTICIPANTS = 3;

function clean(s: unknown, max: number): string {
  return typeof s === "string" ? s.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

function validPin(pin: unknown): string {
  if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
    throw new AppError("A senha precisa ter 4 números, sem letras. Exemplo: 1234.");
  }
  return pin;
}

function getRoomRow(id: string): RoomRow {
  const row = db().prepare("SELECT * FROM rooms WHERE id = ?").get(id) as RoomRow | undefined;
  if (!row) throw new AppError("Sala não encontrada.", 404);
  return row;
}

function listParticipants(id: string) {
  return db()
    .prepare("SELECT id, name FROM participants WHERE room_id = ? ORDER BY created_at")
    .all(id) as { id: string; name: string }[];
}

/** Para metadados e imagens de preview: sala inexistente vira null, sem erro. */
export function findPublicRoom(id: string): PublicRoom | null {
  try {
    return getPublicRoom(id);
  } catch (e) {
    if (e instanceof AppError) return null;
    throw e;
  }
}

export function getPublicRoom(id: string): PublicRoom {
  const r = getRoomRow(id);
  return {
    id: r.id,
    name: r.name,
    budget: r.budget,
    eventDate: r.event_date,
    drawn: r.drawn_at !== null,
    participants: listParticipants(id),
  };
}

// ---------- Organizer ----------

export function createRoom(input: { name?: unknown; budget?: unknown; eventDate?: unknown }) {
  const name = clean(input.name, 80);
  if (!name) throw new AppError("Dê um nome para o grupo.");
  const budget = clean(input.budget, 40) || null;
  const eventDate = clean(input.eventDate, 20) || null;

  const id = roomId();
  const adminToken = randomToken();
  db()
    .prepare(
      "INSERT INTO rooms (id, name, budget, event_date, admin_token_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(id, name, budget, eventDate, hashToken(adminToken), Date.now());
  return { id, adminToken };
}

export function assertAdmin(id: string, token: unknown) {
  const r = getRoomRow(id);
  if (typeof token !== "string" || !safeEqual(hashToken(token), r.admin_token_hash)) {
    throw new AppError("Link de organizador inválido.", 403);
  }
}

export function removeParticipant(id: string, participantId: unknown) {
  const r = getRoomRow(id);
  if (r.drawn_at !== null) throw new AppError("O sorteio já foi feito.");
  db()
    .prepare("DELETE FROM participants WHERE id = ? AND room_id = ?")
    .run(String(participantId), id);
}

/**
 * Shuffle everyone into one big circle and each person gives to the next.
 * Nobody draws themselves, and nobody (organizer included) ever sees the list.
 */
export function draw(id: string) {
  tx(() => {
    const r = getRoomRow(id);
    if (r.drawn_at !== null) throw new AppError("O sorteio já foi feito.");
    const people = listParticipants(id);
    if (people.length < MIN_PARTICIPANTS) {
      throw new AppError(`São necessárias pelo menos ${MIN_PARTICIPANTS} pessoas.`);
    }
    const circle = shuffle(people);
    const insert = db().prepare(
      "INSERT INTO assignments (room_id, giver_id, receiver_id) VALUES (?, ?, ?)",
    );
    circle.forEach((giver, i) => {
      insert.run(id, giver.id, circle[(i + 1) % circle.length].id);
    });
    db().prepare("UPDATE rooms SET drawn_at = ? WHERE id = ?").run(Date.now(), id);
  });
}

// ---------- Participants ----------

function newSession(participantId: string): string {
  const token = randomToken();
  db()
    .prepare("INSERT INTO sessions (token_hash, participant_id, created_at) VALUES (?, ?, ?)")
    .run(hashToken(token), participantId, Date.now());
  return token;
}

export function join(id: string, input: { name?: unknown; pin?: unknown }) {
  const name = clean(input.name, 40);
  if (!name) throw new AppError("Escreva o seu nome no primeiro campo.");
  const pin = validPin(input.pin);

  return tx(() => {
    const r = getRoomRow(id);
    if (r.drawn_at !== null) {
      throw new AppError("O sorteio já foi feito, então não dá mais para entrar. Se você já tinha entrado antes, toque em “Já entrei antes” logo abaixo.");
    }
    const norm = normalizeName(name);
    const exists = db()
      .prepare("SELECT 1 FROM participants WHERE room_id = ? AND name_norm = ?")
      .get(id, norm);
    if (exists) {
      throw new AppError(
        "Já tem alguém com esse nome no sorteio. Se for você mesmo, toque em “Já entrei antes” logo abaixo. Se for outra pessoa, coloque também o seu sobrenome.",
        409,
      );
    }
    const pid = crypto.randomUUID();
    db()
      .prepare(
        "INSERT INTO participants (id, room_id, name, name_norm, pin_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(pid, id, name, norm, hashPin(pin), Date.now());
    return newSession(pid);
  });
}

export function login(id: string, input: { name?: unknown; pin?: unknown }) {
  const name = clean(input.name, 40);
  const pin = validPin(input.pin);
  getRoomRow(id);

  const p = db()
    .prepare("SELECT * FROM participants WHERE room_id = ? AND name_norm = ?")
    .get(id, normalizeName(name)) as ParticipantRow | undefined;
  const generic = new AppError(
    "O nome ou a senha não conferem. Confira se escreveu o nome do mesmo jeito da primeira vez e tente de novo.",
    401,
  );
  if (!p) throw generic;

  const now = Date.now();
  if (p.locked_until > now) {
    const min = Math.ceil((p.locked_until - now) / 60000);
    throw new AppError(`Foram muitas tentativas erradas. Por segurança, espere ${min} minutos e tente de novo.`, 429);
  }
  if (!verifyPin(pin, p.pin_hash)) {
    const fails = p.failed_logins + 1;
    const lock = fails >= MAX_FAILED_LOGINS ? now + LOCK_MS : 0;
    db()
      .prepare("UPDATE participants SET failed_logins = ?, locked_until = ? WHERE id = ?")
      .run(lock ? 0 : fails, lock, p.id);
    throw generic;
  }
  db().prepare("UPDATE participants SET failed_logins = 0, locked_until = 0 WHERE id = ?").run(p.id);
  return newSession(p.id);
}

export function participantFromSession(id: string, token: string | undefined) {
  if (!token) return null;
  const p = db()
    .prepare(
      `SELECT p.* FROM sessions s JOIN participants p ON p.id = s.participant_id
       WHERE s.token_hash = ? AND p.room_id = ?`,
    )
    .get(hashToken(token), id) as ParticipantRow | undefined;
  return p ?? null;
}

export function logout(token: string | undefined) {
  if (token) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
}

/** Everything a logged-in participant is allowed to see — and nothing more. */
export function myView(id: string, p: ParticipantRow) {
  const a = db()
    .prepare(
      `SELECT r.name, r.wishlist FROM assignments a JOIN participants r ON r.id = a.receiver_id
       WHERE a.room_id = ? AND a.giver_id = ?`,
    )
    .get(id, p.id) as { name: string; wishlist: string } | undefined;
  return {
    id: p.id,
    name: p.name,
    wishlist: p.wishlist,
    match: a ? { name: a.name, wishlist: a.wishlist } : null,
  };
}

export function setWishlist(participantId: string, wishlist: unknown) {
  const text = typeof wishlist === "string" ? wishlist.slice(0, 1000) : "";
  db().prepare("UPDATE participants SET wishlist = ? WHERE id = ?").run(text, participantId);
}
