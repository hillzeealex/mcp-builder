import { createHash } from "node:crypto";
import { z } from "zod";

/** Input schema for the `hash_text` tool, generated from the definition. */
export const inputShape = {
  text: z.string().describe("The text to hash."),
  algorithm: z
    .enum(["sha256", "sha512", "md5"])
    .describe("Hash algorithm to use.")
    .default("sha256"),
} satisfies z.ZodRawShape;

/** Validated arguments passed to {@link handler}. */
export type Input = z.infer<z.ZodObject<typeof inputShape>>;

/**
 * Compute a cryptographic hash of a string.
 */
export async function handler(input: Input) {
  const digest = createHash(input.algorithm).update(input.text, "utf8").digest("hex");
  return {
    content: [
      {
        type: "text" as const,
        text: digest,
      },
    ],
  };
}
