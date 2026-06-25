import { z } from "zod";

/** Argument schema for the `code_review` prompt, generated from the definition. */
export const argsShape = {
  code: z.string().describe("The code to review."),
  language: z.string().describe("Programming language of the snippet.").optional(),
} satisfies z.ZodRawShape;

/** Validated arguments passed to {@link handler}. */
export type Args = z.infer<z.ZodObject<typeof argsShape>>;

/**
 * Ask Claude to review a snippet of code for bugs and clarity.
 */
export async function handler(args: Args) {
  const language = args.language ?? "the given language";
  return {
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: [
            `You are a senior engineer reviewing ${language} code.`,
            "Focus on correctness bugs, edge cases, and clarity. Be concise and specific.",
            "",
            "```",
            args.code,
            "```",
          ].join("\n"),
        },
      },
    ],
  };
}
