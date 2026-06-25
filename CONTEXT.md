# Domain & architecture model — mcp-builder

Shared vocabulary for the codebase. Architecture terms (module, interface, seam,
depth, deep/shallow, adapter, leverage, locality) follow the codebase-design
skill. Domain terms below name the good seams.

## Domain language

- **Definition** — the declarative, serializable description of a server: `name`,
  `version`, `transport`, and its capabilities. Authored as `mcp.config.ts`
  (via `defineServer`), JSON, or YAML. Validated and normalized by
  `parseDefinition`.
- **Capability** — something a server exposes. There are three **capability
  kinds**: **tool**, **resource**, **prompt**.
- **Capability kind** — a deep module (one per kind) that owns *all generation*
  for that kind behind a uniform interface (`files`, `imports`, `registrations`,
  `readmeRows` over a Definition). Lives in `packages/core/src/capabilities/`.
  The zod schemas stay explicit in `schema.ts` (genuinely heterogeneous; the
  discriminated union earns its place).
- **Generator** — pure transform: Definition → in-memory `GeneratedProject`
  (`files`). No file system. Iterates the capability-kind registry.
- **Transport** — how the generated server talks to a client: `stdio` or `http`.
  A deep module (one per transport) owns its imports, its `main()` body, and its
  README "Connect" section. Lives in `packages/core/src/transports/`.

## Seams

- **Loading seam** — Definition *in*. `parseSource(content, format)` for JSON and
  YAML strings; `loadDefinition(path)` is the file adapter over it and keeps the
  TypeScript path (jiti needs a file, an honest boundary).
- **Serialization seam** — Definition *out*. `serializeDefinition(def, format)`
  is the named inverse of the loading seam: it owns the on-disk shape (including
  the `defineServer(...)` TypeScript wrapper) so reading and writing cannot drift.
- **Writer seam** — `writeProject` is the single file-system side effect; every
  other part of the core works on in-memory data.

## Invariants

- Generation is **pure and deterministic**: same Definition → byte-identical
  files. This is the test surface (snapshots) and the refactor safety net.
- The CLI and the web playground are **thin adapters over the same core**. No
  generation or parsing logic is duplicated in either.
