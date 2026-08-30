import "./db";

import express from "express";
import { createTasksApi } from "./api/tasks";
import { main } from "./scratch";
import { createTasksEventsApi } from "./api/task_events";
import { createStepperDemoApi } from "./api/stepper-demo";

const app = express();

createTasksApi(app);
createTasksEventsApi(app);
createStepperDemoApi(app);
main();

app.listen(3001, () => console.log("SSE server running on :3001"));

// import("./scratch").then((module) => module());
