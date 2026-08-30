import { Application } from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const STAGES = ["fetch", "plan", "implement", "verify", "pr"] as const;

const MOCK_STEPS = STAGES.map((stage, i) => {
  const statuses = ["done", "done", "running", "pending", "pending"] as const;
  const status = statuses[i];
  const durationMs = status === "done" ? 1200 * (i + 1) : null;
  return {
    index: i + 1,
    stage,
    status,
    durationLabel: durationMs ? `${(durationMs / 1000).toFixed(1)}s` : "—",
    connector: i < STAGES.length - 1,
    connectorClass: status === "done" ? "done" : "",
  };
});

const TEMPLATE_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "./stepper.html",
);

const TEMPLATE = readFileSync(TEMPLATE_PATH, "utf8");

const renderSteps = (steps: typeof MOCK_STEPS) =>
  steps
    .map((step) => {
      let html = `  <div class="step ${step.status}">
    <div class="circle">${step.index}</div>
    <div class="label">${step.stage}</div>
    <div class="duration">${step.durationLabel}</div>
  </div>`;
      if (step.connector) {
        html += `\n  <div class="connector ${step.connectorClass}"></div>`;
      }
      return html;
    })
    .join("\n");

export const createStepperDemoApi = (app: Application) => {
  app.get("/api/stepper-demo", (_req, res) => {
    const html = TEMPLATE.replace("{{taskId}}", "42").replace(
      "<!--STEPS-->",
      renderSteps(MOCK_STEPS),
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });
};
