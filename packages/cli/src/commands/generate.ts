import { relative, resolve } from "node:path";
import { generateProject, loadDefinition, writeProject } from "@mcp-builder/core";
import { ui } from "../ui.js";

export interface GenerateArgs {
  readonly out?: string;
  readonly force?: boolean;
  /** `--no-tests` sets this to false; defaults to true. */
  readonly tests?: boolean;
}

/**
 * Load a definition, generate the server project, and write it to disk.
 *
 * Output directory defaults to the server name from the definition. Throws on
 * invalid definitions or write conflicts; the caller reports the error.
 */
export async function runGenerate(configPath: string, args: GenerateArgs): Promise<void> {
  ui.info(`Loading definition from ${configPath}`);
  const definition = await loadDefinition(configPath);

  const targetName = args.out ?? definition.name;
  const outDir = resolve(targetName);

  const project = await generateProject(definition, { includeTests: args.tests ?? true });
  const result = await writeProject(project, outDir, { force: args.force ?? false });

  ui.success(
    `Generated ${result.written.length} files in ${relative(process.cwd(), outDir) || "."}`,
  );
  ui.list(result.written);

  ui.heading("Next steps");
  ui.list([
    `cd ${targetName}`,
    "npm install",
    "npm run build",
    "npm run inspect   # explore the server in the MCP Inspector",
  ]);
}
