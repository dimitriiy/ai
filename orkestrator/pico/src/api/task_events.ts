import { Application, Request, Response, NextFunction } from "express";
import { db } from "../db";

const cache = new Map();

export const createTasksEventsApi = (app: Application) => {
  app.get("/api/task_events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    res.write(": connected\n\n");
    const id = req.query.v;

    if (!cache.has(id)) {
      cache.set(id, new Set());
    }

    setInterval(() => {
      const data = db.prepare("SELECT * from task_events").all();

      data.forEach((event) => {
        const complexId = `${event.id}-${event.seq}`;

        if (!cache.get(id).has(complexId)) {
          cache.get(id).add(complexId);
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
      });
    }, 1000);
  });
};
