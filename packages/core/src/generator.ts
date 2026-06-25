import { formatFile } from "./format.js";
import { type ServerDefinition, type ServerDefinitionInput, parseDefinition } from "./schema.js";
import {
  renderGitignore,
  renderPackageJson,
  renderReadme,
  renderTsConfig,
  renderVitestConfig,
} from "./templates/project.js";
import { renderPromptModule } from "./templates/prompt.js";
import { renderResourceModule } from "./templates/resource.js";
import { renderServerIndex } from "./templates/server.js";
import { renderSmokeTest } from "./templates/test.js";
import { renderToolModule } from "./templates/tool.js";

/** A single file to be written, with a project-relative POSIX path. */
export interface GeneratedFile {
  readonly path: string;
  readonly contents: string;
}

/** The complete in-memory result of generating a server. No file system involved. */
export interface GeneratedProject {
  readonly definition: ServerDefinition;
  readonly files: readonly GeneratedFile[];
}

export interface GenerateOptions {
  /** Emit a smoke test under `test/`. Defaults to `true`. */
  readonly includeTests?: boolean;
}

/**
 * Turn a server definition into a complete set of project files.
 *
 * Pure with respect to the file system: it validates the definition, renders
 * every file, formats it, and returns the result in memory. This is the seam a
 * CLI, a web UI, or a test all share. {@link writeProject} is the only thing
 * that touches disk.
 *
 * Files are returned sorted by path so the output is deterministic.
 */
export async function generateProject(
  input: ServerDefinitionInput | ServerDefinition,
  options: GenerateOptions = {},
): Promise<GeneratedProject> {
  const definition = parseDefinition(input);
  const includeTests = options.includeTests ?? true;

  const sources: GeneratedFile[] = [
    { path: "package.json", contents: renderPackageJson(definition) },
    { path: "tsconfig.json", contents: renderTsConfig() },
    { path: "vitest.config.ts", contents: renderVitestConfig() },
    { path: ".gitignore", contents: renderGitignore() },
    { path: "README.md", contents: renderReadme(definition) },
    { path: "src/index.ts", contents: renderServerIndex(definition) },
    ...definition.tools.map((tool) => ({
      path: `src/tools/${tool.name}.ts`,
      contents: renderToolModule(tool),
    })),
    ...definition.resources.map((resource) => ({
      path: `src/resources/${resource.name}.ts`,
      contents: renderResourceModule(resource),
    })),
    ...definition.prompts.map((prompt) => ({
      path: `src/prompts/${prompt.name}.ts`,
      contents: renderPromptModule(prompt),
    })),
  ];

  if (includeTests) {
    sources.push({ path: "test/server.test.ts", contents: renderSmokeTest(definition) });
  }

  const files = await Promise.all(
    sources.map(async (file) => ({
      path: file.path,
      contents: await formatFile(file.path, file.contents),
    })),
  );
  files.sort((a, b) => a.path.localeCompare(b.path));

  return { definition, files };
}
