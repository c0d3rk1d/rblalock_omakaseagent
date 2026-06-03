# Omakase Teams Expansion — Research & Plan

**Date:** 2026-06-03  
**Status:** Plan (research complete, not implemented)  
**Audience:** Personal Omakase agent set (rblalock). Others may adopt; design optimizes for *you* — one entry point per team, hidden specialists, no skill shopping.

**Sources researched:**
- [local-client-prospector-skill](https://github.com/Kappaemme-git/local-client-prospector-skill) → generalized **client research**
- [cursor/plugins `cursor-team-kit/skills`](https://github.com/cursor/plugins/tree/main/cursor-team-kit/skills) (18 skills) → Engineering workflow consolidation
- [softaworks/agent-toolkit `skill-judge`](https://github.com/softaworks/agent-toolkit/blob/main/skills/skill-judge/README.md) → Critics meta-quality
- [revfactory/harness](https://github.com/revfactory/harness) → team-architecture factory (patterns + eval methodology; **not** a competing install)
- In-repo: GBrain patterns in Archives (`skill/teams/archives/`), existing Engineering/Critics specialists, `plans/OMAKASE-DARK-FACTORY-RESEARCH.md`

---

## Design principle (your Omakase)

| User-facing | Hidden |
|-------------|--------|
| `@omakase-engineer` | ship, verify, implementation-lead, senior-reviewer, debugger, refactor |
| `@omakase-critic` | deslop, structural, verification, **skill-judge** (new) |
| `@omakase-archivist` | memory-synthesizer |
| `@omakase-sales` (new) | market-mapper, verifier, qualifier, account-researcher, brief-writer |

**Router skill (`omakase-router`)** stays plan/taste/handoff/**init/learn** only — never competes with native leads.

**Omakase vs flat skills:** Cursor Team Kit is 18 menu items. You should say *“ship this”*, *“research these accounts”*, *“audit this skill”* — leads delegate. Reference docs hold gh/browser commands; personas hold judgment.

---

## 1. New team: Sales

### Why a team (not a standalone skill)

[local-client-prospector-skill](https://github.com/Kappaemme-git/local-client-prospector-skill) is a **Codex-only** prompt SOP (~5KB `SKILL.md`, MIT). Valuable core: discover → verify → classify → score → deliver evidence-backed tables. Weak fit as a forked npm skill — duplicates install surface and skips critique + memory.

**Generalize “local” → client research:**

| Local skill default | Omakase `client-research` |
|---------------------|---------------------------|
| `base_location` + `radius_km` | Optional geo *or* account list *or* market filters |
| Italian SMB categories | User ICP from request + `.omakaseagent/taste.md` |
| Website-gap scoring | Configurable **fit criteria** (digital maturity, stack, hiring, etc.) |
| Agency “needs a website” copy | Evidence-only “why prospect”; no generic filler |

### Siphon (keep structure)

- Browser/search discovery loop; Maps/directories as *discovery aid*, cross-check elsewhere
- `website_status` enum, confidence tiers, Hot/Warm/Low/Skip + pre-ship checklist
- Markdown table + CSV schema (`score,business,category,...`)
- Compliance: assisted research, no CAPTCHA bypass, business-contact only, `as_of` date
- Parallel verification batches (when harness supports Task)

### Rewrite (Omakase voice)

- No Italian default categories; no agency-only ICP baked in
- Mandatory: Memory consulted, Why this approach, internal critique on non-trivial sheets
- Hot/Warm require `source_urls`; `Not found` for missing contact — never invent
- Handoff: customer-facing copy → **Critic**; durable ICP rules → **Archivist**

### Proposed layout

```
skill/teams/sales/
├── lead.md                    # The Sales Lead → @omakase-sales
├── sub-personas/
│   ├── market-mapper.md       # discovery / candidate list
│   ├── verifier.md            # per-entity confirmation
│   ├── qualifier.md           # scoring + dedupe + quality gate
│   ├── account-researcher.md  # single-account dossier (non-list mode)
│   └── brief-writer.md        # outreach angles; claims verified by Critic
└── assets/lead-template.csv
skill/reference/client-research.md   # workflow + harness fallbacks (no browser → user list + WebFetch)
```

### Research tools (resolved)

Sales lead runs **capability detection** at task start: browser automation if present, else WebSearch/WebFetch, else user-supplied accounts/list. Never assume Codex-only browser; document what was used and what could not be verified.

### Invocation examples

```text
@omakase-sales Find 10 dental clinics near Austin with weak or no standalone site. Verified leads only.
@omakase-sales Research Acme Corp and two competitors for digital maturity before our discovery call.
```

---

## 2. Engineering: cursor-team-kit consolidation

**Do not port 18 skills.** Fold into **2 new hidden specialists** + existing four + Critic handoffs.

### New specialists

| Specialist | Absorbs (cursor-team-kit) | Role |
|------------|---------------------------|------|
| **ship-specialist** | fix-ci, loop-on-ci, fix-merge-conflicts, get-pr-comments, make-pr-easy-to-review, new-branch-and-pr (git/gh) | PR/CI loop until green; thread triage; conflicts |
| **verify-specialist** | verify-this (execution), run-smoke-tests, check-compiler-errors, control-cli, control-ui | Run checks; baseline/treatment artifacts; evidence packet |

### Existing mapping (no new persona)

| Kit skill | Omakase home | Pattern |
|-----------|--------------|---------|
| deslop | implementation-lead + deslop-critic | Auto on impl; Critic if diff-only |
| thermo-nuclear-code-quality-review | structural-critic | Critic handoff on large/risky |
| verify-this (verdict) | verification-critic | After verify-specialist runs |
| review-and-ship | Engineer orchestrates ship + senior-reviewer + verify | User: “ship this” |
| pr-review-canvas | `skill/reference/pr-review-canvas.md` | Optional human artifact (C) |
| weekly-review, what-did-i-get-done, workflow-from-chats | **Archivist** (D) | Not Engineering |

### Engineer lead — add routing block

```
IF ship / merge / PR / CI / review comments / conflicts
  → ship-specialist (± senior-reviewer)

IF prove / verify / smoke / screenshot / compile errors
  → verify-specialist → verification-critic if claim disputed

IF large structural smell OR thermo-nuclear
  → handoff Critic → structural-critic

IF deslop-only on branch (no implementation)
  → handoff Critic → deslop-critic

ELSE → implementation-lead | refactor-specialist | debugger | senior-reviewer
```

### Reference docs (not user skills)

- `skill/reference/shipping.md` — gh commands from fix-ci / loop-on-ci
- `skill/reference/verification-harness.md` — control-cli/ui + verify-this artifact layout

### User verbs (what you should say)

| Intent | Say | Agent does |
|--------|-----|------------|
| Ship | “ship it”, “fix CI”, “address review” | ship → verify → critic as needed |
| Prove | “verify the fix”, “prove it works” | verify-specialist → verification-critic |
| Build | “implement X” | implementation-lead (+ implicit compile gate) |

Aligns with dark-factory **evidence gates** without a runner.

---

## 3. Critics: skill-judge integration

[skill-judge](https://github.com/softaworks/agent-toolkit/tree/main/skills/skill-judge) evaluates **SKILL.md packages** (8 dimensions, 120 pts, knowledge delta E:A:R). Complements Omakase critique (code/artifacts/plans) — does not replace it.

### Overlap with Omakase today

| skill-judge | Omakase equivalent |
|-------------|-------------------|
| D1 Knowledge delta | Omakase anti-slop + “expert-only” persona design |
| D3 Anti-patterns (NEVER + why) | OMAKASE-RULES, deslop-critic |
| D4 Description / activation | Native agent `description` + router precedence |
| D8 Usability / decision trees | Engineering reference, plan/critique depth adaptation |

**Unique value:** Scored skill audit, pattern typing (Mindset/Navigation/Philosophy/Process/Tool), formal report for *your* skills and third-party imports.

### Recommended integration

**New hidden specialist: The Skill Judge** (`skill-judge-critic` or `skill-judge`)

- Lives under **Critics** team (not Engineering)
- The Critic delegates when: “evaluate this skill”, “audit SKILL.md”, “score omakase-router”, reviewing imports before siphon
- Output: structured report (Summary, dimension table, critical issues, top 3 improvements) — **plus** Omakase Internal Critique Pass on the report itself
- **Siphon:** 8-dimension rubric + E:A:R scan + failure patterns — **rewrite** in Omakase voice; drop vendor-neutral “Claude” framing → “model/harness”; tie passing grade to Omakase Rules

**Also use skill-judge to gate:**

- New `skill/teams/sales/*` before ship
- Any cursor-team-kit-derived reference docs (must be expert-only, &lt;300 lines ideal)
- Future personal skills outside repo

**Do not** expose `@omakase-skill-judge` to users — `@omakase-critic` only.

### Parity with dark factory

Skill-judge is a concrete step toward **mechanical meta-quality** while code parity (smart-default vs explicit engineer) remains a future judge layer in `skill/SKILL.md`.

---

## 4. revfactory/harness — meta-factory (patterns, not a second stack)

[revfactory/harness](https://github.com/revfactory/harness) (v1.2, Apache 2.0) is a **Claude Code plugin / meta-skill** that turns a domain sentence into `.claude/agents/` + `.claude/skills/` + an orchestrator skill. It self-describes as **L3 Team-Architecture Factory** (neighbor to Archon’s runtime-config factory, [meta-harness](https://github.com/SaehwanPark/meta-harness) on Codex).

### What Harness does

| Piece | Behavior |
|-------|----------|
| **Trigger** | “Build a harness for …” / “하네스 구성해줘” |
| **Phases 0–7** | Audit → domain analysis → pick architecture → emit agents → emit skills → orchestrate → validate → evolve |
| **6 patterns** | Pipeline, Fan-out/Fan-in, Expert Pool, Producer-Reviewer, Supervisor, Hierarchical Delegation |
| **2 execution modes** | Agent Teams (TeamCreate/SendMessage, default) vs Subagents (Agent tool) |
| **Outputs** | Per-project `.claude/agents/*`, `.claude/skills/*`, orchestrator SKILL, minimal `CLAUDE.md` pointer + change log |
| **Validation** | With-skill vs without-skill runs, trigger evals (should / should-NOT near-miss), dry-run, `_workspace/` artifacts |

Their [harness-100](https://github.com/revfactory/harness-100) catalog and A/B paper (+60% quality on 15 tasks) are evidence that **structured pre-configuration** helps — aligned with Omakase’s thesis, but Harness **generates** configs; Omakase **is** the config.

### Harness vs your Omakase (critical distinction)

| | **Harness** | **Your Omakase** |
|---|-------------|------------------|
| **Role** | Factory: new harness per domain/project | Fixed personal standard: Engineer, Critic, Archivist, Sales |
| **User mental model** | “Design a harness for X” | “@omakase-engineer ship this” |
| **Install** | Claude plugin or `~/.claude/skills/harness` | `omakase init` → native agents + `omakase-router` |
| **Evolution** | Regenerates agents/skills per feedback | Curated `skill/teams/` + `.omakaseagent/` memory |
| **Quality bar** | Skill-testing guide + optional QA agent | OMAKASE-RULES + mandatory Critic + taste memory |

**Do not install the Harness plugin inside the omakaseagent package.** Siphon its *patterns and init-time discovery* instead (see §4.1). Harness remains useful as external reference when bootstrapping a client repo from scratch.

### Pattern mapping → Omakase (already mostly there)

| Harness pattern | Omakase today | After expansion |
|-----------------|---------------|-----------------|
| **Expert Pool** | Lead picks specialist by signal | + ship, verify, Sales specialists |
| **Producer-Reviewer** | Engineer implements → Critic reviews | Same; Sales brief → Critic for claims |
| **Fan-out/Fan-in** | Parallel Task to specialists | Sales mapper + parallel verifiers; code review fan-out via structural + deslop |
| **Pipeline** | plan → engineer → critic | Router `plan` + native leads |
| **Supervisor** | Lead coordinates Task DAG | Engineer / Sales leads |
| **Hierarchical** | Lead → specialists only (no nested leads) | Keep flat — avoid harness-style deep nesting |

Omakase is effectively a **curated, taste-locked instance** of Harness’s “Producer-Reviewer + Expert Pool” for software + sales + memory — not a generator.

### What to siphon (into Omakase repo, not plugin install)

| Harness artifact | Siphon into | Notes |
|------------------|-------------|-------|
| `agent-design-patterns.md` | `skill/reference/team-architecture.md` (new, short) | Vocabulary for TEAMS.md; when to use fan-out vs pipeline |
| `orchestrator-template.md` | Sales + dark-factory handoffs | `_workspace/{phase}_{agent}_{artifact}` naming; file-based handoffs between specialists |
| `skill-testing-guide.md` | Dark-factory Phase 4 + skill-judge | With/without skill evals; near-miss trigger tests; iteration folders |
| `skill-writing-guide.md` | skill-judge + reference/init | Pushy descriptions, progressive disclosure, &lt;500 lines — overlap skill-judge D4/D5 |
| Phase 0 drift audit | **Archivist** maintenance | Compare `TEAMS.md` / dist agents vs `skill/teams/`; report drift |
| Phase 3-0 / 4-0 dedup | **skill-judge** + Archivist | Before adding specialists, check overlap with existing personas |
| `qa-agent-guide.md` | **verification-critic** | Incremental QA after each module; boundary cross-check (API vs UI shape) |
| Phase 7 evolution + CLAUDE.md changelog | **Archivist** + `decisions.md` | You already use `AGENTS.md` pointer model — add harness-style **change log table** for team edits |
| Marketing / deep-research use cases | Validates **Sales** fan-out research design | Harness README “Marketing Campaign” ≈ Sales + Critic |

### Harness + skill-judge + cursor-kit (one eval stack)

```
Import candidate (external SKILL.md)
    → skill-judge (Critics) — knowledge delta, grade
    → If absorbed: merge into skill/teams or reference/
    → skill-testing methodology (from Harness) — with-skill vs baseline on 2 prompts
    → Archivist logs decision + changelog
```

### 4.1 Project Omakase extension at `init` (Harness-inspired, not Harness-installed)

**Your direction:** When you run `omakase init` on a project, Omakase should **learn the repo** and optionally **craft project-specific agents** that extend the core team — analogous to how [impeccable.style](https://impeccable.style) tailors design skills/agents to a product’s UI context, but for **domain/stack/workflow** fit.

This is **not** “install revfactory/harness” and not unbounded agent sprawl. It is a **capped, critic-gated extension layer** on top of the fixed core leads.

```
┌─────────────────────────────────────────────────────────┐
│  Core Omakase (always, from package)                    │
│  @omakase-engineer | @omakase-critic | @omakase-archivist│
│  @omakase-sales + hidden specialists                    │
└───────────────────────────┬─────────────────────────────┘
                            │ delegates when signal matches
┌───────────────────────────▼─────────────────────────────┐
│  Project extension (per repo, from omakase init)        │
│  0–3 namespaced agents, e.g. omakase-acme-billing.md    │
│  Lives: .omakaseagent/project-agents/ + native emit   │
│  Documented: AGENTS.md + decisions.md changelog         │
└─────────────────────────────────────────────────────────┘
```

**`omakase init` vs `omakase learn`**

Many users install Omakase **globally** (`omakase init --global` or skills in `~/.cursor/`) but need **repo-specific** memory and project agents later — or after the codebase has changed. Split the workflows:

| Command | When | Does | Does not |
|---------|------|------|----------|
| **`omakase init`** | First time in repo (or full bootstrap) | `.omakaseagent/` + seed memory, `AGENTS.md`, install skill/native bundles, optional first **learn** pass for project agents | Silently overwrite existing taste/decisions |
| **`omakase learn`** | Repo already has (or should have) Omakase context; global install is enough for core leads | Re-**discover** repo → update memory + project agents + `AGENTS.md` project section | Re-copy entire global `dist/` unless `--sync-skills` |

```bash
# Core leads already global; this repo needs its own layer
cd my-project
omakase learn

# Preview diffs only
omakase learn --dry-run

# Only refresh taste/decisions from repo (no project agents)
omakase learn --memory-only

# Only reconcile project agents + native emit
omakase learn --project-agents-only
```

**`omakase learn` flow** (add to `reference/learn.md` + `bin/omakase.js`; Archivist persona owns the *method*, CLI owns *determinism*):

| Step | Action |
|------|--------|
| 0 | ** Preconditions** — warn if `.omakaseagent/` missing (“run `omakase init` first”); if global native agents missing, suggest `omakase init --global` once |
| 1 | **Discover** — README, stack, recent commits (optional shallow), existing project agents, `AGENTS.md`, prior `decisions.md` changelog |
| 2 | **Diff** — what changed since last learn (new stack, new domain folder, retired agents); surface drift vs `skill/teams` if omakaseagent dev clone |
| 3 | **Memory update** — append high-signal bullets to `taste.md`; add `decisions.md` rows (never silent wipe); cite “Memory consulted” seed for *this* repo’s ICP/stack |
| 4 | **Project agents** — propose add/update/retire (still ≤3 active); user confirm; write `.omakaseagent/project-agents/*.md` |
| 5 | **Emit** — regenerate namespaced native agent files for **this repo only** from project-agents source |
| 6 | **Register** — patch `AGENTS.md` “Project agents” + changelog table in `decisions.md` |
| 7 | **Gate** — skill-judge report on new/changed agent markdown (report-only) |

**Skill fallback:** `/omakase-router learn` (or documented in router reference) when CLI unavailable — same steps, chat-driven confirm.

**Init flow** (first visit — includes learn steps 1–7 when user opts in to project agents):

| Step | Action |
|------|--------|
| 1 | **Bootstrap** — `.omakaseagent/`, seed memory, `AGENTS.md`, install project skill/native agents (core leads) |
| 2 | **Learn pass** — run discover → propose project agents (same as `omakase learn` steps 1–7) |

**Constraints (Omakase principles):**

- **Cap:** max 3 project agents on init (expand only via explicit Archivist/engineer request + decision log)
- **Namespace:** `omakase-{project-slug}-{role}` — never shadow core `omakase-engineer` etc.
- **User-invokable:** optional — default **lead-delegated only** (hidden descriptions) unless user wants `@omakase-acme-billing` visible
- **Drift:** Archivist Phase 0-style audit compares `skill/` (if any custom) vs `.omakaseagent/project-agents/` vs installed native files
- **Evolution:** Harness-style changelog table in `decisions.md`; repeated bypass → Archivist proposes merge into `taste.md` or retire agent

**Pattern picker (from Harness, simplified):**

| Repo signal | Likely project agents |
|-------------|----------------------|
| Heavy Stripe/billing code | Billing/integrations specialist |
| Design-system / frontend app | UI-system specialist (impeccable may still own pixel polish; this agent knows *your* tokens/routes) |
| Data pipeline repo | ETL/validation specialist |
| Agency / services site | May rely on core **Sales** only — **zero** project agents |

**Impeccable parallel:** Impeccable = design-time skills tuned to product UI. **Project Omakase** = repo-time agents tuned to stack/domain. They can coexist; Engineer lead routes implementation, project agent supplies repo-specific procedures.

**Phase G** (new) implements this after core Sales + ship/verify exist so init has a stable base to extend.

---

## 5. GBrain & existing siphon map

Already in repo (keep, extend):

| Source | Where | Status |
|--------|-------|--------|
| GBrain synthesis | `memory-synthesizer.md` | Shipped |
| GBrain co-curator | `archivist/lead.md` | Shipped |
| Client prospector SOP | — | **Planned → Sales** |
| skill-judge rubric | — | **Planned → Critics specialist** |
| cursor-team-kit workflows | — | **Planned → ship/verify specialists** |
| revfactory/harness patterns + evals | — | **Planned → reference + Archivist + dark factory** |
| revfactory/harness init discovery | — | **Planned → Phase G project extension at `omakase init`** |

Archivist should absorb **weekly-review** / **what-did-i-get-done** / **workflow-from-chats** (git + chat mining → `taste.md` / `decisions.md`) — not Sales or Engineering.

---

## 6. Team roster after expansion

| Team | Lead (native) | Specialists (hidden) | New? |
|------|---------------|----------------------|------|
| Engineering | `@omakase-engineer` | implementation-lead, senior-reviewer, refactor-specialist, debugger, **ship**, **verify** | ship, verify |
| Critics | `@omakase-critic` | deslop, structural, verification, **skill-judge** | skill-judge |
| Archives | `@omakase-archivist` | memory-synthesizer (+ git/chat mining prompts) | extend lead |
| Sales | `@omakase-sales` | market-mapper, verifier, qualifier, account-researcher, brief-writer | **whole team** |

**Native agent count:** 4 leads + ~12 specialists (generator + `verify:native-agents` must be extended).

---

## 7. Implementation phases

### Phase A — Sales team (highest user ask)

1. `skill/teams/sales/lead.md` + **all five** specialists: market-mapper, verifier, qualifier, **account-researcher**, **brief-writer**
2. `skill/reference/client-research.md` — include **capability detection** (browser MCP, WebSearch, WebFetch, user-supplied list); agent picks best available path and states limitations in output
3. Update `TEAMS.md`, `SKILL.md`, `AGENTS.md`, init messaging
4. `scripts/native-agents/generate.js` — register `omakase-sales` + hidden specialists
5. Dogfood one list run + one account dossier run; **Critic** pass on output

### Phase B — Engineering ship/verify

1. `ship-specialist.md`, `verify-specialist.md`
2. `reference/shipping.md`, `reference/verification-harness.md`
3. Extend `engineering/lead.md` routing
4. Regenerate dist + verify CI

### Phase C — Critics skill-judge

1. `sub-personas/skill-judge.md` (siphoned rubric, Omakase-tuned)
2. Extend `critics/lead.md` delegation
3. Run skill-judge on `skill/SKILL.md` and new Sales lead as calibration

### Phase D — Archivist kit leftovers

1. Add git-window recap + chat-mining guidance to Archivist (from weekly-review, workflow-from-chats)
2. No new native agents

### Phase E — Harness-derived reference + drift (lightweight)

1. `skill/reference/team-architecture.md` — 6 patterns + Omakase mapping (1 page)
2. Archivist: drift audit checklist (skill source vs dist agents)
3. Pull trigger-eval + with/without-skill bullets into dark-factory / skill-judge persona

### Phase F — Dark factory alignment (optional, from other plan)

- Scenario templates for Sales output + ship loop evidence
- Mechanical CI checks for gate report headings when templates exist

### Phase G — Project extension + `omakase learn` (Harness-inspired)

1. **`bin/omakase.js`:** `learn` subcommand + flags (`--dry-run`, `--memory-only`, `--project-agents-only`, optional `--sync-skills`)
2. **`skill/reference/learn.md`** — full learn protocol; **`reference/init.md`** — calls learn at end of init
3. **`skill/SKILL.md` / router** — document `omakase learn` + `/omakase-router learn` fallback
4. `.omakaseagent/project-agents/` canonical source; native generator emits namespaced agents on learn
5. Archivist lead: “repo learn” is an Archivist-owned workflow; Engineer/Sales may *trigger* learn after major domain shifts
6. skill-judge report on generated/changed bodies (report-only)
7. Document impeccable-style parallel in `docs/` or `reference/init.md`

---

## 8. Resolved decisions (2026-06-03)

| # | Question | **Decision** |
|---|----------|--------------|
| 1 | Sales scope v1 | **Full Sales MLP** — include **account-researcher** and **brief-writer**, not list-only |
| 2 | Browser / research tools | **Capability-adaptive** — use whatever the harness exposes (browser MCP, search, fetch, user list); agent must detect, choose, and **state limits** in output |
| 3 | Fourth lead `@omakase-sales` | **Yes** — fourth core lead in the picker; specialists stay hidden |
| 4 | skill-judge threshold | **Report-only** — never block imports/merges on grade; Critic reports, human decides |
| 5 | ship-specialist autonomy | **Omakase principles** — evidence, memory citation, visible internal gate; **best judgment** on CI loops (watch when ship intent is clear; don’t burn tokens on ambiguous asks) |
| 6 | “Personal vs upstream” | **Clarification:** we don’t fork Kappaemme/Cursor/softaworks/harness repos into npm dependencies. We **rewrite** siphoned ideas into `skill/` in Omakase voice. If we copy substantial text, one line in `decisions.md` credits the source (MIT). **Default: siphon in-repo, no upstream package.** |
| 7 | Harness | **Glean only** — no Harness plugin in omakaseagent. **Do** add **project extension** via **`omakase init`** (first time) + **`omakase learn`** (repo refresh when core Omakase is global). Impeccable-style tailoring for domain/stack. |
| 8 | `_workspace/` convention | **Adopt** — `{project}/_workspace/{phase}_{agent}_{artifact}.{ext}` for Sales/ship/multi-step handoffs; retain for audit |
| 9 | `omakase learn` | **Yes** — separate command for repo-specific memory + project agents without re-installing global bundles (§4.1) |

---

## 9. What we are explicitly not doing (yet)

- Installing [revfactory/harness](https://github.com/revfactory/harness) plugin as a co-primary skill inside the **omakaseagent package**
- Unbounded per-project agent generation (Harness-100 style catalogs) — **capped at 3** with user confirm
- Pi / Hermes / OpenClaw harness adapters
- CRM integrations, automated outreach sending
- Standalone npm skills duplicating Omakase teams
- DOT/Attractor runner (see dark-factory plan)
- 18 cursor-team-kit skills as installable copies

---

## 10. Suggested implementation order

1. **Phase A** — Sales (full five specialists + capability-adaptive research)
2. **Phase B** — ship + verify specialists
3. **Phase C** — skill-judge (report-only)
4. **Phase D** — Archivist git/chat mining
5. **Phase E** — team-architecture reference + drift
6. **Phase G** — project extension at init (after core teams stable)
7. **Phase F** — dark-factory templates (when ready)

**Command to start implementation:**  
`Implement Phase A of plans/OMAKASE-TEAMS-EXPANSION-RESEARCH.md`