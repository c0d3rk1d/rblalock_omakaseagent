# Factory dogfood snapshot

Committed example of `npx omakaseagent learn` on the **omakaseagent** repo (2026-06-05).

Live workspace uses `.omakaseagent/` (gitignored). This folder is the reproducible snapshot for review and PR diff.

**Regenerate locally:**

```bash
npx omakaseagent init
npx omakaseagent learn --dry-run
npx omakaseagent learn
```

**Gate report for the learn feature:** `.omakaseagent/gates/2026-06-05-omakase-learn-factory-gate.md`
