import { format } from "prettier";

const PARSER_BY_EXTENSION: Record<string, "typescript" | "json" | "markdown"> = {
  ".ts": "typescript",
  ".json": "json",
  ".md": "markdown",
};

/**
 * Pretty-print a generated file based on its extension.
 *
 * Files with no known parser (e.g. `.gitignore`) are returned unchanged.
 * Formatting is deterministic, which is what makes snapshot tests of the
 * generator meaningful.
 */
export async function formatFile(path: string, contents: string): Promise<string> {
  const dot = path.lastIndexOf(".");
  const parser = dot === -1 ? undefined : PARSER_BY_EXTENSION[path.slice(dot)];
  if (parser === undefined) {
    return contents;
  }
  return format(contents, { parser, printWidth: 100 });
}
