CREATE TABLE IF NOT EXISTS agent_sessions (
  task_id    INTEGER NOT NULL,
  stage      TEXT NOT NULL,
  session_id TEXT NOT NULL,
  PRIMARY KEY (task_id, stage)
);