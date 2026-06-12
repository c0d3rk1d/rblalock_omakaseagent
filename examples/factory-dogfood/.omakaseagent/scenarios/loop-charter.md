# Scenario: loop-charter

**Actor:** Loop runner (any harness) + @omakase-engineer  
**Start:** Approved charter in `.omakaseagent/loops/`; queue has eligible items  
**Action:** Runner starts one iteration; agent executes exactly one item via the factory loop (`reference/loops.md`)  
**Observe:** One gate file per iteration; ledger row appended; loop halts on Stop conditions instead of asking mid-run  
**Must not:** Mid-loop scope improvisation; merge/deploy; second item in the same iteration  
**Evidence:** Gate paths + charter ledger rows
