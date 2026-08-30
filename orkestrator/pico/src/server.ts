import "./db";

import cors from "cors";
import express from "express";
import { createTaskApi } from "./api/task";
import { createTasksApi } from "./api/tasks";
import { main } from "./scratch";
import { createTasksEventsApi } from "./api/task_events";
import { createStepperDemoApi } from "./api/stepper-demo";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

createTasksApi(app);
createTasksEventsApi(app);
createStepperDemoApi(app);
createTaskApi(app);

function onServerStart() {
  main();
  console.log("server start");
}
app.listen(3001, onServerStart);

// import("./scratch").then((module) => module());
