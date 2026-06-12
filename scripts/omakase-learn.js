#!/usr/bin/env node
/**
 * omakase learn — discover repo, bootstrap Level 4 factory layout, refresh memory hints.
 * Invoked from bin/omakase.js. Archivist owns the method (skill/reference/learn.md).
 */

const fs = require('fs');
const path = require('path');
const {
  planProjectAgents,
  applyProjectAgentEmit,
  buildAgentsProjectSection,
  PROJECT_AGENTS_MARKER,
} = require('./project-agents');

const TASTE_MARKER = '<!-- omakase-learn:taste -->';
const AGENTS_MARKER = '## Omakase Dark Factory';

function readSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function parsePackageJson(cwd) {
  const raw = readSafe(path.join(cwd, 'package.json'));
  if (!raw) return { name: path.basename(cwd), scripts: {} };
  try {
    const pkg = JSON.parse(raw);
    return { name: pkg.name || path.basename(cwd), scripts: pkg.scripts || {}, description: pkg.description || '' };
  } catch {
    return { name: path.basename(cwd), scripts: {} };
  }
}

function detectStack(cwd, pkg) {
  const signals = [];
  if (fs.existsSync(path.join(cwd, 'package.json'))) signals.push('Node.js');
  if (fs.existsSync(path.join(cwd, 'skill', 'SKILL.md'))) signals.push('Omakase skill source');
  if (fs.existsSync(path.join(cwd, 'dist'))) signals.push('committed dist bundles');
  if (fs.existsSync(path.join(cwd, 'bin', 'omakase.js'))) signals.push('omakase CLI');
  const scripts = Object.keys(pkg.scripts);
  if (scripts.includes('build')) signals.push('build step');
  if (scripts.some((s) => s.includes('verify'))) signals.push('verify scripts');
  return [...new Set(signals)];
}

function mechanicalChecks(pkg) {
  const checks = [];
  if (pkg.scripts.build) checks.push({ cmd: 'npm run build', label: 'Build' });
  for (const name of Object.keys(pkg.scripts).sort()) {
    if (name.startsWith('verify:')) {
      checks.push({ cmd: `npm run ${name}`, label: `Verify: ${name.replace('verify:', '')}` });
    }
  }
  for (const name of Object.keys(pkg.scripts).sort()) {
    if (name === 'test' || name.startsWith('test:')) {
      checks.push({ cmd: `npm run ${name}`, label: `Script: ${name}` });
    }
  }
  if (checks.length === 0 && pkg.scripts.test) checks.push({ cmd: 'npm test', label: 'Tests' });
  return checks.slice(0, 10);
}

function riskGuide(cwd, stack) {
  const isOmakaseRepo = stack.includes('Omakase skill source');
  return [
    {
      class: '0',
      label: 'Docs & packaging',
      examples: isOmakaseRepo ? 'README, reference markdown' : 'README, docs, comments-only',
    },
    {
      class: '1',
      label: 'Mechanical / CI',
      examples: isOmakaseRepo
        ? 'CI workflow, verify scripts, install smoke'
        : 'Config, scripts, generated artifacts with clear checks',
    },
    {
      class: '2',
      label: 'Product behavior',
      examples: isOmakaseRepo
        ? 'skill/, personas, bin/omakase.js, native generator'
        : 'Features with tests and scenarios',
    },
    {
      class: '3',
      label: 'Sensitive',
      examples: 'Auth, billing, data migration — human checkpoint required',
    },
  ];
}

