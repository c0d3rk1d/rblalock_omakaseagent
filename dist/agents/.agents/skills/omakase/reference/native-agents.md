# Native Omakase Agents

Portable reference shipped with the skill. Repo copy: `docs/NATIVE-SUBAGENTS.md`.

## What gets installed

`omakase init` or `omakase skills install` writes:

| Harness | Skill (router fallback) | Native agents |
|---------|-------------------------|---------------|
| Agents / OpenCode | `.agents/skills/omakase/` | `.opencode/agents/omakase-*.md` |
| Cursor | `.cursor/skills/omakase/` | `.cursor/agents/omakase-*.md` |
| Claude Code | `.claude/skills/omakase/` | `.claude/agents/omakase-*.md` |
| Codex | — | `.codex/agents/omakase-*.toml` (+ agents install also copies codex) |

Eleven personas, `omakase-` prefix. **Three leads** are user-facing; eight specialists are lead-delegated only.

## User-facing leads

| Agent id | Use for |
|----------|---------|
| `omakase-engineer` | Implementation, architecture, refactoring, debugging |
| `omakase-critic` | Quality enforcement, critique, deslop, verification |
| `omakase-archivist` | Memory, decisions, taste synthesis |

## Invoke by harness

### OpenCode

```bash
opencode run --agent omakase-engineer "your task"
```

In TUI: `@omakase-engineer` (preferred over invoking the `omakase` **skill** for engineering work).

Leads use `mode: all`. Specialists use `mode: subagent` + `hidden: true` (omitted from `@` autocomplete).

### Claude Code

```bash
claude -p --agent omakase-engineer "your task"
```

### Cursor

`@omakase-engineer` in the IDE agent panel. No headless runner; files must exist under `.cursor/agents/`.

### Codex

```bash
git init   # or --skip-git-repo-check
codex exec --skip-git-repo-check -c 'agent="omakase_engineer"' "your task"
```

TOML `name` uses underscores (`omakase_engineer`); markdown agents use hyphens.

## Delegation (lead → specialist)

Leads **must** use the platform **Task** tool with `subagent_type` set to the exact id:

**Engineering (`omakase-engineer`)**

- `omakase-senior-reviewer`
- `omakase-refactor-specialist`
- `omakase-implementation-lead`
- `omakase-debugger`

**Critics (`omakase-critic`)**

- `omakase-deslop-critic`
- `omakase-structural-critic`
- `omakase-verification-critic`

**Archives (`omakase-archivist`)**

- `omakase-memory-synthesizer`

Charter template:

```
Task → subagent_type: omakase-senior-reviewer
Charter: Review <paths> for simplicity, deslop, file health.
Memory: <paste 3–5 bullets from taste.md / decisions.md>
Deliverable: Findings only; no drive-by edits unless asked.
```

OpenCode lead agents include `permission.task` allowlists for their specialists.

## Skill vs native agent

| User says | Correct target |
|-----------|----------------|
| `@omakase-engineer` | Native agent `omakase-engineer` — **not** `skill("omakase")` |
| `/omakase plan …` | Skill router (`reference/plan.md`) |
| `/omakase engineer …` with native installed | Redirect to `@omakase-engineer` |
| No native agents installed | Skill loads `teams/*/lead.md` (fallback) |

## Uninstall

```bash
omakase skills uninstall
```

Removes `omakase` skill trees and all `omakase-*` files under `.opencode/agents`, `.cursor/agents`, `.claude/agents`, `.codex/agents`.

## Verify install

From the omakase repo:

```bash
npm run verify:native-agents
```