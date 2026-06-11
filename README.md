<div align="center">

<a href="https://omakaseagent.com"><img src="https://omakaseagent.com/og.png" alt="Omakase Agent: the chef's standard for AI agent work" width="720"></a>

**The chef's standard.** One skill. Craftsman's taste. Zero AI slop.

[omakaseagent.com](https://omakaseagent.com)

[![npm](https://img.shields.io/npm/v/omakaseagent?color=d93a1f&label=npm)](https://www.npmjs.com/package/omakaseagent)
[![license](https://img.shields.io/badge/license-Apache--2.0-2a221b)](LICENSE)
[![skills.sh](https://skills.sh/b/rblalock/omakaseagent)](https://skills.sh/rblalock/omakaseagent)

</div>

Trust the chef — state the goal. Omakase applies the bar, remembers taste, and critiques before anything significant ships.

## What it is

Omakase is a **portable quality standard** for agent work: twelve rules, a critique rubric, and project memory (`.omakaseagent/taste.md`, `decisions.md`). Not a bag of prompts.

Generic, hedging, over-engineered output fails. Non-trivial work explains *why* this approach.

## Quick start

```bash
npx omakaseagent init
npx omakaseagent learn    # repo-specific Level 4 factory (scenarios, gates)
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
npx omakaseagent init
```

**Skill + agents only** (harness already configured):

```bash
npx omakaseagent skills install          # auto-detect harness
npx omakaseagent skills install cursor   # or: claude | agents | grok | codex
```

Also on the skills ecosystem: `npx skills add rblalock/omakaseagent` ([skills.sh](https://skills.sh/rblalock/omakaseagent)).

**No terminal?** Omakase works in chat apps. Download
[omakase-skill.zip](https://omakaseagent.com/omakase-skill.zip),
then upload it in Claude (Customize → Skills → Upload skill) or ChatGPT
(Skills → New skill → Upload from your computer). In chat
you get the standard (rules + critique gate); the full kitchen (leads, project
memory) needs a coding harness.

Use `omakase skills install --no-native-agents` for skill-only. Verify artifacts: `npm run verify:native-agents`.

## Developing this repo

Source: `skill/`. Shipped bundles: `dist/` (committed — do not edit by hand).

```bash
npm link              # local CLI
npm run build
npm run verify:native-agents
npx omakaseagent init      # dogfood in this clone
npx omakaseagent learn     # factory layout for this repo
```

Level 4 methodology: [skill/reference/dark-factory.md](skill/reference/dark-factory.md). Multi-agent E2E: [examples/factory-e2e/](examples/factory-e2e/). Learn snapshot: [examples/factory-dogfood/](examples/factory-dogfood/).

Do not commit local harness dirs (`.cursor/`, `.claude/`, etc.) — regenerate with `init`. Personas: `skill/teams/`.

## License

Apache 2.0