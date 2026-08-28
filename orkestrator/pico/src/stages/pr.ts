export interface PrResult {
  url: string;
  number: number;
}
export async function run(task: Task, report: string): Promise<PrResult>;
