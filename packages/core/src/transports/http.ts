import type { ServerDefinition } from "../schema.js";
import type { Transport } from "./transport.js";

export const httpTransport: Transport = {
  imports: () => [
    `import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";`,
    `import { randomUUID } from "node:crypto";`,
    `import { createServer as createHttpServer, type IncomingMessage } from "node:http";`,
  ],

  renderMain: (def) => `const MCP_PATH = "/mcp";

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
}`,

  renderConnectDoc: () =>
    "This server uses the **Streamable HTTP** transport. Start it with `npm start` (listens on `http://localhost:3000/mcp`), then point an HTTP-capable MCP client at that URL.",
};
