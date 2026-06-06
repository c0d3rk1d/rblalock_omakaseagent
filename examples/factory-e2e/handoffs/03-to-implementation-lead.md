# Handoff → omakase-implementation-lead

**From:** Engineer  
**Charter:** Implement `scripts/verify-gate-report.js` + `package.json` script `verify:gate-reports`.

**Constraints:**
- Required headings per `reference/learn.md`
- Default scan: `examples/factory-e2e/gates`, `examples/factory-dogfood/.omakaseagent/gates`
- Accept optional CLI paths for extra dirs
- No dependencies; Node stdlib only
- Match style of `verify-learn.js`

**Memory:** Ruthless simplicity — one file, no config framework.

**Deliver:** Script path + how to run; Engineer runs full mechanical suite.
