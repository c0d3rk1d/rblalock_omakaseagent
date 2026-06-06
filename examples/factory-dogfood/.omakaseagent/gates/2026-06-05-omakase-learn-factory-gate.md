# Gate: omakase learn + Level 4 factory bootstrap

**Date:** 2026-06-05  
**Risk class:** 2 (CLI + skill reference + repo workflow)  
**Branch:** `rb/omakase-learn-factory-a393`

## Seed

Add `omakase learn` to bootstrap per-repo dark factory (factory.md, scenarios, gates) from repo discovery — not static templates. Dogfood on omakaseagent.

**Non-goals:** DOT runner, unattended merge, project agents (cap-3) in this PR.

## Scenarios

| Scenario | Status |
|----------|--------|
| init-native-leads | Existing — init still works |
| mechanical-build | Pass — `npm run build` |
| native-agents-verify | Pass — `npm run verify:native-agents` |
| level4-checkpoint | This file |

## Mechanical evidence

```
npm run build — exit 0
npm run verify:native-agents — exit 0
node bin/omakase.js learn --dry-run — lists 11 paths, no write
node bin/omakase.js learn — wrote factory + 4 scenarios + memory markers
```

## Critic (self-check vs Omakase bar)

- **Simplicity:** Single script `scripts/omakase-learn.js`; no runner engine.
- **Context fidelity:** Discovery reads package.json, skill/, dist/, CI — omakase-specific risks in factory.md.
- **Slop:** No vague templates; scenarios are repo-specific.
- **Gap:** Re-learn overwrites `factory.md` but skips existing scenario files (idempotent). Project agents deferred to Phase G.

## Memory consulted

- `.omakaseagent/taste.md` — ruthless simplicity, native leads, critique gate
- `decisions.md` — Omakase adopted; dark factory bootstrapped entry added by learn

## Risks / human decision

- **Accept** merge if dogfood snapshot in `examples/factory-dogfood/` looks right.
- **Follow-up:** Phase G project agents; Phase 3 CI gate-heading check; mechanical verify:learn script optional.

**Human checkpoint:** Review `examples/factory-dogfood/.omakaseagent/factory.md` + one scenario — not every line of `omakase-learn.js` unless evidence weak.
