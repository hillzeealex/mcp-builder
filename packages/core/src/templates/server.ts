import { CAPABILITY_KINDS } from "../capabilities/index.js";
import { literal } from "../codegen/util.js";
import type { ServerDefinition } from "../schema.js";

/**
 * Render `src/index.ts` for the generated server: imports for every capability
 * module, a `createServer()` factory (exported for testing), and a `main()`
 * that wires the chosen transport.
 */
export function renderServerIndex(def: ServerDefinition): string {
  const imports = [
    `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";`,
    ...transportImports(def.transport),
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

${renderMain(def)}

// Only start a transport when run directly, so the server can be imported in tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Fatal error starting MCP server:", error);
    process.exit(1);
  });
}
`;
}

function renderMain(def: ServerDefinition): string {
  if (def.transport === "http") {
    return renderHttpMain(def);
  }
  return renderStdioMain(def);
}

function renderStdioMain(def: ServerDefinition): string {
  return `async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(${literal(`${def.name} MCP server running on stdio`)});
}`;
}

function renderHttpMain(def: ServerDefinition): string {
  return `const MCP_PATH = "/mcp";

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  if (chunks.length === 0) {
    return undefined;
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });
  await server.connect(transport);

  const port = Number(process.env.PORT ?? 3000);
  const http = createHttpServer((req, res) => {
    void (async () => {
      try {
        if (req.url === undefined || !req.url.startsWith(MCP_PATH)) {
          res.writeHead(404).end();
          return;
        }
        const body = req.method === "POST" ? await readJsonBody(req) : undefined;
        await transport.handleRequest(req, res, body);
      } catch (error) {
        console.error("Error handling MCP request:", error);
        if (!res.headersSent) {
          res.writeHead(500).end();
        }
      }
    })();
  });

  http.listen(port, () => {
    console.error(\`${def.name} MCP server listening on http://localhost:\${port}\${MCP_PATH}\`);
  });
}`;
}

function transportImports(transport: ServerDefinition["transport"]): string[] {
  if (transport === "http") {
    return [
      `import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";`,
      `import { randomUUID } from "node:crypto";`,
      `import { createServer as createHttpServer, type IncomingMessage } from "node:http";`,
      `import { fileURLToPath } from "node:url";`,
    ];
  }
  return [
    `import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";`,
    `import { fileURLToPath } from "node:url";`,
  ];
}

function indentBlock(block: string, depth: number): string {
  const pad = "  ".repeat(depth);
  return block
    .split("\n")
    .map((line) => (line.length > 0 ? pad + line : line))
    .join("\n");
}
