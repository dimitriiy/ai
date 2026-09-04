import { listTasks } from "./state.js";
import { syncIssues } from "./github.js";

const INTERVAL_MS = 15_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

for (;;) {
  try {
    for (const task of listTasks()) {
      if (task.status === "pending") {
      }
    }

    await sleep(INTERVAL_MS);
  } catch (e) {}
}
