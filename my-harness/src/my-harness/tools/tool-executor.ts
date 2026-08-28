import type Anthropic from "@anthropic-ai/sdk";
import type { Client } from "@modelcontextprotocol/sdk/client";
import type { LocalTool, BaseTool } from "../types";

export interface ToolExecutionResult {
  type: "tool_result";
  content: string;
  tool_use_id: string;
}

export class ToolExecutor {
  private toolMap: Map<string, LocalTool | BaseTool>;
  private mcpClient: Client;

  constructor(tools: (LocalTool | BaseTool)[], mcpClient: Client) {
    this.toolMap = new Map(tools.map((t) => [t.definition.name, t]));
    this.mcpClient = mcpClient;
  }

  async execute(tool: Anthropic.Messages.ToolUseBlock): Promise<ToolExecutionResult | null> {
    const toolEntry = this.toolMap.get(tool.name);
    if (!toolEntry) {
      console.warn(`Tool not found: ${tool.name}`);
      return null;
    }

    let output: { content: string } | null = null;

    if ("handler" in toolEntry && toolEntry.handler) {
      const result = await toolEntry.handler(tool.input as Record<string, unknown>);
      output = result;
    } else {
      const resultMcp = await this.mcpClient.callTool({
        name: tool.name,
        arguments: tool.input as Record<string, unknown> | undefined,
      });
      console.log("mcp", resultMcp);
      output = resultMcp.content as { content: string };
    }

    if (!output) return null;

    return {
      type: "tool_result",
      content: output.content,
      tool_use_id: tool.id,
    };
  }

  getToolDefinitions(): Anthropic.Messages.Tool[] {
    return Array.from(this.toolMap.values()).map((t) => t.definition);
  }
}
