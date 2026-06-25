import { shapeToZodRawShape } from "../codegen/zod.js";
import type { ToolDefinition } from "../schema.js";

/**
 * Render `src/tools/<name>.ts`: the input shape (real Zod, derived from the
 * declarative spec), an inferred `Input` type, and a typed handler stub.
 */
export function renderToolModule(tool: ToolDefinition): string {
  const shape = shapeToZodRawShape(tool.input);
  return `import { z } from "zod";

/** Input schema for the \`${tool.name}\` tool, generated from the definition. */
export const inputShape = ${shape} satisfies z.ZodRawShape;

/** Validated arguments passed to {@link handler}. */
export type Input = z.infer<z.ZodObject<typeof inputShape>>;

/**
 * ${tool.description}
 *
 * TODO: replace this placeholder with your implementation.
 */
export async function handler(input: Input) {
  return {
    content: [
      {
        type: "text" as const,
        text: \`${tool.name} called with \${JSON.stringify(input)}\`,
      },
    ],
  };
}
`;
}
