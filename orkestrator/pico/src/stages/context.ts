import fs from "fs";
import path from "path";
import type { Task } from "../types";
import { listFiles } from "../fs-utils";

export interface ContextResult {
  fileTree: string[];
  relevantFiles: Array<{
    path: string;
    content: string;
  }>;
  dependencies: Record<string, string>;
}

function getDeps(worktreePath: string): Record<string, string> {
  const pkgPath = path.join(worktreePath, "package.json");
  if (!fs.existsSync(pkgPath)) return {};

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  return { ...pkg["dependencies"], ...pkg["devDependencies"] };
}

export async function run(task: Task): Promise<ContextResult> {
  if (!task.worktreePath) {
    throw new Error("task.worktreePath is not defined in context");
  }

  const worktree = task.worktreePath;
  const fileTree = listFiles(worktree);

  const words = task.issueTitle
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);

  const relevantFiles = fileTree
    .filter((f) => words.some((w) => f.toLowerCase().includes(w)))
    .slice(0, 5)
    .map((f) => ({
      path: f,
      content: fs.readFileSync(path.join(worktree, f), "utf-8").slice(0, 6000),
    }));

  return {
    fileTree,
    relevantFiles,
    dependencies: getDeps(worktree),
  };
}
