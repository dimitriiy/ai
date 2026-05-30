# AI Aggregator

Три сервиса в одном репозитории:

- **`my-harness`** — терминальный REPL-агент с локальными инструментами (чтение файлов, `grep`, `bash`)
- **`my-mcp`** — MCP-сервер на Express (порт 3000), расширяет агента внешними инструментами
- **`my-rag`** — RAG-пайплайн: индексация в ChromaDB + ответы через LangChain + Ollama

## Требования

- Node.js 20+
- [Ollama](https://ollama.com) (`qwen2.5:latest`)
- Docker (для ChromaDB)

## Запуск

```bash
# 1. Установка зависимостей
npm install

# 2. Запуск Ollama (терминал 1)
make ollama

# 3. Запуск ChromaDB (терминал 2, нужен для my-rag)
make chromadb

# 4. Запуск сервисов (терминал 3)
make dev         # агент + MCP-сервер
make dev-rag     # RAG-пайплайн
```

## Отдельные команды

| Команда | Описание |
|---|---|
| `make dev` | `my-mcp` + `my-harness` |
| `make dev-rag` | `my-rag` (требует ChromaDB) |
| `make dev-mcp` | Только MCP-сервер |
| `make dev-harness` | Только REPL-агент |
| `npm run typecheck` | Проверка типов TypeScript |

## Структура

```
src/
  my-harness/   агент с инструментами
  my-mcp/       MCP-сервер
  my-rag/       RAG-пайплайн
```
