import { describe, expect, it } from "vitest";
import { fieldToZod, shapeToZodRawShape } from "../src/codegen/zod.js";

describe("fieldToZod", () => {
  it("renders a plain string", () => {
    expect(fieldToZod({ type: "string" })).toBe("z.string()");
  });

  it("appends describe then default in a stable order", () => {
    expect(fieldToZod({ type: "string", description: "the name", default: "x" })).toBe(
      'z.string().describe("the name").default("x")',
    );
  });

  it("renders an optional integer", () => {
    expect(fieldToZod({ type: "number", integer: true, optional: true })).toBe(
      "z.number().int().optional()",
    );
  });

  it("renders an enum with a default", () => {
    expect(fieldToZod({ type: "enum", values: ["a", "b"], default: "a" })).toBe(
      'z.enum(["a", "b"]).default("a")',
    );
  });

  it("recurses into arrays and objects", () => {
    expect(fieldToZod({ type: "array", items: { type: "string" } })).toBe("z.array(z.string())");
    expect(fieldToZod({ type: "object", fields: { id: { type: "number" } } })).toBe(
      "z.object({\n  id: z.number(),\n})",
    );
  });
});

describe("shapeToZodRawShape", () => {
  it("renders an empty shape", () => {
    expect(shapeToZodRawShape({})).toBe("{}");
  });

  it("renders a multi-field shape", () => {
    expect(shapeToZodRawShape({ a: { type: "string" }, b: { type: "boolean" } })).toBe(
      "{\n  a: z.string(),\n  b: z.boolean(),\n}",
    );
  });
});
