#!/usr/bin/env node
/**
 * Phase E: drift audit — skill source vs dist native agents vs TEAMS.md.
 * See skill/reference/team-architecture.md and archivist-workflows.md § Drift audit.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');

const LEAD_SOURCES = {
  'omakase-engineer': 'skill/teams/engineering/lead.md',
  'omakase-critic': 'skill/teams/critics/lead.md',
  'omakase-archivist': 'skill/teams/archives/lead.md',
};

const DIST_LEAD_PATHS = {
  cursor: 'dist/cursor/.cursor/agents',
  claude: 'dist/claude/.claude/agents',
  opencode: 'dist/agents/.opencode/agents',
};

function readSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

function parseDescription(md) {
  const fm = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const line = fm[1].split('\n').find((l) => l.startsWith('description:'));
  if (!line) return null;
  return line.replace(/^description:\s*/, '').replace(/^["']|["']$/g, '').trim();
}

function checkTeamsRoster() {
  const teams = readSafe(path.join(root, 'skill/TEAMS.md'));
  const errors = [];
  if (!teams) {
    errors.push('missing skill/TEAMS.md');
    return errors;
  }
  for (const id of Object.keys(LEAD_SOURCES)) {
    if (!teams.includes(id)) errors.push(`TEAMS.md missing lead id ${id}`);
  }
  return errors;
}

function checkDistIncludesSource() {
  const errors = [];
  for (const [id, srcRel] of Object.entries(LEAD_SOURCES)) {
    const src = readSafe(path.join(root, srcRel));
    if (!src) {
      errors.push(`missing source ${srcRel}`);
      continue;
    }
    const srcDesc = parseDescription(src);
    for (const [label, distDir] of Object.entries(DIST_LEAD_PATHS)) {
      const agentPath = path.join(root, distDir, `${id}.md`);
      const agent = readSafe(agentPath);
      if (!agent) {
        errors.push(`${label}: missing ${id}.md`);
        continue;
      }
      if (!agent.includes('teams/')) {
        errors.push(`${label}: ${id}.md missing teams/ include`);
      }
      const distDesc = parseDescription(agent);
      if (srcDesc && distDesc && !distDesc.includes(srcDesc.slice(0, 40))) {
        errors.push(`${label}: ${id} description drift from source (re-run build)`);
      }
    }
  }
  return errors;
}

function checkPersonaCount() {
  const errors = [];
  try {
    const out = execSync('node scripts/native-agents/generate.js --dry-run 2>/dev/null || true', {
      cwd: root,
      encoding: 'utf8',
    });
    if (out.includes('error')) errors.push('native-agents generate dry-run reported errors');
  } catch {
    // generate.js may not support --dry-run; fall back to file count
  }
  const personaDir = path.join(root, 'skill/teams');
  let personaCount = 0;
  function walk(d) {
    for (const e of fs.readdirSync(d)) {
      const p = path.join(d, e);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (e.endsWith('.md')) personaCount++;
    }
  }
  walk(personaDir);
  if (personaCount < 10) errors.push(`expected ≥10 persona files under skill/teams/, found ${personaCount}`);
  return errors;
}

function main() {
  const checks = [
    ['TEAMS.md roster', checkTeamsRoster],
    ['dist lead bundles', checkDistIncludesSource],
    ['persona tree', checkPersonaCount],
  ];

  let failed = false;
  for (const [name, fn] of checks) {
    const errors = fn();
    if (errors.length) {
      console.error(`✗ ${name}`);
      for (const e of errors) console.error(`    ${e}`);
      failed = true;
    } else {
      console.log(`✓ ${name}`);
    }
  }

  if (failed) {
    console.error('verify:drift — run `npm run build` and compare skill/ vs dist/');
    process.exit(1);
  }
  console.log('All drift checks passed.');
}

main();
