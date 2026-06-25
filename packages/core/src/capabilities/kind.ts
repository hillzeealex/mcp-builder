import type { GeneratedFile } from "../file.js";
import type { ServerDefinition } from "../schema.js";

/**
 * A capability kind (tool, resource, or prompt) as a deep module: a uniform
 * interface over the whole {@link ServerDefinition}, with the per-kind
 * heterogeneity (different schemas, different SDK registration calls, different
 * generated modules) hidden inside the implementation.
 *
 * Adding a new kind means writing one of these and adding it to the registry;
 * the generator, the server template, and the README table all iterate the
 * registry and need no edits.
 */
export interface CapabilityKind {
  /** Subdirectory under `src/` where this kind's modules are written. */
  readonly dir: string;
  /** The `src/<dir>/<name>.ts` modules for every capability of this kind. */
  files(def: ServerDefinition): GeneratedFile[];
  /** Import lines for the generated server's `index.ts`. */
  imports(def: ServerDefinition): string[];
  /** `server.register*(...)` calls for the generated server's `index.ts`. */
  registrations(def: ServerDefinition): string[];
  /** Rows for the README capability table. */
  readmeRows(def: ServerDefinition): string[];
}
