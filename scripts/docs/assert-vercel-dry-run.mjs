import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";


const requiredUploads = [
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

const forbiddenPrefixes = [
  "cmd/",
  "internal/",
  "frontend/",
  ".superpowers/",
  "docs/superpowers/",
  ".git/",
];


function normalizeEntry(entry) {
  const reported = typeof entry === "string" ? entry : entry?.path;
  if (typeof reported !== "string" || reported.length === 0) {
    throw new Error("Vercel dry-run entry is missing a path field");
  }
  let normalized = reported.replaceAll("\\", "/");
  while (normalized.startsWith("./")) normalized = normalized.slice(2);
  if (normalized.startsWith("/") || normalized.split("/").includes("..")) {
    throw new Error(`Vercel dry-run entry is not repository-relative: ${reported}`);
  }
  return normalized;
}


function isForbidden(upload) {
  const parts = upload.split("/");
  return upload === "AGENTS.md"
    || upload === "docs/README.md"
    || forbiddenPrefixes.some((prefix) => upload.startsWith(prefix))
    || parts.some((part) => part === ".env" || part.startsWith(".env."));
}


export function assertUploadBoundary(entries) {
  if (!Array.isArray(entries)) throw new Error("Vercel dry-run report must be a JSON array");
  const uploads = new Set(entries.map(normalizeEntry));
  for (const required of requiredUploads) {
    if (!uploads.has(required)) throw new Error(`missing required upload: ${required}`);
  }
  for (const upload of uploads) {
    if (isForbidden(upload)) throw new Error(`forbidden upload: ${upload}`);
  }
  return [...uploads].sort();
}


export async function readDryRunReport(reportPath) {
  let report;
  try {
    report = JSON.parse(await readFile(reportPath, "utf8"));
  } catch (error) {
    throw new Error(`invalid Vercel dry-run JSON: ${error.message}`, { cause: error });
  }
  const entries = Array.isArray(report) ? report : report?.files;
  if (!Array.isArray(entries)) {
    throw new Error("Vercel dry-run report must be a JSON array or contain a files array");
  }
  entries.map(normalizeEntry);
  return entries;
}


const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  const reportPath = process.argv[2];
  if (!reportPath || process.argv.length !== 3) {
    process.stderr.write("usage: node scripts/docs/assert-vercel-dry-run.mjs <report.json>\n");
    process.exitCode = 2;
  } else {
    try {
      const uploads = assertUploadBoundary(await readDryRunReport(reportPath));
      process.stdout.write(`validated ${uploads.length} Vercel upload files\n`);
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
