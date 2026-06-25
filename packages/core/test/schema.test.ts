import { describe, expect, it } from "vitest";
import { ValidationError } from "../src/errors.js";
import { parseDefinition } from "../src/schema.js";

describe("parseDefinition", () => {
  it("applies defaults for a minimal valid definition", () => {
    const def = parseDefinition({
      name: "demo",
      version: "0.1.0",
      tools: [{ name: "ping", description: "Reply with pong" }],
    });

    expect(def.transport).toBe("stdio");
    expect(def.resources).toEqual([]);
    expect(def.prompts).toEqual([]);
    expect(def.tools[0]?.input).toEqual({});
  });

  it("defaults resource mimeType and prompt arguments", () => {
    const def = parseDefinition({
      name: "demo",
      version: "0.1.0",
      resources: [{ name: "about", uri: "demo://about", description: "About" }],
      prompts: [{ name: "review", description: "Review" }],
    });

    expect(def.resources[0]?.mimeType).toBe("text/plain");
    expect(def.prompts[0]?.arguments).toEqual({});
  });

  it("throws ValidationError with every issue at once", () => {
    expect(() => parseDefinition({})).toThrowError(ValidationError);
  });

  it("rejects an invalid server name", () => {
    try {
      parseDefinition({
        name: "Demo Server",
        version: "0.1.0",
        tools: [{ name: "x", description: "d" }],
      });
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).issues.some((i) => i.path === "name")).toBe(true);
    }
  });

  it("rejects duplicate tool names", () => {
    try {
      parseDefinition({
        name: "demo",
        version: "0.1.0",
        tools: [
          { name: "dup", description: "a" },
          { name: "dup", description: "b" },
        ],
      });
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).issues.some((i) => i.message.includes("duplicate"))).toBe(
        true,
      );
    }
  });

  it("rejects a server with no capabilities", () => {
    expect(() => parseDefinition({ name: "demo", version: "0.1.0" })).toThrowError(/at least one/);
  });
});
