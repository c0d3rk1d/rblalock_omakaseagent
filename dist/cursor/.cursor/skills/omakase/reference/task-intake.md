# Task intake — agents co-create the factory setup

Users say goals in plain language ("add rate limiting", "fix the CI flake"). **They should not need to know "seed", risk classes, or gate file paths.** Leads set that up.

**Read first:** `.omakaseagent/factory.md` (if present), `taste.md`, `decisions.md`. Global bar: `reference/dark-factory.md`.

## If factory is missing

On first significant task in a repo without `factory.md`:

1. Tell the user briefly: Omakase works best with a one-time repo setup.  
2. Prefer CLI: `npx omakase init` then `npx omakase learn` (or `learn --dry-run`).  
3. If CLI unavailable: `@omakase-archivist` or router `learn` per `reference/learn.md` — propose artifacts, confirm before write.  
4. **Do not block Class 0–1 trivia** (typo in README) on full factory — still cite memory if present.

## Intake protocol (Engineer — start of non-trivial work)

Replace jargon with a short **Task brief** the user can skim in one screen.

### 1. Infer from the request (do not interrogate)

From the user message + repo context, draft:

| Field | Agent fills |
|-------|-------------|
| **Goal** | What should be true when done |
| **Non-goals** | What we are not doing |
| **Observable behavior** | What a human or test would see |
| **Risk class** | 0–3+ using `factory.md` or `dark-factory.md` defaults |
| **Evidence plan** | Commands from `factory.md` mechanical list + scenarios if Class 2+ |

Show the brief under a heading like **Task brief** (not "Seed" unless the user is technical).

### 2. When to ask the user (minimal)

| Situation | Action |
|-----------|--------|
| Class 0–1, clear ask | Brief inline → proceed |
| Class 2+, clear ask | Brief + propose 1–3 scenarios (new or link existing in `.omakaseagent/scenarios/`) → **one** confirm: "Proceed with this brief?" |
| Ambiguous goal, conflicting constraints, Class 3+ | Ask clarifying questions before implementation |
| User already gave a full spec | Brief is confirm-only or skip if redundant |

Never ask the user to "create a seed file." You create the brief; they approve or correct.

### 3. Scenarios (Class 2+)

- Reuse existing scenario files when they cover the work.  
- If gaps exist, **draft** `.omakaseagent/scenarios/<slug>.md` and show content; write file after confirm (or on proceed if user said "ship it").  
- Keep scenarios short: actor, start, action, observe, must-not, evidence.

### 4. Work between gates

Proceed with implementation per Engineering lead. Run mechanical checks from `factory.md`. Delegate critic when appropriate.

### 5. Close with a gate report (not chat-only "done")

Write `.omakaseagent/gates/<date>-<slug>-gate.md` using headings from `reference/learn.md`. Tell the user the path.

For Class 0–1, a **light checkpoint** in the reply is enough; full gate file optional unless taste requires it.

### 6. Plain-language close

End with what changed, what was verified, and **one decision** if the human must accept/reject — not a lecture on Level 4.

## Other leads

| Lead | Intake role |
|------|-------------|
| **Critic** | Reviews evidence stack in gate reports; does not replace intake |
| **Archivist** | `learn`, memory, chat/git workflows; may draft factory artifacts |

## Anti-patterns

- Waiting for the user to say "seed" or "risk class"  
- Long factory terminology up front  
- Skipping mechanical evidence when `factory.md` lists commands  
- "Done" without verification or gate artifact on Class 2+
