import type { Task } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PrResult {
  url: string;
  number: number;
}

export async function run(task: Task, report: string): Promise<PrResult> {
  await delay(5000); // 0-1s

  const mockPrNumber = Math.floor(Math.random() * 9000) + 1000;

  return {
    url: `https://github.com/mock-org/mock-repo/pull/${mockPrNumber}`,
    number: mockPrNumber,
  };
}
