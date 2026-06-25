import { z } from "zod";
import { type DefinitionIssue, ValidationError } from "./errors.js";

/**
 * Declarative field specification.
 *
 * Definitions describe tool inputs as data, not as live Zod objects. This keeps
 * a definition fully serializable (so it can come from `mcp.config.ts`, JSON, or
 * a web form) while the generator turns each field into real Zod source code in
 * the emitted server.
 */
const identifier = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/, "must be lower_snake_case and start with a letter");

const fieldBase = {
  description: z.string().min(1).optional(),
  optional: z.boolean().optional(),
};

// `z.lazy` + an explicit annotation lets the union reference itself for the
// recursive `array` and `object` cases without TypeScript losing the type.
export const fieldSpecSchema: z.ZodType<FieldSpec> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.object({ ...fieldBase, type: z.literal("string"), default: z.string().optional() }),
    z.object({
      ...fieldBase,
      type: z.literal("number"),
      integer: z.boolean().optional(),
      default: z.number().optional(),
    }),
    z.object({ ...fieldBase, type: z.literal("boolean"), default: z.boolean().optional() }),
    z.object({
      ...fieldBase,
      type: z.literal("enum"),
      values: z.array(z.string().min(1)).min(1),
      default: z.string().optional(),
    }),
    z.object({ ...fieldBase, type: z.literal("array"), items: fieldSpecSchema }),
    z.object({ ...fieldBase, type: z.literal("object"), fields: z.record(fieldSpecSchema) }),
  ]),
);

const shapeSchema = z.record(identifier, fieldSpecSchema);

const promptArgumentSchema = z.object({
  description: z.string().min(1).optional(),
  optional: z.boolean().optional(),
});

const toolSchema = z.object({
  name: identifier,
  title: z.string().min(1).optional(),
  description: z.string().min(1),
  input: shapeSchema.default({}),
});

const resourceSchema = z.object({
  name: identifier,
  uri: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().min(1),
  mimeType: z.string().min(1).default("text/plain"),
});

const promptSchema = z.object({
  name: identifier,
  title: z.string().min(1).optional(),
  description: z.string().min(1),
  arguments: z.record(identifier, promptArgumentSchema).default({}),
});

export const serverDefinitionSchema = z
  .object({
    name: z.string().regex(/^[a-z][a-z0-9-]*$/, "must be lower kebab-case and start with a letter"),
    version: z.string().regex(/^\d+\.\d+\.\d+/, "must be a semantic version (e.g. 0.1.0)"),
    description: z.string().min(1).optional(),
    transport: z.enum(["stdio", "http"]).default("stdio"),
    tools: z.array(toolSchema).default([]),
    resources: z.array(resourceSchema).default([]),
    prompts: z.array(promptSchema).default([]),
  })
  .superRefine((def, ctx) => {
    requireUniqueNames(def.tools, "tools", ctx);
    requireUniqueNames(def.resources, "resources", ctx);
    requireUniqueNames(def.prompts, "prompts", ctx);
    if (def.tools.length + def.resources.length + def.prompts.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "a server must expose at least one tool, resource, or prompt",
        path: [],
      });
    }
  });

function requireUniqueNames(
  items: readonly { name: string }[],
  path: string,
  ctx: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  for (const [index, item] of items.entries()) {
    if (seen.has(item.name)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `duplicate name "${item.name}"`,
        path: [path, index, "name"],
      });
    }
    seen.add(item.name);
  }
}

// --- Public types -----------------------------------------------------------

export type FieldSpec =
  | { type: "string"; description?: string; optional?: boolean; default?: string }
  | {
      type: "number";
      description?: string;
      optional?: boolean;
      integer?: boolean;
      default?: number;
    }
  | { type: "boolean"; description?: string; optional?: boolean; default?: boolean }
  | {
      type: "enum";
      description?: string;
      optional?: boolean;
      values: string[];
      default?: string;
    }
  | { type: "array"; description?: string; optional?: boolean; items: FieldSpec }
  | { type: "object"; description?: string; optional?: boolean; fields: Record<string, FieldSpec> };

/** A map of field name to its specification (a tool's input shape). */
export type Shape = Record<string, FieldSpec>;

/** The normalized definition, after defaults are applied. */
export type ServerDefinition = z.infer<typeof serverDefinitionSchema>;

/** The shape a user writes; optionals here are filled in by {@link parseDefinition}. */
export type ServerDefinitionInput = z.input<typeof serverDefinitionSchema>;

export type ToolDefinition = ServerDefinition["tools"][number];
export type ResourceDefinition = ServerDefinition["resources"][number];
export type PromptDefinition = ServerDefinition["prompts"][number];

/**
 * Validate and normalize a raw definition.
 *
 * Applies defaults (transport, mime types, empty collections) so every
 * downstream consumer receives a complete, predictable object. Throws
 * {@link ValidationError} with every problem at once on failure.
 */
export function parseDefinition(raw: unknown): ServerDefinition {
  const result = serverDefinitionSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }
  const issues: DefinitionIssue[] = result.error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "(root)",
    message: issue.message,
  }));
  throw new ValidationError(issues);
}