function buildScenarios(cwd, pkg, checks) {
  const scenarios = [];
  const isOmakaseRepo = fs.existsSync(path.join(cwd, 'skill', 'SKILL.md'));

  if (isOmakaseRepo) {
    scenarios.push({
      slug: 'init-native-leads',
      title: 'Project init exposes native leads',
      body: `# Scenario: init-native-leads

**Actor:** Developer in a fresh clone  
**Start:** No \`.omakaseagent/\` (or empty)  
**Action:** Run \`npx omakase init\` (or \`node bin/omakase.js init\` in dev clone)  
**Observe:** \`.omakaseagent/taste.md\` and \`decisions.md\` exist; harness has \`omakase-engineer\`, \`omakase-critic\`, \`omakase-archivist\`  
**Must not:** Specialists listed as user-facing primary entry in picker docs  
**Evidence:** Init log + agent files on disk; optional \`npm run verify:native-agents\`
`,
    });
  }

  if (checks.some((c) => c.cmd.includes('build'))) {
    scenarios.push({
      slug: 'mechanical-build',
      title: 'Build produces dist without guard failure',
      body: `# Scenario: mechanical-build

**Actor:** CI or developer  
**Start:** Clean \`skill/\` source; \`dist/\` may be stale  
**Action:** \`npm run build\`  
**Observe:** Build completes; dist bundles updated; guard passes  
**Must not:** Hand-edit \`dist/\` without rebuild  
**Evidence:** Command exit 0 + build log
`,
    });
  }

  if (checks.some((c) => c.cmd.includes('verify:native-agents'))) {
    scenarios.push({
      slug: 'native-agents-verify',
      title: 'Native agent contract holds',
      body: `# Scenario: native-agents-verify

**Actor:** CI or developer  
**Start:** Built \`dist/\`  
**Action:** \`npm run verify:native-agents\`  
**Observe:** All harness checks pass; 12 personas; 3 user-facing leads  
**Must not:** Missing delegation lists or wrong skill name  
**Evidence:** verify script stdout
`,
    });
  }

  scenarios.push({
    slug: 'level4-checkpoint',
    title: 'Class 2+ work ends with gate report',
    body: `# Scenario: level4-checkpoint

**Actor:** Human + @omakase-engineer  
**Start:** User states goal in plain language; agent co-writes task brief + scenarios (Class 2)  
**Action:** Agent implements; runs mechanical checks; @omakase-critic reviews  
**Observe:** Gate report in \`.omakaseagent/gates/\` with evidence stack + memory cited  
**Must not:** User required to say "seed"; "done" with only chat — no gate artifact  
**Evidence:** Gate markdown file path + check outputs referenced inside
`,
  });

  scenarios.push({
    slug: 'loop-charter',
    title: 'Standing loop runs under charter, halts on Stop',
    body: `# Scenario: loop-charter

**Actor:** Loop runner (any harness) + @omakase-engineer  
**Start:** Approved charter in \`.omakaseagent/loops/\`; queue has eligible items  
**Action:** Runner starts one iteration; agent executes exactly one item via the factory loop (\`reference/loops.md\`)  
**Observe:** One gate file per iteration; ledger row appended; loop halts on Stop conditions instead of asking mid-run  
**Must not:** Mid-loop scope improvisation; merge/deploy; second item in the same iteration  
**Evidence:** Gate paths + charter ledger rows
`,
  });

  return scenarios.slice(0, 5);
}

function buildLoopCharter(today) {
  return {
    slug: 'backlog-drain',
    body: `# Loop: backlog-drain

## Intent

Drain \`.omakaseagent/backlog/\` in dependency order without per-task prompting.
Generated by \`omakase learn\` on ${today}.

**Approval:** UNAPPROVED — a human replaces this line with "Approved by <name> on <date>" before any unattended run. Agents halt on UNAPPROVED.

## Scope

- **Queue:** \`.omakaseagent/backlog/README.md\` execution order (status TODO, dependencies DONE)
- **In-scope paths:** per each execution plan's Scope section
- **Risk class ceiling:** 2 — items above it are skipped and flagged, never attempted

## Iteration

One eligible item per run via \`reference/factory-orchestration.md\`: brief from the
plan, mechanical checks, critic, gate, queue status update, ledger row.

## Stop

- Queue empty
- A STOP condition in an execution plan fires
- A gate is rejected at review
- Two consecutive failed iterations
- Iteration cap: 5

## Checkpoint policy

- Gates reviewed in batch — no synchronous confirm per iteration
- Halt for human immediately when: risk ceiling would be exceeded, drift check
  fails, or work needs a scenario this charter does not cover

## Ledger

| # | Date | Item | Gate | Result |
|---|------|------|------|--------|
`,
  };
}

