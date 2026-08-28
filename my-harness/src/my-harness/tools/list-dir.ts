import type { LocalTool } from "../types";
import fs from "fs/promises";
import { direntType } from "../utils/file";
import { getSafePath } from "./safe-path";

export const listDir: LocalTool = {
  definition: {
    name: "list_dir",
    description:
      "List files and directories at a path relative to the working directory. Returns a JSON array of { name, type } objects, where type is one of: dir, file, symlink, block, char, fifo, socket, unknown. Paths that escape the working directory are rejected.",
    input_schema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: 'Relative path (use "." for cwd)',
        },
      },
    },
  },

  handler: async (input: Record<string, unknown>) => {
    const safePath = getSafePath(input.path as string);

    const dirs = await fs.readdir(safePath, { withFileTypes: true });

    const payload = dirs.map((dir) => ({
      name: dir.name,
      type: direntType(dir),
    }));

    return {
      content: JSON.stringify(payload, null, 2),
      display: `${safePath} (${payload.length} entries)`,
    };
  },
};
