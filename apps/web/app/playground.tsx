"use client";

import type { DefinitionFormat } from "@mcp-builder/core";
import JSZip from "jszip";
import { useState } from "react";
import { type GenerateResult, generateAction } from "./actions";

export function Playground({ initialSource }: { initialSource: string }) {
  const [source, setSource] = useState(initialSource);
  const [format, setFormat] = useState<DefinitionFormat>("json");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function generate() {
    setPending(true);
    try {
      const next = await generateAction(source, format);
      setResult(next);
      setActivePath(next.ok ? (next.files[0]?.path ?? null) : null);
    } finally {
      setPending(false);
    }
  }

  async function downloadZip() {
    if (!result?.ok) return;
    const zip = new JSZip();
    for (const file of result.files) {
      zip.file(file.path, file.contents);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${result.name}.zip`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const activeFile = result?.ok ? result.files.find((file) => file.path === activePath) : undefined;

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8">
      <Header />

      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">
              Definition ({format.toUpperCase()})
            </h2>
            <div className="flex gap-2">
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value as DefinitionFormat)}
                className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
              </select>
              <button
                type="button"
                onClick={generate}
                disabled={pending}
                className="rounded-md bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
              >
                {pending ? "Generating…" : "Generate"}
              </button>
              <button
                type="button"
                onClick={downloadZip}
                disabled={!result?.ok}
                className="rounded-md border border-slate-700 px-4 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 disabled:opacity-40"
              >
                Download .zip
              </button>
            </div>
          </div>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            className="h-[28rem] flex-1 resize-none rounded-lg border border-slate-800 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-200 outline-none focus:border-indigo-500"
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-300">Generated server</h2>
          <Output
            result={result}
            activeFile={activeFile}
            activePath={activePath}
            onSelect={setActivePath}
          />
        </section>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-col gap-2 border-b border-slate-800 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-slate-400">mcp</span>
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            -builder
          </span>
          <span className="ml-2 font-normal text-slate-400">playground</span>
        </h1>
        <a
          href="https://github.com/hillzeealex/mcp-builder"
          className="text-sm font-medium text-slate-400 transition hover:text-slate-200"
        >
          GitHub ↗
        </a>
      </div>
      <p className="text-sm text-slate-400">
        Declare your tools, resources, and prompts. The same{" "}
        <code className="rounded bg-slate-800 px-1 py-0.5 text-xs">@mcp-builder/core</code> engine
        that powers the CLI generates a typed MCP server, right here in your browser.
      </p>
    </header>
  );
}

function Output({
  result,
  activeFile,
  activePath,
  onSelect,
}: {
  result: GenerateResult | null;
  activeFile: { path: string; contents: string } | undefined;
  activePath: string | null;
  onSelect: (path: string) => void;
}) {
  if (result === null) {
    return (
      <div className="flex h-[28rem] items-center justify-center rounded-lg border border-dashed border-slate-800 text-sm text-slate-500">
        Press <span className="mx-1 font-semibold text-slate-300">Generate</span> to scaffold a
        server.
      </div>
    );
  }

  if (!result.ok) {
    return (
      <div className="h-[28rem] overflow-auto rounded-lg border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200">
        <p className="font-semibold">{result.error}</p>
        {result.issues && (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-red-300/90">
            {result.issues.map((issue) => (
              <li key={`${issue.path}:${issue.message}`}>
                <span className="font-mono text-xs text-red-200">{issue.path}</span>:{" "}
                {issue.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-[28rem] overflow-hidden rounded-lg border border-slate-800">
      <ul className="w-52 shrink-0 overflow-auto border-r border-slate-800 bg-slate-950/40 py-1 text-xs">
        {result.files.map((file) => (
          <li key={file.path}>
            <button
              type="button"
              onClick={() => onSelect(file.path)}
              className={`block w-full truncate px-3 py-1.5 text-left font-mono transition ${
                file.path === activePath
                  ? "bg-indigo-500/20 text-indigo-200"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              {file.path}
            </button>
          </li>
        ))}
      </ul>
      <pre className="flex-1 overflow-auto bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-200">
        {activeFile?.contents}
      </pre>
    </div>
  );
}
