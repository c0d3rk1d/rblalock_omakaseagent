#!/usr/bin/env node
/**
 * omakase — the chef's standard
 * CLI: skills install, project init, native sub-agent distribution.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
const command = args[0];
const sub = args[1];

const root = path.resolve(__dirname, '..');
const distRoot = path.join(root, 'dist');
const pkg = require(path.join(root, 'package.json'));
const VERSION = pkg.version;

const HARNESS_CONFIG = {
  cursor: { dotDir: '.cursor', label: 'Cursor', distName: 'cursor' },
  claude: { dotDir: '.claude', label: 'Claude Code', distName: 'claude' },
  agents: { dotDir: '.agents', label: 'Agents / OpenCode', distName: 'agents' },
  codex: { dotDir: '.codex', label: 'Codex', distName: 'codex' },
};

/** Dist subtrees copied on install (relative to dist/<harness>/). */
const DIST_OVERLAYS = {
  cursor: ['.cursor'],
  claude: ['.claude'],
  agents: ['.agents', '.opencode'],
  codex: ['.codex'],
};

const NATIVE_AGENT_GLOBS = {
  '.cursor/agents': 'omakase-',
  '.claude/agents': 'omakase-',
  '.opencode/agents': 'omakase-',
  '.codex/agents': 'omakase-',
};

const GLOBAL_NATIVE_PATHS = {
  '.opencode/agents': path.join('.config', 'opencode', 'agents'),
  '.cursor/agents': path.join('.cursor', 'agents'),
  '.claude/agents': path.join('.claude', 'agents'),
  '.codex/agents': path.join('.codex', 'agents'),
};

function detectHarness() {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, '.cursor'))) return 'cursor';
  if (fs.existsSync(path.join(cwd, '.claude'))) return 'claude';
  if (fs.existsSync(path.join(cwd, '.codex'))) return 'codex';
  if (fs.existsSync(path.join(cwd, '.agents'))) return 'agents';
  return 'agents';
}

function isValidHarness(h) {
  return !!HARNESS_CONFIG[h];
}

function flag(name) {
  return args.includes(name) || args.includes(name.replace('--', '-'));
}

function getSkillFileCount(skillDir) {
  let count = 0;
  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d)) {
      const p = path.join(d, e);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else count++;
    }
  }
  walk(skillDir);
  return count;
}

function copyRecursive(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dst, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

function copyDistOverlay(harness, baseDir, options = {}) {
  const cfg = HARNESS_CONFIG[harness];
  const treeSource = path.join(distRoot, cfg.distName);
  const overlays = DIST_OVERLAYS[harness] || [];
  const copied = [];

  for (const overlay of overlays) {
    const src = path.join(treeSource, overlay);
    if (!fs.existsSync(src)) continue;
    const dst = path.join(baseDir, overlay);
    copyRecursive(src, dst);
    copied.push(overlay);
  }

  return copied;
}

function removeNativeAgents(baseDir, isGlobal = false) {
  let removed = 0;
  for (const dir of nativeAgentDirs(baseDir, isGlobal)) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      if (!entry.startsWith('omakase-')) continue;
      fs.rmSync(path.join(dir, entry), { force: true });
      removed++;
    }
  }
  return removed;
}

function resolveNativeAgentDir(relDir, isGlobal) {
  if (!isGlobal) return relDir;
  const mapped = GLOBAL_NATIVE_PATHS[relDir];
  return mapped || relDir;
}

function nativeAgentDirs(baseDir, isGlobal) {
  const dirs = [];
  for (const relDir of Object.keys(NATIVE_AGENT_GLOBS)) {
    dirs.push(path.join(baseDir, resolveNativeAgentDir(relDir, isGlobal)));
  }
  if (isGlobal) {
    dirs.push(path.join(os.homedir(), '.config', 'opencode', 'agents'));
  }
  return [...new Set(dirs)];
}

/** Count unique persona ids (not duplicate paths across opencode/codex/cursor). */
function summarizeNativeAgents(baseDir, isGlobal) {
  const ids = new Set();
  const byLocation = {};
  for (const dir of nativeAgentDirs(baseDir, isGlobal)) {
    if (!fs.existsSync(dir)) continue;
    const rel = path.relative(baseDir, dir) || dir;
    const files = fs.readdirSync(dir).filter((e) => e.startsWith('omakase-'));
    if (files.length) byLocation[rel] = files.length;
    for (const f of files) {
      ids.add(f.replace(/\.(md|toml)$/, ''));
    }
  }
  return { unique: ids.size, byLocation, ids: [...ids].sort() };
}

