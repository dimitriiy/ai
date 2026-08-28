import "dotenv/config";
import path from "node:path";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`config error: ${name} is required`);

  return value;
}

export const config = {
  githubToken: required("GITHUB_TOKEN"),
  repo: required("GITHUB_REPO"),
  anthropicKey: required("ANTHROPIC_API_KEY"),

  issueLabel: process.env.ISSUE_LABEL ?? "pico-task",
  baseBranch: process.env.BASE_BRANCH ?? "main",
  dbPath: path.resolve(process.env.DB_PATH ?? "./data/pico.sqlite"),
  worktreeRoot: path.resolve(process.env.WORKTREE_ROOT ?? "./worktrees"),
  verifyCommand: process.env.VERIFY_COMMAND ?? "",
  maxAttempts: Number(process.env.MAX_ATTEMPTS ?? 2),
  port: Number(process.env.PORT ?? 8000),
};

export const [repoOwner, repoName] = config.repo.split("/");
