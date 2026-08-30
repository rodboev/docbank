# Tiered Documentation Site Design

## Objective

Give Docbank one public site with three deliberate levels of depth:

- `https://docbank.ai/` establishes the product identity and install path.
- `https://docbank.ai/guide/` explains the document authority lifecycle through a visual operator tour.
- `https://docbank.ai/docs/` contains precise operating and architecture documentation.

The site describes Docbank as it will exist after the current document-processing, retrieval, interface, and Model Context Protocol pull-request stack lands. Implementation may begin from `origin/main`, but publication waits until that stack and its corresponding release have landed.

## Audience and position

The primary reader is a highly technical operator or builder responsible for durable AI document workflows. They evaluate systems through authority boundaries, failure behavior, data portability, deployment control, and recovery evidence. The site must explain those properties directly instead of borrowing generic AI-product language.

The core position is:

> The system of record for documents your agents can use.

Docbank keeps original documents authoritative while governed processing produces searchable renditions and embeddings. Every derivative and retrieval result remains tied to exact source identity, explicit disclosure, and a recovery path controlled by the operator.

The organizing idea is the **authority lifecycle**:

1. Ingest exact source bytes without changing the source.
2. Assign stable document identity and immutable content-version identity.
3. Review provider disclosure, retained classes, estimates, and consent before processing.
4. Publish renditions and embedding sets as derivatives, never replacement authority.
5. Retrieve lexically, semantically, or in hybrid mode behind an exact source-version fence.
6. Serve bounded access through the CLI, web application, terminal UI, HTTP API, embedded Go API, and MCP server.
7. Verify, audit, back up, restore, and rebuild without converting a provider or index into authority.

“AI-native” describes the resulting operating model, not a visual theme or an excuse for vague claims. Copy uses the actual Docbank nouns: source version, processing plan, consent, rendition, embedding set, source fence, receipt, audit, backup, and restore.

## Public tiers

### Product page: `/`

The static product page answers four questions in order:

1. What is Docbank? An authoritative document system for technical operators and agents.
2. What makes it different? Original authority remains distinct from derived machine understanding.
3. What can an operator do? Store, version, process, retrieve, expose, audit, and recover documents through one governed system.
4. What is the next action? Install the current release or read the guide.

The page contains:

- A compact header with Docbank, Guide, Docs, and GitHub.
- A hero with the core position, concrete supporting copy, install and guide actions, and platform/license facts.
- A document authority ledger showing Source, Authorization, Understanding, Retrieval, and Recovery states.
- Four proof sections: keep the source sovereign, govern machine understanding, constrain every answer, and restore the record.
- A real product capture from the pinned screenshot set.
- A section explaining local, self-hosted, and hosted processing choices without turning a provider list into the product identity.
- A section showing one authority across the CLI, web, TUI, HTTP, embedded Go API, and MCP.
- A direct comparison with cloud drives and storage appliances that preserves Docbank’s existing archive/system-of-record boundary.
- A final guide/install call to action and a restrained legal footer.

The page does not use synthetic AI artwork, network-node illustrations, fabricated dashboards, vanity metrics, customer logos, or unprovable security language.

### Operator guide: `/guide/`

The guide is a seven-stop visual explanation of one document’s path through Docbank:

1. **Ingest** — copy exact source bytes into a virtual tree while leaving the source untouched.
2. **Identify** — show stable node identity, immutable versions, checksums, moves, and replacement history.
3. **Authorize** — inspect a processing plan, provider flow, retained classes, estimate, fingerprint, and consent state before egress.
4. **Understand** — build and inspect retained sanitized Markdown, normalized evidence, embedding sets, independent coverage, and durable jobs.
5. **Retrieve** — run lexical, semantic, hybrid, or automatic retrieval over an exact source-version fence and inspect the evidence used.
6. **Serve** — use the same authority through human interfaces, automation APIs, embedding, and the bounded MCP server.
7. **Prove** — verify content, inspect audited history, create and verify a backup, restore without provider calls, and rebuild disposable indexes.

Each stop uses an actual synthetic-vault capture or a compact native diagram derived from product contracts. Each stop links to the corresponding operating documentation. The guide avoids duplicating full command references.

### Operating documentation: `/docs/`

The existing Zensical content moves under `/docs/`. Its navigation continues to separate starting, document work, protection and operations, automation and integration, reference, architecture, and project status.

