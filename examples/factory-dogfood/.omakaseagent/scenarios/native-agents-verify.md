# Scenario: native-agents-verify

**Actor:** CI or developer  
**Start:** Built `dist/`  
**Action:** `npm run verify:native-agents`  
**Observe:** All harness checks pass; 12 personas; 3 user-facing leads  
**Must not:** Missing delegation lists or wrong skill name  
**Evidence:** verify script stdout
