import { Application, Request, Response, NextFunction } from "express";
import { db } from "../db";

const cache = new Set();

//   seq: number;
//   taskId: number;
//   stage: Stage;
//   kind: EventKind;
//   tsMs: number;
//   payload: Record<string, unknown>;
// }

export const createTasksEventsApi = (app: Application) => {
  app.get("/api/task_events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    res.write(": connected\n\n");

    setInterval(() => {
      const data = db.prepare("SELECT * from task_events").all();

      data.forEach((event) => {
        const id = `${event.id}-${event.seq}`;

        if (!cache.has(id)) {
          cache.add(id);
          res.write(`${JSON.stringify(event, null, 2)}\n\n`);
        }
      });
    }, 1000);
  });
};
