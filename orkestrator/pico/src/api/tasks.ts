import express from "express";
import { db } from "../db";

const router = express.Router();

const cache = new Map();

router.get("/tasks", (req, res) => {
  const id = req.query.v;

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write(": connec1ted\n\n");

  setInterval(() => {
    const data = db.prepare("SELECT * from tasks").all() as { id: unknown }[];

    if (!cache.has(id)) {
      cache.set(id, new Set());
    }

    data.forEach((task) => {
      if (!cache.get(id).has(task.id)) {
        cache.get(id).add(task.id);
        res.write(`data: ${JSON.stringify(task)}\n\n`);
      }
    });
  }, 1000);
});

export default router;
