# Gate: mechanical gate-report verification in CI

**Date:** 2026-06-06  
**Risk class:** 2  
**Orchestration:** Engineer → implementation-lead → critic → archivist proposal → this gate

## Seed

User goal: gate reports must be mechanically verifiable in CI; document multi-agent factory run. See `examples/factory-e2e/01-user-goal.md` and `02-engineer-task-brief.md`.

## Scenarios

- `examples/factory-e2e/scenarios/gate-report-ci.md` — CI runs `verify:gate-reports` on committed example gates

## Mechanical evidence

```
npm run build                 — exit 0
npm run verify:native-agents  — exit 0
npm run verify:learn          — exit 0
npm run verify:gate-reports   — exit 0 (2 gate files after this commit)
```

Handoffs: `examples/factory-e2e/handoffs/03` through `07`.

## Critic

Pass — see `handoffs/06-critic-findings.md`. No P0/P1. P2: future PR-diff gate enforcement.

## Memory consulted

- taste.md — dark factory: gate file required Class 2+; agents co-create briefs
- factory.md — mechanical evidence commands (post-learn: includes verify:gate-reports)
- decisions.md — Omakase adopted; archivist proposes factory CI row in `handoffs/07-archivist-proposal.md`

## Risks / human decision

- **Accept** if team loop + CI verify match `factory-orchestration.md`.
- **Follow-up:** enforce gates on PRs that add `.omakaseagent/gates/`; task queue runner (out of scope).

**Human checkpoint:** Review this gate + `scripts/verify-gate-report.js` — not every persona file.
