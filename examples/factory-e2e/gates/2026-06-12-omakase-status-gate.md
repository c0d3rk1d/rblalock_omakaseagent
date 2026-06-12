# Gate: omakase status — deterministic loop state for agents

**Date:** 2026-06-12  
**Risk class:** 2 (bin/omakase.js, scripts/, skill/ loop contract)  
**Orchestration:** Engineer implementation → self-critic → this gate

## Seed

Agents in a loop were re-deriving approval, Stop conditions, and queue eligibility from markdown every iteration — the most failure-prone judgment in the loop, and exactly the kind of repeatable check the factory's own operating rule says to encode. Ship a **read-only** `omakase status` so the least capable agent in the loop picks the same item the most careful one would. The loop motor stays BYO (`omakase loop` remains deferred).

## Scenarios

- `loop-charter` updated in spirit: iteration step 1 is now "run `omakase status` when available; trust it over hand-parsing"
- Eligibility, halt, and exit-code behavior pinned by `npm run verify:status` (9 fixture cases: eligible pick, dependency unlock, UNAPPROVED halt, missing-approval halt, cap halt, EMPTY halt, double-FAILED halt, drained queue, missing queue table)
- Contract patterns held by `evals/loop-contract.eval.json` (`omakase status` required in loops.md + engineer lead)

## Mechanical evidence

All exit 0 at this revision:

```
npm run verify:status          # 9 fixture cases
npm run build
npm run verify:native-agents
npm run verify:learn
npm run verify:gate-reports
npm run verify:pr-gate-diff
npm run verify:scenario-evals  # incl. updated loop-contract
npm run verify:drift
node bin/omakase.js status     # error path: no .omakaseagent/ → exit 1
```

E2E smoke (tmp repo from the loop dogfood run): pre-approval charter → HALT "no Approval line", exit 2; approved with EMPTY ledger → HALT "queue was drained", exit 2; ledger reset with all-DONE queue → "next: none — append an EMPTY ledger row", exit 2; fresh TODO items → NEXT picks the dependency-satisfied Class 2 item, flags the Class 3 item over ceiling, exit 0.

## Critic

Self-critique pass: read-only by design — ledger and queue writes stay with the agent, so the CLI cannot fake an iteration. Exit codes (0 work / 2 halt / 1 error) replace the brittle `tail | grep` runner check flagged as P2 in the loop ladder gate. No P0/P1.

Found while wiring: **the published npm package shipped no `scripts/`** — `bin/omakase.js` requires `scripts/omakase-learn.js`, so `npx omakaseagent learn` from the registry tarball would crash with MODULE_NOT_FOUND. Fixed by whitelisting the four required scripts in `package.json` `files`.

## Memory consulted

- `dark-factory.md` operating rule — "if a human would check the same thing on every task, propose a mechanical check"; applied to the agent's own per-iteration checks
- `decisions.md` 2026-06-12 "Loop ladder adopted" — revisit clause triggered deliberately; new entry "omakase status shipped" records the boundary (status yes, runner no)
- `taste.md` — ruthless simplicity: no JSON output mode, no flags beyond `[loop]` and `--quiet`, no deps

## Risks / human decision

- **Parsing is format-coupled** to the charter and backlog-index templates `omakase learn` generates. Hand-rolled charters that drop the Approval line or risk ceiling fail safe (HALT with a fix-it message), never permissive.
- **`omakase loop` stays deferred** — accept that the motor remains BYO.
- **Human checkpoint:** accept `status` as part of the loop contract (agents instructed to trust it over hand-parsing).
