import { fileURLToPath } from "node:url";
import path from "node:path";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALLOWED_ROOT = process.cwd();

const ALLOWED_EXTENSIONS = new Set([
  ".ts",
  ".js",
  ".json",
  ".md",
  ".txt",
  ".yaml",
  ".toml",
]);

export const getSafePath = (pathName: string, root = ALLOWED_ROOT) => {
  try {
    const resolvedPath = path.resolve(root, pathName);
    const extension = path.extname(resolvedPath);
    const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;

    if (Boolean(extension && !ALLOWED_EXTENSIONS.has(extension))) {
      throw new Error("File not allowed");
    }

    const relative = path.relative(root, resolvedPath);

    if (relative.startsWith("..") || !resolvedPath.startsWith(rootWithSep)) {
      throw new Error("Path out of range");
    }

    return resolvedPath;
  } catch (e) {
    console.log(e);
    throw new Error(`File not found: ${pathName}`);
  }
};
