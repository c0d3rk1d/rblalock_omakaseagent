#!/usr/bin/env node
/**
 * E2E: fresh tmp repo → init → learn → seed backlog → approve charter →
 * drive loop iterations via omakase status until EMPTY. Mirrors loopcraft gate scenario.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const { computeStatus } = require('./omakase-status');

const OMAKASE_ROOT = path.resolve(__dirname, '..');
const CLI = path.join(OMAKASE_ROOT, 'bin/omakase.js');

function run(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function assert(cond, msg) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function gateTemplate(slug, plan) {
  return `# Gate: ${slug}

**Date:** 2026-06-12
**Review:** PENDING

## Seed

E2E tmp loop — plan ${plan}

## Scenarios

- Mechanical change applied

## Mechanical evidence

\`\`\`
node -e "require('./index.js')" — exit 0
\`\`\`

## Critic

Pass — fixture iteration. No P0/P1.

## Memory consulted

- E2E fixture only

## Risks / human decision

Tmp repo dogfood — discard after test.

**Review:** PENDING
`;
}

function queueIndex(rows) {
  return `# Backlog — execution plans

## Execution order & status

| Plan | Title | Priority | Effort | Risk | Depends on | Status |
|------|-------|----------|--------|------|------------|--------|
${rows.map((r) => `| ${r.plan} | ${r.title} | P1 | S | ${r.risk} | ${r.deps || '—'} | ${r.status} |`).join('\n')}
`;
}

function planFile(num, slug, title, fnBody) {
  return `# Plan ${num}: ${title}

## Status

- **Risk class:** 2
- **Depends on:** ${num === '002' ? '001' : 'none'}

## Steps

Add to \`index.js\`:

\`\`\`js
${fnBody}
\`\`\`

## Done criteria

- [ ] Function exported and runnable
`;
}

function readCharter(dir) {
  return fs.readFileSync(path.join(dir, '.omakaseagent/loops/backlog-drain.md'), 'utf8');
}

function writeCharter(dir, content) {
  fs.writeFileSync(path.join(dir, '.omakaseagent/loops/backlog-drain.md'), content);
}

function appendLedger(dir, row) {
  const p = path.join(dir, '.omakaseagent/loops/backlog-drain.md');
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  const line = `| ${row.n} | 2026-06-12 | ${row.item} | ${row.gate} | ${row.result} |`;
  let insertAt = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    const t = lines[i].trim();
    if (t.startsWith('|') && !t.includes('---') && !t.startsWith('| #')) {
      insertAt = i + 1;
      break;
    }
  }
  lines.splice(insertAt, 0, line);
  fs.writeFileSync(p, lines.join('\n'));
}

function setQueue(dir, rows) {
  fs.writeFileSync(path.join(dir, '.omakaseagent/backlog/README.md'), queueIndex(rows));
}

function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'omakase-loop-e2e-'));
  const results = [];

  try {
    // 1. Minimal Node repo
    fs.writeFileSync(
      path.join(tmp, 'package.json'),
      JSON.stringify({ name: 'loop-e2e-fixture', version: '1.0.0', main: 'index.js' }, null, 2)
    );
    fs.writeFileSync(path.join(tmp, 'index.js'), 'module.exports = {};\n');
    fs.writeFileSync(path.join(tmp, 'README.md'), '# loop-e2e-fixture\n');

    // 2. init + learn
    run(`node "${CLI}" init`, tmp);
    run(`node "${CLI}" learn`, tmp);
    assert(fs.existsSync(path.join(tmp, '.omakaseagent/factory.md')), 'factory.md exists');
    assert(fs.existsSync(path.join(tmp, '.omakaseagent/loops/backlog-drain.md')), 'charter exists');

    // 3. UNAPPROVED must halt
    let st = computeStatus(tmp).loops[0];
    assert(st.halt && st.halt.includes('UNAPPROVED'), 'UNAPPROVED halts');
    results.push('UNAPPROVED charter halts');

    // 4. Seed backlog (loopcraft scenario)
    const backlogDir = path.join(tmp, '.omakaseagent/backlog');
    fs.writeFileSync(
      path.join(backlogDir, '001-add-multiply.md'),
      planFile('001', 'add-multiply', 'Add multiply', 'exports.multiply = (a, b) => a * b;')
    );
    fs.writeFileSync(
      path.join(backlogDir, '002-add-divide.md'),
      planFile('002', 'add-divide', 'Add divide', 'exports.divide = (a, b) => a / b;')
    );
    fs.writeFileSync(
      path.join(backlogDir, '003-rotate-api-keys.md'),
      '# Plan 003: Rotate API keys\n\n## Status\n\n- **Risk class:** 3\n'
    );
    setQueue(tmp, [
      { plan: '001', title: 'Add multiply', risk: 2, status: 'TODO' },
      { plan: '002', title: 'Add divide', risk: 2, deps: '001', status: 'TODO' },
      { plan: '003', title: 'Rotate keys', risk: 3, status: 'TODO' },
    ]);

    // 5. Approve charter
    let charter = readCharter(tmp);
    charter = charter.replace(
      /\*\*Approval:\*\* UNAPPROVED[^\n]*/,
      '**Approval:** Approved by e2e-runner on 2026-06-12'
    );
    writeCharter(tmp, charter);

    st = computeStatus(tmp).loops[0];
    assert(!st.halt && st.next?.plan === '001', 'approved → next is 001');
    assert(st.flagged.length === 1 && st.flagged[0].plan === '003', '003 flagged over ceiling');
    results.push('approved charter picks 001, flags 003');

    const queue = () => {
      const raw = fs.readFileSync(path.join(tmp, '.omakaseagent/backlog/README.md'), 'utf8');
      return [
        { plan: '001', title: 'Add multiply', risk: 2, status: 'TODO' },
        { plan: '002', title: 'Add divide', risk: 2, deps: '001', status: 'TODO' },
        { plan: '003', title: 'Rotate keys', risk: 3, status: 'TODO' },
      ].map((r) => {
        const m = raw.match(new RegExp(`\\| ${r.plan} \\|[^\\n]+\\| ([A-Z]+)`));
        return { ...r, status: m ? m[1] : r.status };
      });
    };

    // 6. Iteration 1 — 001
    const idx = path.join(tmp, 'index.js');
    let code = fs.readFileSync(idx, 'utf8');
    fs.writeFileSync(idx, code.replace('{}', '{ multiply: (a, b) => a * b }'));
    const g1 = '.omakaseagent/gates/2026-06-12-001-multiply-gate.md';
    fs.writeFileSync(path.join(tmp, g1), gateTemplate('001-multiply', '001'));
    const q1 = queue().map((r) => ({ ...r, status: r.plan === '001' ? 'DONE' : r.status }));
    setQueue(tmp, q1);
    appendLedger(tmp, { n: 1, item: '001-add-multiply', gate: g1, result: 'DONE' });
    results.push('iteration 1: 001 DONE');

    st = computeStatus(tmp).loops[0];
    assert(!st.halt && st.next?.plan === '002', 'after 001 → next is 002');
    results.push('dependency unlocks 002');

    // 7. Iteration 2 — 002
    code = fs.readFileSync(idx, 'utf8');
    fs.writeFileSync(idx, code.replace('}', ', divide: (a, b) => a / b }'));
    const g2 = '.omakaseagent/gates/2026-06-12-002-divide-gate.md';
    fs.writeFileSync(path.join(tmp, g2), gateTemplate('002-divide', '002'));
    const q2 = q1.map((r) => ({ ...r, status: r.plan === '002' ? 'DONE' : r.status }));
    setQueue(tmp, q2);
    appendLedger(tmp, { n: 2, item: '002-add-divide', gate: g2, result: 'DONE' });
    results.push('iteration 2: 002 DONE');

    st = computeStatus(tmp).loops[0];
    assert(!st.halt && !st.next && st.flagged.length === 1, 'no eligible TODO — only 003 flagged');
    results.push('queue drained except flagged 003');

    // 8. Iteration 3 — skip 003
    const q3 = q2.map((r) => ({ ...r, status: r.plan === '003' ? 'BLOCKED (over ceiling)' : r.status }));
    setQueue(tmp, q3);
    appendLedger(tmp, { n: 3, item: '003-rotate-api-keys', gate: '—', result: 'SKIPPED (over ceiling)' });
    results.push('iteration 3: 003 SKIPPED');

    st = computeStatus(tmp).loops[0];
    assert(!st.halt && !st.next, 'still need EMPTY row');

    // 9. Iteration 4 — EMPTY
    appendLedger(tmp, { n: 4, item: '—', gate: '—', result: 'EMPTY' });
    st = computeStatus(tmp).loops[0];
    assert(st.halt && st.halt.includes('EMPTY'), 'EMPTY halts loop');
    results.push('iteration 4: EMPTY halts');

    // 10. CLI status exit codes
    try {
      run(`node "${CLI}" status --quiet`, tmp);
      assert(false, 'status should exit 2 when halted');
    } catch (e) {
      assert(e.status === 2, `status exit 2 on halt, got ${e.status}`);
    }
    results.push('CLI status --quiet exits 2 on halt');

    // 11. Gate heading contract
    const gateCheck = run(`node "${path.join(OMAKASE_ROOT, 'scripts/verify-gate-report.js')}" "${path.join(tmp, '.omakaseagent/gates')}"`, OMAKASE_ROOT);
    assert(gateCheck.includes('All 2 gate'), 'gate reports validated');
    results.push('verify-gate-report passes on loop gates');

    // 12. learn must not clobber backlog
    const queueBefore = fs.readFileSync(path.join(tmp, '.omakaseagent/backlog/README.md'), 'utf8');
    const ledgerBefore = readCharter(tmp);
    run(`node "${CLI}" learn`, tmp);
    const queueAfter = fs.readFileSync(path.join(tmp, '.omakaseagent/backlog/README.md'), 'utf8');
    assert(queueBefore === queueAfter, 'learn preserved backlog README');
    assert(readCharter(tmp).includes('EMPTY'), 'learn preserved ledger');
    results.push('re-learn preserves queue + ledger');

    // 13. Runnable artifact
    const out = run(`node -e "const m=require('./index.js'); console.log(m.multiply(3,4), m.divide(8,2))"`, tmp);
    assert(out === '12 4', `index.js runs: ${out}`);
    results.push('fixture code runs (12 4)');

    console.log('\nE2E loop tmp — ALL PASSED\n');
    for (const r of results) console.log(`  ✓ ${r}`);
    console.log(`\n  tmp: ${tmp}\n`);
  } catch (err) {
    console.error('\nE2E loop tmp — FAILED\n');
    console.error(`  ${err.message}`);
    console.error(`  tmp: ${tmp}\n`);
    process.exit(1);
  }
}

main();