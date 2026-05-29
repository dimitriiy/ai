import type { Dirent } from "fs";

export function direntType(e: Dirent): string {
  switch (true) {
    case e.isDirectory():
      return "dir";
    case e.isFile():
      return "file";
    case e.isSymbolicLink():
      return "symlink";
    case e.isBlockDevice():
      return "block";
    case e.isCharacterDevice():
      return "char";
    case e.isFIFO():
      return "fifo";
    case e.isSocket():
      return "socket";
    default:
      return "unknown";
  }
}
