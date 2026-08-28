import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { LocalTool } from "../types";
import { BASH_MAX_BUFFER } from "../config";

const execAsync = promisify(exec);

export const bash: LocalTool = {
  definition: {
    name: "bash",
    description:
      "Run a shell command in the working directory and capture its output. Returns JSON: { ok, exitCode, stdout, stderr, timedOut }",
    input_schema: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command to execute" },
      },
      required: ["command"],
    },
  },

  handler: async (input) => {
    try {
      const { stdout, stderr } = await execAsync(input.command as string, {
        cwd: process.cwd(),
        timeout: 10_000,
        maxBuffer: BASH_MAX_BUFFER,
      });

      const result = JSON.stringify({
        ok: true,
        exitCode: 0,
        stdout,
        stderr,
        timedOut: false,
      });
      return { content: result, display: `bash: ${input.command}` };
    } catch (err: any) {
      const result = JSON.stringify({
        ok: false,
        exitCode: err.code ?? 1,
        stdout: err.stdout ?? "",
        stderr: err.stderr ?? err.message,
        timedOut: err.killed ?? false,
      });
      return { content: result, display: `bash: ${input.command} (failed)` };
    }
  },
};
