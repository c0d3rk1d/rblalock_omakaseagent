# Omakase Taste Memory

## What Good Looks Like Here
- Ruthless simplicity over clever abstractions
- Senior craftsmanship: clear, direct, maintainable
- Non-trivial work explains taste ("Why this approach")
- Critique gate before significant deliverables ship

## What We Reject
- Generic AI tone and filler
- Unnecessary comments and defensive noise
- Files growing past ~1000 lines without justification
- "Future flexibility" abstractions that add cost today

## Current Standards
- Load and cite this file + decisions.md on significant tasks
- Use native Omakase agents: @omakase-engineer, @omakase-critic, @omakase-archivist

<!-- omakase-learn:taste -->
## Dark factory (omakase learn)
- Level 4: Class 2+ needs approved scenarios before long agent runs
- Checkpoint = gate report under `.omakaseagent/gates/`, not chat-only "done"
- Never edit `dist/` by hand — `npm run build` only
- Native agent changes require `npm run verify:native-agents`
