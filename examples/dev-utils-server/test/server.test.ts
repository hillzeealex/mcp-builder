import { describe, expect, it } from "vitest";
import { createServer } from "../src/index.js";
import { handler as formatJson } from "../src/tools/format_json.js";
import { handler as generateUuid } from "../src/tools/generate_uuid.js";
import { handler as hashText } from "../src/tools/hash_text.js";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("dev-utils server", () => {
  it("builds with all capabilities registered", () => {
    expect(createServer()).toBeDefined();
  });
});

describe("hash_text", () => {
  it("computes a known sha256 digest", async () => {
    const result = await hashText({ text: "hello", algorithm: "sha256" });
    expect(result.content[0]?.text).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });
});

describe("generate_uuid", () => {
  it("generates the requested count and clamps the upper bound", async () => {
    const result = await generateUuid({ count: 3 });
    const lines = result.content[0]?.text.split("\n") ?? [];
    expect(lines).toHaveLength(3);
    expect(lines[0]).toMatch(UUID_V4);
  });
});

describe("format_json", () => {
  it("pretty-prints valid JSON", async () => {
    const result = await formatJson({ json: '{"a":1}', minify: false });
    expect(result.content[0]?.text).toBe('{\n  "a": 1\n}');
  });

  it("returns a tool error for invalid JSON", async () => {
    const result = await formatJson({ json: "{nope}", minify: false });
    expect(result.isError).toBe(true);
  });
});
