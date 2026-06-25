import { describe, expect, it } from "vitest";
import { parseSource } from "../src/load.js";
import { parseDefinition } from "../src/schema.js";
import { serializeDefinition } from "../src/serialize.js";

const def = parseDefinition({
  name: "demo",
  version: "0.1.0",
  tools: [{ name: "ping", description: "Reply with pong" }],
});

describe("serializeDefinition", () => {
  it("round-trips through JSON (load and serialize cannot drift)", () => {
    expect(parseSource(serializeDefinition(def, "json"), "json")).toEqual(def);
  });

  it("round-trips through YAML", () => {
    expect(parseSource(serializeDefinition(def, "yaml"), "yaml")).toEqual(def);
  });

  it("emits a defineServer module for TypeScript", () => {
    const ts = serializeDefinition(def, "ts");
    expect(ts).toContain('import { defineServer } from "@mcp-builder/core";');
    expect(ts).toContain("export default defineServer(");
  });
});
