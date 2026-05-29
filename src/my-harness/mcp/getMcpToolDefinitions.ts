import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { BaseTool } from "../types";

export async function getMcpToolDefinitions(client: Client): Promise<BaseTool[]> {
  const listTools = await client.listTools();

  return listTools.tools.map((tool) => ({
    definition: {
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    },
  }));
}
