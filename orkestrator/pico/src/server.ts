import "./db";

import cors from "cors";
import express from "express";
import taskRouter from "./api/task";
import tasksRouter from "./api/tasks";
import taskEventsRouter from "./api/task_events";
import { main } from "./scratch";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use("/api", tasksRouter);
app.use("/api", taskEventsRouter);
app.use("/api", taskRouter);

function onServerStart() {
  main();
  console.log("server start");
}
app.listen(3001, onServerStart);
