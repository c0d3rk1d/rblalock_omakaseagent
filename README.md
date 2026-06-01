# Omakase

**The chef's standard.**

[![skills.sh](https://skills.sh/b/rblalock/omakaseagent)](https://skills.sh/rblalock/omakaseagent)

One skill. Senior taste. Zero AI slop. It holds the work to the same bar you would.

Trust the chef. State the goal. We decide the approach and enforce the standard.

## Why this exists

Most agent skills are bags of prompts. Omakase is a **standard** — a small set of non-negotiable rules and a critique rubric that every significant output must pass.

It is deliberately anti-slop by design:
- Ruthless simplicity is the default stance
- Critique is mandatory
- Persistent project taste memory is first-class
- You always explain your taste on non-trivial work

If the output could have been written by a generic model with no strong opinions, it has failed.

## Quick start

```bash
npx omakase init
```

This bootstraps `.omakaseagent/`, updates `AGENTS.md`, installs the skill, and registers **native sub-agents** (`@omakase-engineer`, `@omakase-critic`, `@omakase-archivist`) for OpenCode, Cursor, Claude Code, and Codex.

Reload your harness, then:

```
@omakase-engineer add rate limiting with backoff and jitter
@omakase-critic review the auth module
```

Fallback (skill router only):

```
/omakase engineer <task>
/omakase critique <target>
```

## The Standard (ships with every install)

Three small documents. These are sacred context:

- **OMAKASE-RULES.md** — The 12 rules (Full Context First, Zero Slop Policy, Ruthless Simplicity, Explain Your Taste, Persistent Memory, etc.)
- **OMAKASE-CRITIQUE.md** — The 8-bullet rubric every major output must pass
- **OMAKASE-PRINCIPLES.md** — This is a standard, not another prompt collection

Project memory lives in `.omakaseagent/taste.md` and `decisions.md`. The skill loads them on relevant work.

## Installation

### Recommended

```bash
npx omakase skills install
```

This gives the best experience and automatically detects your harness (Cursor, Claude Code, agents-style, etc.).

Explicit harness:

```bash
npx omakase skills install cursor
npx omakase skills install claude
npx omakase skills install agents   # also .opencode/agents + .codex/agents
npx omakase skills install codex
```

Native agents are installed by default. Use `--no-native-agents` for skill-only install.

### Also available via the general skills installer

```bash
npx skills add rblalock/omakaseagent
```

This makes Omakase discoverable on [skills.sh](https://skills.sh) and works with the unified skills ecosystem.

**Note:** The dedicated `npx omakase skills install` path is recommended for the best results while the skill is actively evolving.

## Local Development (no npm publish required)

If you're working on Omakase itself (or want the absolute latest version locally):

1. **Link the CLI globally** (so the `omakase` command always uses your local copy):

   ```bash
   cd /path/to/omakaseagent
   npm link
   ```

   This also runs the build automatically.

2. **Install the skill** with full control:

   ```bash
   # Per-project (most common during development)
   omakase skills install cursor --test
   omakase skills install claude --test

   # Global / user-level (available in every project)
   omakase skills install cursor --global
   omakase skills install agents --global --test
   ```

   `--global` installs to `~/.cursor/skills/`, `~/.claude/skills/`, or `~/.agents/skills/` instead of the current project.

This model is very close to how [Impeccable](https://impeccable.style) handles installation (their `npx impeccable skills install` + documented global paths for several harnesses).

You can freely switch between the published version (`npx omakase ...`) and your local linked version at any time.

## Usage

One entry point:

```
/omakase <goal or command>
```

Common explicit commands:

- `init` — Bootstrap `.omakaseagent/` with taste + decisions
- `engineer` — Full senior Engineering persona (code judo, deslop, critique gate)
- `critique` — Domain-aware review that merges the right extensions
- `plan` — Senior planning with explicit reasoning and options

For everything else, just say what you want. The skill detects intent and applies the appropriate standard.

## Philosophy

Mediocre work is not acceptable.

The output should feel like it came from a practitioner with strong, earned opinions — not from a model averaging its training data.

We reject generic AI patterns at the architecture level. Critique is non-negotiable. Taste is persisted. Simplicity is the default. "Why this approach" is required on anything non-trivial.

We only ship what we would use daily.

## Development

Source of truth is `skill/`.

```bash
npm run build
```

Never edit `dist/` directly.

The original implementation spec (OMAKASE-SPEC.md) has been retired. The current state is captured in this README, the personas under `skill/teams/`, and `.omakaseagent/decisions.md`.

## License

Apache 2.0. The tooling is licensed for distribution. The standard is meant to be adopted and enforced by teams that care about quality.

---

Trust the chef.
