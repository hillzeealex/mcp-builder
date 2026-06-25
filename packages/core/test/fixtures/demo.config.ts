// Plain default export (no import) so the fixture stays self-contained for the
// jiti loading path.
export default {
  name: "demo-ts",
  version: "0.1.0",
  description: "Loaded from TypeScript",
  tools: [{ name: "ping", description: "Reply with pong" }],
};
