import { execFile } from "node:child_process";

export interface ShellResult {
  stdout: string;
  stderr: string;
  code: number;
}

export function run(
  cmd: string,
  args: string[],
  opts: { cwd?: string; allowFailure?: boolean } = {},
): Promise<ShellResult> {
  return new Promise((resolve, reject) => {
    execFile(
      cmd,
      args,
      { cwd: opts.cwd, maxBuffer: 10 * 1024 * 1024 },
      (err, stdout, stderr) => {
        const code = err && typeof err.code === "number" ? err.code : 0;
        if (err && !opts.allowFailure) {
          reject(
            new Error(`${cmd} ${args.join(" ")} failed (${code}): ${stderr}`),
          );
          return;
        }
        resolve({ stdout, stderr, code });
      },
    );
  });
}
