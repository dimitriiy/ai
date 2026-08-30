import { runTask } from "./pipeline";
import { upsertTask } from "./state";
export const main = async () => {
  try {
    const task = upsertTask({
      issueNumber: 1,
      issueTitle: "Demo task",
      issueBody: "Scratch run",
    });

    // 1. Запускаем задачу
    await runTask(task);
    // Выведет:
    // [Task 1] Running stage: fetch
    // [Task 1] Running stage: plan
    // [Task 1] Generated plan (expensive!)  ← 2 секунды
    // ...

    // 2. Представим что процесс упал после стадии plan
    // Перезапускаем worker:
    // await runTask(task);
    // Что выведется?
  } catch (err) {
    console.error(err);
  }
};
