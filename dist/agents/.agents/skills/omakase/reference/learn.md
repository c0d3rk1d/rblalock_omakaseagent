# omakase learn — repo factory bootstrap

**Owner:** The Archivist (method). **CLI:** `bin/omakase.js learn` (deterministic discover + write).

## Purpose

Install a **Level 4 dark factory** for *this* repo — not generic templates. `learn` discovers stack and scripts, then writes:

- `.omakaseagent/factory.md` — repo playbook (checks, risk classes, workflow)
- `.omakaseagent/scenarios/` — up to 5 starter scenarios (approve before Class 2+ work)
- `.omakaseagent/gates/` + `handoffs/` + `backlog/` — empty with README
- Taste/decisions/AGENTS.md updates when missing factory markers

Global bar: `reference/dark-factory.md`. This command installs **instrumentation**.

## CLI

```bash
omakase learn              # factory + memory markers
omakase learn --dry-run    # list paths only
omakase learn --memory-only   # taste/decisions only, no scenarios
omakase learn --factory-only  # factory.md + scenarios, skip taste merge
omakase learn --project-agents-only  # project-agents/ + native emit only
```

**Precondition:** `.omakaseagent/` exists (`omakase init` first).

## Agent fallback (no CLI)

1. Confirm `.omakaseagent/` exists; else tell user to run `omakase init`.  
2. Read README, `package.json`, CI workflows, main source dirs.  
3. Propose same artifacts as CLI would write; show diffs.  
4. **Wait for confirm** before writing.  
5. Log decision in `decisions.md`.

## After learn

Agents follow **`reference/task-intake.md`** (single tasks) and **`reference/factory-orchestration.md`** (Class 2+ team loop: Engineer → critic → gate → archivist when needed). Backlog audit and execution plans: **`reference/backlog-audit.md`**, **`reference/execution-plan.md`**.

- Class **0–1:** brief inline; mechanical checks; light checkpoint OK.  
- Class **2+:** brief + scenarios (agent drafts); one confirm; gate file at end.  
- Re-run `learn` when stack or CI changes (`--dry-run` first).

## Gate report shape (minimum headings)

```markdown
# Gate: <task>

## Seed
## Scenarios
## Mechanical evidence
## Critic
## Memory consulted
## Risks / human decision
```

## Project agents (Phase G)

`learn` proposes up to **3** namespaced agents under `.omakaseagent/project-agents/` from repo signals (`skill/`, `bin/`, domain dirs). On learn, stubs emit to installed harness `agents/` dirs (e.g. `.cursor/agents/omakase-<pkg>-skill.md`).

- **Canonical source:** `.omakaseagent/project-agents/*.md` — edit here, re-run learn
- **Does not replace** core leads (`@omakase-engineer`, etc.)
- **Gate:** skill-judge report on new/changed bodies (report-only; human decides)
- **Refresh:** `omakase learn --project-agents-only` after editing project agent files

See `reference/team-architecture.md` for delegation patterns.
