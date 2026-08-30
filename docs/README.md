# docbank documentation

This directory holds the [zensical](https://zensical.org) documentation site
plus internal design material.

## Layout

- `*.md`, `usage/`, `architecture/` — published site content
- `stylesheets/` — published visual theme
- `scripts/` — source and built-site validation (never published)
- `internal/` — living agent/developer design documentation (never published)
- `zensical.toml` — site configuration
- `zensical-docs.sh` — build wrapper; validates sources, copies publishable
  content into a temporary tree, and checks the generated site's links,
  metadata, assets, and publishing boundary; all Python tools run through
  the locked `uv` environment

Every rendered directory route also publishes its exact Markdown source at the
sibling `.md` path. The operating page `/docs/setup/` has `/docs/setup.md`, and
`/docs/usage/importing/` has `/docs/usage/importing.md`. The product page and
authority guide follow the same rule at `/index.md` and `/guide.md`. Agents and
other text-first clients can use these stable representations without scraping
rendered HTML.

## Building

Run documentation commands from the repository root:

```bash
make docs-install  # one-time: install the locked Zensical environment
make docs-serve    # build and watch all three tiers on http://127.0.0.1:8000
make docs-build    # strict production build into site/
```

`make docs-serve` serves the product page, authority guide, and operating
documentation from one origin. It rebuilds after changes beneath `website/` or
`docs/`, or after the pinned screenshot commit or manifest changes. A failed
rebuild leaves the last successful `site/` available for inspection.

## Screenshots

Screenshot generation is a separate reviewed workflow. It never runs during a
documentation build or deployment.

1. Run `make docs-screenshots`. The harness starts a real daemon with a
   temporary synthetic vault and writes the complete capture set beneath
   `.superpowers/screenshots/`.
2. Inspect every generated image and its metadata.
3. Publish the complete reviewed set as one orphan `docs-assets` commit.
4. Put that exact commit in `scripts/docs-assets.ref` and run
   `make docs-assets-sync`.
5. Run `make docs-build` after the final source or asset-pin edit.

Never capture a developer vault, publish a partial set, or point the build at a
mutable branch head.

## Documentation boundary

- User- and agent-facing pages explain shipped capabilities, exact contracts,
  and current limitations. They do not inventory future commands or endpoints.
- Public Architecture pages explain product behavior and durable boundaries.
  A future contract belongs there only when it materially explains design
  intent, and is always isolated under an explicit `!!! info "Planned"`
  admonition.
- `internal/` is the definitive developer description of how the system works
  and why. Update it in place with implementation changes; revise the matching
  public Architecture page when user-visible behavior or boundaries change.
- `roadmap.md` is the one high-level public view of product direction and
  status. It is not an execution ledger.
- Kata is the sole source of truth for actionable work, sequencing, ownership,
  blockers, and completion state. Do not copy that state into documentation.
