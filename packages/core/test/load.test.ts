import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadDefinition } from "../src/load.js";

function fixture(name: string): string {
  return fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
}

describe("loadDefinition", () => {
  it("loads a JSON definition and applies defaults", async () => {
    const def = await loadDefinition(fixture("demo.json"));
    expect(def.name).toBe("demo-json");
    expect(def.transport).toBe("stdio");
    expect(def.tools[0]?.name).toBe("ping");
  });

  it("loads a YAML definition", async () => {
    const def = await loadDefinition(fixture("demo.yaml"));
    expect(def.name).toBe("demo-yaml");
    expect(def.tools[0]?.input).toEqual({});
  });

  it("loads a TypeScript definition via its default export", async () => {
    const def = await loadDefinition(fixture("demo.config.ts"));
    expect(def.name).toBe("demo-ts");
  });
});
