import type { ServerDefinitionInput } from "./schema.js";

/**
 * Identity helper that gives full editor autocompletion and type-checking when
 * writing an `mcp.config.ts`.
 *
 * It intentionally does no validation or normalization at call time: that
 * happens in {@link parseDefinition}/{@link loadDefinition}, keeping authoring
 * (types) and runtime (validation) cleanly separated.
 *
 * @example
 * ```ts
 * import { defineServer } from "@mcp-builder/core";
 *
 * export default defineServer({
 *   name: "dev-utils",
 *   version: "0.1.0",
 *   tools: [{ name: "ping", description: "Reply with pong" }],
 * });
 * ```
 */
export function defineServer(definition: ServerDefinitionInput): ServerDefinitionInput {
  return definition;
}
