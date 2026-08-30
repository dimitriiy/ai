import { Application, Request, Response, NextFunction } from "express";
import { db } from "../db";

const cache = new Set();

export const createTasksApi = (app: Application) => {
  app.get("/api/tasks", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    res.write(": connected\n\n");

    setInterval(() => {
      const data = db.prepare("SELECT * from tasks").all();

      data.forEach((task) => {
        if (!cache.has(task.id)) {
          cache.add(task.id);
          res.write(`${JSON.stringify(task, null, 2)}\n\n`);
        }
      });
    }, 1000);
  });
};
