import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { assertUploadBoundary, readDryRunReport } from "./assert-vercel-dry-run.mjs";


const required = [
  "vercel.json",
  "website/index.html",
  "docs/zensical.toml",
  "docs/uv.lock",
  "scripts/vercel-install-docs.sh",
  "scripts/vercel-build-docs.sh",
  "scripts/sync-docs-assets.sh",
  "scripts/docs-assets.ref",
  "scripts/docs-assets.txt",
  "scripts/docs/build.mjs",
  "scripts/docs/verify-site.mjs",
  "scripts/install.sh",
  "scripts/install.ps1",
];


test("accepts the complete static documentation build input", () => {
  assert.doesNotThrow(() => assertUploadBoundary(required));
});


test("normalizes CLI path objects", () => {
  const report = required.map((filePath, index) => ({
    path: index % 2 === 0 ? `./${filePath}` : filePath.replaceAll("/", "\\"),
    size: 10,
  }));
  assert.doesNotThrow(() => assertUploadBoundary(report));
});


test("reads the Vercel CLI report envelope", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "docbank-vercel-report-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const report = path.join(directory, "report.json");
  await writeFile(report, JSON.stringify({ fileCount: required.length, files: required.map((entry) => ({ path: entry })) }));
  assert.deepEqual(await readDryRunReport(report), required.map((entry) => ({ path: entry })));
});


test("rejects a missing build input", () => {
  assert.throws(
    () => assertUploadBoundary(required.filter((filePath) => filePath !== "vercel.json")),
    /missing required upload: vercel\.json/,
  );
});


for (const forbidden of [
  "cmd/docbank/main.go",
  "internal/store/store.go",
  "frontend/package.json",
  ".superpowers/plan.md",
  "docs/superpowers/specs/plan.md",
  ".git/config",
  ".env.local",
  "docs/.env",
  "AGENTS.md",
  "docs/README.md",
]) {
  test(`rejects forbidden upload ${forbidden}`, () => {
    assert.throws(() => assertUploadBoundary([...required, forbidden]), /forbidden upload/);
  });
}


test("rejects malformed reports instead of treating them as empty", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "docbank-vercel-report-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const report = path.join(directory, "report.json");
  await writeFile(report, '{"path":"website/index.html"}\n');
  await assert.rejects(() => readDryRunReport(report), /files array/);
  await writeFile(report, '{"files":[{"size":10}]}\n');
  await assert.rejects(() => readDryRunReport(report), /path field/);
});
