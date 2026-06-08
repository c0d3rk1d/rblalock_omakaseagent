# Archivist — proposed decisions.md row (confirm to apply)

```markdown
## 2026-06-06 — Factory gate reports mechanically verified
**Context**: Level 4 factory requires gate files; chat-only "done" is insufficient.
**Decision**: Committed example gates under `examples/*/gates/` must pass `npm run verify:gate-reports` in CI. Class 2+ work uses `reference/factory-orchestration.md` team loop.
**Why**: Encode checkpoint shape so humans review evidence stacks, not routine heading drift.
**Revisit if**: Gate schema changes — update script + learn.md together.
```

**Not applied automatically** — user confirms.
