# Omakase

**The chef's standard.** One skill. Senior taste. Zero AI slop.

[![skills.sh](https://skills.sh/b/rblalock/omakaseagent)](https://skills.sh/rblalock/omakaseagent)

Trust the chef — state the goal. Omakase applies the bar, remembers taste, and critiques before anything significant ships.

## What it is

Omakase is a **portable quality standard** for agent work: twelve rules, a critique rubric, and project memory (`.omakaseagent/taste.md`, `decisions.md`). Not a bag of prompts.

Generic, hedging, over-engineered output fails. Non-trivial work explains *why* this approach.

## Quick start

```bash
npx omakase init
```

Reload your harness, then talk to a **lead** (not a menu of skills):

| Harness | Example |
|---------|---------|
| Cursor / Claude IDE | `@omakase-engineer add rate limiting with backoff` |
| OpenCode | `opencode run --agent omakase-engineer "add rate limiting…"` |
| Grok | `grok --agent omakase-engineer "…"` |
| Claude CLI | `claude -p --agent omakase-critic "review the auth module"` |

**Leads:** `@omakase-engineer` · `@omakase-critic` · `@omakase-archivist` — specialists stay internal; leads delegate.

**Router skill** (`omakase-router`) is only for plan, taste, handoff, and init when you are not using a native lead:

```
/omakase-router plan <goal>
/omakase-router critique <target>
```

Harness quirks, Codex names, and troubleshooting: [docs/NATIVE-SUBAGENTS.md](docs/NATIVE-SUBAGENTS.md).

## The standard (always loaded)

| File | Role |
|------|------|
| [OMAKASE-RULES.md](OMAKASE-RULES.md) | Twelve non-negotiable rules |
| [OMAKASE-CRITIQUE.md](OMAKASE-CRITIQUE.md) | Rubric for major output |
| [OMAKASE-PRINCIPLES.md](OMAKASE-PRINCIPLES.md) | Why this is a standard, not a prompt pack |

Memory lives in `.omakaseagent/` after `init`.

## Install

**New project:**

```bash
npx omakase init
```

**Skill + agents only** (harness already configured):

```bash
npx omakase skills install          # auto-detect harness
npx omakase skills install cursor   # or: claude | agents | grok | codex
```

Also on the skills ecosystem: `npx skills add rblalock/omakaseagent` ([skills.sh](https://skills.sh/rblalock/omakaseagent)).

Use `omakase skills install --no-native-agents` for skill-only. Verify artifacts: `npm run verify:native-agents`.

## Developing this repo

Source: `skill/`. Shipped bundles: `dist/` (committed — do not edit by hand).

```bash
npm link              # local CLI
npm run build
npm run verify:native-agents
npx omakase init      # dogfood in this clone
```

Do not commit local harness dirs (`.cursor/`, `.claude/`, etc.) — regenerate with `init`. Personas: `skill/teams/`.

## License

Apache 2.0