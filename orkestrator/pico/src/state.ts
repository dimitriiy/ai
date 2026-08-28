import { db } from "./db/index.js";
import type { Stage, Task } from "./types.js";

interface Row {
  id: number;
  issue_number: number;
  issue_title: string;
  issue_body: string;
  status: string;
  stage: string;
  attempts: number;
  branch: string | null;
  worktree_path: string | null;
  pr_url: string | null;
  created_at: string;
  updated_at: string;
}

function rowToTask(row: Row): Task {
  return {
    id: row.id,
    issueNumber: row.issue_number,
    issueTitle: row.issue_title,
    issueBody: row.issue_body,
    status: row.status as Task["status"],
    stage: row.stage as Task["stage"],
    attempts: row.attempts,
    branch: row.branch,
    worktreePath: row.worktree_path,
    prUrl: row.pr_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const now = () => new Date().toISOString();

export function getTask(id: number): Task | null {
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | Row
    | undefined;
  return row ? rowToTask(row) : null;
}

export function getTaskByIssue(issueNumber: number): Task | null {
  const row = db
    .prepare("SELECT * FROM tasks WHERE issue_number = ?")
    .get(issueNumber) as Row | undefined;
  return row ? rowToTask(row) : null;
}

export function listTasks(): Task[] {
  const rows = db
    .prepare("SELECT * FROM tasks ORDER BY id DESC")
    .all() as Row[];
  return rows.map(rowToTask);
}

export function upsertTask(input: {
  issueNumber: number;
  issueTitle: string;
  issueBody: string;
}): Task | null {
  const exiting = getTaskByIssue(input.issueNumber);

  if (exiting) {
    db.prepare(
      "UPDATE tasks SET issue_title = ?, issue_body = ?, updated_at = ? WHERE id = ?",
    ).run(input.issueTitle, input.issueBody, now(), exiting.id);

    return getTask(exiting.id);
  }

  const ts = now();
  const info = db
    .prepare(
      `INSERT INTO tasks
         (issue_number, issue_title, issue_body, status, stage, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', 'fetch', ?, ?)`,
    )
    .run(input.issueNumber, input.issueTitle, input.issueBody, ts, ts);

  return getTask(Number(info.lastInsertRowid))!;
}

const MUTABLE = {
  status: "status",
  stage: "stage",
  attempts: "attempts",
  branch: "branch",
  worktreePath: "worktree_path",
  prUrl: "pr_url",
} as const;

export function updateTask(id: number, patch: Partial<Task>): Task {
  const sets: string[] = [];
  const values: (string | number | null)[] = [];
  for (const [key, column] of Object.entries(MUTABLE)) {
    const value = patch[key as keyof typeof MUTABLE];
    if (value !== undefined) {
      sets.push(`${column} = ?`);
      values.push(value);
    }
  }
  sets.push("updated_at = ?");
  values.push(now(), id);
  db.prepare(`UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`).run(...values);
  return getTask(id)!;
}

export function saveStageResult(
  taskId: number,
  stage: Stage,
  output: unknown, // что вернула стадия; уедет в базу через JSON.stringify
  attempt = 0, // номер попытки; по умолчанию 0
) {
  db.prepare(
    `INSERT OR REPLACE INTO stage_results (task_id, stage, attempt, output_json, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(
    taskId,
    stage,
    attempt ?? 0,
    JSON.stringify(output),
    new Date().toISOString(),
  );
}

export function getStageResult<T>(
  taskId: number,
  stage: Stage,
  attempt?: number,
): T | null {
  const row = db
    .prepare(
      `SELECT * from  stage_results WHERE task_id = ? and stage = ? and attempt = ?`,
    )
    .get(taskId, stage, attempt);

  return row ? (JSON.parse(row.output_json) as T) : null;
}
