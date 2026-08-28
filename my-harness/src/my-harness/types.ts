import type Anthropic from "@anthropic-ai/sdk";

export type ToolDefinition = Anthropic.Messages.Tool;

export interface ToolResult {
  content: string; // sent back to the model as tool_result
  display: string; // one-line human summary printed to the terminal
}

export type BaseTool = {
  definition: ToolDefinition;
};

export interface LocalTool extends BaseTool {
  handler?: (
    input: Record<string, unknown>,
  ) => Promise<ToolResult> | ToolResult;
}

export type ChatMessage = Anthropic.Messages.MessageParam;
