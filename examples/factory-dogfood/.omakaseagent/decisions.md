# Key Decisions

## 2026-06-05 — Omakase Standard Adopted
**Context**: Project initialized with `omakase init`.
**Decision**: Adopt Omakase Rules + Critique Rubric. Use native team leads as primary entry points; specialists are lead-delegated only.
**Why**: Establishes persistent taste memory and senior quality bar from day one.
**Revisit if**: Team changes standards or moves off Omakase.

## 2026-06-05 — Dark factory bootstrapped
**Context**: `omakase learn` on this repo.
**Decision**: Adopt Level 4 layout (factory.md, scenarios, gates, handoffs). Class 2+ uses scenarios + gate reports.
**Why**: Humans review intent and evidence, not every diff; Omakase principles already define the bar.
**Revisit if**: Stack or CI changes materially — re-run `omakase learn`.

## 2026-06-12 — Loop ladder adopted
**Context**: Loopcraft review (`docs/LOOPS-REVIEW.md`) — stacking loops on the Level 4 factory.
**Decision**: Adopt the L0–L4 loop ladder and standing charters in `.omakaseagent/loops/` (`reference/loops.md`). Unattended runs require an approved charter; one gate per iteration; upshift only via a human-approved decisions.md entry; no orchestration engine — runners are external (BYO).
**Why**: Takes the human out of the iteration, not the checkpoint. Throughput scales by batching gate review; autonomy is earned via gate history, never assumed.
**Revisit if**: Charter adoption shows BYO runners are insufficient — then consider `omakase loop` / `omakase status` CLI (see backlog deferrals).

