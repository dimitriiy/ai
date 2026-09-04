import express from "express";
import { worktreeTest } from "../worktree";

const router = express.Router();

router.post("/worktree-test", async (_req, res) => {
  try {
    await worktreeTest();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
