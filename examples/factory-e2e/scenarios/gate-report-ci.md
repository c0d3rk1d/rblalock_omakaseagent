# Scenario: gate-report-ci

**Actor:** CI on push/PR to main  
**Start:** Repo with `examples/factory-e2e/gates/*.md` committed  
**Action:** `npm run verify:gate-reports`  
**Observe:** Exit 0; each gate file contains Seed, Scenarios, Mechanical evidence, Critic, Memory consulted, Risks  
**Must not:** Pass when a required heading is removed  
**Evidence:** GitHub Actions log + local command output
