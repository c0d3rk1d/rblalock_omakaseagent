# Omakase Teams & Personas

This document defines the canonical structure for Omakase teams and sub-personas.

## Philosophy

- Work is organized into **Teams**.
- Each team has exactly one **Lead**.
- From outside the team, you only ever speak to the Lead.
- Inside the team, the Lead may delegate to internal sub-personas.
- Every persona (lead or member) **inherits** the full Omakase core principles (Rules + Critique Rubric + taste philosophy).
- Teams and personas are defined as markdown with YAML frontmatter for portability across agent harnesses.

## Canonical Frontmatter

```yaml
---
name: short-kebab-case-name
team: Team Name
lead: The Lead Name
role: lead | member
description: One-sentence purpose (used for intent detection and routing)
inherits: omakase-core
model: optional-override
tools: optional-allowlist
---
```

### Required Fields
- `name`
- `team`
- `lead`
- `role` (`lead` or `member`)
- `description`
- `inherits: omakase-core`

### Optional Fields
- `model`
- `tools`

## Team Model

- **External interface**: Only the team Lead is addressable from outside the team.
- **Internal delegation**: The Lead may delegate to sub-personas within the same team.
- **Handoffs between teams**: Explicit and documented in each Lead’s “Known Teams & Handoff Guidance” section.
- **Inheritance**: All teams and sub-personas receive the full `omakase-core` at build/packaging time.

## Current Teams (MLP)

| Team         | Lead            | Primary Invocation       | Purpose |
|--------------|-----------------|--------------------------|---------|
| Engineering  | The Engineer    | `/omakase engineer`      | Implementation, review, refactoring, debugging, architecture |
| Archives     | The Archivist   | Handoff or explicit      | Memory, decisions, knowledge synthesis |
| Critics      | The Critic      | `/omakase critique`      | Cross-cutting quality enforcement and judging |

## Sub-Personas Inside Teams

Sub-personas are only invocable by their team’s Lead. They are never addressed directly from outside the team.

Example (inside Engineering):

- The Senior Reviewer
- The Refactor Specialist

## Naming Conventions

- Team Leads: Always “The X” (e.g., The Engineer, The Critic, The Archivist)
- Internal sub-personas: “The X” style when possible (e.g., The Deslop Critic, The Senior Reviewer)
- Keep names to two words where practical.

## Adding New Teams or Sub-Personas

1. Create the directory under `skill/teams/<team-name>/`
2. Create `lead.md` with the canonical frontmatter + “Known Teams” and “Internal Sub-Personas” sections.
3. Add sub-personas under `sub-personas/` as needed.
4. Update the main `SKILL.md` router if the team should be directly invocable.
5. Ensure the new team’s Lead references `omakase-core` (it will be injected at build time).
6. Update this document and any relevant sections in `SKILL.md`.

All new teams and personas must inherit the full Omakase principles.

## Testing & Cleanup

For development and cross-harness testing, use the `omakase-test` installation path when available. This installs under a clearly removable namespace so it can be cleaned up in one command across all supported harnesses.

## Related Documents

- `core/omakase-core.md` — The injected core principles
- `SKILL.md` — Main router and team loading logic
- `reference/init.md` — How `omakase init` scaffolds teams and AGENTS.md
- `OMAKASE-RULES.md` + `OMAKASE-CRITIQUE.md` — The actual rules and rubric (injected via omakase-core)