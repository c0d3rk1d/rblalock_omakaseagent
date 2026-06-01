# Native sub-agents

How Omakase registers team leads and specialists as first-class harness agents.

## Quick start

```bash
npx omakase init
```

Use **`@omakase-engineer`**, **`@omakase-critic`**, or **`@omakase-archivist`** (or harness CLI below). Do **not** use the **`omakase-router`** skill for lead work — that skill is plan/taste/handoff only.

## Architecture

```mermaid
flowchart LR
  User -->|@omakase-engineer| Lead[Native lead agent]
  Lead -->|Task subagent_type| Spec[Hidden specialist]
  User -->|/omakase-router plan| Skill[omakase-router skill]
```

- **Source of truth:** `skill/teams/**/*.md`
- **Build:** `scripts/native-agents/generate.js` → `dist/**/agents/`
- **Agent bodies:** `{file:...}` includes point at `.agents/skills/omakase/` (no duplicated core text in dist agents, except Codex TOML)

## Harness coverage

| Harness | Skill (router) | Native agents |
|---------|----------------|---------------|
| Agents / OpenCode | `.agents/skills/omakase/` (`name: omakase-router`) | `.opencode/agents/omakase-*.md` |
| Grok Build | `.grok/skills/omakase/` | `.grok/agents/omakase-*.md` |
| Cursor | `.cursor/skills/omakase/` | `.cursor/agents/omakase-*.md` |
| Claude Code | `.claude/skills/omakase/` | `.claude/agents/omakase-*.md` |
| Codex | — | `.codex/agents/omakase-*.toml` |

`omakase init` installs **agents + grok + codex** overlays always; adds cursor/claude when those dirs exist.

## Per-harness commands

### OpenCode

```bash
opencode run --agent omakase-engineer "your task"
```

Prefer `run --agent` over `@omakase-engineer` if your session still routes `@` to the skill. The skill is named **`omakase-router`** (not `omakase`) so `@omakase-engineer` should not invoke it.

### Grok Build

[Grok skills, plugins, and subagents](https://docs.x.ai/build/features/skills-plugins-marketplaces#subagents) — subagents spawn isolated child sessions via the `task` tool.

```bash
# After omakase init — agents in .grok/agents/
grok --agent omakase-engineer "your task"
```

Grok also reads `.claude/agents/` and `.agents/skills/` for compatibility, but prefer explicit `.grok/agents/` definitions from install.

Leads: `permission_mode: default`. Specialists: `permission_mode: plan` + `INTERNAL ONLY` descriptions.

### Claude Code

```bash
claude -p --agent omakase-engineer "your task"
```

### Cursor

`@omakase-engineer` in the IDE. Specialists use `INTERNAL ONLY` descriptions + `is_background: true` (no `hidden` field on Cursor).

### Codex

```bash
codex exec --skip-git-repo-check -c 'agent="omakase_engineer"' "your task"
```

## Skill vs native agent

| User intent | Target |
|-------------|--------|
| Engineering / critique / archivist work | `@omakase-engineer` etc. |
| Plan, taste, handoff, init guidance | `/omakase-router …` skill |
| `@omakase-engineer` | Native agent — **never** `skill("omakase")` or `skill("omakase-router")` |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `@omakase-engineer` loads skill + `lead.md` | Re-init; skill must be `omakase-router`. Use `opencode run --agent omakase-engineer`. |
| `run --agent` falls back to `build` | Lead needs `mode: all` in `.opencode/agents/omakase-engineer.md`. |
| Specialist in `@` menu (OpenCode) | Regenerate; specialists need `hidden: true`. |
| `{file:}` not resolving | Run `omakase init` so `.agents/skills/omakase/teams/` exists relative to agent files. |
| Grok missing agents | Run `omakase skills install grok` or full `omakase init`. |

## CI

```bash
npm run build
npm run verify:native-agents
```

GitHub Actions: `.github/workflows/verify.yml`