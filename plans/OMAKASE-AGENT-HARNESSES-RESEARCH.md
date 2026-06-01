# Omakase Agent Harnesses Research

**Purpose**: This document synthesizes how major AI coding agent harnesses implement agents and subagents. It is intended to inform the design of a cross-platform subagent strategy for the Omakase skill system.

**Date**: June 2026
**Status**: Research complete for MLP planning

---

## Executive Summary

Most modern coding agent harnesses converge on a **markdown + YAML frontmatter** pattern for defining specialized agents/subagents. This is a massive win for portability.

**Common patterns across harnesses**:
- Subagents are defined as markdown files with YAML frontmatter (`name`, `description`, `tools`, `model`, etc.)
- Subagents run with **isolated context windows** (fresh start or forked)
- Invocation mixes **automatic delegation** (based on task intent + description) and **explicit invocation** (natural language, @mention, `/command`, or tool call)
- Handoff is almost always: Parent sends task + focused context → Child returns **summary/results** (not full transcript)
- Skills (portable instruction sets) are often separated from Agents (stateful/tool-enabled entities)

**Key differentiators**:
- **Context model**: Always-fresh (Hermes) vs. fork/inherit support (Claude Code experimental, OpenClaw, some Pi extensions)
- **Orchestration sophistication**: Hermes and OpenClaw are the most advanced for hierarchical/parallel work
- **Skills abstraction**: OpenCode has the most mature reusable `SKILL.md` system that agents can discover and invoke
- **Definition portability**: Markdown + YAML dominates → Omakase can define sub-personas once and adapt per platform

**Recommendation for Omakase**:
Define sub-personas as markdown reference sections (or separate files) inside the main `omakase` skill. Use platform-specific thin adapters only where needed for invocation mechanics. Lean heavily on the markdown definition pattern that almost every harness already supports.

