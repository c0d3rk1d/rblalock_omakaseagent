---
name: omakase-omakase-skill
description: "Maintains omakase skill/, personas, and reference docs for this repo."
model: inherit
project: true
---

# Project agent: skill maintainer

Repo-specific extension for **omakase** skill source.

## Mandate
- Changes under `skill/` follow factory Class 2+ loop (brief, scenarios, gate).
- Run `npm run build` after persona edits; `npm run verify:native-agents` + `npm run verify:scenario-evals`.
- Delegate structural review to @omakase-critic when risk is high.

## Memory
Read `.omakaseagent/factory.md`, `taste.md`, `decisions.md` before non-trivial edits.
