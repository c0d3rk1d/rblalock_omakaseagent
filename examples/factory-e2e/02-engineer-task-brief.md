# Task brief — gate report CI (Engineer)

**Memory consulted:** factory.md mechanical list; taste.md dark-factory bullets; decisions.md Omakase adopted.

| Field | Value |
|-------|--------|
| **Goal** | Script + npm script + CI step validates gate markdown headings; orchestration doc for multi-agent factory |
| **Non-goals** | PR blocking on missing gates (v2); unattended ship |
| **Observable behavior** | `npm run verify:gate-reports` exits 0 on valid gates; fails on missing `## Critic` etc. |
| **Risk class** | 2 — skill reference, scripts, CI, factory policy |
| **Evidence plan** | `npm run build`, `verify:native-agents`, `verify:learn`, `verify:gate-reports` |

**Proceed?** (User confirmed in factory E2E exercise.)

**Orchestration:** `reference/factory-orchestration.md` — delegate implementation script to implementation-lead; critic before gate; archivist if policy row needed.
