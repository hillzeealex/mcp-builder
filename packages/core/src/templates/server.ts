import { CAPABILITY_KINDS } from "../capabilities/index.js";
import { literal } from "../codegen/util.js";
import type { ServerDefinition } from "../schema.js";
import { TRANSPORTS } from "../transports/index.js";

/**
 * Render `src/index.ts` for the generated server: imports for every capability
 * module, a `createServer()` factory (exported for testing), and a `main()`
 * supplied by the chosen transport. This module is the shell; capabilities and
 * transports own everything that varies.
 */
export function renderServerIndex(def: ServerDefinition): string {
  const transport = TRANSPORTS[def.transport];

  const imports = [
    `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";`,
    ...transport.imports(),
    `import { fileURLToPath } from "node:url";`,
    "",
    ...CAPABILITY_KINDS.flatMap((kind) => kind.imports(def)),
  ].join("\n");

  const registrations = CAPABILITY_KINDS.flatMap((kind) => kind.registrations(def)).join("\n\n");

  return `${imports}

/**
 * Build and configure the ${def.name} MCP server.
 *
 * Exported separately from {@link main} so tests can construct the server
 * without opening a transport.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: ${literal(def.name)},
    version: ${literal(def.version)},
  });

${indentBlock(registrations, 1)}

  return server;
}

${transport.renderMain(def)}

// Only start a transport when run directly, so the server can be imported in tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Fatal error starting MCP server:", error);
    process.exit(1);
  });
}
`;
}

function indentBlock(block: string, depth: number): string {
  const pad = "  ".repeat(depth);
  return block
    .split("\n")
    .map((line) => (line.length > 0 ? pad + line : line))
    .join("\n");
}
