# The system of record for documents your agents can use

Docbank stores exact source bytes as authority. Governed processing adds
searchable renditions and embeddings without turning a provider or index into
the record.

Docbank is local-first, open source, and usable through the CLI, web
application, terminal interface, HTTP API, embedded Go package, and agent
tooling.

## Install

- [Install for macOS or Linux](/install.sh)
- [Install for Windows](/install.ps1)
- [Download the latest release archive](https://github.com/kenn-io/docbank/releases/latest)
- [Follow the authority lifecycle](/guide/)

## One record. Explicit states.

A document can be copied, indexed, transformed, and served through several
interfaces. Its authority does not move implicitly with those operations.

1. **Source** — exact retained bytes and stable identity.
2. **Authorization** — a reviewed processing boundary.
3. **Understanding** — derivatives bound to one source version.
4. **Retrieval** — results backed by evidence and source identity.
5. **Recovery** — verified restore under operator control.

## Built around the record, not the index

Docbank separates durable document authority from the systems that make
documents useful. That boundary stays visible in routine operator work.

### Source sovereign

Keep the original exact. Content-addressed bytes, stable document identity,
immutable versions, and checksums preserve what entered the system.

### Govern understanding

Approve what may leave control. Processing policy names the provider boundary
and retained outputs. Derived text and embeddings remain tied to the source
version that produced them.

### Constrain answers

Retrieve with evidence. Search and agent access operate over verified current
content while preserving the document and version behind a result.

### Restore the record

Recover without a provider. Incremental snapshots retain content, metadata, and
history so recovery does not depend on a search or processing service.

## A vault operators can inspect

[![Docbank web vault showing a synthetic technical document
collection](https://docbank.ai/assets/generated/web-vault-browser.png)](https://docbank.ai/assets/generated/web-vault-browser.png)

Browse a filesystem-shaped document tree, inspect document identity and
storage state, and move through retained authority without leaving the vault
interface. The capture shows the real web interface against a generated
synthetic vault.

## Choose the boundary per workload

Understanding is governed work, not an invisible side effect of storage.
Operators decide where it runs and which outputs become retained derivatives.

- **Local:** use local tooling when document bytes should remain on
  operator-controlled hardware.
- **Self-hosted:** point governed jobs at infrastructure your organization
  operates and audits.
- **Hosted:** authorize a provider for a defined task while keeping the original
  and resulting record in Docbank.
- **None:** a document remains a complete authoritative record even when no
  derivative is produced.

## One authority across every surface

People, applications, and agents work through interfaces suited to the task.
They do not create separate copies of record.

- **CLI:** scriptable operator workflows.
- **Web:** visual browsing and maintenance.
- **TUI:** keyboard-first vault inspection.
- **HTTP:** an authenticated filesystem-shaped API.
- **Go:** embedded vault ownership.
- **MCP:** bounded tools for agent work.

[Integrate an agent](/docs/agents/) or [inspect the HTTP
contract](/docs/architecture/http-api/).

## Not another cloud drive

Docbank is closer to a storage appliance with an evidence-aware retrieval
layer: the operator owns the vault, its policy, and its recovery path.

- **Cloud drive:** the service is the record. Identity, search, processing, and
  recovery are coupled to one provider account and its lifecycle.
- **Docbank:** the vault is the record. Storage locations, processors, and
  interfaces are replaceable participants around operator-controlled authority.

## Follow one document through the system

The [authority guide](/guide/) makes each boundary concrete. The [operating
documentation](/docs/) carries installation, workflows, architecture, and
exact command behavior.
