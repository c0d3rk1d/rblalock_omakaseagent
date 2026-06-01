# Native sub-agents

How Omakase registers team leads and specialists as first-class harness agents.

## Quick start

```bash
npx omakase init
```

Then use **`@omakase-engineer`**, **`@omakase-critic`**, or **`@omakase-archivist`** (or harness CLI equivalents below). Do not use the `omakase` skill for lead work when native agents are installed.

## Architecture

```mermaid
flowchart LR
  User -->|@omakase-engineer| Lead[Native lead agent]
  Lead -->|Task subagent_type| Spec[Hidden specialist]
  User -->|/omakase plan| Skill[omakase skill router]
```

- **Source of truth:** `skill/teams/**/*.md`
- **Build:** `scripts/native-agents/generate.js` → `dist/**/agents/`
- **Install:** `bin/omakase.js` copies dist overlays into the project

## Agent inventory

| id | Role | User can invoke? |
|----|------|------------------|
| omakase-engineer | The Engineer | Yes |
| omakase-critic | The Critic | Yes |
| omakase-archivist | The Archivist | Yes |
| omakase-senior-reviewer | Engineering specialist | No (lead only) |
| omakase-refactor-specialist | Engineering specialist | No |
| omakase-implementation-lead | Engineering specialist | No |
| omakase-debugger | Engineering specialist | No |
| omakase-deslop-critic | Critics specialist | No |
| omakase-structural-critic | Critics specialist | No |
| omakase-verification-critic | Critics specialist | No |
| omakase-memory-synthesizer | Archives specialist | No |

## Per-harness commands

### OpenCode

```bash
opencode agent list | rg '^omakase-'
opencode run --agent omakase-engineer "task"
```

Leads: `mode: all`. Specialists: `mode: subagent`, `hidden: true`.

### Claude Code

```bash
claude -p --agent omakase-engineer "task"
```

### Cursor

Install `.cursor/agents/omakase-*.md`, then `@omakase-engineer` in the IDE.

### Codex

```bash
codex exec --skip-git-repo-check -c 'agent="omakase_engineer"' "task"
```

## Migration from skill-only

1. Run `omakase init` in the project.
2. Switch entry from `/omakase engineer` to `@omakase-engineer`.
3. Keep `/omakase plan`, `/omakase taste`, `/omakase handoff` on the skill router.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `@omakase-engineer` loads skill + `lead.md` | Use `opencode run --agent omakase-engineer` or update skill (precedence rules). Do not call `skill("omakase")` for lead work. |
| `run --agent omakase-engineer` falls back to `build` | Re-run `npm run build` + `omakase init`; lead needs `mode: all` in `.opencode/agents/omakase-engineer.md`. |
| Specialist appears in `@` menu (OpenCode) | Regenerate agents; specialists must have `hidden: true`. |
| Codex exec fails | `git init` or `--skip-git-repo-check`; use `agent="omakase_engineer"` (underscore). |

## CI / local verify

```bash
npm run build
npm run verify:native-agents
```

See also `skill/reference/native-agents.md` (shipped inside the skill bundle).