# User goal (plain language)

> Make factory gate reports mechanically verifiable in CI so Level 4 checkpoints can't be faked in chat. Wire it into Omakase's own CI and document how the team should run a factory goal.

**Non-goals:** Auto-merge PRs; DOT runner; block PRs without gates yet (only verify committed example gates + dogfood snapshots).

**Success looks like:** `npm run verify:gate-reports` passes in CI; Engineer knows to run critic + write gate; example run in `examples/factory-e2e/`.
