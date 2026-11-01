import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "amigo-oculto.db");

declare global {
  var __amigoDb: DatabaseSync | undefined;
}

function open(): DatabaseSync {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS rooms (
      id               TEXT PRIMARY KEY,
      name             TEXT NOT NULL,
      budget           TEXT,
      event_date       TEXT,
      admin_token_hash TEXT NOT NULL,
      drawn_at         INTEGER,
      created_at       INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS participants (
      id            TEXT PRIMARY KEY,
      room_id       TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      name          TEXT NOT NULL,
      name_norm     TEXT NOT NULL,
      pin_hash      TEXT NOT NULL,
      wishlist      TEXT NOT NULL DEFAULT '',
      failed_logins INTEGER NOT NULL DEFAULT 0,
      locked_until  INTEGER NOT NULL DEFAULT 0,
      created_at    INTEGER NOT NULL,
      UNIQUE (room_id, name_norm)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash     TEXT PRIMARY KEY,
      participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
      created_at     INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assignments (
      room_id     TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      giver_id    TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
      receiver_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
      PRIMARY KEY (room_id, giver_id)
    );
  `);
  return db;
}

export function db(): DatabaseSync {
  globalThis.__amigoDb ??= open();
  return globalThis.__amigoDb;
}

/** Runs fn inside a transaction (node:sqlite is synchronous, so this is safe). */
export function tx<T>(fn: () => T): T {
  const d = db();
  d.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    d.exec("COMMIT");
    return result;
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}
