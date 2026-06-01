# Omakase Native Sub-Agents Implementation Plan

**Date**: 2026-06-02  
**Status**: Draft for new session  
**Owner**: TBD  
**Goal**: Make Omakase's teams (Engineering, Critics, Archives) and their internal sub-personas register and behave as *first-class native sub-agents* in supported harnesses, with proper isolated context, delegation via the platform's native mechanisms (Task tool, sub-agent spawning, etc.), and correct TUI treatment where available.

This moves beyond the current "sophisticated skill + LLM role-play / generic Task fallback" model.

---

## 1. Current State Diagnosis (The Gap)

### What Omakase Currently Does Well
- Clean teams model with Leads + internal sub-personas ("The Engineer" can delegate to "The Senior Reviewer", etc.).
- Strong router in `skill/SKILL.md` that describes the model and now (post recent changes) explicitly prefers native sub-agent mechanisms.
- Persona files use reasonable YAML frontmatter + inherit `omakase-core`.
- Single `omakase skills install [harness]` command that copies pre-built dist trees.

### What Is Broken / Insufficient for "Native" Support
- Everything is installed as **one Skill** under e.g. `.agents/skills/omakase/`.
- Individual personas (`The Engineer`, `The Senior Reviewer`, `The Critic`, etc.) are just additional Markdown files inside that skill directory.
- The main router tells the LLM "when you need engineering work, load `teams/engineering/lead.md` and act as The Engineer".
- In practice (confirmed in real OpenCode sessions and test runs):
  - Harnesses do **not** see "The Engineer" or "The Senior Reviewer" as first-class registered sub-agents.
  - OpenCode only exposes generic `general` / `explore` types for the `task` tool.
  - Cursor/Claude Code do not discover the personas in `.cursor/agents/` or `.claude/agents/`.
  - Result: Either flat context stuffing or the LLM manually using a generic Task with a huge inline prompt. No proper isolated sub-agent sessions, no native TUI differentiation, no reliable `@mention` or auto-delegation by the platform.

This violates the original design goal stated repeatedly: "on install put them in the right spots, so they work natively for these harnesses."

---

## 2. Core Principle for the Fix

**Omake the install step produce native agent/sub-agent definitions for each supported harness**, while keeping the existing portable Skill-based fallback.

- The main `omakase` Skill (router + core) remains valuable for any LLM.
- For harnesses with strong native sub-agent support, we also emit the individual Leads and key sub-personas in the exact format/location the harness expects for first-class sub-agents.

Prioritized harnesses (per previous alignment):
1. OpenCode (highest current pain point)
2. Cursor
3. Claude Code
4. Codex (OpenAI)
5. Pi (stretch)

---

## 3. Detailed Per-Harness Requirements

### 3.1 OpenCode (Primary Target)

**Current Discovery** (from official docs + live investigation):
- **Skills**: `SKILL.md` files with specific frontmatter, discovered in `.opencode/skills/<name>/`, `.agents/skills/<name>/`, `.claude/skills/<name>/`, global equivalents. Invoked via the `skill({ name })` tool.
- **Agents / Subagents**: Defined either in `opencode.json` under the `agent` key, **or** as Markdown files in `.opencode/agents/` (project) or `~/.config/opencode/agents/` (global). These have rich frontmatter (`name`, `description`, `mode: subagent`, `permission`, `model`, `prompt`, color, etc.). They are invocable via the `Task` tool (with `subagent_type` or agent name), `@mention`, and appear in the UI.

**What Omakase Must Do on Install**:
- Continue shipping the current `omakase` Skill (the router) so the existing `/omakase engineer` etc. commands keep working as a fallback.
- **Additionally** generate proper OpenCode Agent definitions for the key personas so they become native subagents.

