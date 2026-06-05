# Phase C: Skill Judge (archived 2026-06-04)

**Status:** Shipped.

## What shipped

- **Persona:** `skill/teams/critics/sub-personas/skill-judge.md` — The Skill Judge
- **Rubric:** `skill/reference/skill-judge.md` — 8 dimensions, 120 points, E:A:R scan, report-only policy
- **Lead:** `skill/teams/critics/lead.md` — delegates to Skill Judge for SKILL.md / skill-package audits
- **Critique router:** `skill/reference/critique.md` — skill-package detection signals
- **Native agent:** `omakase-skill-judge` (hidden; `omakase-critic` delegates via Task)
- **Build:** 12 personas in `scripts/native-agents/generate.js`; verify count updated

## Policy

- **Report-only** — grades never block merges or installs; human decides
- **Not user-facing** — invoke `@omakase-critic`, not a fourth lead
- **Lineage:** distilled from [softaworks skill-judge](https://github.com/softaworks/agent-toolkit/tree/main/skills/skill-judge) (MIT), Omakase voice

## Enables

- Dark-factory with/without-skill evals on skill packages
- Import gates before siphoning external skills (Sales, cursor-kit refs, project agents)
- Meta-quality baseline for `omakase learn` generated personas (future)

## Optional follow-up

- Calibration report on `skill/SKILL.md` after major router changes
