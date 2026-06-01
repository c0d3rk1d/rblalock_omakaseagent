#!/usr/bin/env node
/**
 * Omakase build — produces committed dist/ bundles for Cursor, Claude Code, agents harnesses.
 * Source of truth: skill/. Only skill/ + the 3 core OMAKASE-*.md files are emitted.
 * Strict guard + required-file checks. Follows Impeccable distribution model.
 *
 * Run: npm run build
 */

const fs = require('fs');
const path = require('path');
const { generateNativeAgents } = require('./native-agents/generate');

const root = path.resolve(__dirname, '..');
const skillSrc = path.join(root, 'skill');
const distRoot = path.join(root, 'dist');

// Clean previous dist (except we keep the dir structure for git)
function rimraf(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      rimraf(p);
      fs.rmdirSync(p);
    } else {
      fs.unlinkSync(p);
    }
  }
}

// Ensure the three target harness trees exist (they were pre-created)
const harnesses = [
  {
    name: 'cursor',
    targetDir: path.join(distRoot, 'cursor/.cursor/skills/omakase'),
  },
  {
    name: 'claude',
    targetDir: path.join(distRoot, 'claude/.claude/skills/omakase'),
  },
  {
    name: 'agents',
    targetDir: path.join(distRoot, 'agents/.agents/skills/omakase'),
  },
  {
    name: 'grok',
    targetDir: path.join(distRoot, 'grok/.grok/skills/omakase'),
  },
];

console.log('Omakase build starting...\n');

for (const h of harnesses) {
  // Clean target
  rimraf(h.targetDir);
  fs.mkdirSync(h.targetDir, { recursive: true });

  // Copy the entire skill/ content (SKILL.md + reference/)
  function copyRecursive(src, dst) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.mkdirSync(dst, { recursive: true });
      for (const entry of fs.readdirSync(src)) {
        copyRecursive(path.join(src, entry), path.join(dst, entry));
      }
    } else {
      fs.copyFileSync(src, dst);
    }
  }

  copyRecursive(skillSrc, h.targetDir);

  // Drop only the core philosophy documents that are part of the shipped standard.
  // OMAKASE-SPEC.md is the internal build plan and is deliberately excluded from distribution.
  const coreFiles = [
    'OMAKASE-PRINCIPLES.md',
    'OMAKASE-RULES.md',
    'OMAKASE-CRITIQUE.md',
  ];
  for (const f of coreFiles) {
    const src = path.join(root, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(h.targetDir, f));
    }
  }

  // Required payload check (fail fast if source is incomplete)
  const required = [
    'SKILL.md',
    'reference/engineering.md',
    'reference/critique.md',
    'reference/plan.md',
    'reference/init.md',
    'reference/taste.md',
    'reference/handoff.md',
    'reference/native-agents.md',
    'OMAKASE-PRINCIPLES.md',
    'OMAKASE-RULES.md',
    'OMAKASE-CRITIQUE.md',
  ];
  const missing = required.filter(f => !fs.existsSync(path.join(h.targetDir, f)));
  if (missing.length > 0) {
    console.error(`\nBUILD FAILED for ${h.name}: missing required files in bundle:`);
    missing.forEach(m => console.error('  ' + m));
    process.exit(1);
  }

  // Summary (high-signal)
  let fileCount = 0;
  function countFiles(d) {
    for (const e of fs.readdirSync(d)) {
      const p = path.join(d, e);
      if (fs.statSync(p).isDirectory()) countFiles(p);
      else fileCount++;
    }
  }
  countFiles(h.targetDir);
  const top = fs.readdirSync(h.targetDir).sort().join(', ');
  console.log(`✓ Built ${h.name} → ${path.relative(root, h.targetDir)}  (${fileCount} files)`);
  console.log(`    top-level: ${top}`);
}

const native = generateNativeAgents();
console.log(`\n✓ Native agents: ${native.count} personas → opencode, cursor, claude, grok, codex`);

// Ensure codex dist marker exists for install validation
const codexMarker = path.join(distRoot, 'codex/.codex');
fs.mkdirSync(codexMarker, { recursive: true });

// Strict distribution guard: only the intended files may ship in bundles.
// OMAKASE-SPEC.md (internal) + any stray files outside the three approved skill trees are rejected.
const FORBIDDEN_IN_DIST = ['OMAKASE-SPEC.md', '.git', 'node_modules', '.DS_Store'];
const ALLOWED_PREFIXES = [
  'dist/cursor/.cursor/skills/omakase/',
  'dist/cursor/.cursor/agents/',
  'dist/claude/.claude/skills/omakase/',
  'dist/claude/.claude/agents/',
  'dist/agents/.agents/skills/omakase/',
  'dist/agents/.opencode/agents/',
  'dist/grok/.grok/skills/omakase/',
  'dist/grok/.grok/agents/',
  'dist/codex/.codex/agents/',
];

function isAllowedDistPath(rel) {
  return ALLOWED_PREFIXES.some(p => rel.startsWith(p));
}

let violations = [];
function scan(dir, isFullDist = false) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const rel = path.relative(root, p);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      scan(p, isFullDist);
    } else {
      const isForbidden = FORBIDDEN_IN_DIST.some(f => entry === f || rel.includes(f));
      const isStray = isFullDist && !isAllowedDistPath(rel);
      if (isForbidden || isStray) {
        violations.push(rel);
      }
    }
  }
}

// Guard the leaves (original) + entire dist/ for strays
for (const h of harnesses) {
  scan(h.targetDir);
}
scan(distRoot, true);

if (violations.length > 0) {
  console.error('\nBUILD FAILED — forbidden or stray files found in dist/:');
  for (const v of violations) console.error('  ' + v);
  console.error('\nOnly the three harness skill trees (skill/ + 3× core OMAKASE-*.md) are allowed.');
  console.error('This violates the distribution contract. Fix and retry.');
  process.exit(1);
}

console.log('\nBuild complete. dist/ bundles ready (commit them).');
console.log('Guard passed — only approved skill content + 3 core standards present.');
console.log('Test: npx omakase skills install   (or npm run skills:install)\n');