The incoming stack’s document-processing, processing-search, processing-configuration, derivative-architecture, and MCP pages remain operating documentation. The redesign may revise their navigation labels and cross-links but must not weaken their exact contracts.

## Visual language

The site uses a flat teal-on-ink system:

- Solid ink backgrounds and slightly raised solid panels.
- Thin, precise rules to establish hierarchy.
- One restrained teal accent for active states, links, and primary actions.
- Off-white primary text and quiet blue-green gray secondary text.
- Square or minimally rounded geometry.
- No gradients, glows, glass effects, translucent floating panels, decorative blobs, particle fields, or “AI network” imagery.
- No ornamental motion. Any transition must clarify interaction state and respect reduced-motion preferences.

The authority ledger is the main graphic motif. It presents meaningful identities and states rather than decoration.

### Typography

Self-host the fonts required by the public site:

- **JetBrains Mono** for the wordmark, headings, navigation, labels, code, identifiers, and lifecycle states.
- **Inter** for paragraphs, tables, captions, long-form documentation, and other continuous reading.

Body text uses Inter 400 with generous line height. Inter 500 or 600 provides emphasis. The site does not use font weights below 400; visual lightness comes from spacing, scale, and color contrast rather than fragile hairline glyphs. JetBrains Mono uses 600 or 700 for display hierarchy and 400 for code.

All text and interactive states must meet WCAG AA contrast. Focus states are visible and use the same teal system.

## Human- and machine-readable publishing contract

Every substantive page has a stable HTML route and a Markdown peer:

| Human route | Markdown route |
| --- | --- |
| `/` | `/index.md` |
| `/guide/` | `/guide.md` |
| `/docs/` | `/docs/index.md` |
| `/docs/<page>/` | `/docs/<page>.md` |
| `/docs/<section>/<page>/` | `/docs/<section>/<page>.md` |

`https://docbank.ai/llms.txt` is the hand-maintained root index for all published Markdown pages across the three tiers. It uses canonical `docbank.ai` URLs.

The production build fails when:

- a substantive HTML page lacks its Markdown peer;
- a published Markdown page lacks its HTML route;
- `llms.txt` omits a published Markdown page or names a missing page;
- the copied Markdown differs from its source;
- a local link, anchor, image, canonical URL, or required social metadata is invalid; or
- private/internal material crosses the publishing boundary.

The static product page and guide use dedicated text-first Markdown sources. They contain the same claims, examples, and links as their visual HTML pages without trying to reproduce visual layout in Markdown.

## Screenshot generation and publication

Screenshot generation is independent from documentation builds and deployment.

`make docs-screenshots` runs the repository-owned Playwright harness against a real temporary daemon and synthetic vault. It produces the complete current documentation capture set in an ignored staging directory. It never reads a developer vault, uses mocked API data, or writes captures into tracked documentation sources.

Publishing replaces the complete root of the orphan `docs-assets` branch with the reviewed capture set. The main branch records one full reviewed commit SHA in `scripts/docs-assets.ref` and one explicit asset manifest. Documentation builds fetch that exact commit, validate every expected asset, and fail closed on missing, extra, malformed, oversized, or unsupported files. They never fall back to the mutable branch head.

Documentation screenshots are PNG unless a specific reviewed vector diagram is maintained as tracked site source. Remote SVG screenshots are not accepted. The generated set is staged beside its destination and published atomically so a failed move cannot delete the previous usable set.

The build materializes pinned assets into an ignored local cache before rendering. Markdown and HTML refer only to stable site-local asset paths.

## Build architecture

The repository root owns documentation commands:

- `make docs-install` installs the locked Zensical environment.
- `make docs-serve` builds the same three tiers and serves them with live reload where practical.
- `make docs-build` produces and verifies the complete static site.
- `make docs-screenshots` generates the separate capture set.
- `make docs-deploy` performs the verified production deployment from the repository root.

The static build follows an explicit public allowlist:

1. Copy `website/` into a scratch site root for `/`, `/guide/`, fonts, favicon, and static scripts.
2. Copy installer scripts from their repository-owned sources.
3. Fetch and validate the pinned screenshot generation.
4. Stage only publishable Zensical sources into a scratch project.
5. Render Zensical under `/docs/`.
6. Publish every Markdown peer and root `llms.txt`.
7. Verify routes, links, metadata, assets, Markdown parity, and the public boundary.
8. Atomically replace the local `site/` output.

