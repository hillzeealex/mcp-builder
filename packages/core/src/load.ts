import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createJiti } from "jiti";
import { parse as parseYaml } from "yaml";
import { type ServerDefinition, parseDefinition } from "./schema.js";

/** Serializable definition formats that can be parsed from a string. */
export type DefinitionFormat = "json" | "yaml";

/**
 * Parse and validate a definition from a string.
 *
 * This is the string-level loading seam shared by the CLI (for `.json`/`.yaml`
 * files) and the web playground (for editor content). TypeScript is not handled
 * here because evaluating it needs a file on disk; see {@link loadDefinition}.
 * Throws on malformed JSON/YAML and {@link ValidationError} on an invalid
 * definition.
 */
export function parseSource(content: string, format: DefinitionFormat): ServerDefinition {
  const raw: unknown = format === "yaml" ? parseYaml(content) : JSON.parse(content);
  return parseDefinition(raw);
}

/**
 * Load and validate a definition from a file, dispatching on its extension.
 *
 * `.json` and `.yaml`/`.yml` delegate to {@link parseSource}. `.ts`/`.js` are
 * imported via `jiti` (no build step), using the default export, which is
 * typically produced by {@link defineServer}. This is the file adapter over the
 * loading seam.
 */
export async function loadDefinition(path: string): Promise<ServerDefinition> {
  const absolutePath = resolve(path);
  const extension = extname(absolutePath).toLowerCase();

  if (extension === ".json") {
    return parseSource(await readFile(absolutePath, "utf8"), "json");
  }
  if (extension === ".yaml" || extension === ".yml") {
    return parseSource(await readFile(absolutePath, "utf8"), "yaml");
  }

  const jiti = createJiti(pathToFileURL(absolutePath).href);
  const moduleNamespace = (await jiti.import(absolutePath)) as Record<string, unknown>;
  return parseDefinition(moduleNamespace.default ?? moduleNamespace);
}
