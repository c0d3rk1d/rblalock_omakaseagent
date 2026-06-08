#!/usr/bin/env node
/**
 * CI: Class 2 path changes require a new gate report under gates/.
 * See skill/reference/dark-factory.md and examples/factory-e2e/.
 */

const { execSync } = require('child_process');
const { isClass2Path, isGatePath } = require('./factory-paths');

function git(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function resolveRange() {
  const base = process.env.GITHUB_BASE_SHA;
  const head = process.env.GITHUB_HEAD_SHA || 'HEAD';
  if (base && base !== '0000000000000000000000000000000000000000') {
    return { base, head, label: `${base.slice(0, 7)}..${head.slice(0, 7)}` };
  }
  try {
    const mergeBase = git('git merge-base origin/main HEAD');
    return { base: mergeBase, head: 'HEAD', label: `origin/main..HEAD` };
  } catch {
    return { base: 'HEAD~1', head: 'HEAD', label: 'HEAD~1..HEAD' };
  }
}

function listChangedFiles(base, head) {
  const out = git(`git diff --name-only --diff-filter=AMR ${base} ${head}`);
  return out ? out.split('\n').filter(Boolean) : [];
}

function listAddedFiles(base, head) {
  const out = git(`git diff --name-only --diff-filter=A ${base} ${head}`);
  return out ? out.split('\n').filter(Boolean) : [];
}

function main() {
  const { base, head, label } = resolveRange();
  const changed = listChangedFiles(base, head);
  const added = new Set(listAddedFiles(base, head));

  const class2Changed = changed.filter(isClass2Path);
  const newGates = [...added].filter(isGatePath);

  if (class2Changed.length === 0) {
    console.log(`verify:pr-gate-diff — no Class 2 paths in ${label}; gate not required.`);
    return;
  }

  console.log(`verify:pr-gate-diff — Class 2 paths (${class2Changed.length}) in ${label}:`);
  for (const f of class2Changed) console.log(`  - ${f}`);

  if (newGates.length > 0) {
    console.log(`✓ new gate report(s): ${newGates.join(', ')}`);
    return;
  }

  console.error(
    'verify:pr-gate-diff — Class 2 paths changed without a new gate report.\n' +
      'Add `.omakaseagent/gates/<date>-<slug>-gate.md` or `examples/<name>/gates/<date>-<slug>-gate.md`.\n' +
      'Gate shape must pass `npm run verify:gate-reports`.',
  );
  process.exit(1);
}

main();
