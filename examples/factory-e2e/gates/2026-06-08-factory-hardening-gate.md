# Gate: factory hardening — CI learn fix + PR gate enforcement

**Date:** 2026-06-08  
**Risk class:** 2 (skill router parity) + 1 (verify scripts, CI)  
**Orchestration:** Engineer → implementation → critic (self-review) → this gate

## Seed

Post-merge CI failed `verify:learn` because `.omakaseagent/` is gitignored. Priority queue: (1) PR-diff gate enforcement, (2) learn picks up all verify scripts, (3) router parity with `@omakase-engineer` factory behavior.

## Scenarios

- CI on main/PR runs `npm run verify:learn` without local `.omakaseagent/` — exit 0
- PR touching `skill/` without a new gate file — `verify:pr-gate-diff` exit 1
- PR touching `skill/` with new gate under `examples/*/gates/` — exit 0
- `examples/factory-dogfood/.omakaseagent/factory.md` lists all `verify:*` scripts

## Mechanical evidence

```
npm run build                 — exit 0
npm run verify:native-agents  — exit 0
npm run verify:learn          — exit 0 (allowNoMem plan smoke)
npm run verify:gate-reports   — exit 0 (3 gate files)
npm run verify:pr-gate-diff   — exit 0 (this gate satisfies Class 2 diff)
```

## Critic

Pass — focused diff; enforcement script mirrors `riskGuide` Class 2 paths. Router parity moves from "design goal" to explicit load list for fallback engineering mode. No P0/P1.

## Memory consulted

- dark-factory.md — Level 4 checkpoint = gate file + mechanical stack
- factory-e2e critic P2 — PR-diff gate enforcement now implemented

## Risks / human decision

- **Class 2 path heuristics** may need tuning as repo layout evolves — update `scripts/factory-paths.js` with learn risk classes.
- **Router parity** is contractual in markdown for fallback mode; native `@omakase-engineer` already loads task-intake + factory-orchestration.

**Human checkpoint:** Accept gate + CI wiring; scenario evals (Phase 4) remain follow-up.
