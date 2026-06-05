# omakase learn — repo factory bootstrap

**Owner:** The Archivist (method). **CLI:** `bin/omakase.js learn` (deterministic discover + write).

## Purpose

Install a **Level 4 dark factory** for *this* repo — not generic templates. `learn` discovers stack and scripts, then writes:

- `.omakaseagent/factory.md` — repo playbook (checks, risk classes, workflow)
- `.omakaseagent/scenarios/` — up to 5 starter scenarios (approve before Class 2+ work)
- `.omakaseagent/gates/` + `handoffs/` — empty with README
- Taste/decisions/AGENTS.md updates when missing factory markers

Global bar: `reference/dark-factory.md`. This command installs **instrumentation**.

## CLI

```bash
omakase learn              # factory + memory markers
omakase learn --dry-run    # list paths only
omakase learn --memory-only   # taste/decisions only, no scenarios
omakase learn --factory-only  # factory.md + scenarios, skip taste merge
```

**Precondition:** `.omakaseagent/` exists (`omakase init` first).

## Agent fallback (no CLI)

1. Confirm `.omakaseagent/` exists; else tell user to run `omakase init`.  
2. Read README, `package.json`, CI workflows, main source dirs.  
3. Propose same artifacts as CLI would write; show diffs.  
4. **Wait for confirm** before writing.  
5. Log decision in `decisions.md`.

## After learn

- Class **0–1:** seed + mechanical checks + gate report optional but light.  
- Class **2+:** approved scenarios required; end with `.omakaseagent/gates/<date>-<task>-gate.md`.  
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

## Project agents (future)

Optional `learn` step may propose ≤3 namespaced project agents (see expansion plan Phase G). Not required for factory v1.
