# The document authority lifecycle

One document moves through seven explicit boundaries. The source remains
authoritative at every stop.

## Ingest

Copy exact source bytes into the virtual tree without changing the source.
[Importing documents](/docs/usage/importing/)

## Identify

Keep stable node identity, immutable versions, checksums, moves, and replacement
history. [Editing and versions](/docs/architecture/editing-and-versions/)

## Authorize

Review the processing boundary and retained outputs before document bytes can
leave operator control. [Document understanding](/docs/document-understanding/)

## Understand

Publish sanitized renditions and other derivatives against an exact source
version. [Document understanding](/docs/document-understanding/)

## Retrieve

Search current verified content while preserving the evidence and source
identity behind a result. [Searching](/docs/usage/searching/)

## Serve

Use the same authority through human interfaces, automation, HTTP, and embedded
Go. [Docbank for agents](/docs/agents/)

## Prove

Verify content and history, create a backup, and restore without making a
provider authoritative. [Backup and restore](/docs/usage/backup/)
