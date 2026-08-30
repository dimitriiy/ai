import { Application } from "express";
import { db } from "../db";
import type { Task } from "../types";
import { listTasks, rowToTask } from "../state";
import { readEvents } from "../events";
import { projectStages, projectTask } from "../projection";

export const createTaskApi = (app: Application) => {
  app.get("/api/tasks", (_req, res) => {
    const tasks = listTasks().map((t) =>
      projectTask(t, readEvents(t.id), false),
    );
    res.json(tasks);
  });
};
