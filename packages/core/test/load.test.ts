import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ValidationError } from "../src/errors.js";
import { loadDefinition, parseSource } from "../src/load.js";

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

describe("parseSource", () => {
  it("parses a JSON string", () => {
    const def = parseSource(
      '{"name":"s","version":"0.1.0","tools":[{"name":"t","description":"d"}]}',
      "json",
    );
    expect(def.name).toBe("s");
    expect(def.transport).toBe("stdio");
  });

  it("parses a YAML string", () => {
    const def = parseSource(
      "name: s\nversion: 0.1.0\ntools:\n  - name: t\n    description: d\n",
      "yaml",
    );
    expect(def.tools[0]?.name).toBe("t");
  });

  it("throws ValidationError for a structurally invalid definition", () => {
    expect(() => parseSource("{}", "json")).toThrowError(ValidationError);
  });
});
