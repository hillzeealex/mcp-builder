"use server";

import {
  type DefinitionFormat,
  ValidationError,
  generateProject,
  parseSource,
} from "@mcp-builder/core";

export interface GeneratedFileDTO {
  path: string;
  contents: string;
}

export type GenerateResult =
  | { ok: true; name: string; files: GeneratedFileDTO[] }
  | { ok: false; error: string; issues?: { path: string; message: string }[] };

/**
 * Server action: parse a definition (JSON or YAML) from the editor and generate
 * the project in memory.
 *
 * Parsing goes through the same `parseSource` seam the CLI uses, so the browser
 * playground and the CLI share one parser with no duplicated logic.
 */
export async function generateAction(
  source: string,
  format: DefinitionFormat,
): Promise<GenerateResult> {
  let definition: Awaited<ReturnType<typeof parseSource>>;
  try {
    definition = parseSource(source, format);
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        ok: false,
        error: "The definition is invalid.",
        issues: error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
      };
    }
    return {
      ok: false,
      error: `Invalid ${format.toUpperCase()}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const project = await generateProject(definition);
  return {
    ok: true,
    name: project.definition.name,
    files: project.files.map((file) => ({ path: file.path, contents: file.contents })),
  };
}