**Recommended Output Structure** (for the "agents" target):
```
.agents/skills/omakase/               ← Existing Skill (router + all persona content)
.opencode/agents/                     ← NEW: Native sub-agent definitions
    engineer.md                       ← The Engineer (primary orchestrator for the team)
    senior-reviewer.md
    refactor-specialist.md
    ...
    critic.md                         ← The Critic
    ...
    archivist.md
```

Each `.opencode/agents/<name>.md` should contain:
- Proper YAML frontmatter with `mode: subagent`, good `description` (for auto-delegation), `permission` (readonly for reviewers, etc.), `color` if desired, etc.
- The body can either be self-contained or use `{file: relative/path/to/persona.md}` style includes if OpenCode supports it (or we copy the relevant content + core).

We will also need to update the main router (in the Skill) to know how to invoke these native agents via OpenCode's `Task` tool when the user is in an OpenCode session.

**Global vs Project**:
- Support both `--global` (writes to `~/.config/opencode/agents/`) and project-level.

### 3.2 Cursor

**Discovery**:
- Subagents live as `.md` files with YAML frontmatter in `.cursor/agents/` (project) or `~/.cursor/agents/` (user).
- Also accepts compatibility paths `.claude/agents/` and `.codex/agents/`.
- The `description` field is the primary signal for automatic delegation.
- Strong support for `readonly`, `is_background`, isolated context, parallel execution, and nesting.

**What Omakase Must Do**:
- On `omakase skills install cursor`, in addition to (or instead of) the current Skill layout, populate `.cursor/agents/` (or the omakase subdir) with properly formatted persona files.
- Or create a clean structure like:
  ```
  .cursor/agents/omakase-engineer.md
  .cursor/agents/omakase-senior-reviewer.md
  ...
  ```
- Ensure descriptions are excellent for auto-triggering.
- Update the main Omakase router to prefer Cursor's native subagent invocation when running inside Cursor.

**Global support** via `--global`.

### 3.3 Claude Code

Very similar to Cursor:
- `.claude/agents/<name>.md` with rich YAML (name, description, tools, permissionMode, model, memory, skills, hooks, etc.).
- Strong isolated context and sub-agent support.

**Action**: Mirror the Cursor work but target `.claude/agents/`.

Note that many projects will have both `.cursor/` and `.claude/` compatibility paths — we can populate both or let the user choose.

### 3.4 Codex (OpenAI)

- Uses TOML files in `.codex/agents/*.toml` (project) or `~/.codex/agents/*.toml` (user).
- Fields: `name`, `description`, `developer_instructions` (the prompt), `model`, `sandbox_mode`, etc.
- Subagents are more explicitly orchestrated by the parent.

**Action**: During install for Codex-compatible targets, generate the corresponding TOML files for the main leads and key specialists.

### 3.5 Pi and Others

Lower priority for v1 of this work, but the same pattern applies: research their agent/sub-agent definition format and generate the appropriate files on install.

---

## 4. High-Level Implementation Phases

### Phase 0 – Research & Alignment (Small)
- Confirm exact current agent/sub-agent definition formats and best practices for OpenCode, Cursor, Claude Code, and Codex (use the docs fetched in this session + any updates).
- Decide on naming convention (e.g. `omakase-engineer`, `omakase-senior-reviewer`, or shorter `engineer`, `senior-reviewer` under an omakase namespace).
- Decide whether we keep the single "omakase" Skill as the primary entry point + add native agent definitions alongside it (recommended), or split further.

### Phase 1 – Core Data Model & Generation Logic (in the Omakase repo)
- Create (or expand) a machine-readable definition of the teams and personas (probably just enhance the existing structure under `skill/teams/` + `skill/TEAMS.md`).
- Build a small generator (Node script, probably inside `scripts/` or as part of the build) that, given a target harness, can emit the correct agent definition files.
- The generator must be able to produce:
  - OpenCode Markdown agents (with rich frontmatter + prompt body or includes).
  - Cursor/Claude compatible Markdown agents.
  - Codex TOML agents.
- Make the generator respect the existing `omakase-core` injection for consistency.

