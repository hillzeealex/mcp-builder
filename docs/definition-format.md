# Definition format

A definition is the single source of truth for a generated server. Write it as a typed
`mcp.config.ts` and wrap it in `defineServer(...)` for full autocompletion. It is validated and
normalized by `parseDefinition` before any code is generated; invalid definitions throw a
`ValidationError` listing every problem at once.

## Server

```ts
defineServer({
  name: string,            // lower kebab-case, e.g. "dev-utils"
  version: string,         // semantic version, e.g. "0.1.0"
  description?: string,
  transport?: "stdio" | "http",   // default "stdio"
  tools?: Tool[],
  resources?: Resource[],
  prompts?: Prompt[],
});
```

A server must expose at least one tool, resource, or prompt. Names must be unique within each
category.

| Field | Required | Default | Notes |
| --- | --- | --- | --- |
| `name` | yes | | `^[a-z][a-z0-9-]*$` |
| `version` | yes | | must start `MAJOR.MINOR.PATCH` |
| `description` | no | | used in the generated README and `package.json` |
| `transport` | no | `"stdio"` | `"http"` emits a Streamable HTTP entrypoint |
| `tools` / `resources` / `prompts` | no | `[]` | |

## Tool

```ts
{
  name: string,            // lower_snake_case, e.g. "hash_text"
  title?: string,          // human-friendly label shown to clients
  description: string,
  input?: Shape,           // default {}
}
```

`input` is a map of argument name to a [field spec](#field-specs). It becomes the tool's Zod
`inputSchema` and the inferred `Input` type of the handler.

## Resource

```ts
{
  name: string,
  uri: string,             // e.g. "dev-utils://about"
  title?: string,
  description: string,
  mimeType?: string,       // default "text/plain"
}
```

Generates a `read(uri: URL)` callback stub.

## Prompt

```ts
{
  name: string,
  title?: string,
  description: string,
  arguments?: Record<string, { description?: string; optional?: boolean }>,
}
```

MCP prompt arguments are always strings, so each entry becomes a `z.string()` in the generated
args shape.

## Field specs

A field spec describes one tool input. The generator turns it into a Zod expression.

| `type` | Extra fields | Generated Zod |
| --- | --- | --- |
| `"string"` | `default?: string` | `z.string()` |
| `"number"` | `integer?: boolean`, `default?: number` | `z.number()` / `z.number().int()` |
| `"boolean"` | `default?: boolean` | `z.boolean()` |
| `"enum"` | `values: string[]`, `default?: string` | `z.enum([...])` |
| `"array"` | `items: FieldSpec` | `z.array(...)` |
| `"object"` | `fields: Record<string, FieldSpec>` | `z.object({ ... })` |

Every field also accepts `description?: string` and `optional?: boolean`. When a `default` is set
the field is required-with-default; otherwise `optional: true` adds `.optional()`.

### Examples

```ts
// string with a default
{ type: "string", description: "Greeting", default: "hello" }
// → z.string().describe("Greeting").default("hello")

// optional integer
{ type: "number", integer: true, optional: true }
// → z.number().int().optional()

// enum with a default
{ type: "enum", values: ["sha256", "sha512"], default: "sha256" }
// → z.enum(["sha256", "sha512"]).default("sha256")

// nested object
{
  type: "object",
  fields: {
    id: { type: "number", integer: true },
    tags: { type: "array", items: { type: "string" } },
  },
}
```

## Programmatic use

The same engine is available as a library, with no file-system side effects until you ask for
them:

```ts
import { generateProject, parseDefinition, writeProject } from "@mcp-builder/core";

const project = await generateProject(definition);   // pure: { files: [...] }
await writeProject(project, "./out", { force: true }); // the only I/O
```
