#!/usr/bin/env node
/** Smoke: omakase learn plans files for cwd (omakaseagent dev clone). */

const { planLearn } = require('./omakase-learn');
const path = require('path');
const fs = require('fs');

const cwd = path.resolve(__dirname, '..');
const memDir = path.join(cwd, '.omakaseagent');

if (!fs.existsSync(memDir)) {
  console.error('verify:learn — run from repo with .omakaseagent/ (npx omakase init)');
  process.exit(1);
}

const plan = planLearn(cwd, {});
if (plan.error) {
  console.error('verify:learn —', plan.message);
  process.exit(1);
}

const onDisk = (sub) => fs.existsSync(path.join(memDir, sub));
const mustPlan = (sub) => plan.files.some((f) => f.path.includes(sub));
const checks = [
  ['factory.md', mustPlan('factory.md') || onDisk('factory.md')],
  [
    'scenarios',
    mustPlan(path.join('scenarios', 'mechanical-build.md')) ||
      onDisk(path.join('scenarios', 'mechanical-build.md')),
  ],
  ['stack detects Omakase', plan.stack.some((s) => s.includes('Omakase'))],
];

let failed = false;
for (const [name, ok] of checks) {
  if (!ok) {
    console.error(`✗ ${name}`);
    failed = true;
  } else {
    console.log(`✓ ${name}`);
  }
}

if (failed) process.exit(1);
console.log('All learn smoke checks passed.');