function buildFactoryMd(cwd, pkg, stack, checks, risks) {
  const today = new Date().toISOString().slice(0, 10);
  const checkLines = checks.length
    ? checks.map((c) => `- \`${c.cmd}\` — ${c.label}`).join('\n')
    : '- *(none detected — add your test/build commands here)*';

  const riskLines = risks
    .map((r) => `- **Class ${r.class}** (${r.label}): ${r.examples}`)
    .join('\n');

  return `# Omakase factory — ${pkg.name}

Generated by \`omakase learn\` on ${today}.

## What this factory is

This file is the **repo-specific** half of the Omakase factory pattern. Global goals and what "automation" means: \`skill/reference/dark-factory.md\` (in the omakase package).

**Pattern:** Level 4 — humans approve what should be true; agents implement and **prove** it with an evidence stack; humans accept at **checkpoint** (gate report), not by reading every diff.

**Agents:** Co-create task briefs (\`reference/task-intake.md\`). Run the mechanical commands below. Write gate reports to \`gates/\`. Do not merge or deploy without explicit human accept.

## This repo

- **Stack:** ${stack.join(', ') || 'unknown'}
- **Package:** ${pkg.name}${pkg.description ? ` — ${pkg.description}` : ''}

## Mechanical evidence (run before checkpoint)

${checkLines}

## Risk classes (defaults for this repo)

${riskLines}

## Workflow

1. **Task brief** — agent co-writes from user goal (see \`reference/task-intake.md\`)  
2. **Scenarios** — agent proposes; confirm before Class 2+ agent work  
3. **Work** — \`@omakase-engineer\` between gates; cite \`taste.md\` / \`decisions.md\`  
4. **Evidence** — scenarios + mechanical + @omakase-critic + memory updates  
5. **Gate** — write \`.omakaseagent/gates/<date>-<task>-gate.md\`; human reviews intent + evidence, not every line by default  
6. **Learn again** — after major stack/CI changes: \`omakase learn --dry-run\` then apply

## Loops (standing charters)

- Charters live in \`.omakaseagent/loops/\` — approve before any unattended run (\`reference/loops.md\`)
- One iteration = one queue item → factory loop → gate file + ledger row
- Gates are batch-reviewed; the loop halts on Stop conditions instead of asking mid-run

Global methodology: \`skill/reference/dark-factory.md\` (in omakase package) or Omakase docs.
`;
}

function buildTasteSection(pkg, stack, checks) {
  const bullets = [
    'Users state goals plainly — agents co-create task brief + scenarios (`reference/task-intake.md`)',
    'Level 4: Class 2+ needs brief confirm before long runs; gate report at end',
    'Checkpoint = gate file under `.omakaseagent/gates/`, not chat-only "done"',
    'Loops run only under an approved charter in `.omakaseagent/loops/` — one gate per iteration (`reference/loops.md`)',
  ];
  if (stack.includes('committed dist bundles')) {
    bullets.push('Never edit `dist/` by hand — `npm run build` only');
  }
  if (checks.some((c) => c.cmd.includes('verify:native-agents'))) {
    bullets.push('Native agent changes require `npm run verify:native-agents`');
  }
  return `${TASTE_MARKER}
## Dark factory (omakase learn)
${bullets.map((b) => `- ${b}`).join('\n')}
`;
}

function buildAgentsSection(projectSlugs = []) {
  const projectBlock = projectSlugs.length ? buildAgentsProjectSection(projectSlugs) : '';
  return `

${AGENTS_MARKER}

This repo uses **Level 4** Omakase: approve intent and scenarios; review gate evidence at checkpoint.

- **Factory playbook:** \`.omakaseagent/factory.md\`
- **Scenarios:** \`.omakaseagent/scenarios/\`
- **Gate reports:** \`.omakaseagent/gates/\`
- **Backlog:** \`.omakaseagent/backlog/\` — execution plans (\`reference/backlog-audit.md\`)
- **Loops:** \`.omakaseagent/loops/\` — standing charters for unattended runs (\`reference/loops.md\`)
- **Project agents:** \`.omakaseagent/project-agents/\` (≤3, emitted on learn)
- **Refresh:** \`npx omakase learn\` (use \`--dry-run\` first)
${projectBlock}
`;
}

const DIR_READMES = {
  scenarios: 'Human-approved behavior contracts. Approve before Class 2+ agent work.',
  gates: 'Evidence stacks + critic summary per checkpoint. One file per task/milestone.',
  handoffs: 'High-signal continuation notes between agents or humans.',
  backlog:
    'Execution plans from backlog audit (`reference/backlog-audit.md`). Implement via factory loop — not chat-only.',
  loops:
    'Standing loop charters (`reference/loops.md`). One file per loop; approve before any unattended run.',
};

