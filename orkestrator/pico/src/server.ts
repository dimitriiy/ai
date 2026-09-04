import "./db";

import cors from "cors";
import express from "express";
import tasksRouter from "./api/tasks";
import fetchRouter from "./api/fetch";
import worktreeRouter from "./api/worktree";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use("/api", tasksRouter);
app.use("/api", fetchRouter);
app.use("/api", worktreeRouter);

function onServerStart() {
  console.log("server start");
}
app.listen(3001, onServerStart);
