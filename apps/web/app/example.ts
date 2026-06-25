/** Definition pre-loaded into the playground editor. */
export const EXAMPLE_DEFINITION = `{
  "name": "dev-utils",
  "version": "0.1.0",
  "description": "A small toolbox of offline developer utilities, exposed over MCP.",
  "transport": "stdio",
  "tools": [
    {
      "name": "hash_text",
      "description": "Compute a cryptographic hash of a string.",
      "input": {
        "text": { "type": "string", "description": "The text to hash." },
        "algorithm": {
          "type": "enum",
          "values": ["sha256", "sha512", "md5"],
          "default": "sha256"
        }
      }
    }
  ],
  "resources": [
    { "name": "about", "uri": "dev-utils://about", "description": "Server metadata." }
  ],
  "prompts": [
    {
      "name": "code_review",
      "description": "Ask Claude to review a snippet of code.",
      "arguments": { "code": {}, "language": { "optional": true } }
    }
  ]
}
`;