function formatNativeSummary(summary) {
  if (!summary.unique) return '0';
  const locs = Object.entries(summary.byLocation)
    .map(([k, n]) => `${k} (${n})`)
    .join(', ');
  return `${summary.unique} personas · ${locs}`;
}

function installSkills(targetHarness, options = {}) {
  const harness = targetHarness || detectHarness();
  const isTest = !!options.test;
  const isGlobal = !!options.global;
  const nativeAgents = options.nativeAgents !== false;

  if (targetHarness && !isValidHarness(harness)) {
    console.log(`
          〜

  Unknown harness: ${targetHarness}
  Supported: cursor | claude | agents | codex

          〜
`);
    process.exit(1);
  }

  const cfg = HARNESS_CONFIG[harness];
  const treeSource = path.join(distRoot, cfg.distName);
  const dotDirName = cfg.dotDir;
  const marker = path.join(treeSource, dotDirName);

  if (!fs.existsSync(treeSource) || !fs.existsSync(marker)) {
    console.log(`No dist bundle found for ${harness}.`);
    console.log('Run `npm run build` in the omakase repo and try again.');
    process.exit(1);
  }

  const cwd = process.cwd();
  const baseDir = isGlobal ? os.homedir() : cwd;
  const targetDot = path.join(baseDir, dotDirName);
  const skillName = isTest ? 'omakase-test' : 'omakase';
  const alreadyPresent = fs.existsSync(path.join(targetDot, `skills/${skillName}/SKILL.md`));

  let action = alreadyPresent ? 'refresh' : 'install';
  if (isTest) action = 'test-install';
  if (isGlobal) action = isTest ? 'global-test-install' : 'global-install';

  console.log(`
          〜

  道
  ${action} · ${harness}
      source: ${path.relative(root, treeSource)}
      target: ${isGlobal ? '~' : ''}${dotDirName}/skills/${skillName}${isGlobal ? ' (user-level)' : ''}
`);

  const copied = copyDistOverlay(harness, baseDir, options);

  // OpenCode global agents live in ~/.config/opencode/agents, not ~/.opencode/agents
  if (isGlobal && harness === 'agents' && nativeAgents) {
    const ocSrc = path.join(treeSource, '.opencode/agents');
    if (fs.existsSync(ocSrc)) {
      const ocDst = path.join(os.homedir(), '.config', 'opencode', 'agents');
      fs.mkdirSync(ocDst, { recursive: true });
      for (const entry of fs.readdirSync(ocSrc)) {
        if (!entry.startsWith('omakase-')) continue;
        copyRecursive(path.join(ocSrc, entry), path.join(ocDst, entry));
      }
      copied.push('~/.config/opencode/agents');
    }
  }

  // Codex bundle is agents-only; installing agents also pulls codex native agents into project
  if (harness === 'agents' && nativeAgents) {
    const codexSrc = path.join(distRoot, 'codex/.codex/agents');
    if (fs.existsSync(codexSrc)) {
      const codexDst = path.join(
        baseDir,
        resolveNativeAgentDir('.codex/agents', isGlobal)
      );
      fs.mkdirSync(codexDst, { recursive: true });
      for (const entry of fs.readdirSync(codexSrc)) {
        if (!entry.startsWith('omakase-')) continue;
        copyRecursive(path.join(codexSrc, entry), path.join(codexDst, entry));
      }
      if (!copied.includes('.codex')) copied.push('.codex/agents');
    }
  }

  if (isTest && harness !== 'codex') {
    const installedDir = path.join(targetDot, 'skills/omakase');
    const testDir = path.join(targetDot, 'skills/omakase-test');
    if (fs.existsSync(installedDir)) {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
      fs.renameSync(installedDir, testDir);
    }
  }

  const finalSkillDir = path.join(targetDot, `skills/${skillName}`);
  const fileCount = fs.existsSync(finalSkillDir) ? getSkillFileCount(finalSkillDir) : 0;
  const nativeSummary = nativeAgents ? summarizeNativeAgents(baseDir, isGlobal) : { unique: 0 };

  console.log(`
          〜

  仕上がり
    skill: ${fileCount} files → ${path.relative(baseDir, finalSkillDir) || '(codex agents only)'}
    native: ${formatNativeSummary(nativeSummary)}
    overlays: ${copied.join(', ') || '(none)'}

          〜
`);

  if (nativeAgents && nativeSummary.unique > 0) {
    console.log('  Leads (invoke directly): @omakase-engineer, @omakase-critic, @omakase-archivist');
    console.log('  Specialists: hidden in OpenCode; delegate via leads only');
  }

  if (isTest) {
    console.log('  omakase-test (isolated)');
    console.log('  削除  delete the omakase-test folder + omakase-* agents');
  } else if (isGlobal) {
    console.log('  再起動  restart your harness');
  } else {
    console.log('  再起動  reload your harness');
  }

  return { harness, nativeSummary, fileCount };
}

