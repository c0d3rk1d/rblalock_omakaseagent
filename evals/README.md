# Omakase scenario evals (dark-factory Phase 4)

Mechanical checks that Omakase **skill and native agent contracts** encode real factory behavior — not live LLM runs.

Each `*.eval.json` defines:

| Field | Purpose |
|-------|---------|
| `seedPrompt` | Representative user ask that exposed the failure (documentation for humans + future live evals) |
| `targets` | Repo files + regex patterns that must / must-not match |
| `requiredEvidence` | Strings agents must surface in output (contractual in persona docs) |
| `forbiddenFailures` | Anti-patterns the eval guards against |
| `criticRubric` | Critique bullets this behavior supports |

Run: `npm run verify:scenario-evals`

Live harness evals (with-skill vs baseline) are Phase 5+ — these specs are the factory floor for persona drift.
