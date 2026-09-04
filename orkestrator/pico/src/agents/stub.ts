import path from "path";
import { recordEvent } from "../events";
import type { Task } from "../types";
import type { AgentResult, AgentStage, CodingAgent } from "./types";
import fs from "fs";

export class StubAgent implements CodingAgent {
  name = "stub";

  async apply(
    task: Task,
    worktree: string,
    _input: string,
    stage: AgentStage,
  ): Promise<AgentResult> {
    let response: string;

    switch (stage) {
      case "plan":
        recordEvent(task.id, stage, "agent_tool", {
          tool: "Read",
          detail: "README.md",
        });
        response = `stub plan for issue #${task.issueNumber}\n\nPlan: append one line to README.md`;
        break;

      case "implement": {
        recordEvent(task.id, stage, "agent_tool", {
          tool: "Edit",
          detail: "README.md",
        });

        const target = path.join(worktree, "README.md");
        const line = `foundry-bot: task #${task.id} — ${task.issueTitle}\n`;
        fs.appendFileSync(target, line, "utf8");
        response = `appended 1 line to README.md for issue #${task.issueNumber}`;
        break;
      }
      case "verify":
        recordEvent(task.id, stage, "agent_tool", {
          tool: "Bash",
          detail: "echo ok",
        });
        response = "PASS\nstub always verifies";
        break;

      default:
        throw new Error(`unknown stage: ${stage}`);
    }

    recordEvent(task.id, stage, "agent_text", { text: response });

    return { response, sessionId: null };
  }
}
