import type { LocalTool } from "../types";
import { glob as globFunc } from "glob";

export const glob: LocalTool = {
  definition: {
    name: "glob",
    description:
      "Glob pattern to filter files, e.g. '**/*.ts', 'src/**/*.js'. Use when you need to find files.",

    input_schema: {
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "Path string for searching",
        },
      },
    },
  },

  handler: async (input) => {
    try {
      const pattern = input.pattern as string;

      if (!pattern) {
        throw new Error("Provide either 'pattern' or 'regex'");
      }

      const result = await globFunc(pattern, {
        cwd: process.cwd(),
        ignore: ["**/node_modules/**", "**/.git/**"],
        nodir: true,
      });

      return {
        content: result.length > 0 ? result.join("\n") : "No matches found",
        display: `Found ${result.length} files`,
      };
    } catch (e) {
      throw e instanceof Error ? e : new Error(String(e));
    }
  },
};
