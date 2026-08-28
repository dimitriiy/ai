import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, readFileSync, mkdirSync } from "node:fs";
import { config } from "../config";

const schemaDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "schema");

mkdirSync(path.dirname(config.dbPath), { recursive: true });

export const db = new Database(config.dbPath);
db.pragma("journal_mode = WAL");

for (const file of readdirSync(schemaDir).filter((f) => f.endsWith(".sql")).sort()) {
  db.exec(readFileSync(path.join(schemaDir, file), "utf8"));
}
