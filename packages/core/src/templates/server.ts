import { literal, toCamelCase } from "../codegen/util.js";
import type {
  PromptDefinition,
  ResourceDefinition,
  ServerDefinition,
  ToolDefinition,
} from "../schema.js";

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
    ...def.tools.map((t) => `import * as ${alias(t.name, "Tool")} from "./tools/${t.name}.js";`),
    ...def.resources.map(
      (r) => `import * as ${alias(r.name, "Resource")} from "./resources/${r.name}.js";`,
    ),
    ...def.prompts.map(
      (p) => `import * as ${alias(p.name, "Prompt")} from "./prompts/${p.name}.js";`,
    ),
  ].join("\n");

  const registrations = [
    ...def.tools.map(renderToolRegistration),
    ...def.resources.map(renderResourceRegistration),
    ...def.prompts.map(renderPromptRegistration),
  ].join("\n\n");

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

function renderToolRegistration(tool: ToolDefinition): string {
  const ns = alias(tool.name, "Tool");
  const config = configObject([
    ["title", tool.title === undefined ? undefined : literal(tool.title)],
    ["description", literal(tool.description)],
    ["inputSchema", `${ns}.inputShape`],
  ]);
  return `server.registerTool(${literal(tool.name)}, ${config}, ${ns}.handler);`;
}

function renderResourceRegistration(resource: ResourceDefinition): string {
  const ns = alias(resource.name, "Resource");
  const config = configObject([
    ["title", resource.title === undefined ? undefined : literal(resource.title)],
    ["description", literal(resource.description)],
    ["mimeType", literal(resource.mimeType)],
  ]);
  return `server.registerResource(${literal(resource.name)}, ${literal(resource.uri)}, ${config}, ${ns}.read);`;
}

function renderPromptRegistration(prompt: PromptDefinition): string {
  const ns = alias(prompt.name, "Prompt");
  const config = configObject([
    ["title", prompt.title === undefined ? undefined : literal(prompt.title)],
    ["description", literal(prompt.description)],
    ["argsSchema", `${ns}.argsShape`],
  ]);
  return `server.registerPrompt(${literal(prompt.name)}, ${config}, ${ns}.handler);`;
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

/** Build a `{ key: value }` literal, dropping entries whose value is undefined. */
function configObject(entries: [string, string | undefined][]): string {
  const present = entries.filter((entry): entry is [string, string] => entry[1] !== undefined);
  const body = present.map(([key, value]) => `${key}: ${value}`).join(", ");
  return `{ ${body} }`;
}

function alias(name: string, suffix: string): string {
  return `${toCamelCase(name)}${suffix}`;
}

function indentBlock(block: string, depth: number): string {
  const pad = "  ".repeat(depth);
  return block
    .split("\n")
    .map((line) => (line.length > 0 ? pad + line : line))
    .join("\n");
}
