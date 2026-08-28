CREATE TABLE IF NOT EXISTS tasks (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_number  INTEGER NOT NULL UNIQUE,
    issue_title   TEXT NOT NULL,
    issue_body    TEXT NOT NULL,
    status        TEXT NOT NULL,
    stage         TEXT NOT NULL,
    attempts      INTEGER NOT NULL DEFAULT 0,
    branch        TEXT,
    worktree_path TEXT,
    pr_url        TEXT,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
);
