import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createJiti } from "jiti";
import { parse as parseYaml } from "yaml";
import { type ServerDefinition, parseDefinition } from "./schema.js";

/**
 * Load and validate a definition from a file, dispatching on its extension:
 *
 * - `.ts` / `.js` / `.mjs` / `.cjs`: imported via `jiti` (no build step needed),
 *   using the default export, which is typically produced by {@link defineServer}.
 * - `.json`: parsed as JSON.
 * - `.yaml` / `.yml`: parsed as YAML.
 *
 * All paths converge on {@link parseDefinition}, so validation and defaults are
 * identical regardless of source format. Throws {@link ValidationError} when the
 * loaded value is not a valid definition.
 */
export async function loadDefinition(path: string): Promise<ServerDefinition> {
  const absolutePath = resolve(path);
  const raw = await loadRaw(absolutePath, extname(absolutePath).toLowerCase());
  return parseDefinition(raw);
}

async function loadRaw(absolutePath: string, extension: string): Promise<unknown> {
  switch (extension) {
    case ".json":
      return JSON.parse(await readFile(absolutePath, "utf8"));
    case ".yaml":
    case ".yml":
      return parseYaml(await readFile(absolutePath, "utf8"));
    default: {
      const jiti = createJiti(pathToFileURL(absolutePath).href);
      const moduleNamespace = (await jiti.import(absolutePath)) as Record<string, unknown>;
      return moduleNamespace.default ?? moduleNamespace;
    }
  }
}
