import { describe, expect, it } from "vitest";
import { generateProject } from "../src/generator.js";
import type { ServerDefinitionInput } from "../src/schema.js";

const fixture: ServerDefinitionInput = {
  name: "demo",
  version: "0.1.0",
  description: "A demo server",
  tools: [
    {
      name: "echo",
      description: "Echo a message back",
      input: { message: { type: "string", description: "What to echo" } },
    },
  ],
  resources: [{ name: "about", uri: "demo://about", description: "About this server" }],
  prompts: [{ name: "greet", description: "Greet someone", arguments: { who: {} } }],
};

function pathsOf(files: readonly { path: string }[]): string[] {
  return files.map((f) => f.path);
}

describe("generateProject", () => {
  it("emits the expected project layout", async () => {
    const project = await generateProject(fixture);
    expect(pathsOf(project.files)).toEqual([
      ".gitignore",
      "package.json",
      "README.md",
      "src/index.ts",
      "src/prompts/greet.ts",
      "src/resources/about.ts",
      "src/tools/echo.ts",
      "test/server.test.ts",
      "tsconfig.json",
      "vitest.config.ts",
    ]);
  });

  it("omits the test when includeTests is false", async () => {
    const project = await generateProject(fixture, { includeTests: false });
    expect(pathsOf(project.files)).not.toContain("test/server.test.ts");
  });

  it("is deterministic: same input yields identical output", async () => {
    const a = await generateProject(fixture);
    const b = await generateProject(fixture);
    expect(a.files).toEqual(b.files);
  });

  it("generates a tool module that matches the snapshot", async () => {
    const project = await generateProject(fixture);
    const tool = project.files.find((f) => f.path === "src/tools/echo.ts");
    expect(tool?.contents).toMatchSnapshot();
  });

  it("wires the http transport when requested", async () => {
    const project = await generateProject({ ...fixture, transport: "http" });
    const index = project.files.find((f) => f.path === "src/index.ts");
    expect(index?.contents).toContain("StreamableHTTPServerTransport");
  });
});
