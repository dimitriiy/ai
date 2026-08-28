.PHONY: dev dev-rag dev-mcp dev-harness ollama chromadb check-ollama check-chromadb

# --- Всё вместе ---

# MCP-сервер + агент (ollama должна быть запущена)
dev: check-ollama dev-mcp
	@sleep 2
	@npx tsx --watch src/my-harness/index.ts

# RAG-пайплайн (ollama + chromadb должны быть запущены)
dev-rag: check-ollama check-chromadb
	npx tsx --watch src/my-rag/index.ts

# --- Отдельные сервисы ---

dev-mcp:
	@npx tsx --watch src/my-mcp/main.ts &

dev-harness: check-ollama
	npx tsx --watch src/my-harness/index.ts

# --- Внешние зависимости ---

ollama:
	@echo "Pulling qwen2.5:latest и запуск..."
	ollama run qwen2.5:latest

chromadb:
	@echo "Запуск ChromaDB на порту 8000..."
	docker run --rm -p 8000:8000 chromadb/chroma

# --- Проверки ---

check-ollama:
	@curl -sf http://localhost:11434/ > /dev/null 2>&1 || \
		(echo "❌ Ollama не запущена. Запустите: make ollama"; exit 1)
	@echo "✅ Ollama OK"

check-chromadb:
	@curl -sf http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1 || \
		(echo "❌ ChromaDB не запущена. Запустите: make chromadb"; exit 1)
	@echo "✅ ChromaDB OK"
