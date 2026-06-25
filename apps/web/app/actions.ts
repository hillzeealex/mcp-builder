"use server";

import { type ServerDefinitionInput, ValidationError, generateProject } from "@mcp-builder/core";

export interface GeneratedFileDTO {
  path: string;
  contents: string;
}

export type GenerateResult =
  | { ok: true; name: string; files: GeneratedFileDTO[] }
  | { ok: false; error: string; issues?: { path: string; message: string }[] };

/**
 * Server action: parse a JSON definition and generate the project in memory.
 *
 * This is the whole point of keeping the core pure: the browser playground and
 * the CLI run the exact same generator, with no duplicated logic.
 */
export async function generateAction(source: string): Promise<GenerateResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    return { ok: false, error: `Invalid JSON: ${error instanceof Error ? error.message : error}` };
  }

  try {
    const project = await generateProject(parsed as ServerDefinitionInput);
    return {
      ok: true,
      name: project.definition.name,
      files: project.files.map((file) => ({ path: file.path, contents: file.contents })),
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        ok: false,
        error: "The definition is invalid.",
        issues: error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
      };
    }
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
