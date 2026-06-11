# Native sub-agents

How Omakase registers team leads and specialists as first-class harness agents.

## Quick start

```bash
npx omakaseagent init
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

`omakase init` installs **agents + grok + claude + codex** always.

| Path | Files | Why |
|------|-------|-----|
| `.cursor/agents/` | 3 leads | Cursor `@` picker |
| `.claude/agents/` | 3 leads | Claude `/agents` — **Cursor also reads this path**, so specialists must not live here |
| `.grok/agents/` | 12 (leads + specialists) | Grok delegation; Cursor does **not** read `.grok/agents/` |
| `.opencode/agents/` | 12, specialists `hidden: true` | OpenCode `@` + delegation |
| `.codex/agents/` | 12 `.toml` | Codex spawn-by-name only (no library UI) |

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

**Install:** `omakase init` always writes `.claude/agents/` (you do **not** need a pre-existing `.claude/` folder).

**See them in the TUI:** run **`/agents`** → **Library** → scroll to **Project agents** (below Plugin / Built-in). **Start a new Claude session** after init — agents load at session start.

```bash
claude -p --agent omakase-engineer "your task"
```

If Library only shows Plugin + Built-in agents, Claude agents were never installed: check `ls .claude/agents/omakase-engineer.md`.

### Cursor

`@omakase-engineer` in the IDE. Specialists use `INTERNAL ONLY` descriptions + `is_background: true` (no `hidden` field on Cursor).

### Codex

Custom agents live in `.codex/agents/*.toml` (installed by `omakase init` via the `agents` harness). Codex does **not** show a browsable catalog like OpenCode `@` or Claude `/agents` Library.

The TUI **Subagents** screen (`/agent`) lists **active threads** (e.g. `Main [default]`) — not available agent definitions. You only see more rows after Codex **spawns** a subagent.

**Use them:**

```bash
codex exec --skip-git-repo-check -c 'agent="omakase_engineer"' "your task"
```

In the interactive TUI, ask explicitly, e.g. `Spawn a subagent using the omakase_engineer custom agent to review this diff.` (names use **underscores**: `omakase_engineer`, not hyphens).

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
| Specialists in Cursor `@` menu | Re-run `omakase init` — remove stale files from `.claude/agents/`. Specialists are only in `.grok` + `.opencode`, not `.claude`. |
| Specialists in Grok `grok inspect` | Expected (12 in `.grok/agents/`). Use the 3 leads in the UI; specialists are delegate-only. |
| `{file:}` not resolving | Run `omakase init` so `.agents/skills/omakase/teams/` exists relative to agent files. |
| Grok missing agents | Run `omakase skills install grok` or full `omakase init`. |
| Claude Library has no Project agents | Re-run `omakase init`; confirm `.claude/agents/omakase-*.md`; **new session**. |
| Codex Subagents only shows Main | Expected — spawn agents via prompt or `agent="omakase_engineer"`. |

## CI

```bash
npm run build
npm run verify:native-agents
```

GitHub Actions: `.github/workflows/verify.yml`