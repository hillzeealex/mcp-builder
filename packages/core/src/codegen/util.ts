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

/**
 * Build an import alias for a capability module, e.g. `hashTextTool`. The
 * per-kind suffix is what keeps a tool and a resource of the same name from
 * colliding in the generated server's imports.
 */
export function alias(name: string, suffix: string): string {
  return `${toCamelCase(name)}${suffix}`;
}

/** Build a `{ key: value }` literal, dropping entries whose value is undefined. */
export function configObject(entries: [string, string | undefined][]): string {
  const present = entries.filter((entry): entry is [string, string] => entry[1] !== undefined);
  const body = present.map(([key, value]) => `${key}: ${value}`).join(", ");
  return `{ ${body} }`;
}
