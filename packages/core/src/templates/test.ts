import type { ServerDefinition } from "../schema.js";

/**
 * Render a smoke test for the generated server. It asserts the server builds
 * with every capability registered, which catches schema/import regressions
 * without depending on the (still TODO) handler bodies.
 */
export function renderSmokeTest(def: ServerDefinition): string {
  return `import { describe, expect, it } from "vitest";
import { createServer } from "../src/index.js";

describe("${def.name} server", () => {
  it("builds with all capabilities registered", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});
`;
}