**AGENTS.md Integration (Strongly Recommended)**:
AGENTS.md (https://agents.md/) is rapidly becoming the de facto open standard for project-level agent instructions. Omakase's `init` should generate/enhance an `AGENTS.md` that encodes Omakase principles + critique standards. This gives Omakase projects instant compatibility with Codex, Cursor, OpenCode, and the broader ecosystem.

---

## 1. OpenAI Codex Subagents

**Source**: https://developers.openai.com/codex/subagents

### Definition
- Custom agents defined in **standalone TOML files**
- Location: `~/.codex/agents/` (user) or `.codex/agents/` (project)
- Required fields: `name`, `description`, `developer_instructions`
- Optional: `model`, `sandbox_mode`, `nickname_candidates`

**Example** (`pr-explorer.toml`):
```toml
name = "pr_explorer"
description = "Read-only codebase explorer..."
model = "gpt-5.3-codex-spark"
sandbox_mode = "read-only"
developer_instructions = """
Stay in exploration mode...
"""
```

### Invocation & Handoff
- Explicit spawning via natural language ("Spawn one agent per point")
- Batch mode via `spawn_agents_on_csv` tool (reads CSV, launches workers, writes results)
- Root session = depth 0; children increase depth (default max depth = 1)
- Parent can steer/stop child threads via natural language

### Context & Isolation
- Children inherit parent config but run in **own threads**
- Context is provided at spawn time; not full history by default
- Sandbox/approval choices from parent are reapplied

### Strengths for Cross-Platform
- Clean TOML definition (easy to generate)
- Strong batch/orchestration primitive
- Depth limits prevent runaway nesting

### Weaknesses
- TOML is less common than Markdown + YAML in the ecosystem
- Less automatic delegation than Claude Code / Cursor

---

## 2. Claude Code Sub-Agents (Anthropic)

**Source**: https://code.claude.com/docs/en/sub-agents

### Definition
- **Markdown files with YAML frontmatter**
- Location: `.claude/agents/` (project), `~/.claude/agents/` (user), or via plugins
- Fields: `name`, `description`, `tools` (allow/deny list), `model`, `memory`, `skills`, `permissionMode`, etc.
- Built-in: `Explore`, `Plan`, general-purpose

**Example structure**:
```markdown
---
name: code-improver
description: Improves code quality with senior-level taste
tools: [read, edit, bash]
model: sonnet
---
You are a senior engineer who...
```

### Invocation
- **Automatic**: Claude decides based on `description` + task complexity
- **Explicit**: Natural language ("Use the code-improver agent"), `@name`, `--agent` CLI flag, or `/agents` command
- Session-wide mode via CLI flag

### Handoff & Context
- Isolated context window per subagent (fresh start)
- Delegation message summarizes the task
- Subagents return **summary or relevant results** only
- **Fork mode** (experimental): Inherits full parent context + tools
- Persistent memory via `memory` field (own `MEMORY.md`)
- No infinite nesting (subagents cannot spawn other subagents by default)

### Strengths
- Excellent automatic delegation
- Strong memory hierarchy support
- Clean separation of tools/permissions per subagent
- Fork mode is powerful when needed

### Weaknesses
- Fork mode is experimental
- Subagents cannot easily orchestrate other subagents (flat)

---

## 3. Cursor Subagents

**Source**: https://cursor.com/docs/subagents

### Definition
- **Markdown + YAML frontmatter** in `.cursor/agents/`
- Fields: `name`, `description`, `model`, `readonly`, `is_background`

**Example**:
```markdown
---
name: verifier
description: Thoroughly verifies changes against requirements
model: sonnet
is_background: true
---
You are a meticulous verifier...
```

### Invocation
- Automatic (based on complexity + description)
- Explicit: `/verifier confirm auth` or natural language
- Built-in: `explore`, `bash`, `browser`

### Handoff & Context
- Isolated context window
- Parent sends prompt + necessary context
- Child returns **final results** (not intermediate output)
- **Nested delegation supported** (subagents can launch child subagents)
- Background subagents: output stored in `~/.cursor/subagents/`
- Foreground (blocking) vs background (non-blocking) modes

### Strengths
- Good nested delegation support
- Background mode is useful for long-running work
- Clean markdown definition

### Weaknesses
- Less sophisticated orchestration primitives than Hermes/OpenClaw

---

## 4. OpenCode.ai (Skills + Agents)

**Sources**:
- https://opencode.ai/docs/agents/
- https://opencode.ai/docs/skills/
- https://opencode.ai/docs/custom-tools/

### Skills System (Very Relevant to Omakase)
- Skills defined as `SKILL.md` with YAML frontmatter
- Locations searched: `.opencode/skills/`, `.claude/skills/`, `.agents/skills/`, global `~/.config/opencode/skills/`
- Agents invoke skills via the `skill` tool: `skill({ name: "my-skill" })`
- Strong permission model (`allow` / `deny` / `ask` patterns)
- Skills are **portable, discoverable, reusable instruction sets**

### Agents
- Configurable AI assistants with custom prompts, models, tool access
- Primary agents: Build, Plan, etc. (switchable)
- Subagents: Invoked via `Task` tool or `@mention`
- Subagents can create **child sessions** (navigable via keybindings)

### Handoff
- Primary agents delegate via `Task` tool
- Users can navigate between parent/child sessions
- Permissions control what subagents can do (e.g., Plan is read-only)

### Strengths for Omakase
- **Skills abstraction is excellent** — very close to what we want for portable Omakase commands
- Multiple discovery paths (project + global)
- Clean separation of skills vs agents

### Weaknesses
- Subagent orchestration is more session-based than tool-based in some flows

---

## 5. OpenClaw Subagents

**Source**: https://docs.openclaw.ai/tools/subagents

### Definition & Spawning
- Programmatic via `sessions_spawn` tool (not markdown-first)
- Parameters: `task`, `agentId`, `model`, `thinking`, `context` (isolated or fork), `sandbox`, etc.
- Session key pattern: `agent:<agentId>:subagent:<uuid>`

### Context Modes
- `isolated` (default): Clean transcript, lower token use
- `fork`: Branches requester’s transcript

### Orchestration Features
- **Depth limits**: `maxSpawnDepth` (default 1, max 5)
- Depth-2+ "orchestrators" get session tools
- Non-blocking spawn + `sessions_yield` to wait for completion
- Strong **orchestrator pattern** for hierarchical work
- ACP runtime support for external harness integration

### Handoff
- Child announces completion via internal event
- Parent wakes up with result + status + review/follow-up instructions
- No polling required

### Strengths
- Most sophisticated programmatic orchestration among the harnesses
- Good depth + orchestrator support
- ACP for cross-harness integration

### Weaknesses
- Less markdown-centric than others (more code/tool driven)
- Requires more platform-specific implementation

---

## 6. Hermes Agent (Nous Research)

**Source**: https://hermes-agent.nousresearch.com/docs/user-guide/features/delegation

### Subagent Delegation (`delegate_task` tool)
- Parent calls `delegate_task` with `goal` + optional `context`
- Child starts with **completely fresh conversation** (zero prior history)
- Restricted `toolsets` per child (e.g., `["terminal", "file"]`)
- Blocked for leaf subagents: delegation, clarify, memory writes, etc.
- Orchestrator children (`role="orchestrator"`) can delegate further

### Parallel & Hierarchical
- Batch mode: up to 3 concurrent by default (configurable)
- Flat by default (max depth = 1)
- Optional hierarchical: set `max_spawn_depth` (1–3) + use orchestrator role
- Synchronous blocking call — parent waits for all children

### Handoff
- Only **final structured summary** returned to parent
- No intermediate state leaked
- Strong timeout + interrupt handling (children killed on parent interrupt)

### Strengths
- **Best-in-class for orchestration and parallel work**
- Extremely clean isolation model
- Configurable concurrency + depth
- Excellent for "fan out → synthesize" patterns

### Weaknesses
- Always-fresh context (no fork mode)
- Subagents are tied to the synchronous `delegate_task` call (not durable background jobs)

---

## 7. Pi + Community Subagent Extensions

**Sources**:
- https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/subagent
- https://github.com/nicobailon/pi-subagents
- Multiple community extensions (`pi-subagents`, `tintinweb/pi-subagents`, etc.)

### Definition
- Markdown + YAML frontmatter (very similar to Claude Code / Cursor)
- `name`, `description`, `tools`, `model`
- Stored in `~/.pi/agent/agents/` or `.pi/agents/`

### Invocation
- Natural language or slash commands
- Single / parallel / chain workflows supported in extensions
- Some extensions spawn separate `pi` processes for isolation

### Context
- Most use **isolated** (spawn fresh)
- Some extensions support `spawn` vs `fork` modes
- Parallel execution with status widgets

### Strengths
- Very active community extension ecosystem
- Markdown definition is consistent with the broader trend
- Good support for parallel + chained workflows in extensions

### Weaknesses
- Core Pi is intentionally minimal; subagents live in extensions (fragmentation)
- Less standardized than Claude Code / Cursor / OpenCode

---

## 8. Other Notable Mentions (Landscape)

- **Continue.dev**: More focused on configurable agents via `config.yaml` + custom prompts. Subagent support is emerging but not as mature as the above.
- **Zed**: Agent Panel + ACP (Agent Client Protocol) for bringing external agents (Claude Code, Codex, etc.) into the editor. Strong on parallel/multiplayer agents.
- **Windsurf (Cascade)**: Strong autonomous + parallel agent workflows (Devin integration). Less public detail on subagent definition format.

**Broader trend**: The ecosystem is rapidly converging on **markdown-defined specialized agents** with isolated context and some form of delegation primitive.

---

## 8.5. AGENTS.md — Emerging Open Standard for Project-Level Agent Instructions

**Source**: https://agents.md/ (stewarded by the Agentic AI Foundation under the Linux Foundation)

### What It Is
AGENTS.md is a simple, open, **vendor-agnostic** format for a “README for AI coding agents.” It provides a predictable place for project-specific instructions that coding agents need (build/test commands, code style, PR conventions, architecture notes, etc.) without polluting the human-facing README.md.

### Key Characteristics
- **Format**: Plain Markdown with arbitrary headings. No required fields. Agents simply read content under headings.
- **Location**: Repo root (`AGENTS.md`). Supports nested files in subdirectories (monorepos) with nearest-wins precedence.
- **Adoption**: 60,000+ open-source projects. Backed by OpenAI Codex, Cursor, Google (Jules), Factory, Amp, and others.
- **Tool Support**:
  - Codex: Reads automatically before any work.
  - Cursor: Treated as always-on project rule.
  - OpenCode: Supported (alongside or as fallback to CLAUDE.md).
  - Claude Code: Not native yet (community requests open); users often create `CLAUDE.md` that references `@AGENTS.md`.
  - Many others via simple config.

### Relevance to Omakase
This is **highly complementary** to Omakase’s goals:
- Omakase is about **taste, rules, critique standards, and senior craftsmanship**.
- AGENTS.md is about **project context and repeatable workflows**.
- An Omakase-powered project should have an excellent `AGENTS.md` that encodes Omakase principles so any coding agent (even without the full Omakase skill installed) gets high-quality guidance.

### Recommendation for Omakase
- `omakase init` should **generate or enhance** an `AGENTS.md` file that includes:
  - Reference to Omakase principles and rules
  - Strong guidance on anti-slop, senior craftsmanship, and critique standards
  - Commands/workflows that align with Omakase (e.g., how to run critique, plan, etc.)
- This gives Omakase a natural “foot in the door” in the emerging ecosystem standard without fighting it.
- Sub-persona definitions (for `/omakase engineer`, etc.) can live alongside or be referenced from AGENTS.md.

## Cross-Platform Synthesis & Recommendations for Omakase

### Dominant Pattern (Adopt This)
**Markdown + YAML frontmatter** for persona/subagent definitions.
- `name`
- `description` (used for automatic routing)
- `tools` / capabilities
- `model` (optional override)
- Body = system prompt / instructions

This pattern is already supported (natively or via extensions) by:
- Claude Code
- Cursor
- OpenCode (via skills + agents)
- Pi (via extensions)
- Hermes (can be adapted)

### Skills vs Agents Delineation (Important)
OpenCode makes the cleanest distinction:
- **Skills** = Portable, discoverable instruction sets (`SKILL.md`)
- **Agents** = Stateful entities that can use tools and orchestrate

**Omakase recommendation**: 
- Core Omakase lives primarily as **skills** (portable markdown)
- Sub-personas can be defined as reference sections or separate markdown files that the main skill loads
- Only introduce platform-specific **agent** wrappers where real tool-calling orchestration is needed

### Context Strategy
- Default to **isolated/fresh context** for sub-personas (safer, lower token cost)
- Support **fork** mode only when explicitly beneficial (e.g., long-running research that needs parent history)
- Always provide focused context + task summary at handoff

### Orchestration Approach
For MLP:
- Rely on **host platform routing** where possible (automatic delegation via good `description` fields)
- Use explicit persona activation (`/omakase engineer`) for deliberate control
- Define internal "sub-persona" sections in markdown that the main skill can reference/load
- Only add real multi-agent tool calling (e.g., `delegate_task` style) in Phase 3+ or platform-specific adapters

### Platform-Specific Adapters (Thin Layer)
- **Cursor / Claude Code / OpenCode**: Mostly native markdown support — minimal adapter needed
- **Hermes**: Strong `delegate_task` primitive — can expose Omakase sub-personas as orchestratable units
- **OpenClaw**: Use `sessions_spawn` + ACP where available
- **Pi**: Leverage community subagent extensions or build a thin one
- **Generic markdown-only**: Just include the persona definitions + instructions for the user/host to route manually

### Memory Layer
- Use `.omakaseagent/` (as already decided) for project-level taste/decisions
- Sub-personas should read from this but write only through controlled paths (or not at all for leaf personas)
- Persistent memory across sub-personas is a higher-order feature (post-MLP)

---

## Open Questions for Implementation

1. Should Omakase define a canonical **persona markdown format** (with specific frontmatter fields) that all platforms adapt from?
2. How deep should the initial MLP go on automatic domain detection for `critique` / `plan` vs explicit persona commands?
3. Do we want a small set of **built-in sub-personas** (e.g., `engineer:implement`, `engineer:review`, `engineer:architect`) even in MLP?
4. Should the CLI layer expose subagent spawning for platforms that don't support it natively?

---

**Next Step**: Hand this research + the updated `OMAKASE-SPEC.md` to the coding agent when ready to implement cross-platform subagent support.