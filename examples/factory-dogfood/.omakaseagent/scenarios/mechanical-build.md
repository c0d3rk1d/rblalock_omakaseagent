# Scenario: mechanical-build

**Actor:** CI or developer  
**Start:** Clean `skill/` source; `dist/` may be stale  
**Action:** `npm run build`  
**Observe:** Build completes; dist bundles updated; guard passes  
**Must not:** Hand-edit `dist/` without rebuild  
**Evidence:** Command exit 0 + build log