function installProjectStack(options = {}) {
  const results = [];
  results.push(installSkills('agents', options));
  if (fs.existsSync(path.join(process.cwd(), '.cursor'))) {
    results.push(installSkills('cursor', options));
  }
  if (fs.existsSync(path.join(process.cwd(), '.claude'))) {
    results.push(installSkills('claude', options));
  }
  if (fs.existsSync(path.join(process.cwd(), '.codex')) && !fs.existsSync(path.join(process.cwd(), '.agents'))) {
    results.push(installSkills('codex', options));
  }
  return results;
}

function uninstallSkills(targetHarness, options = {}) {
  const harness = targetHarness || detectHarness();
  const isGlobal = !!options.global;
  const isTest = !!options.test;
  const removeNative = options.nativeAgents !== false;

  if (targetHarness && !isValidHarness(harness)) {
    console.log(`
          〜

  Unknown harness: ${targetHarness}
  Supported: cursor | claude | agents | codex

          〜
`);
    process.exit(1);
  }

  const cfg = HARNESS_CONFIG[harness];
  const baseDir = isGlobal ? os.homedir() : process.cwd();
  const targetDot = path.join(baseDir, cfg.dotDir);
  const skillName = isTest ? 'omakase-test' : 'omakase';
  const skillDir = path.join(targetDot, 'skills', skillName);

  console.log(`
          〜

  道
  uninstall · ${harness}${isGlobal ? ' (user-level)' : ''}
`);

  if (fs.existsSync(skillDir)) {
    fs.rmSync(skillDir, { recursive: true, force: true });
    console.log(`  removed skill: ${skillName}`);
  }

  if (removeNative) {
    const n = removeNativeAgents(baseDir, isGlobal);
    if (n > 0) console.log(`  removed ${n} native agent file(s)`);
  }

  console.log(`
          〜

  仕上がり
    done

          〜
`);
}

function uninstallProjectStack(options = {}) {
  const cwd = process.cwd();
  const isGlobal = !!options.global;
  const baseDir = isGlobal ? os.homedir() : cwd;
  const skillName = options.test ? 'omakase-test' : 'omakase';
  let skillsRemoved = 0;

  console.log(`
          〜

  道
  uninstall · project stack${isGlobal ? ' (user-level)' : ''}
`);

  for (const h of ['agents', 'cursor', 'claude', 'codex']) {
    const skillDir = path.join(baseDir, HARNESS_CONFIG[h].dotDir, 'skills', skillName);
    if (fs.existsSync(skillDir)) {
      fs.rmSync(skillDir, { recursive: true, force: true });
      skillsRemoved++;
    }
  }

  const agentsRemoved =
    options.nativeAgents !== false ? removeNativeAgents(baseDir, isGlobal) : 0;

  console.log(`
          〜

  仕上がり
    skill trees removed: ${skillsRemoved}
    native agent files removed: ${agentsRemoved}

          〜
`);
}

