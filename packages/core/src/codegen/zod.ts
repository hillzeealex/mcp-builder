import type { FieldSpec, Shape } from "../schema.js";
import { literal } from "./util.js";

/**
 * Render a single {@link FieldSpec} as a Zod expression string.
 *
 * Recurses into `array` and `object` fields. Modifiers are appended in a stable
 * order (`.describe()` then `.default()`/`.optional()`) so the generated code
 * is deterministic and snapshot-testable.
 */
export function fieldToZod(spec: FieldSpec): string {
  let expr = baseExpr(spec);

  if (spec.description !== undefined) {
    expr += `.describe(${literal(spec.description)})`;
  }

  const fallback = defaultLiteral(spec);
  if (fallback !== undefined) {
    expr += `.default(${fallback})`;
  } else if (spec.optional === true) {
    expr += ".optional()";
  }

  return expr;
}

/**
 * Render a {@link Shape} as a Zod raw-shape object literal, e.g.
 * `{ name: z.string(), count: z.number().int() }`. This is what the MCP SDK's
 * `inputSchema` / `argsSchema` fields expect.
 */
export function shapeToZodRawShape(shape: Shape): string {
  const entries = Object.entries(shape);
  if (entries.length === 0) {
    return "{}";
  }
  const lines = entries.map(([key, field]) => `  ${key}: ${fieldToZod(field)},`);
  return `{\n${lines.join("\n")}\n}`;
}

function baseExpr(spec: FieldSpec): string {
  switch (spec.type) {
    case "string":
      return "z.string()";
    case "number":
      return spec.integer === true ? "z.number().int()" : "z.number()";
    case "boolean":
      return "z.boolean()";
    case "enum":
      return `z.enum([${spec.values.map((value) => literal(value)).join(", ")}])`;
    case "array":
      return `z.array(${fieldToZod(spec.items)})`;
    case "object": {
      const lines = Object.entries(spec.fields).map(
        ([key, field]) => `  ${key}: ${fieldToZod(field)},`,
      );
      return lines.length > 0 ? `z.object({\n${lines.join("\n")}\n})` : "z.object({})";
    }
  }
}

function defaultLiteral(spec: FieldSpec): string | undefined {
  switch (spec.type) {
    case "string":
    case "number":
    case "boolean":
      return spec.default === undefined ? undefined : literal(spec.default);
    case "enum":
      return spec.default === undefined ? undefined : literal(spec.default);
    default:
      return undefined;
  }
}
