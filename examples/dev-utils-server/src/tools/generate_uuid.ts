import { randomUUID } from "node:crypto";
import { z } from "zod";

/** Input schema for the `generate_uuid` tool, generated from the definition. */
export const inputShape = {
  count: z.number().int().describe("How many UUIDs to generate (1-100).").default(1),
} satisfies z.ZodRawShape;

/** Validated arguments passed to {@link handler}. */
export type Input = z.infer<z.ZodObject<typeof inputShape>>;

/**
 * Generate one or more random UUID v4 strings.
 */
export async function handler(input: Input) {
  const count = Math.min(Math.max(input.count, 1), 100);
  const uuids = Array.from({ length: count }, () => randomUUID());
  return {
    content: [
      {
        type: "text" as const,
        text: uuids.join("\n"),
      },
    ],
  };
}
