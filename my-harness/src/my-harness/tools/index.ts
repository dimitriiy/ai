import type { Client } from "@modelcontextprotocol/sdk/client";
import { getMcpToolDefinitions } from "../mcp/getMcpToolDefinitions";
import type { LocalTool, BaseTool } from "../types";
import { bash } from "./bash";
import { getTime } from "./get-time";
import { glob } from "./glob";
import { grep } from "./grep";
import { listDir } from "./list-dir";
import { readFile } from "./read-file";
import { writeFile } from "./write-file";

export const createTools = async (mcpClient: Client) => {
  const mcpTools = await getMcpToolDefinitions(mcpClient);

  const tools: (LocalTool | BaseTool)[] = [
    getTime,
    writeFile,
    bash,
    readFile,
    listDir,
    grep,
    glob,
    ...mcpTools,
  ];

  return tools;
};
