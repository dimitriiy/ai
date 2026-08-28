CREATE TABLE IF NOT EXISTS task_events (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    seq     INTEGER NOT NULL,
    stage   TEXT NOT NULL,
    kind    TEXT NOT NULL,
    ts_ms   INTEGER NOT NULL,
    payload TEXT NOT NULL,
    UNIQUE (task_id, seq)
);

CREATE INDEX IF NOT EXISTS idx_events_task_seq ON task_events(task_id, seq);
