import express from "express";
import { db } from "../db";
import { readEvents } from "../events";
import { projectTask } from "../projection";
import { getTask, listTasks, updateTask } from "../state";
import { runTask } from "../pipeline";
import { syncIssues } from "../github";

const router = express.Router();

router.get("/tasks", (_req, res) => {
  const tasks = listTasks().map((t) => projectTask(t, readEvents(t.id), false));
  res.json(tasks);
});

router.get("/tasks/:id", (req, res) => {
  const task = getTask(Number(req.params.id));

  if (!task) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(projectTask(task, readEvents(task.id), true));
});

router.post("/tasks/:id/run", (req, res) => {
  const task = getTask(Number(req.params.id));
  if (!task) {
    res.status(404).json({ error: "not found" });
    return;
  }

  runTask(task);

  res.json({ ok: true });
});

router.post("/tasks/sync", async (_req, res) => {
  try {
    const count = await syncIssues();
    res.json({ ok: true, synced: count });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/tasks/clear-all", (_req, res) => {
  db.exec(`
    DELETE FROM task_events;
    DELETE FROM tasks;
    DELETE FROM stage_results;
    UPDATE tasks SET status = 'pending', stage = 'fetch', attempts = 0, branch = NULL, worktree_path = NULL, pr_url = NULL;
  `);
  res.json({ ok: true });
});

router.post("/tasks/:id/resume", (req, res) => {
  const task = getTask(Number(req.params.id));
  if (!task) {
    res.status(404).json({ error: "not found" });
    return;
  }
  if (task.status === "running") {
    res.status(409).json({ error: "task is running" });
    return;
  }
  const updated = updateTask(task.id, { status: "pending", stage: "fetch" });

  res.json(projectTask(updated, readEvents(updated.id), true));
});

router.get("/tasks/:id/events", (req, res) => {
  const taskId = Number(req.params.id);
  let lastSeen = Number(req.headers["last-event-id"] ?? 0);

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write(": connected\n\n");

  const tick = () => {
    for (const event of readEvents(taskId, lastSeen)) {
      lastSeen = event.seq;
      res.write(
        `id: ${event.seq}\nevent: ${event.kind}\ndata: ${JSON.stringify(event)}\n\n`,
      );
    }
  };

  tick();
  const interval = setInterval(tick, 500);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

export default router;
