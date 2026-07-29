import { DatabaseSync } from "node:sqlite";
import path from "path";

// Uses Node's built-in SQLite module (stable, ships inside Node.js itself —
// requires Node >= 22.13 / 23.4, no flag needed). Zero native compilation,
// so no C++ build tools / Visual Studio requirement on any platform.
const dbPath = path.join(process.cwd(), "novaconvert.db");
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    image TEXT,
    provider TEXT NOT NULL DEFAULT 'credentials',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS conversions (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    file_name TEXT NOT NULL,
    from_format TEXT NOT NULL,
    to_format TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'done',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;

export type DbUser = {
  id: string;
  name: string | null;
  email: string;
  password: string | null;
  image: string | null;
  provider: string;
  created_at: string;
};

export function findUserByEmail(email: string): DbUser | undefined {
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  return row as DbUser | undefined;
}

export function createUser(user: { id: string; name?: string | null; email: string; password?: string | null; image?: string | null; provider?: string }) {
  db.prepare(
    "INSERT INTO users (id, name, email, password, image, provider) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    user.id,
    user.name ?? null,
    user.email,
    user.password ?? null,
    user.image ?? null,
    user.provider ?? "credentials"
  );
}

export function upsertOAuthUser(user: { id: string; name?: string | null; email: string; image?: string | null; provider: string }) {
  const existing = findUserByEmail(user.email);
  if (existing) return existing;
  createUser(user);
  return findUserByEmail(user.email)!;
}

export function logConversion(entry: { id: string; userEmail: string; fileName: string; fromFormat: string; toFormat: string; fileSize: number }) {
  db.prepare(
    "INSERT INTO conversions (id, user_email, file_name, from_format, to_format, file_size) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(entry.id, entry.userEmail, entry.fileName, entry.fromFormat, entry.toFormat, entry.fileSize);
}

export function getHistoryForUser(userEmail: string, limit = 50) {
  return db
    .prepare("SELECT * FROM conversions WHERE user_email = ? ORDER BY created_at DESC LIMIT ?")
    .all(userEmail, limit);
}

export function getStatsForUser(userEmail: string) {
  const total = db.prepare("SELECT COUNT(*) as c FROM conversions WHERE user_email = ?").get(userEmail) as { c: number };
  const size = db.prepare("SELECT COALESCE(SUM(file_size),0) as s FROM conversions WHERE user_email = ?").get(userEmail) as { s: number };
  const topFormat = db
    .prepare(
      "SELECT to_format, COUNT(*) as c FROM conversions WHERE user_email = ? GROUP BY to_format ORDER BY c DESC LIMIT 1"
    )
    .get(userEmail) as { to_format: string; c: number } | undefined;
  return {
    filesConverted: total.c,
    storageUsed: size.s,
    favoriteTool: topFormat?.to_format ?? "—",
  };
}
