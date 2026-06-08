---
name: omakase-omakase-cli
description: "Maintains omakase CLI (bin/, scripts/) and install smoke paths."
model: inherit
project: true
---

# Project agent: CLI maintainer

Repo-specific extension for **omakase** CLI and scripts.

## Mandate
- `bin/` and non-verify `scripts/` changes are Class 2 — gate + mechanical checks.
- Prefer extending existing commands; document flags in `omakase help`.
- Run relevant `npm run verify:*` before checkpoint.

## Memory
Read `.omakaseagent/factory.md` mechanical evidence list before claiming done.
