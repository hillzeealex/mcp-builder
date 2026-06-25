import { describe, expect, it } from "vitest";
import { CAPABILITY_KINDS } from "../src/capabilities/index.js";

describe("capability kind registry", () => {
  it("covers tools, resources, and prompts", () => {
    const dirs = CAPABILITY_KINDS.map((kind) => kind.dir).sort();
    expect(dirs).toEqual(["prompts", "resources", "tools"]);
  });
});
