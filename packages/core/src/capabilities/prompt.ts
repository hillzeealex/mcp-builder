import { alias, configObject, literal } from "../codegen/util.js";
import { shapeToZodRawShape } from "../codegen/zod.js";
import type { PromptDefinition, Shape } from "../schema.js";
import type { CapabilityKind } from "./kind.js";

const DIR = "prompts";
const SUFFIX = "Prompt";

/**
 * Render `src/prompts/<name>.ts`. MCP prompt arguments are always strings, so
 * each declared argument becomes a `z.string()` in the generated args shape.
 */
function renderModule(prompt: PromptDefinition): string {
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

function renderRegistration(prompt: PromptDefinition): string {
  const ns = alias(prompt.name, SUFFIX);
  const config = configObject([
    ["title", prompt.title === undefined ? undefined : literal(prompt.title)],
    ["description", literal(prompt.description)],
    ["argsSchema", `${ns}.argsShape`],
  ]);
  return `server.registerPrompt(${literal(prompt.name)}, ${config}, ${ns}.handler);`;
}

export const promptKind: CapabilityKind = {
  dir: DIR,
  files: (def) =>
    def.prompts.map((prompt) => ({
      path: `src/${DIR}/${prompt.name}.ts`,
      contents: renderModule(prompt),
    })),
  imports: (def) =>
    def.prompts.map(
      (prompt) => `import * as ${alias(prompt.name, SUFFIX)} from "./${DIR}/${prompt.name}.js";`,
    ),
  registrations: (def) => def.prompts.map(renderRegistration),
  readmeRows: (def) =>
    def.prompts.map((prompt) => `| prompt | \`${prompt.name}\` | ${prompt.description} |`),
};
