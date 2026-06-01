#!/usr/bin/env node
/**
 * Smoke-test native agent artifacts in dist/ (no API keys required).
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const distRoot = path.join(root, 'dist');

const LEADS = ['omakase-engineer', 'omakase-critic', 'omakase-archivist'];
const SPECIALIST = 'omakase-senior-reviewer';
const PERSONA_COUNT = 11;

const paths = {
  opencode: path.join(distRoot, 'agents/.opencode/agents'),
  cursor: path.join(distRoot, 'cursor/.cursor/agents'),
  claude: path.join(distRoot, 'claude/.claude/agents'),
  grok: path.join(distRoot, 'grok/.grok/agents'),
  codex: path.join(distRoot, 'codex/.codex/agents'),
};

let failed = 0;

function fail(msg) {
  console.error(`✗ ${msg}`);
  failed++;
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

function countOmakase(dir, ext) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => f.startsWith('omakase-') && f.endsWith(ext)).length;
}

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

for (const [name, dir] of Object.entries(paths)) {
  const ext = name === 'codex' ? '.toml' : '.md';
  const n = countOmakase(dir, ext);
  if (n !== PERSONA_COUNT) {
    fail(`${name}: expected ${PERSONA_COUNT} omakase-*${ext}, got ${n}`);
  } else {
    ok(`${name}: ${n} agent files`);
  }
}

const engineerMd = path.join(paths.opencode, 'omakase-engineer.md');
if (!fs.existsSync(engineerMd)) {
  fail('missing omakase-engineer.md');
} else {
  const t = read(engineerMd);
  if (!t.includes('mode: all')) fail('engineer must have mode: all (OpenCode)');
  else ok('engineer has mode: all');
  if (!t.includes('omakase-senior-reviewer')) fail('engineer missing delegation ids');
  else ok('engineer lists delegation targets');
  if (!t.includes('task:')) fail('engineer missing task permissions');
  else ok('engineer has task permissions');
  if (!t.includes('{file:')) fail('markdown agents should use {file:} includes');
  else ok('opencode uses {file:} includes');
}

const specialistMd = path.join(paths.opencode, SPECIALIST + '.md');
if (!fs.existsSync(specialistMd)) {
  fail(`missing ${SPECIALIST}.md`);
} else {
  const t = read(specialistMd);
  if (!t.includes('hidden: true')) fail('specialist must be hidden (OpenCode)');
  else ok('specialist has hidden: true');
  if (!t.includes('INTERNAL ONLY')) fail('specialist description must signal INTERNAL ONLY');
  else ok('specialist has INTERNAL ONLY description');
}

const grokEngineer = path.join(paths.grok, 'omakase-engineer.md');
if (!fs.existsSync(grokEngineer)) {
  fail('missing grok omakase-engineer.md');
} else {
  const t = read(grokEngineer);
  if (!t.includes('name: omakase-engineer')) fail('grok engineer missing name');
  else ok('grok engineer frontmatter');
  if (!t.includes('prompt_mode: full')) fail('grok engineer missing prompt_mode');
  else ok('grok engineer prompt_mode');
}

const skillRouter = path.join(distRoot, 'agents/.agents/skills/omakase/SKILL.md');
const skillText = read(skillRouter);
if (!skillText.includes('Native agent precedence')) {
  fail('SKILL.md missing native precedence section');
} else {
  ok('SKILL.md has native precedence');
}
if (!skillText.includes('name: omakase-router')) {
  fail('SKILL.md must be named omakase-router (not omakase) to avoid @omakase-* hijack');
} else {
  ok('skill named omakase-router');
}

if (!fs.existsSync(path.join(distRoot, 'grok/.grok/skills/omakase/SKILL.md'))) {
  fail('missing grok skill bundle');
} else {
  ok('grok skill bundle present');
}

if (!fs.existsSync(path.join(root, 'skill/reference/native-agents.md'))) {
  fail('missing skill/reference/native-agents.md');
} else {
  ok('reference/native-agents.md present');
}

try {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'omakase-verify-'));
  const ocAgents = path.join(tmp, '.opencode/agents');
  fs.mkdirSync(ocAgents, { recursive: true });
  for (const f of fs.readdirSync(paths.opencode)) {
    if (f.startsWith('omakase-')) {
      fs.copyFileSync(path.join(paths.opencode, f), path.join(ocAgents, f));
    }
  }
  for (const lead of LEADS) {
    const p = path.join(ocAgents, `${lead}.md`);
    if (!fs.existsSync(p)) fail(`opencode layout missing ${lead}.md`);
    else ok(`opencode agent file ${lead}.md`);
  }
} catch (e) {
  fail(`opencode layout: ${e.message}`);
}

try {
  const tmpInstall = fs.mkdtempSync(path.join(os.tmpdir(), 'omakase-install-'));
  execSync(`node "${path.join(root, 'bin/omakase.js')}" skills install agents --test`, {
    cwd: tmpInstall,
    encoding: 'utf8',
    timeout: 30000,
  });
  const ocDir = path.join(tmpInstall, '.opencode/agents');
  const n = countOmakase(ocDir, '.md');
  if (n !== PERSONA_COUNT) fail(`CLI install: expected ${PERSONA_COUNT} in .opencode/agents, got ${n}`);
  else ok('CLI install agents --test → .opencode/agents');
  fs.rmSync(tmpInstall, { recursive: true, force: true });
} catch (e) {
  fail(`CLI install smoke: ${e.message}`);
}

try {
  const tmpGrok = fs.mkdtempSync(path.join(os.tmpdir(), 'omakase-grok-install-'));
  execSync(`node "${path.join(root, 'bin/omakase.js')}" skills install grok --test`, {
    cwd: tmpGrok,
    encoding: 'utf8',
    timeout: 30000,
  });
  const grokDir = path.join(tmpGrok, '.grok/agents');
  const n = countOmakase(grokDir, '.md');
  if (n !== PERSONA_COUNT) fail(`grok install: expected ${PERSONA_COUNT} agents, got ${n}`);
  else ok('CLI install grok --test → .grok/agents');
  fs.rmSync(tmpGrok, { recursive: true, force: true });
} catch (e) {
  fail(`grok install smoke: ${e.message}`);
}

try {
  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'omakase-global-home-'));
  const tmpGlobal = path.join(fakeHome, 'project');
  fs.mkdirSync(tmpGlobal, { recursive: true });
  execSync(`node "${path.join(root, 'bin/omakase.js')}" skills install agents --global --test`, {
    cwd: tmpGlobal,
    env: { ...process.env, HOME: fakeHome },
    encoding: 'utf8',
    timeout: 30000,
  });
  const globalOc = path.join(fakeHome, '.config', 'opencode', 'agents');
  const n = countOmakase(globalOc, '.md');
  if (n !== PERSONA_COUNT) {
    fail(`global install: expected ${PERSONA_COUNT} in ~/.config/opencode/agents, got ${n}`);
  } else {
    ok('global install → ~/.config/opencode/agents');
  }
  fs.rmSync(fakeHome, { recursive: true, force: true });
} catch (e) {
  fail(`global install smoke: ${e.message}`);
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nAll native agent checks passed.');