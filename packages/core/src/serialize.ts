import { stringify as stringifyYaml } from "yaml";
import type { DefinitionFormat } from "./load.js";
import type { ServerDefinition, ServerDefinitionInput } from "./schema.js";

/** Formats a definition can be serialized to. `"ts"` emits a `defineServer` module. */
export type SerializeFormat = "ts" | DefinitionFormat;

/**
 * Serialize a definition to source text: the named inverse of the loading seam.
 *
 * Keeping read ({@link loadDefinition}/{@link parseSource}) and write together
 * means the on-disk shape, including the `defineServer(...)` TypeScript wrapper,
 * is owned in one place and cannot drift between the two directions.
 */
export function serializeDefinition(
  definition: ServerDefinition | ServerDefinitionInput,
  format: SerializeFormat,
): string {
  switch (format) {
    case "json":
      return `${JSON.stringify(definition, null, 2)}\n`;
    case "yaml":
      return stringifyYaml(definition);
    case "ts":
      return `import { defineServer } from "@mcp-builder/core";\n\nexport default defineServer(${JSON.stringify(
        definition,
        null,
        2,
      )});\n`;
  }
}
