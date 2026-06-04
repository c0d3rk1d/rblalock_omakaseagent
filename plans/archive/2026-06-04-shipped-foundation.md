# Shipped foundation (archived 2026-06-04)

These items were tracked in expansion and dark-factory research plans. They are **done** — do not treat as open backlog.

## Native agents and team MLP

- **Three user-facing leads:** `@omakase-engineer`, `@omakase-critic`, `@omakase-archivist`
- **Hidden specialists** delegated by leads via platform Task / sub-agent mechanisms
- **Documentation:** [`docs/NATIVE-SUBAGENTS.md`](../../docs/NATIVE-SUBAGENTS.md)
- **Verification:** `npm run verify:native-agents` (also runs in CI)

## Engineering team (current)

- Lead: The Engineer (`skill/teams/engineering/lead.md`)
- Specialists: implementation-lead, senior-reviewer, refactor-specialist, debugger
- Reference: `skill/reference/engineering.md`

## Critics team (current)

- Lead: The Critic
- Specialists: deslop-critic, structural-critic, verification-critic

## Archives team (current)

- Lead: The Archivist
- Specialist: memory-synthesizer

## GBrain siphon (Archives)

| Source | Where |
|--------|-------|
| GBrain synthesis | `skill/teams/archives/sub-personas/memory-synthesizer.md` |
| GBrain co-curator patterns | `skill/teams/archives/lead.md` |

## Build, distribution, and CI

- Source of truth: `skill/` → `npm run build` → committed `dist/` bundles
- Dist guard and required-file checks in `scripts/build.js`
- **CI:** [`.github/workflows/verify.yml`](../../.github/workflows/verify.yml) — build + `verify:native-agents` on push/PR

## Repo standards

- Root [`AGENTS.md`](../../AGENTS.md) — Omakase entry points and memory paths
- Project memory: `.omakaseagent/taste.md`, `decisions.md`

## Engineering Rubric (how-to-code distill)

**Decision:** 2026-06-04 — boundary/contract/lifecycle guidance from [how-to-code](https://github.com/janbam/how-to-code) distilled into Engineering team only.

- Rubric: `skill/reference/engineering.md` § Engineering Rubric
- Owner: The Engineer (`skill/teams/engineering/lead.md`)
- Judge: The Senior Reviewer (`skill/teams/engineering/sub-personas/senior-reviewer.md`)

Not applied to Sales, Critics, or Archives teams.

## Harness research (conclusion only)

Research concluded: markdown personas + native sub-agents + lead delegation are the Omakase model. **Do not** install revfactory/harness as a co-primary package skill. Pattern gleaning remains in expansion plan for future reference docs and `omakase learn` (not shipped).

## Dark-factory gaps closed since playbook draft

These were listed as “current gaps” in the dark-factory memo; they are no longer open:

- ~~No CI~~ → verify workflow exists
- ~~No repo-local AGENTS.md~~ → present at repo root

Still open (see active dark-factory plan): scenario templates, gate report format, parity eval harness, mechanical citation/critique checks.
