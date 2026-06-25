import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createJiti } from "jiti";
import { type ServerDefinition, parseDefinition } from "./schema.js";

/**
 * Load and validate a definition from a file.
 *
 * Uses `jiti` so a TypeScript `mcp.config.ts` can be imported directly, with no
 * build step. The file's default export is expected to be the definition
 * (typically produced by {@link defineServer}). Throws {@link ValidationError}
 * if the loaded value is not a valid definition.
 */
export async function loadDefinition(path: string): Promise<ServerDefinition> {
  const absolutePath = resolve(path);
  const jiti = createJiti(pathToFileURL(absolutePath).href);
  const moduleNamespace = (await jiti.import(absolutePath)) as Record<string, unknown>;
  const candidate = moduleNamespace.default ?? moduleNamespace;
  return parseDefinition(candidate);
}
