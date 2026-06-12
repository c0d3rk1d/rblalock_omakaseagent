# Deferred expansion phases (A / B / F)

**Archived:** 2026-06-08 (Phase 4 + G + E gate).  
**Context:** Dark-factory expansion plan after scenario evals, project agents on learn, and drift checks shipped.

These phases were explicitly deferred — not cancelled. Revisit when factory evals are stable in live harnesses and project-agent emit has dogfood evidence.

## Phase A — (deferred)

Sales / GTM packaging for the standard as a product surface. Deferred until factory checkpoint discipline is proven on real repos.

## Phase B — (deferred)

Additional harness generators beyond the current OpenCode / Cursor / Claude / Grok / Codex matrix. Deferred until native-agent contract stays green across releases.

## Phase F — (deferred)

Live scenario evals (with-skill vs baseline) in real LLM harnesses. Contract-only evals shipped in Phase 4; live runs remain Phase 5+.

## Where this lives now

- Methodology: `skill/reference/dark-factory.md`, `skill/reference/loops.md`
- Shipped gates: `examples/factory-e2e/gates/2026-06-08-phase4-g-e-gate.md`
- Loop motor: BYO runner (`reference/loops.md`) — built-in `omakase loop` CLI still deferred