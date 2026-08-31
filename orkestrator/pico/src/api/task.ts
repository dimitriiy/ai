import express from "express";
import { listTasks } from "../state";
import { readEvents } from "../events";
import { projectTask } from "../projection";

const router = express.Router();

router.get("/tasks", (_req, res) => {
  const tasks = listTasks().map((t) =>
    projectTask(t, readEvents(t.id), false),
  );
  res.json(tasks);
});

export default router;
