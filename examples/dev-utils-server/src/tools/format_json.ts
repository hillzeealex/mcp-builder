import { z } from "zod";

/** Input schema for the `format_json` tool, generated from the definition. */
export const inputShape = {
  json: z.string().describe("The JSON text to format."),
  minify: z.boolean().describe("Minify instead of pretty-printing.").default(false),
} satisfies z.ZodRawShape;

/** Validated arguments passed to {@link handler}. */
export type Input = z.infer<z.ZodObject<typeof inputShape>>;

/**
 * Pretty-print or minify a JSON string. Returns a tool error (rather than
 * throwing) when the input is not valid JSON, so the model can react.
 */
export async function handler(input: Input) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input.json);
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }

  const formatted = input.minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
  return {
    content: [
      {
        type: "text" as const,
        text: formatted,
      },
    ],
  };
}
