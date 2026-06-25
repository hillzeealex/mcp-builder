import { shapeToZodRawShape } from "../codegen/zod.js";
import type { PromptDefinition, Shape } from "../schema.js";

/**
 * Render `src/prompts/<name>.ts`. MCP prompt arguments are always strings, so
 * each declared argument becomes a `z.string()` in the generated args shape.
 */
export function renderPromptModule(prompt: PromptDefinition): string {
  const shape: Shape = Object.fromEntries(
    Object.entries(prompt.arguments).map(([name, arg]) => [
      name,
      { type: "string", description: arg.description, optional: arg.optional },
    ]),
  );

  return `import { z } from "zod";

/** Argument schema for the \`${prompt.name}\` prompt, generated from the definition. */
export const argsShape = ${shapeToZodRawShape(shape)} satisfies z.ZodRawShape;

/** Validated arguments passed to {@link handler}. */
export type Args = z.infer<z.ZodObject<typeof argsShape>>;

/**
 * ${prompt.description}
 *
 * TODO: build the real prompt message(s) from the arguments.
 */
export async function handler(args: Args) {
  return {
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: \`TODO: "${prompt.name}" prompt from \${JSON.stringify(args)}\`,
        },
      },
    ],
  };
}
`;
}
