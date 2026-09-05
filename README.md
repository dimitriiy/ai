# ai

Монорепозиторий AI-инструментов.

## Проекты

### [orkestrator](orkestrator/README.md)

Мини-оркестратор для автономного выполнения задач из GitHub Issues силами AI-агента. Берёт issue с определённым лейблом, прогоняет через пайплайн `fetch → plan → implement → verify → pr`, открывает Pull Request с решением.

- **Backend**: Node.js + TypeScript, Express, SQLite, Anthropic SDK, Octokit
- **Frontend**: React + Vite, Mantine UI, TanStack Query
- **Изоляция**: каждая задача — отдельный git worktree (параллельное выполнение)
- **Запуск**: `make install && make all`

### [my-harness](my-harness/README.md)

Три сервиса для локальной работы с AI:

- **`my-harness`** — терминальный REPL-агент с инструментами (файлы, grep, bash)
- **`my-mcp`** — MCP-сервер на Express (порт 3000)
- **`my-rag`** — RAG-пайплайн: ChromaDB + LangChain + Ollama

- **Стек**: Node.js + TypeScript, Ollama (`qwen2.5`), ChromaDB (Docker)
- **Запуск**: `make dev` (агент + MCP) / `make dev-rag` (RAG)
