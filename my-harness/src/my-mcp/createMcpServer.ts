import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";

export const createMcpServer = () => {
  const server = new McpServer({
    name: "my-mcp-server",
    version: "1.0.0",
  });

  server.registerTool(
    "add_numbers",
    {
      title: "add numbers",
      description: "Сложение двух чисел",
      inputSchema: {
        a: z.number().describe("Первое число"),
        b: z.number().describe("Второе число"),
      },
    },
    async ({ a, b }) => {
      return {
        content: [{ type: "text", text: String(a + b) }],
      };
    },
  );

  server.registerTool(
    "get_time",
    {
      title: "get local time",
      description: "get local time",
      inputSchema: {},
    },
    async () => {
      return {
        content: [{ type: "text", text: new Date().toISOString() }],
      };
    },
  );

  return server;
};
