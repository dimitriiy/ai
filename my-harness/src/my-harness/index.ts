import { runAgent } from "./agent/loop";
import { ConversationHistory } from "./agent/conversation-history";
import { ConsoleUI } from "./ui/console-ui";
import { AnthropicLLMClient } from "./llm/anthropic-client";
import { connectMcpServer } from "./mcp/client";
import { createTools } from "./tools";
import { ToolExecutor } from "./tools/tool-executor";

async function main() {
  const ui = new ConsoleUI();
  const mcpClient = await connectMcpServer();
  const tools = await createTools(mcpClient);
  const llmClient = new AnthropicLLMClient();
  const toolExecutor = new ToolExecutor(tools, mcpClient);
  const history = new ConversationHistory();

  ui.print("Наивный агент запущен. Напиши сообщение. Для выхода: exit");

  try {
    while (true) {
      const userText = await ui.ask("You: ");

      if (userText === "exit") break;
      if (!userText) continue;

      try {
        const reply = await runAgent(userText, {
          llmClient,
          ui,
          toolExecutor,
          history,
        });
        ui.print(`\n${ui.renderMarkdown(reply)}\n`);
      } catch (err) {
        ui.printError(`Ошибка агента: ${err}`);
      }
    }
  } finally {
    ui.close();
  }
}

main();