function initProject(options = {}) {
  const cwd = process.cwd();
  const memDir = path.join(cwd, '.omakaseagent');
  const tastePath = path.join(memDir, 'taste.md');
  const decisionsPath = path.join(memDir, 'decisions.md');
  const agentsPath = path.join(cwd, 'AGENTS.md');
  const today = new Date().toISOString().slice(0, 10);

  console.log(`
          〜

  道
  init · project bootstrap
`);

  fs.mkdirSync(memDir, { recursive: true });

  if (!fs.existsSync(tastePath)) {
    fs.writeFileSync(
      tastePath,
      `# Omakase Taste Memory

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
`,
      'utf8'
    );
  }

  if (!fs.existsSync(decisionsPath)) {
    fs.writeFileSync(
      decisionsPath,
      `# Key Decisions

## ${today} — Omakase Standard Adopted
**Context**: Project initialized with \`omakase init\`.
**Decision**: Adopt Omakase Rules + Critique Rubric. Use native team leads as primary entry points; specialists are lead-delegated only.
**Why**: Establishes persistent taste memory and senior quality bar from day one.
**Revisit if**: Team changes standards or moves off Omakase.

`,
      'utf8'
    );
  }

  const omakaseSection = `
## Omakase Standards

This project follows the [Omakase](https://github.com/rblalock/omakaseagent) standard — senior craftsmanship, zero AI slop, mandatory critique.

**Native agents (primary entry points):**
- \`@omakase-engineer\` — implementation, architecture, refactoring
- \`@omakase-critic\` — quality enforcement and review
- \`@omakase-archivist\` — memory and decisions

Specialists (\`omakase-senior-reviewer\`, etc.) are internal — invoked by leads via Task, not directly.

**Memory:** \`.omakaseagent/taste.md\` and \`.omakaseagent/decisions.md\`

**Fallback router:** \`/omakase <goal>\` or the installed \`omakase\` skill when native agents are unavailable.
`;

  if (!fs.existsSync(agentsPath)) {
    fs.writeFileSync(agentsPath, `# AGENTS\n${omakaseSection}`, 'utf8');
  } else {
    const existing = fs.readFileSync(agentsPath, 'utf8');
    if (!existing.includes('## Omakase Standards')) {
      fs.appendFileSync(agentsPath, omakaseSection, 'utf8');
    }
  }

  const installOpts = {
    test: !!options.test,
    global: !!options.global,
    nativeAgents: options.nativeAgents !== false,
  };

  installProjectStack(installOpts);
  const initBase = installOpts.global ? os.homedir() : cwd;
  const nativeSummary = summarizeNativeAgents(initBase, !!installOpts.global);

  console.log(`
          〜

  仕上がり
    .omakaseagent/     taste + decisions
    AGENTS.md          Omakase section
    native:            ${formatNativeSummary(nativeSummary)}

  Next: @omakase-engineer <your task>
        or /omakase engineer <task> (skill fallback)

          〜
`);
}

function showHelp() {
  console.log(`
omakase v${VERSION}

          〜

  道
  omakase init [--test]
      Bootstrap .omakaseagent/, AGENTS.md, install skill + native agents
      (agents + opencode + codex; + cursor/claude if those dirs exist)

  omakase skills install [cursor|claude|agents|codex] [--test] [--global]
      Install skill + native omakase-* agents (default)
      --no-native-agents   skill only, no omakase-* agent files

  omakase skills uninstall [--global] [--test] [--no-native-agents]
      Remove installed skill and omakase-* agents

          〜

  心
  Primary: @omakase-engineer | @omakase-critic | @omakase-archivist
  Fallback: /omakase engineer | /omakase critique | /omakase <goal>

          〜
`);
}

const isTest = flag('--test') || flag('-t');
const isGlobal = flag('--global') || flag('-g');
const noNative = flag('--no-native-agents');
const installOpts = { test: isTest, global: isGlobal, nativeAgents: !noNative };

if (command === 'init') {
  initProject(installOpts);
} else if (command === 'skills' && sub === 'install') {
  const explicit = args[2] && !args[2].startsWith('-') ? args[2] : null;
  if (explicit) {
    installSkills(explicit, installOpts);
  } else {
    installProjectStack(installOpts);
  }
} else if (command === 'skills' && sub === 'uninstall') {
  const explicit = args[2] && !args[2].startsWith('-') ? args[2] : null;
  if (explicit) {
    uninstallSkills(explicit, installOpts);
  } else {
    uninstallProjectStack(installOpts);
  }
} else if (command === 'version' || command === '--version' || command === '-v') {
  console.log(VERSION);
} else if (!command || command === 'help' || command === '--help') {
  showHelp();
} else if (command === 'skills' && (sub === 'help' || !sub)) {
  showHelp();
} else {
  console.log(`
          〜

  Unknown command. See \`omakase help\`.

          〜
`);
  process.exit(1);
}