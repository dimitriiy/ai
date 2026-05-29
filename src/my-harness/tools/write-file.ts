import fs from "node:fs/promises";
import type { LocalTool } from "../types";
import { Buffer } from "node:buffer";
import { getSafePath } from "./safe-path";

export const writeFile: LocalTool = {
  definition: {
    name: "write_file",
    description:
      "Write UTF-8 content to a file at a path relative to the working directory. Overwrites if the file exists and creates missing parent directories. Paths that escape the working directory, or content exceeding the size cap, are rejected. Returns JSON: { ok, path, bytes }.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string" },
        content: { type: "string", nullable: true },
      },
      required: ["path"],
    },
  },

  handler: async (input) => {
    const filePath = input.path as string;
    const content = (input.content ?? "") as string;
    const safePath = getSafePath(filePath);
    const bytes = Buffer.byteLength(content, "utf-8");

    await fs.writeFile(safePath, content, "utf-8");

    const result = JSON.stringify({ ok: true, path: filePath, bytes });

    return { content: result, display: `write_file: ${filePath}` };
  },
};
