#!/usr/bin/env node
/**
 * Smoke-test native agent artifacts in dist/ (no API keys required).
 */

const fs = require('fs');
const path = require('path');
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
}

const specialistMd = path.join(paths.opencode, `${SPECIALIST}.md`);
if (!fs.existsSync(specialistMd)) {
  fail(`missing ${SPECIALIST}.md`);
} else {
  const t = read(specialistMd);
  if (!t.includes('hidden: true')) fail('specialist must be hidden');
  else ok('specialist has hidden: true');
  if (!t.includes('mode: subagent')) fail('specialist must be subagent mode');
  else ok('specialist has mode: subagent');
}

const skillRouter = path.join(distRoot, 'agents/.agents/skills/omakase/SKILL.md');
if (!read(skillRouter).includes('Native agent precedence')) {
  fail('SKILL.md missing native precedence section');
} else {
  ok('SKILL.md has native precedence');
}

if (!fs.existsSync(path.join(root, 'skill/reference/native-agents.md'))) {
  fail('missing skill/reference/native-agents.md');
} else {
  ok('reference/native-agents.md present');
}

try {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'omakase-verify-'));
  const ocAgents = path.join(tmp, '.opencode/agents');
  fs.mkdirSync(ocAgents, { recursive: true });
  for (const f of fs.readdirSync(paths.opencode)) {
    if (f.startsWith('omakase-')) {
      fs.copyFileSync(path.join(paths.opencode, f), path.join(ocAgents, f));
    }
  }
  const list = execSync('opencode agent list', { cwd: tmp, encoding: 'utf8', timeout: 15000 });
  for (const lead of LEADS) {
    if (!list.includes(`${lead} (`)) fail(`opencode list missing ${lead}`);
    else ok(`opencode lists ${lead}`);
  }
} catch (e) {
  fail(`opencode agent list: ${e.message}`);
}

// CLI install smoke (project-level)
try {
  const tmpInstall = fs.mkdtempSync(path.join(require('os').tmpdir(), 'omakase-install-'));
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

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nAll native agent checks passed.');