/**
 * Metadata describing the dev-utils server.
 *
 * Exposed at `dev-utils://about`.
 */
export async function read(uri: URL) {
  const about = {
    name: "dev-utils",
    version: "0.1.0",
    description: "A small toolbox of offline developer utilities, exposed over MCP.",
    tools: ["hash_text", "generate_uuid", "format_json"],
    generatedBy: "mcp-builder",
  };
  return {
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(about, null, 2),
      },
    ],
  };
}
