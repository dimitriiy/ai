import express from "express";
import { config, repoName, repoOwner } from "../config";

const router = express.Router();

router.get("/repo", (_req, res) => {
  res.json({ owner: repoOwner, name: repoName, fullName: config.repo });
});

export default router;
