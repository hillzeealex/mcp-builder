/**
 * A single problem found while validating a server definition.
 *
 * `path` is the dotted location of the offending value (e.g. `tools.0.name`),
 * matching the shape the user wrote in their `mcp.config.ts`.
 */
export interface DefinitionIssue {
  readonly path: string;
  readonly message: string;
}

/**
 * Thrown when a definition fails validation.
 *
 * Carries every issue at once (not just the first) so callers can show a
 * complete report. The `message` is a human-readable, multi-line summary;
 * `issues` is the machine-readable list a UI can render however it likes.
 */
export class ValidationError extends Error {
  override readonly name = "ValidationError";
  readonly issues: readonly DefinitionIssue[];

  constructor(issues: readonly DefinitionIssue[]) {
    const summary = issues.map((issue) => `  - ${issue.path}: ${issue.message}`).join("\n");
    super(`Invalid server definition:\n${summary}`);
    this.issues = issues;
  }
}

/**
 * Thrown when generated files cannot be written to disk, typically because the
 * target directory already contains files and `force` was not set.
 */
export class WriteConflictError extends Error {
  override readonly name = "WriteConflictError";
  readonly targetDir: string;

  constructor(targetDir: string) {
    super(
      `Target directory "${targetDir}" is not empty. Pass { force: true } (or use --force) to overwrite existing files.`,
    );
    this.targetDir = targetDir;
  }
}
