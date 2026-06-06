#!/usr/bin/env node
/**
 * Mechanical check: factory gate reports include required headings.
 * See skill/reference/learn.md and examples/factory-e2e/
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_CHECKS = [
  { label: 'Seed', test: (c) => c.includes('## Seed') },
  { label: 'Scenarios', test: (c) => c.includes('## Scenarios') },
  { label: 'Mechanical evidence', test: (c) => c.includes('## Mechanical evidence') },
  { label: 'Critic', test: (c) => c.includes('## Critic') },
  { label: 'Memory consulted', test: (c) => c.includes('## Memory consulted') },
  { label: 'Risks / human decision', test: (c) => /## Risks/.test(c) },
];

const DEFAULT_PATHS = [
  'examples/factory-e2e/gates',
  'examples/factory-dogfood/.omakaseagent/gates',
];

function listGateFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => path.join(dir, f));
}

function validateGate(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const missing = REQUIRED_CHECKS.filter(({ test }) => !test(content)).map(({ label }) => label);
  const hasTitle = /^#\s+Gate:/m.test(content);
  return { filePath, missing, hasTitle };
}

function main() {
  const roots = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PATHS;
  const files = roots.flatMap((r) => listGateFiles(path.resolve(r)));

  if (files.length === 0) {
    console.error('verify:gate-reports — no gate files found under:', roots.join(', '));
    process.exit(1);
  }

  let failed = false;
  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    const { missing, hasTitle } = validateGate(file);
    if (!hasTitle) {
      console.error(`✗ ${rel} — missing "# Gate:" title`);
      failed = true;
      continue;
    }
    if (missing.length) {
      console.error(`✗ ${rel} — missing headings: ${missing.join(', ')}`);
      failed = true;
      continue;
    }
    console.log(`✓ ${rel}`);
  }

  if (failed) process.exit(1);
  console.log(`All ${files.length} gate report(s) passed.`);
}

main();
