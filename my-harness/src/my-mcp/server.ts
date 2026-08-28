import { createMcpServer } from "./createMcpServer";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";

export const runServer = async () => {
  const app = express();
  app.use(express.json());

  app.post("/mcp", async (req, res) => {
    const server = createMcpServer();

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

    res.on("close", () => {
      transport.close();
      server.close();
    });
  });

  app.get("/", (req, res) => res.json({ ok: true }));

  app.listen(3000, () => console.log("MCP server on http://localhost:3000"));
};
