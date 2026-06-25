import { resolve } from "node:path";
import * as p from "@clack/prompts";
import { type ServerDefinitionInput, generateProject, writeProject } from "@mcp-builder/core";
import { ui } from "../ui.js";

export interface InitArgs {
  readonly out?: string;
}

/**
 * Interactively assemble a definition, write an `mcp.config.ts`, and optionally
 * generate the server immediately. The two-step split (config then generate)
 * mirrors the recommended workflow: keep the editable definition in source
 * control, regenerate whenever it changes.
 */
export async function runInit(args: InitArgs): Promise<void> {
  p.intro("mcp-builder");

  const name = await ask(
    p.text({
      message: "Server name",
      placeholder: "dev-utils",
      validate: (value) =>
        /^[a-z][a-z0-9-]*$/.test(value) ? undefined : "Use lower kebab-case, e.g. dev-utils",
    }),
  );

  const version = await ask(
    p.text({ message: "Version", initialValue: "0.1.0", placeholder: "0.1.0" }),
  );

  const description = await ask(
    p.text({ message: "Description", placeholder: "What does this server do?" }),
  );

  const transport = await ask(
    p.select({
      message: "Transport",
      options: [
        { value: "stdio" as const, label: "stdio", hint: "local clients like Claude Desktop" },
        { value: "http" as const, label: "http", hint: "Streamable HTTP for remote clients" },
      ],
    }),
  );

  const tools = await collectTools();

  const definition: ServerDefinitionInput = {
    name,
    version,
    ...(description.length > 0 ? { description } : {}),
    transport,
    tools,
  };

  const configDir = resolve(args.out ?? ".");
  const configPath = resolve(configDir, "mcp.config.ts");
  await writeConfigFile(configPath, definition);
  ui.success(`Wrote ${configPath}`);

  const generateNow = await ask(
    p.confirm({ message: "Generate the server now?", initialValue: true }),
  );

  if (generateNow) {
    const outDir = resolve(configDir, name);
    const project = await generateProject(definition);
    const result = await writeProject(project, outDir, { force: false });
    ui.success(`Generated ${result.written.length} files in ${name}/`);
  }

  p.outro("Done. Fill in the handler stubs and run `npm run inspect`.");
}

async function collectTools(): Promise<NonNullable<ServerDefinitionInput["tools"]>> {
  const tools: NonNullable<ServerDefinitionInput["tools"]> = [];
  for (;;) {
    const addMore = await ask(
      p.confirm({
        message: tools.length === 0 ? "Add a tool?" : "Add another tool?",
        initialValue: tools.length === 0,
      }),
    );
    if (!addMore) {
      break;
    }
    const toolName = await ask(
      p.text({
        message: "Tool name",
        placeholder: "do_something",
        validate: (value) =>
          /^[a-z][a-z0-9_]*$/.test(value) ? undefined : "Use lower_snake_case, e.g. do_something",
      }),
    );
    const toolDescription = await ask(
      p.text({ message: "Tool description", placeholder: "What does this tool do?" }),
    );
    tools.push({ name: toolName, description: toolDescription || toolName, input: {} });
  }
  return tools;
}

async function writeConfigFile(path: string, definition: ServerDefinitionInput): Promise<void> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const { dirname } = await import("node:path");
  const source = `import { defineServer } from "@mcp-builder/core";\n\nexport default defineServer(${JSON.stringify(
    definition,
    null,
    2,
  )});\n`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, source, "utf8");
}

/** Resolve a clack prompt, exiting cleanly if the user cancels. */
async function ask<T>(prompt: Promise<T | symbol>): Promise<T> {
  const value = await prompt;
  if (p.isCancel(value)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  return value;
}
