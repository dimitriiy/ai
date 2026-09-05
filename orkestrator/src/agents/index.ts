import { CliAgent } from "./cli.js";
import { StubAgent } from "./stub.js";
import type { CodingAgent } from "./types.js";

export function createAgent(): CodingAgent {
  return process.env.CODING_AGENT === "claude_cli"
    ? new CliAgent()
    : new StubAgent();
}

export type { CodingAgent, AgentStage, AgentResult } from "./types.js";
