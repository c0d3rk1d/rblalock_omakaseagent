# Scenario: level4-checkpoint

**Actor:** Human + @omakase-engineer  
**Start:** User states goal in plain language; agent co-writes task brief + scenarios (Class 2)  
**Action:** Agent implements; runs mechanical checks; @omakase-critic reviews  
**Observe:** Gate report in `.omakaseagent/gates/` with evidence stack + memory cited  
**Must not:** User required to say "seed"; "done" with only chat — no gate artifact  
**Evidence:** Gate markdown file path + check outputs referenced inside
