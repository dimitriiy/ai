import { spawn } from "node:child_process";

// Пример: запускаем "claude" с аргументом-запросом
console.log(
  "ANTHROPIC_API_KEY:",
  process.env.ANTHROPIC_API_KEY ? "✅ задан" : "❌ не задан",
);
console.log("Длина:", process.env.ANTHROPIC_API_KEY?.length);
const args = [
  "-p",
  " напищи 5 ф-ий сортирвоко разных",
  "--output-format",
  "stream-json",
  "--verbose",
  "--max-turns",
  "20",
];

const child = spawn("claude", args, {
  stdio: ["ignore", "pipe", "pipe"],
});

// Читаем вывод по частям (потоково)
child.stdout.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  process.stdout.write(chunk); // сразу печатаем в терминал
  // или накапливаете: buffer += chunk;
});

// Ошибки/лог stderr
child.stderr.setEncoding("utf8");
child.stderr.on("data", (chunk) => {
  console.error("[stderr]", chunk.toString());
});

// Завершение
child.on("close", (code) => {
  console.log("\n[process exited with code]", code);
});

child.on("error", (err) => {
  console.error("[spawn error]", err);
});
