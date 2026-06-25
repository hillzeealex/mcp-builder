/**
 * @mcp-builder/core
 *
 * The pure, deterministic engine behind mcp-builder: validate a server
 * definition, generate project files in memory, and (optionally) write them to
 * disk. The CLI and any future web UI are thin adapters over this surface.
 */

export { defineServer } from "./define.js";
export {
  parseDefinition,
  type FieldSpec,
  type PromptDefinition,
  type ResourceDefinition,
  type ServerDefinition,
  type ServerDefinitionInput,
  type Shape,
  type ToolDefinition,
} from "./schema.js";
export {
  generateProject,
  type GeneratedFile,
  type GeneratedProject,
  type GenerateOptions,
} from "./generator.js";
export { loadDefinition } from "./load.js";
export { writeProject, type WriteOptions, type WriteResult } from "./writer.js";
export { ValidationError, WriteConflictError } from "./errors.js";
export type { DefinitionIssue } from "./errors.js";