### Phase 2 – Install-Time Changes (`bin/omakase.js`)
- Extend `installSkills()` (and the `--global` path) so that for each harness it does two things:
  1. The existing Skill overlay (for the router + full content as fallback).
  2. Generation + placement of the native agent definitions into the correct directories (`.opencode/agents/`, `.cursor/agents/`, `.claude/agents/`, `.codex/agents/`, and their global equivalents).
- Add a new flag or behavior, e.g. `--native-agents` (default on) or make it the primary behavior for the relevant harnesses.
- Handle `--test` correctly (install native agents under a test namespace if the harness supports it, or document limitations).
- Update the CLI help and post-install messages to clearly explain what was installed (Skill + native sub-agents for X, Y, Z).

### Phase 3 – Router & Persona Improvements (Ongoing)
- Continue refining the main `SKILL.md` router to be an excellent orchestrator that knows when to use native sub-agent invocation vs fallback.
- Keep the persona Markdown files as the single source of truth for content (generator pulls from them).
- Possibly add a tiny harness-specific "adapter" note or small file per persona for advanced registration.

### Phase 4 – Documentation & DX
- Major updates to `README.md`, `TEAMS.md`, and a new `docs/NATIVE-SUBAGENTS.md`.
- Clear migration / "what changed" notes for existing users.
- Strong guidance on `omakase skills install` vs just having the skill active in a chat.
- Examples of the new native behavior in each supported harness.

### Phase 5 – Testing & Validation
- For each prioritized harness, create automated or manual test harnesses that verify:
  - The persona appears as a native sub-agent (via UI or CLI listing).
  - Delegation via the platform mechanism creates a real isolated child session.
  - The sub-agent receives the expected focused charter + memory.
  - Handoffs between leads and internal specialists work with isolation.
- Add these tests to CI where possible (at minimum documented manual test procedures).

---

## 5. Open Questions / Decisions to Make in the New Session

1. **Naming**: Do we expose `engineer`, `senior-reviewer`, etc. directly, or prefix everything with `omakase-` (e.g. `omakase-engineer`) to avoid collisions?
2. **Single Skill vs Multiple Agents**: Do we still require users to go through the main `omakase` Skill/router, or can they talk directly to the native `omakase-engineer` sub-agent?
3. **Content Duplication vs Includes**: How do we avoid massive duplication between the Skill version of the personas and the native agent definitions? (Symlinks? Generator that pulls from a canonical source + injects core? Template system?)
4. **Scope of "Native" for MVP**: Do we aim for full native support in OpenCode + Cursor first, then expand? Or do a lighter "best effort registration" across more harnesses?
5. **Init vs Install**: Should `/omakase init` also ensure the native agent definitions are present (or at least warn loudly if they are missing)?
6. **Backwards Compatibility**: How do we roll this out without breaking people who are happily using the current Skill-only experience?

---

## 6. Suggested First Steps for the New Session

1. Read this entire plan + the current versions of:
   - `skill/SKILL.md`
   - `skill/TEAMS.md`
   - `bin/omakase.js` (install logic)
   - The three main lead persona files
   - The latest research in `plans/OMAKASE-AGENT-HARNESSES-RESEARCH.md` + the docs fetched in the previous session

2. Decide on naming convention and MVP scope (which 2–3 harnesses first).

3. Prototype the generator for one harness (probably OpenCode, since that was the biggest recent pain point).

4. Update the install command for that harness and test end-to-end (install → native sub-agents appear in the TUI / are invocable via the platform's preferred method → isolated context works → delegation between lead and sub-persona works).

5. Iterate on the other high-priority harnesses.

6. Update docs and the main router language as the last polishing step.

---

This plan is intentionally detailed because the gap between "works via LLM instructions" and "works natively as first-class sub-agents" is larger than it first appears, and each harness has its own (sometimes opinionated) registration story.

Let's do it right this time.
