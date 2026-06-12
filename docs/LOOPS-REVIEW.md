# Loops review — Loopcraft vs the dark factory

**Source:** [AINews: Loopcraft — The Art of Stacking Loops](https://www.latent.space/p/ainews-loopcraft-the-art-of-stacking) (Latent Space, 2026-06-12), reviewed against `skill/reference/dark-factory.md` and the Level 4 factory as shipped.

This is the rationale document. The durable methodology it produced is `skill/reference/loops.md`.

## What the article claims

1. **Design loops, not prompts.** Steipete: "you shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents." Boris Cherny: "I write loops, the loops do the work."
2. **Remove yourself as the bottleneck.** Karpathy: arrange things so they are completely autonomous — "arrange it once and hit go" — and maximize token throughput by not being in the loop.
3. **The game is stacking loops.** Early on, the valuable skill is knowing when to go DOWN a loop when things go wrong (reliability); over time it is knowing how to go UP a loop as models improve (leverage).
4. **The Salty Lesson.** Don't fix things yourself; focus on systems that scale with more agents — goals and orchestration.

## What the factory already gets right

We built loop infrastructure without calling it that:

| Loop requirement | Existing omakase artifact |
|------------------|---------------------------|
| Brakes — an iteration must fail safe | STOP conditions, drift check, hard scope boundaries (`reference/execution-plan.md`) |
| Mechanical exit conditions, not vibes | Machine-checkable done criteria per plan; `factory.md` mechanical list |
| Asynchronous human review | Gate reports — evidence stacks reviewable after the fact (`reference/learn.md`) |
| Reliability downshift | Risk classes 0–3+; Class 3+ stays interactive (`reference/dark-factory.md`) |
| Don't re-inspect — encode | Operating rule: "If a human would check the same thing on every task, propose a scenario or mechanical check." The Salty Lesson, already written down |
| A work queue | `.omakaseagent/backlog/` index with TODO / DONE / BLOCKED / STALE statuses |
| The loop that improves the loop | `omakase learn` refresh + `taste.md` / `decisions.md` memory |

## The gaps

1. **Synchronous human assumptions.** The factory loop puts a human at two points per task (scenario confirm, checkpoint). Nothing specified how the loop runs when the human approves intent once and reviews gates in batch afterward.
2. **No named ladder.** "Go up/down a loop" was not actionable because the levels did not exist as concepts in our docs.
3. **No standing-intent artifact.** Scenarios approve behavior per task; nothing approved "drain the backlog for up to N iterations under these constraints."
4. **No runner contract.** We rightly refuse to build an orchestration engine (v1 decision), but we never wrote down what any external loop runner — bash `while`, CI cron, cloud agent — must do to drive the factory safely.
5. **No earned-autonomy mechanics.** Phase 5+ hinted that narrow task classes may earn more autonomy after evidence history, with no rule for when or how.

## Position

Karpathy's framing is "remove yourself from the loop entirely." The omakase answer is sharper: remove the human from the **iteration**, keep them at the **checkpoint**.

- Level 4 does not become Level 5. Merge, ship, and deploy stay human.
- Throughput scales by **batching checkpoints**, not deleting them. A human who reviews ten gate reports over coffee is out of ten loops without giving up accept/reject.
- Trust scales because **evidence compounds**: every iteration leaves a gate file, every gate feeds the record that justifies the next promotion.
- Autonomy is **earned and recorded** — upshift is a `decisions.md` entry the human approves, never an assumption.

The Salty Lesson becomes a house rule (the loop law in `reference/loops.md`): every manual human intervention mid-loop must leave behind a scenario, mechanical check, or memory entry that makes the next intervention unnecessary. An intervention that leaves nothing behind is a bug in the loop, not just in the code.

## What shipped in response

- `skill/reference/loops.md` — the loop ladder (L0–L4), gearbox rules, loop charter shape, one-iteration agent contract, and the BYO runner contract.
- `.omakaseagent/loops/` — standing charters, scaffolded by `omakase learn` with a `backlog-drain.md` default.
- Engineer lead, router, intake, and orchestration references wired to loop mode; `loop-charter` starter scenario; `evals/loop-contract.eval.json` keeps the contract mechanical.

## Deferred

Recorded in the dogfood backlog (`examples/factory-dogfood/.omakaseagent/backlog/README.md`):

- ~~`omakase status`~~ — shipped after the agent-success review: eligibility and Stop-condition checks are deterministic computation, and our own operating rule says repeatable checks get encoded, not re-judged by an LLM each iteration. Read-only; exit codes double as the runner halt check.
- ~~Automated upshift proposals from gate history~~ — shipped via gate `**Review:**` markers (agent writes PENDING, human flips to accepted/rejected): `status` halts on rejection and reports upshift eligibility at 5 accepted in a row. The trust verbs now live on disk, not in chat.
- `omakase loop` (a built-in runner) — still deferred; the loop motor stays BYO.
- L4 fleet spec — named as horizon only.
