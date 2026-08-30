# The document authority lifecycle

One document moves through seven explicit boundaries. Exact source bytes remain
authoritative at every stop.

1. [Ingest](#ingest)
2. [Identify](#identify)
3. [Authorize](#authorize)
4. [Understand](#understand)
5. [Retrieve](#retrieve)
6. [Serve](#serve)
7. [Prove](#prove)

## Ingest

Docbank copies bytes into the vault without making the source path part of
document identity. The virtual tree gives operators a familiar hierarchy while
retained content stays addressable by checksum.

![Synthetic Docbank vault after document
ingestion](https://docbank.ai/assets/generated/web-vault-browser.png)

[Importing documents](/docs/usage/importing/)

## Identify

A stable node identity survives moves and renames. Replacement creates an
immutable content version, preserving checksums and history instead of silently
changing what an identifier means.

![Docbank retained version history and download
action](https://docbank.ai/assets/generated/web-retained-version-download.png)

[Editing and versions](/docs/architecture/editing-and-versions/)

## Authorize

Before processing, the operator chooses where document bytes may go and which
outputs may be retained. Authorization governs a task; it does not transfer
source authority to the processor.

![Source authority above authorized, version-bound processing
steps](https://docbank.ai/assets/authority-ledger.svg)

[Document understanding](/docs/document-understanding/)

## Understand

Normalized text, sanitized renditions, and embeddings are derivatives of one
exact source version. They can improve retrieval or be regenerated without
becoming the original record.

![Derivatives retained beneath an exact authoritative source
version](https://docbank.ai/assets/authority-ledger.svg)

[Understanding outputs](/docs/document-understanding/)

## Retrieve

Search ranks names and verified current text while keeping the document,
version, and evidence behind each result available. An index helps locate the
record; it does not define it.

![Docbank ranked search over a synthetic document
catalog](https://docbank.ai/assets/generated/web-search-results.png)

[Searching](/docs/usage/searching/)

## Serve

The CLI, web application, TUI, HTTP API, embedded Go package, and agent tools
operate over the same vault model. Each surface inherits the same identity,
revision, and integrity boundaries.

![CLI, web, TUI, HTTP, Go, and MCP interfaces sharing one Docbank
vault](https://docbank.ai/assets/interface-map.svg)

[Docbank for agents](/docs/agents/)

## Prove

Verification checks content and history before an operator needs them.
Incremental snapshots restore exact bytes, metadata, and retained history
without relying on a processing or search provider.

![Docbank evidence view for a protected synthetic document
scope](https://docbank.ai/assets/generated/web-audit-evidence.png)

![Verified snapshot restoring a vault without a processing
provider](https://docbank.ai/assets/recovery-flow.svg)

[Backup and restore](/docs/usage/backup/)

Continue with the [quickstart](/docs/quickstart/) or open the complete [operating
documentation](/docs/).
