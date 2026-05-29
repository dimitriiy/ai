import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const MODEL = "qwen2.5";
export const MAX_TOKENS = 4096;
export const MAX_WRITE_BYTES = 1_000_000; // 1 MB per write_file call
export const MAX_HISTORY_TURNS = 40; // user+assistant+tool-result turns kept
export const BASH_TIMEOUT_MS = 30_000; // hard cap per bash invocation
export const BASH_MAX_BUFFER = 1_000_000; // 1 MB combined stdout+stderr cap
