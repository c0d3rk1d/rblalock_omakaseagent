# Execution plan — tactical spec for factory handoff

Use when **@omakase-engineer** (or router `plan` with implementation intent) writes a backlog item after audit — or when scoping a single well-known fix without a full audit.

**Not** the same as `reference/plan.md` (strategic: why, options, trade-offs). Execution plans are **how**: self-contained specs for `omakase-implementation-lead` or a follow-up Engineer session with zero audit context.

**Storage:** `.omakaseagent/backlog/NNN-<slug>.md`  
**Index:** `.omakaseagent/backlog/README.md`

Patterns adapted from senior advisor / executor-spec practice (self-contained context, verification gates, STOP conditions).

---

## Three properties (non-negotiable)

1. **Self-contained context** — paths, excerpts, conventions, commands inlined; no "as discussed in audit."
2. **Verification gates** — every step ends with a command and expected result from `factory.md` or recon.
3. **Hard boundaries** — in-scope / out-of-scope lists; STOP conditions instead of improvisation when reality diverges.

---

## Template

```markdown
# Plan NNN: <Imperative title — what will be true after this>

> **Executor instructions**: Follow step by step. Run every verification command
> and confirm the expected result before the next step. On any STOP condition,
> stop and report — do not improvise. When done, update this plan's status row
> in `.omakaseagent/backlog/README.md`.
>
> **Drift check (run first)**: `git diff --stat <planned-at SHA>..HEAD -- <in-scope paths>`
> If in-scope files changed, compare "Current state" excerpts to live code; mismatch
> → STOP.

## Status

- **Priority**: P1 | P2 | P3
- **Effort**: S | M | L
- **Risk class**: 0–3+ (per `.omakaseagent/factory.md`)
- **Depends on**: `backlog/NNN-*.md` or none
- **Category**: bug | security | perf | tests | tech-debt | migration | dx | docs | direction
- **Planned at**: commit `<short SHA>`, <YYYY-MM-DD>
- **Gate**: (filled after factory close — path to `.omakaseagent/gates/...` or "n/a Class 0–1")

## Why this matters

2–5 sentences: problem, cost, what improves. Cite `taste.md` / `decisions.md` when they constrain the shape.

## Current state

- Files and roles (`path` — one line each)
- Short excerpts with `file:line` markers
- Convention exemplar: "Match error handling in `src/foo.ts`"

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| ... | from `factory.md` mechanical list | exit 0 / all pass |

## Scope

**In scope** (only files you may modify):
- ...

**Out of scope** (do NOT touch):
- ...

## Steps

### Step 1: <imperative title>

Precise instructions. Target shape when load-bearing.

**Verify**: `<command>` → <expected output>

### Step 2: ...

## Test plan

- New tests: file, cases, pattern file to copy
- **Verify**: `<test command>` → all pass including N new tests

## Done criteria

Machine-checkable. ALL must hold:

- [ ] ...
- [ ] No files outside in-scope modified (`git status`)
- [ ] `backlog/README.md` status updated
- [ ] (Class 2+) Gate file written and plan path linked

## STOP conditions

Stop and report (do not improvise) if:

- Current state excerpts do not match live code (drift)
- Verification fails twice after reasonable fix attempt
- Fix requires an out-of-scope file
- Key assumption "<...>" is false
- Risk class escalates (e.g. touches auth) — escalate to Engineer before continuing

## Maintenance notes

What future changes interact with this; what reviewers should scrutinize; explicit deferrals.
```

---

## Index: `.omakaseagent/backlog/README.md`

```markdown
# Backlog — execution plans

Omakase backlog. Execute in order unless dependencies say otherwise.
Factory loop (critic + gate) applies per `reference/factory-orchestration.md`.

## Execution order & status

| Plan | Title | Priority | Effort | Risk | Depends on | Status |
|------|-------|----------|--------|------|------------|--------|
| 001 | ... | P1 | S | 1 | — | TODO |

Status: TODO | IN PROGRESS | DONE | BLOCKED (reason) | STALE (drift) | REJECTED (reason)

## Dependency notes

- 002 requires 001 because ...

## Findings considered and rejected

- <finding>: <one line why> (optional: see `decisions.md` <date>)
```

---

## Quality bar (check before shipping each plan)

- Could a model that has never seen this repo execute with only this file?
- Is every verification a command + expected result, not judgment?
- Does every step name exact files and symbols?
- Are STOP conditions specific to this plan's risks?
- Would critic + human reading "Why" + "Done criteria" know what they're approving?
- No secret values — locations and types only.
- Planned-at SHA filled; drift check paths match Scope.
- Plan passes taste bar — no over-engineering spec'd into steps.

---

## After execution (factory close)

Engineer updates:

1. Plan **Gate** field → path to gate report
2. `backlog/README.md` status → DONE (only after critic + gate on Class 2+)
3. `decisions.md` when the work establishes durable policy (via archivist when appropriate)

Critic checks **both** Omakase rubric and plan done criteria.
