import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";

export async function connectMcpServer(): Promise<Client> {
  const transport = new StreamableHTTPClientTransport(
    new URL("http://localhost:3000/mcp"),
  );

  const client = new Client({ name: "my-agent", version: "1.0.0" });
  await client.connect(transport);

  const result = await client.listTools();

  return client;
}
