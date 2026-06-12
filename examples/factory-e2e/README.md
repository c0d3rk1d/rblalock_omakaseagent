# Factory E2E — one goal, full team loop

**Worthy test:** user gives one goal; **Engineer orchestrates** implementation lead, **Critic**, and **Archivist**; mechanical CI enforces gate shape.

This directory is the **recorded run** for that goal on omakaseagent (2026-06-06). Reproduce:

```bash
npx omakaseagent init && npx omakaseagent learn
# User to @omakase-engineer:
# "Make factory gate reports mechanically verifiable in CI so checkpoints can't be faked."
```

## User goal

[01-user-goal.md](01-user-goal.md)

## Factory run (agent phases)

| Phase | Agent | Artifact |
|-------|-------|----------|
| 1 Intake | Engineer | [02-engineer-task-brief.md](02-engineer-task-brief.md) |
| 1b Scenarios | Engineer | [scenarios/gate-report-ci.md](scenarios/gate-report-ci.md) |
| 2 Work | Implementation lead (delegated) | [handoffs/03-to-implementation-lead.md](handoffs/03-to-implementation-lead.md) → [handoffs/04-implementation-result.md](handoffs/04-implementation-result.md) |
| 3 Mechanical | Engineer | captured in [gates/2026-06-06-gate-report-ci-gate.md](gates/2026-06-06-gate-report-ci-gate.md) |
| 4 Critic | Critic | [handoffs/05-to-critic.md](handoffs/05-to-critic.md) → [handoffs/06-critic-findings.md](handoffs/06-critic-findings.md) |
| 5 Gate | Engineer | [gates/2026-06-06-gate-report-ci-gate.md](gates/2026-06-06-gate-report-ci-gate.md) |
| 6 Memory | Archivist | [handoffs/07-archivist-proposal.md](handoffs/07-archivist-proposal.md) |

## What shipped (real code)

- `scripts/verify-gate-report.js` — required gate headings  
- `npm run verify:gate-reports` — wired in CI  
- `skill/reference/factory-orchestration.md` — multi-agent routing  
- Engineer / Critic leads — mandatory team loop Class 2+

## Verify this example

```bash
npm run verify:gate-reports
```

## What this proves vs trivial tests

| Trivial test (shop-api health) | This E2E |
|-------------------------------|----------|
| Single agent, one file | Engineer **orchestrates** 3 leads + specialist |
| No critic | Critic rubric in gate |
| No CI enforcement | Gate shape **mechanically verified** |
| Toy repo | **This repo** — meta-factory on Omakase itself |
