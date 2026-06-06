# Dark factory — Level 4 with Omakase

Portable methodology. **Per-repo setup:** `omakase learn` (writes `.omakaseagent/factory.md` and starter scenarios).

## Rule

> Humans approve what should be true. Agents prove it became true.

| Human owns | Agent owns | Omakase owns |
|------------|------------|--------------|
| Intent, constraints, scenarios, risk class, final accept | Implementation, checks, evidence, checkpoint draft | Taste, critique, memory shape, gate language |

Not Level 5: no unattended merge or deploy in v1.

## Loop

1. **Task brief** (agent co-writes from user's goal — users don't need the word "seed") — what changes, non-goals, behavior, risk class, evidence required  
2. **Scenarios** — agent proposes; human confirms before Class 2+ deep work  
3. **Work** — `@omakase-engineer` between gates; read memory first  
4. **Evidence** — scenarios + mechanical (`npm test`, build, CI) + `@omakase-critic` + memory cite/update  
5. **Checkpoint** — agent writes gate report (`.omakaseagent/gates/`); human reviews intent + evidence, not every diff by default  

**Agent protocol:** `reference/task-intake.md` — Engineer runs intake automatically on non-trivial tasks.

## Risk classes (short)

| Class | Examples |
|-------|----------|
| 0 | Docs, README, packaging copy |
| 1 | CI, scripts, smoke tests |
| 2 | Features, personas, CLI behavior |
| 3+ | Auth, money, migrations — stay involved |

Repo-specific defaults live in `.omakaseagent/factory.md` after `learn`.

## Gates (Omakase)

1. Context loaded (memory cited)  
2. Spec/scenario clarity  
3. Anti-slop critique  
4. Verification (fresh evidence)  
5. Memory update when durable  
6. Checkpoint artifact exists  

## Commands

```bash
npx omakase init    # memory + agents
npx omakase learn   # factory layout for this repo
npx omakase learn --dry-run
```

Agent fallback: `@omakase-archivist` with `reference/learn.md` when CLI unavailable.

Full research: `plans/OMAKASE-DARK-FACTORY-RESEARCH.md` in the omakaseagent repo.
