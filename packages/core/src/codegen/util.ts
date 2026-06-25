/**
 * Render a JS string/number/boolean as a source-code literal.
 *
 * Strings go through `JSON.stringify` so quoting and escaping are always valid;
 * the formatter normalizes quote style afterwards.
 */
export function literal(value: string | number | boolean): string {
  return JSON.stringify(value);
}

/** Indent every line of a block by `depth` two-space steps. */
export function indent(block: string, depth = 1): string {
  const pad = "  ".repeat(depth);
  return block
    .split("\n")
    .map((line) => (line.length > 0 ? pad + line : line))
    .join("\n");
}

/** Convert a `lower_snake_case` name to `camelCase` for use as an import alias. */
export function toCamelCase(name: string): string {
  return name.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}
