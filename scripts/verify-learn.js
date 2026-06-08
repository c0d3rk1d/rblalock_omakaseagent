#!/usr/bin/env node
/** Smoke: omakase learn plans factory layout for this repo (CI-safe — no local .omakaseagent/). */

const { planLearn } = require('./omakase-learn');
const path = require('path');

const cwd = path.resolve(__dirname, '..');
const plan = planLearn(cwd, { allowNoMem: true });

if (plan.error) {
  console.error('verify:learn —', plan.message);
  process.exit(1);
}

const mustPlan = (sub) => plan.files.some((f) => f.path.includes(sub));
const checks = [
  ['factory.md planned', mustPlan('factory.md')],
  [
    'scenarios planned',
    mustPlan(path.join('scenarios', 'mechanical-build.md')) ||
      plan.scenarios.includes('mechanical-build'),
  ],
  ['stack detects Omakase', plan.stack.some((s) => s.includes('Omakase'))],
  [
    'mechanical checks include verify scripts',
    plan.checks.some((c) => c.cmd.includes('verify:')),
  ],
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
