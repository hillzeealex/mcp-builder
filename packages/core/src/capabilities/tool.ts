import { alias, configObject, literal } from "../codegen/util.js";
import { shapeToZodRawShape } from "../codegen/zod.js";
import type { ToolDefinition } from "../schema.js";
import type { CapabilityKind } from "./kind.js";

const DIR = "tools";
const SUFFIX = "Tool";

/** Render `src/tools/<name>.ts`: input shape, inferred type, and handler stub. */
function renderModule(tool: ToolDefinition): string {
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

function renderRegistration(tool: ToolDefinition): string {
  const ns = alias(tool.name, SUFFIX);
  const config = configObject([
    ["title", tool.title === undefined ? undefined : literal(tool.title)],
    ["description", literal(tool.description)],
    ["inputSchema", `${ns}.inputShape`],
  ]);
  return `server.registerTool(${literal(tool.name)}, ${config}, ${ns}.handler);`;
}

export const toolKind: CapabilityKind = {
  dir: DIR,
  files: (def) =>
    def.tools.map((tool) => ({ path: `src/${DIR}/${tool.name}.ts`, contents: renderModule(tool) })),
  imports: (def) =>
    def.tools.map(
      (tool) => `import * as ${alias(tool.name, SUFFIX)} from "./${DIR}/${tool.name}.js";`,
    ),
  registrations: (def) => def.tools.map(renderRegistration),
  readmeRows: (def) => def.tools.map((tool) => `| tool | \`${tool.name}\` | ${tool.description} |`),
};
