CREATE TABLE IF NOT EXISTS stage_results (
    task_id INTEGER NOT NULL,
    attempt INTEGER NOT NULL,
    stage   TEXT NOT NULL,
    kind    TEXT NOT NULL,
    created_at   TEXT NOT NULL,
    output_json TEXT NOT NULL,
    PRIMARY KEY (task_id, stage, attempt)
);


