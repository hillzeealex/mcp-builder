import { defineServer } from "@mcp-builder/core";

/**
 * Example definition: a small, offline toolbox of developer utilities.
 *
 * Run `pnpm example:generate` from the repo root to regenerate
 * `examples/dev-utils-server/` from this file.
 */
export default defineServer({
  name: "dev-utils",
  version: "0.1.0",
  description: "A small toolbox of offline developer utilities, exposed over MCP.",
  transport: "stdio",
  tools: [
    {
      name: "hash_text",
      title: "Hash text",
      description: "Compute a cryptographic hash of a string.",
      input: {
        text: { type: "string", description: "The text to hash." },
        algorithm: {
          type: "enum",
          values: ["sha256", "sha512", "md5"],
          default: "sha256",
          description: "Hash algorithm to use.",
        },
      },
    },
    {
      name: "generate_uuid",
      title: "Generate UUID",
      description: "Generate one or more random UUID v4 strings.",
      input: {
        count: {
          type: "number",
          integer: true,
          default: 1,
          description: "How many UUIDs to generate (1-100).",
        },
      },
    },
    {
      name: "format_json",
      title: "Format JSON",
      description: "Pretty-print or minify a JSON string.",
      input: {
        json: { type: "string", description: "The JSON text to format." },
        minify: {
          type: "boolean",
          default: false,
          description: "Minify instead of pretty-printing.",
        },
      },
    },
  ],
  resources: [
    {
      name: "about",
      uri: "dev-utils://about",
      title: "About this server",
      description: "Metadata describing the dev-utils server.",
      mimeType: "application/json",
    },
  ],
  prompts: [
    {
      name: "code_review",
      title: "Code review",
      description: "Ask Claude to review a snippet of code for bugs and clarity.",
      arguments: {
        code: { description: "The code to review." },
        language: { description: "Programming language of the snippet.", optional: true },
      },
    },
  ],
});
