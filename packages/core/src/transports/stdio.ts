import { literal } from "../codegen/util.js";
import type { ServerDefinition } from "../schema.js";
import type { Transport } from "./transport.js";

function claudeConfig(def: ServerDefinition): string {
  return JSON.stringify(
    {
      mcpServers: {
        [def.name]: {
          command: "node",
          args: [`/ABSOLUTE/PATH/TO/${def.name}/dist/index.js`],
        },
      },
    },
    null,
    2,
  );
}

export const stdioTransport: Transport = {
  imports: () => [
    `import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";`,
  ],

  renderMain: (def) => `async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(${literal(`${def.name} MCP server running on stdio`)});
}`,

  renderConnectDoc: (
    def,
  ) => `Build the server, then add it to \`claude_desktop_config.json\` (use an **absolute** path):

\`\`\`json
${claudeConfig(def)}
\`\`\`

Restart Claude Desktop. The server's tools, resources, and prompts will appear in the client.`,
};
