# AGENTS

## Omakase Standards

This project follows the [Omakase](https://github.com/rblalock/omakaseagent) standard — senior craftsmanship, zero AI slop, mandatory critique.

**Native agents (primary entry points):**
- `@omakase-engineer` — implementation, architecture, refactoring
- `@omakase-critic` — quality enforcement and review
- `@omakase-archivist` — memory and decisions

Specialists (`omakase-senior-reviewer`, `omakase-skill-judge`, etc.) are internal — invoked by leads via Task, not directly.

**Memory:** `.omakaseagent/taste.md` and `.omakaseagent/decisions.md`

**Fallback router:** `/omakase-router plan` / `/omakase-router taste` (skill `omakase-router` in `.agents/skills/omakase/`) — not for lead work.

## Omakase Dark Factory

This repo uses **Level 4** Omakase: approve intent and scenarios; review gate evidence at checkpoint.

- **Factory playbook:** `.omakaseagent/factory.md`
- **Scenarios:** `.omakaseagent/scenarios/`
- **Gate reports:** `.omakaseagent/gates/`
- **Loops:** `.omakaseagent/loops/` — standing charters for unattended runs (`reference/loops.md`)
- **Refresh:** `npx omakaseagent learn` (use `--dry-run` first)

<!-- omakase-learn:project-agents -->

**Project agents** (≤3, repo-specific):

- `.omakaseagent/project-agents/skill-maintainer.md` → emitted on learn
- `.omakaseagent/project-agents/cli-maintainer.md` → emitted on learn
