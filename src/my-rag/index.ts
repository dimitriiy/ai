import fs from "node:fs/promises";
import path from "node:path";
import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { readFile } from "fs/promises";
import console from "node:console";

const OLLAMA_BASE_URL = "http://localhost:11434";
const LLM_MODEL = "qwen2.5:latest";
const EMBEDDING_MODEL = "embeddinggemma";
const COLLECTION_NAME = "faq-bot";

async function loadDocuments() {
  const filePath = path.resolve(
    process.cwd(),
    "src/my-rag/data",
    "knowledge.txt",
  );
  const data = await readFile(filePath, "utf-8");

  return [
    new Document({
      pageContent: data,
      metadata: { source: "knowledge.txt" },
    }),
  ];
}

async function buildVectorStore() {
  const docs = await loadDocuments();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 120,
  });

  const splitDocs = await splitter.splitDocuments(docs);

  const embeddings = new OllamaEmbeddings({
    model: EMBEDDING_MODEL,
    baseUrl: OLLAMA_BASE_URL,
  });

  const vectorStore = await Chroma.fromDocuments(splitDocs, embeddings, {
    collectionName: COLLECTION_NAME,
    url: "http://localhost:8000",
  });

  return vectorStore;
}

async function ask(question: string) {
  const embeddings = new OllamaEmbeddings({
    model: EMBEDDING_MODEL,
    baseUrl: OLLAMA_BASE_URL,
  });

  const vectorStore = new Chroma(embeddings, {
    collectionName: COLLECTION_NAME,
    url: "http://localhost:8000",
  });

  const retriever = vectorStore.asRetriever(6);
  const docs = await retriever.invoke(question);

  console.log(docs);
  const context = docs
    .map((d, i) => `Фрагмент ${i + 1}:\n${d.pageContent}`)
    .join("\n\n");

  const llm = new ChatOllama({
    model: LLM_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0,
  });

  const prompt = `
Ты — помощник компании.
Отвечай только на основе контекста ниже.
Если ответа в контексте нет, так и скажи.

Контекст:
${context}

Вопрос:
${question}
`;

  const response = await llm.invoke(prompt);
  console.log("\nОтвет:\n", response.content);
}

async function main() {
  const command = process.argv[2];
  const arg = process.argv.slice(3).join(" ");

  if (command === "index") {
    await buildVectorStore();
    console.log("Индексация завершена");
    return;
  }

  if (command === "ask") {
    await ask(arg);
    return;
  }

  console.log(`Использование:
  npm run dev -- index
  npm run dev -- ask "Какие сроки доставки?"
  `);
}

await buildVectorStore();
main().catch(console.error);
