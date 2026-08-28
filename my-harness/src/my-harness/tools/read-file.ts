import fs from "node:fs/promises";
import type { LocalTool } from "../types";
import { getSafePath } from "./safe-path";

export const readFile: LocalTool = {
  definition: {
    name: "read_file",
    description:
      "Читает файл. Путь указывается относительно корня проекта (где package.json)",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string" },
      },
      required: ["path"],
    },
  },

  handler: async (input) => {
    const filePath = input.path as string;

    const safePath = getSafePath(filePath);
    const file = (await fs.readFile(safePath, "utf-8")).slice(0, 4000);

    return {
      content: file,
      display: file,
    };
  },
};
