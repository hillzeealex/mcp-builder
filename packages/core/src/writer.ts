import { existsSync } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { WriteConflictError } from "./errors.js";
import type { GeneratedProject } from "./generator.js";

export interface WriteOptions {
  /** Overwrite even if the target directory already contains files. */
  readonly force?: boolean;
}

export interface WriteResult {
  readonly targetDir: string;
  readonly written: readonly string[];
}

/**
 * Write a {@link GeneratedProject} to disk under `targetDir`.
 *
 * This is the single side-effecting boundary of the library: every other part
 * works on in-memory data. Refuses to write into a non-empty directory unless
 * `force` is set, surfacing a {@link WriteConflictError} instead.
 */
export async function writeProject(
  project: GeneratedProject,
  targetDir: string,
  options: WriteOptions = {},
): Promise<WriteResult> {
  if (options.force !== true && existsSync(targetDir)) {
    const entries = await readdir(targetDir);
    if (entries.length > 0) {
      throw new WriteConflictError(targetDir);
    }
  }

  const written: string[] = [];
  for (const file of project.files) {
    const fullPath = join(targetDir, file.path);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, file.contents, "utf8");
    written.push(file.path);
  }

  return { targetDir, written };
}
