import fs from "node:fs";
import path from "node:path";

export const SKIP = new Set([
  ".git",
  "node_modules",
  "dist",
  "worktrees",
  ".venv",
]);

export function listFiles(
  root: string,
  dir = root,
  acc: string[] = [],
): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) listFiles(root, full, acc);
    else acc.push(path.relative(root, full));
  }
  return acc;
}
