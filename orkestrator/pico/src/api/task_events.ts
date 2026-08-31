import express from "express";
import { db } from "../db";

const router = express.Router();

const cache = new Map();

router.get("/task_events", (req, res) => {
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
    const data = db.prepare("SELECT * from task_events").all() as {
      id: unknown;
      seq: unknown;
    }[];

    data.forEach((event) => {
      const complexId = `${event.id}-${event.seq}`;

      if (!cache.get(id).has(complexId)) {
        cache.get(id).add(complexId);
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    });
  }, 1000);
});

export default router;
