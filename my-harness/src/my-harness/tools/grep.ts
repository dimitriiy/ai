import { promisify } from "util";
import type { LocalTool } from "../types";
import { execFile } from "child_process";

const execFileAsync = promisify(execFile);

export const grep: LocalTool = {
  definition: {
    name: "grep",
    description:
      "Search file contents using regex. Fast search across codebase.",
    input_schema: {
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "Plain string for searching",
        },
        regex: {
          type: "string",
          description: "Regex string for searching",
        },
      },
    },
  },

  handler: async (input) => {
    try {
      const pattern = (input.pattern ?? input.regex) as string | undefined;

      if (!pattern) {
        throw new Error("Provide either 'pattern' or 'regex'");
      }

      const regexFlag = input.regex ? "-E" : "-F";

      const result = await execFileAsync("grep", [
        "-rn",
        regexFlag,
        "--exclude-dir=node_modules",
        pattern, // безопасно — не интерпретируется shell
        ".",
      ]);

      return {
        content: result.stdout,
        display: result.stdout || "No matches found",
      };
    } catch (e: any) {
      if (e.code === 1) {
        return { content: "", display: "No matches found" };
      }
      throw new Error(e.stderr ?? e.message);
    }
  },
};
