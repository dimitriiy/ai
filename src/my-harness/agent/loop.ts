import type { LLMClient } from "../llm/types";
import type { UI } from "../ui/console-ui";
import { ConversationHistory } from "./conversation-history";
import { ToolExecutor } from "../tools/tool-executor";
import { systemPrompt } from "../prompts/system";

const MAX_TRIES = 5;

export interface AgentDeps {
  llmClient: LLMClient;
  ui: UI;
  toolExecutor: ToolExecutor;
  history: ConversationHistory;
}

export async function runAgent(userText: string, deps: AgentDeps): Promise<string> {
  const { llmClient, ui, toolExecutor, history } = deps;
  let tries = 0;

  history.addUserMessage(userText);

  while (++tries <= MAX_TRIES) {
    ui.startSpinner();

    try {
      const response = await llmClient.sendMessage(
        history.getMessages(),
        toolExecutor.getToolDefinitions(),
        systemPrompt,
      );

      ui.stopSpinner();

      history.addAssistantMessage(response.content as any);

      if (response.stopReason === "end_turn") {
        return response.text ?? "[без текстового ответа]";
      }

      const toolUses = response.content.filter(
        (block): block is any => block.type === "tool_use"
      );

      if (toolUses.length === 0) {
        return response.text ?? "[без текстового ответа]";
      }

      const toolResults = await Promise.all(
        toolUses.map((tool) => toolExecutor.execute(tool))
      );

      const validResults = toolResults.filter((r): r is NonNullable<typeof r> => r !== null);
      
      if (validResults.length > 0) {
        history.addToolResults(validResults);
      }
    } catch (error) {
      ui.stopSpinner();
      throw error;
    }
  }

  return "[достигнут лимит попыток]";
}
