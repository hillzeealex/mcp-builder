import type { ServerDefinition } from "../schema.js";

/**
 * A transport (stdio or http) as a deep module: it owns the transport-specific
 * imports, the body of the generated server's `main()`, and the README section
 * that explains how to connect. Adding a transport means writing one of these
 * and adding it to the registry; the server template and the README need no
 * edits.
 *
 * The entrypoint guard and its `fileURLToPath` import live in the server shell,
 * not here, since they are identical across transports.
 */
export interface Transport {
  /** Transport-specific import lines for the generated server's `index.ts`. */
  imports(): string[];
  /** The body of `async function main()`. */
  renderMain(def: ServerDefinition): string;
  /** The body of the README's "Connect to Claude" section. */
  renderConnectDoc(def: ServerDefinition): string;
}