Zensical remains locked through `docs/uv.lock`. Static website code has no frontend framework or package-install step. Small browser behavior such as screenshot zoom and current-release download selection uses dependency-free JavaScript.

The Vercel install/build path installs Zensical, syncs the pinned assets, and builds the static site. It does not install or run Go, npm dependencies, the product frontend, Docker, Playwright, screenshot generation, provider runtimes, or browser tests.

Root `.vercelignore` acts as an upload allowlist. It includes only the static website, allowlisted documentation sources, fonts/favicon, installer sources, and the scripts/configuration required for the static build. It excludes repository source, caches, generated product assets, local state, credentials, internal documentation, plans, reports, and screenshot tooling.

## Release and deployment contract

Candidate feature documentation must not become public before the corresponding software release.

The successful software release makes a documentation source eligible but does not publish it immediately. The intended production source is the post-tag documentation-only follow-up after the final release changelog and wording corrections merge. Deployment verifies that the latest release tag is an ancestor of the selected source and that every commit between the tag and that source changes only the approved documentation and publishing surface. The selected source may be an exact commit on `main` if unrelated next-release work has already advanced the branch.

The GitHub deployment workflow is explicitly dispatched with that eligible source after the post-tag follow-up. `make docs-deploy` uses the same release-aware validation before invoking `vercel deploy --prod` from the repository root and remains the recommended manual production command. The Vercel upload uses the root allowlist and does not send the full repository.

Production promotion verifies the intended latest release before build and immediately before promotion. A stale deployment cannot replace a newer production site.

The canonical host is `https://docbank.ai/`. `www.docbank.ai` redirects to the apex host.

## Development workflow for maintainers and agents

`AGENTS.md` and `docs/README.md` document the same workflow:

- Use `make docs-serve` for content, navigation, and visual work.
- Use `make docs-screenshots` only when product UI captures need regeneration.
- Inspect generated screenshots before publishing a complete `docs-assets` generation.
- Update the pinned commit and manifest in a separate reviewed change.
- Run `make docs-build` after the final documentation edit.
- Review substantive changes as rendered pages, not only source diffs.
- Do not publish candidate feature documentation before its release.
- Use `make docs-deploy` from the root only for an authorized production release or post-tag documentation follow-up.

The guidance explicitly tells agents that docs builds consume screenshots but never generate them.

## Verification

Verification exercises owned behavior rather than restating configuration text:

- Unit tests build a fixture site and prove that missing twins, stale `llms.txt` entries, broken links, leaked private paths, and undeclared assets fail.
- Asset-sync tests use a local synthetic Git repository and prove exact-commit pinning, manifest completeness, file-type/size validation, and fail-closed behavior without network fallbacks.
- Upload-boundary tests construct the actual Vercel input set and prove that required public files are present while representative Go, frontend, internal, local-environment, and screenshot-generation files are absent.
- The strict production build validates all output pages and Markdown peers.
- Browser verification loads the built landing page, guide, representative docs pages, navigation, theme, responsive layouts, screenshot lightbox, and download fallback in Chromium and WebKit.
- Accessibility checks cover headings, landmarks, keyboard navigation, visible focus, image alternatives, reduced motion, and color contrast.

Tests do not assert that a parser returns values copied from the same configuration, inspect source strings as a proxy for behavior, or recreate the implementation logic inside the assertion.

## Non-goals

- Redesigning the Docbank product UI.
- Changing document-processing, retrieval, storage, audit, backup, or MCP contracts.
- Adding a JavaScript framework or general-purpose website build system.
- Publishing unreleased capability claims before the post-stack release.
- Tracking generated screenshots on the main branch.
- Running product builds or screenshot capture inside Vercel.

## Acceptance criteria

- The three tiers build into one verified static site at the documented routes.
- The homepage and guide express the authority lifecycle for technical operators using post-stack product behavior.
- The visual system uses flat teal-on-ink surfaces, JetBrains Mono display text, and readable Inter body text without AI-style decoration.
- Root `llms.txt` lists every published Markdown page, and every substantive HTML page has its documented Markdown peer.
- Documentation builds consume one pinned, complete screenshot generation and never run screenshot capture.
- `make docs-deploy` works from the repository root, enforces the release boundary, and uploads only the narrow public input set.
- Strict build, behavioral boundary tests, and browser verification pass.
- Maintainer and agent instructions describe the complete development, screenshot, review, and release workflow.