function planLearn(cwd, options = {}) {
  const memDir = path.join(cwd, '.omakaseagent');
  if (!fs.existsSync(memDir) && !options.allowNoMem) {
    return { error: 'missing_omakaseagent', message: 'Run `omakase init` first (creates .omakaseagent/).' };
  }

  const pkg = parsePackageJson(cwd);
  const stack = detectStack(cwd, pkg);
  const checks = mechanicalChecks(pkg);
  const risks = riskGuide(cwd, stack);
  const scenarios = buildScenarios(cwd, pkg, checks);
  const factoryMd = buildFactoryMd(cwd, pkg, stack, checks, risks);
  const tasteSection = buildTasteSection(pkg, stack, checks);
  const projectPlan = planProjectAgents(cwd, pkg, stack, options);
  const agentsSection = buildAgentsSection(projectPlan.candidates);
  const today = new Date().toISOString().slice(0, 10);
  const loopCharter = buildLoopCharter(today);

  const files = [];
  const projectAgentsOnly = !!options.projectAgentsOnly;
  const skipFactory = options.memoryOnly || projectAgentsOnly;
  const skipMemory = options.factoryOnly || projectAgentsOnly;

  if (!skipFactory) {
    // README stubs only on first learn — backlog/README.md becomes the live queue
    // index and loop ledgers reference it; re-learn must never clobber state.
    for (const dir of ['scenarios', 'gates', 'handoffs', 'backlog', 'loops']) {
      const readmePath = path.join(memDir, dir, 'README.md');
      if (!fs.existsSync(readmePath)) {
        files.push({
          path: readmePath,
          content: `# ${dir}\n\n${DIR_READMES[dir]}\n`,
        });
      }
    }
    files.push({ path: path.join(memDir, 'factory.md'), content: factoryMd });
    for (const s of scenarios) {
      const scenarioPath = path.join(memDir, 'scenarios', `${s.slug}.md`);
      if (!fs.existsSync(scenarioPath)) {
        files.push({ path: scenarioPath, content: s.body });
      }
    }
    const charterPath = path.join(memDir, 'loops', `${loopCharter.slug}.md`);
    if (!fs.existsSync(charterPath)) {
      files.push({ path: charterPath, content: loopCharter.body });
    }
  }

  if (!skipMemory) {
    const tastePath = path.join(memDir, 'taste.md');
    let taste = readSafe(tastePath) || '';
    if (!taste.includes(TASTE_MARKER)) {
      files.push({ path: tastePath, content: taste.trimEnd() + '\n\n' + tasteSection });
    }

    const decisionRow = `
## ${today} — Dark factory bootstrapped
**Context**: \`omakase learn\` on this repo.
**Decision**: Adopt Level 4 layout (factory.md, scenarios, gates, handoffs, backlog, loops). Class 2+ uses scenarios + gate reports; unattended runs need an approved loop charter.
**Why**: Humans review intent and evidence, not every diff; Omakase principles already define the bar.
**Revisit if**: Stack or CI changes materially — re-run \`omakase learn\`.

`;
    const decisionsPath = path.join(memDir, 'decisions.md');
    let decisions = readSafe(decisionsPath) || '# Key Decisions\n\n';
    if (!decisions.includes('Dark factory bootstrapped')) {
      files.push({ path: decisionsPath, content: decisions.trimEnd() + '\n' + decisionRow });
    }
  }

  if (!options.memoryOnly) {
    files.push(...projectPlan.files);
  }

  const agentsPath = path.join(cwd, 'AGENTS.md');
  const agents = readSafe(agentsPath) || '';
  if (!agents.includes(AGENTS_MARKER)) {
    files.push({
      path: agentsPath,
      content: agents.trimEnd() + agentsSection,
    });
  } else if (!agents.includes(PROJECT_AGENTS_MARKER) && projectPlan.candidates.length) {
    files.push({
      path: agentsPath,
      content: agents.trimEnd() + buildAgentsProjectSection(projectPlan.candidates),
    });
  }

  return {
    files,
    pkg,
    stack,
    checks,
    scenarios: scenarios.map((s) => s.slug),
    loops: skipFactory ? [] : [loopCharter.slug],
    projectAgents: projectPlan.candidates,
    emitPlan: projectPlan.emitPlan,
    harnesses: projectPlan.harnesses,
  };
}

function applyLearn(plan, options = {}) {
  const written = [];
  for (const f of plan.files) {
    if (options.dryRun) continue;
    fs.mkdirSync(path.dirname(f.path), { recursive: true });
    fs.writeFileSync(f.path, f.content, 'utf8');
    written.push(path.relative(process.cwd(), f.path));
  }
  return written;
}

function runLearn(options = {}) {
  const cwd = process.cwd();
  const plan = planLearn(cwd, {
    memoryOnly: options.memoryOnly,
    factoryOnly: options.factoryOnly,
    projectAgentsOnly: options.projectAgentsOnly,
    allowNoMem: false,
  });

  if (plan.error) {
    return plan;
  }

  const written = applyLearn(plan, { dryRun: options.dryRun });
  const emitted = applyProjectAgentEmit(plan.emitPlan || [], { dryRun: options.dryRun });

  return {
    dryRun: !!options.dryRun,
    written,
    emitted,
    planned: plan.files.map((f) => path.relative(cwd, f.path)),
    stack: plan.stack,
    checks: plan.checks,
    scenarios: plan.scenarios,
    loops: plan.loops || [],
    projectAgents: plan.projectAgents || [],
    harnesses: plan.harnesses || [],
  };
}

module.exports = { runLearn, planLearn, buildFactoryMd, buildScenarios };
