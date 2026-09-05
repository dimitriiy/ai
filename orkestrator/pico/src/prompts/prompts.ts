import path from "path";
import { fileURLToPath } from "url";
import type { AgentStage } from "../agents";

import fs from "node:fs";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "prompts");

export function renderPrompt(
  stage: AgentStage,
  vars: Record<string, string>,
): string {
  const template = fs.readFileSync(path.join(DIR, `${stage}.md`), "utf8");
  return template.replace(/\{\{(\w+)\}\}/g, (whole, key) => vars[key] ?? whole);
}
