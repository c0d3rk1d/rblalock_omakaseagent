# Scenario: init-native-leads

**Actor:** Developer in a fresh clone  
**Start:** No `.omakaseagent/` (or empty)  
**Action:** Run `npx omakase init` (or `node bin/omakase.js init` in dev clone)  
**Observe:** `.omakaseagent/taste.md` and `decisions.md` exist; harness has `omakase-engineer`, `omakase-critic`, `omakase-archivist`  
**Must not:** Specialists listed as user-facing primary entry in picker docs  
**Evidence:** Init log + agent files on disk; optional `npm run verify:native-agents`
