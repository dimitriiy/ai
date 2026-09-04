import express from "express";
import { syncIssues } from "../github";

const router = express.Router();

router.post("/fetch", async (_req, res) => {
  const length = await syncIssues();

  try {
    res.json({ fetched: length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
