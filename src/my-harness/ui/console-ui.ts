import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import ora, { type Ora } from "ora";
import md from "cli-markdown";

export interface UI {
  ask(question: string): Promise<string>;
  print(text: string): void;
  printError(text: string): void;
  startSpinner(text?: string): void;
  stopSpinner(): void;
  renderMarkdown(text: string): string;
  close(): void;
}

export class ConsoleUI implements UI {
  private rl: readline.Interface;
  private spinner: Ora;

  constructor() {
    this.rl = readline.createInterface({ input, output });
    this.spinner = ora();
  }

  async ask(question: string): Promise<string> {
    return this.rl.question(question);
  }

  print(text: string): void {
    console.log(text);
  }

  printError(text: string): void {
    console.error(text);
  }

  startSpinner(text?: string): void {
    this.spinner.start(text);
  }

  stopSpinner(): void {
    this.spinner.stop();
  }

  renderMarkdown(text: string): string {
    return md(text).trimEnd();
  }

  close(): void {
    this.rl.close();
  }
}
