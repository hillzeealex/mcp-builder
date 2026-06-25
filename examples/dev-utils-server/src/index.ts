import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fileURLToPath } from "node:url";

import * as hashTextTool from "./tools/hash_text.js";
import * as generateUuidTool from "./tools/generate_uuid.js";
import * as formatJsonTool from "./tools/format_json.js";
import * as aboutResource from "./resources/about.js";
import * as codeReviewPrompt from "./prompts/code_review.js";

/**
 * Build and configure the dev-utils MCP server.
 *
 * Exported separately from {@link main} so tests can construct the server
 * without opening a transport.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "dev-utils",
    version: "0.1.0",
  });

  server.registerTool(
    "hash_text",
    {
      title: "Hash text",
      description: "Compute a cryptographic hash of a string.",
      inputSchema: hashTextTool.inputShape,
    },
    hashTextTool.handler,
  );

  server.registerTool(
    "generate_uuid",
    {
      title: "Generate UUID",
      description: "Generate one or more random UUID v4 strings.",
      inputSchema: generateUuidTool.inputShape,
    },
    generateUuidTool.handler,
  );

  server.registerTool(
    "format_json",
    {
      title: "Format JSON",
      description: "Pretty-print or minify a JSON string.",
      inputSchema: formatJsonTool.inputShape,
    },
    formatJsonTool.handler,
  );

  server.registerResource(
    "about",
    "dev-utils://about",
    {
      title: "About this server",
      description: "Metadata describing the dev-utils server.",
      mimeType: "application/json",
    },
    aboutResource.read,
  );

  server.registerPrompt(
    "code_review",
    {
      title: "Code review",
      description: "Ask Claude to review a snippet of code for bugs and clarity.",
      argsSchema: codeReviewPrompt.argsShape,
    },
    codeReviewPrompt.handler,
  );

  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("dev-utils MCP server running on stdio");
}

// Only start a transport when run directly, so the server can be imported in tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Fatal error starting MCP server:", error);
    process.exit(1);
  });
}
