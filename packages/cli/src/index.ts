#!/usr/bin/env node
import { ValidationError, WriteConflictError } from "@mcp-builder/core";
import { Command } from "commander";
import { type GenerateArgs, runGenerate } from "./commands/generate.js";
import { type InitArgs, runInit } from "./commands/init.js";
import { ui } from "./ui.js";

const program = new Command();

program
  .name("mcp-builder")
  .description("Scaffold typed, tested, deployable MCP servers from a declarative definition.")
  .version("0.1.0");

program
  .command("generate")
  .description("Generate a server project from an mcp.config.ts (or JSON) definition")
  .argument("<config>", "path to the definition file")
  .option("-o, --out <dir>", "output directory (defaults to the server name)")
  .option("-f, --force", "overwrite a non-empty output directory")
  .option("--no-tests", "skip generating the smoke test")
  .action(async (config: string, options: GenerateArgs) => {
    await runGenerate(config, options);
  });

program
  .command("init")
  .description("Interactively create an mcp.config.ts and optionally generate the server")
  .option("-o, --out <dir>", "directory to write the config into", ".")
  .action(async (options: InitArgs) => {
    await runInit(options);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  reportError(error);
  process.exit(1);
});

function reportError(error: unknown): void {
  if (error instanceof ValidationError) {
    ui.error("The definition is invalid:");
    ui.list(error.issues.map((issue) => `${issue.path}: ${issue.message}`));
    return;
  }
  if (error instanceof WriteConflictError) {
    ui.error(error.message);
    return;
  }
  ui.error(error instanceof Error ? error.message : String(error));
}
