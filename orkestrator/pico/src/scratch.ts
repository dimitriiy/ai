import { db } from "./db";

export const main = async () => {
  try {
    db.prepare("DELETE FROM stage_results WHERE task_id = ?").run(1);
  } catch (err) {
    console.error(err);
  }
};
