#!/usr/bin/env node
/** Mechanical check: omakase status computes loop state correctly on fixtures. */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { computeStatus, listPendingGates } = require('./omakase-status');

const APPROVED = '**Approval:** Approved by tester on 2026-06-12.';
const UNAPPROVED = '**Approval:** UNAPPROVED — a human replaces this line before any unattended run.';

function gateFile(review) {
  return `# Gate: fixture\n\n**Review:** ${review}\n\n## Seed\n`;
}

function charter({ approval = APPROVED, ceiling = 2, cap = 5, ledgerRows = [] } = {}) {
  return `# Loop: backlog-drain

## Intent

Drain the backlog.

${approval}

## Scope

- **Queue:** \`.omakaseagent/backlog/README.md\`
- **Risk class ceiling:** ${ceiling}

## Stop

- Queue empty
- Iteration cap: ${cap}

## Ledger

| # | Date | Item | Gate | Result |
|---|------|------|------|--------|
${ledgerRows.map((r, i) => `| ${i + 1} | 2026-06-12 | ${r.item || 'backlog/00x.md'} | ${r.gate || '—'} | ${r.result} |`).join('\n')}
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

function fixture(charterMd, queueMd, gates = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'omakase-status-'));
  fs.mkdirSync(path.join(dir, '.omakaseagent', 'loops'), { recursive: true });
  fs.mkdirSync(path.join(dir, '.omakaseagent', 'backlog'), { recursive: true });
  fs.mkdirSync(path.join(dir, '.omakaseagent', 'gates'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.omakaseagent', 'loops', 'backlog-drain.md'), charterMd);
  if (queueMd !== null) {
    fs.writeFileSync(path.join(dir, '.omakaseagent', 'backlog', 'README.md'), queueMd);
  }
  for (const [name, content] of Object.entries(gates)) {
    fs.writeFileSync(path.join(dir, '.omakaseagent', 'gates', name), content);
  }
  return dir;
}

const BASE_QUEUE = [
  { plan: '001', title: 'Add multiply', risk: 2, status: 'TODO' },
  { plan: '002', title: 'Add divide', risk: 2, deps: '001', status: 'TODO' },
  { plan: '003', title: 'Rotate keys', risk: 3, status: 'TODO' },
];

const cases = [
  {
    name: 'approved charter picks first eligible item, flags over-ceiling',
    dir: () => fixture(charter(), queueIndex(BASE_QUEUE)),
    expect: (l) => !l.halt && l.next?.plan === '001' && l.flagged.length === 1 && l.flagged[0].plan === '003' && l.waiting.length === 1,
  },
  {
    name: 'dependency unlocks after DONE',
    dir: () =>
      fixture(
        charter({ ledgerRows: [{ result: 'DONE' }] }),
        queueIndex([{ ...BASE_QUEUE[0], status: 'DONE' }, BASE_QUEUE[1], BASE_QUEUE[2]])
      ),
    expect: (l) => !l.halt && l.next?.plan === '002' && l.waiting.length === 0,
  },
  {
    name: 'UNAPPROVED charter halts',
    dir: () => fixture(charter({ approval: UNAPPROVED }), queueIndex(BASE_QUEUE)),
    expect: (l) => l.halt && l.halt.includes('UNAPPROVED') && !l.next,
  },
  {
    name: 'missing Approval line halts',
    dir: () => fixture(charter({ approval: '' }), queueIndex(BASE_QUEUE)),
    expect: (l) => l.halt && l.halt.includes('no Approval line'),
  },
  {
    name: 'approved line mentioning UNAPPROVED in prose stays approved',
    dir: () =>
      fixture(
        charter({ approval: '**Approval:** Approved by rblalock on 2026-06-12 (generated charters say UNAPPROVED until a human replaces the line).' }),
        queueIndex(BASE_QUEUE)
      ),
    expect: (l) => !l.halt && l.next?.plan === '001',
  },
  {
    name: 'approval value not starting with approved fails safe',
    dir: () => fixture(charter({ approval: '**Approval:** pending sign-off from team lead' }), queueIndex(BASE_QUEUE)),
    expect: (l) => l.halt && l.halt.includes('UNAPPROVED'),
  },
  {
    name: 'iteration cap halts',
    dir: () =>
      fixture(
        charter({ cap: 3, ledgerRows: [{ result: 'DONE' }, { result: 'DONE' }, { result: 'SKIPPED (over ceiling)' }] }),
        queueIndex(BASE_QUEUE)
      ),
    expect: (l) => l.halt && l.halt.includes('cap'),
  },
  {
    name: 'EMPTY ledger row halts',
    dir: () => fixture(charter({ ledgerRows: [{ result: 'DONE' }, { result: 'EMPTY (no eligible items remain)' }] }), queueIndex(BASE_QUEUE)),
    expect: (l) => l.halt && l.halt.includes('EMPTY'),
  },
  {
    name: 'two consecutive FAILED halts',
    dir: () => fixture(charter({ ledgerRows: [{ result: 'FAILED' }, { result: 'FAILED' }] }), queueIndex(BASE_QUEUE)),
    expect: (l) => l.halt && l.halt.includes('consecutive'),
  },
  {
    name: 'drained queue reports none + EMPTY advice',
    dir: () => fixture(charter(), queueIndex(BASE_QUEUE.map((r) => ({ ...r, status: r.plan === '003' ? 'BLOCKED (ceiling)' : 'DONE' })))),
    expect: (l) => !l.halt && !l.next && l.flagged.length === 0,
  },
  {
    name: 'missing queue table reported, no work',
    dir: () => fixture(charter(), null),
    expect: (l) => !l.halt && !l.next && l.queueError,
  },
  {
    name: 'rejected gate review halts the loop',
    dir: () =>
      fixture(
        charter({ ledgerRows: [{ result: 'DONE', gate: 'gates/g1.md' }, { result: 'DONE', gate: 'gates/g2.md' }] }),
        queueIndex(BASE_QUEUE),
        { 'g1.md': gateFile('accepted by tester 2026-06-12'), 'g2.md': gateFile('rejected — wrong shape') }
      ),
    expect: (l) => l.halt && l.halt.includes('rejected') && l.halt.includes('g2.md') && !l.next,
  },
  {
    name: 'pending reviews counted, no halt',
    dir: () =>
      fixture(
        charter({ ledgerRows: [{ result: 'DONE', gate: 'gates/g1.md' }] }),
        queueIndex(BASE_QUEUE),
        { 'g1.md': gateFile('PENDING — human flips at batch review') }
      ),
    expect: (l) => !l.halt && l.reviews.pending === 1 && l.next?.plan === '001' && l.acceptedStreak === 0,
  },
  {
    name: 'gate file without Review line counts as pending',
    dir: () =>
      fixture(
        charter({ ledgerRows: [{ result: 'DONE', gate: 'gates/g1.md' }] }),
        queueIndex(BASE_QUEUE),
        { 'g1.md': '# Gate: fixture\n\n## Seed\n' }
      ),
    expect: (l) => !l.halt && l.reviews.pending === 1,
  },
  {
    name: 'IN PROGRESS queue row halts (crashed iteration guard)',
    dir: () => fixture(charter(), queueIndex([{ ...BASE_QUEUE[0], status: 'IN PROGRESS' }, BASE_QUEUE[1], BASE_QUEUE[2]])),
    expect: (l) => l.halt && l.halt.includes('IN PROGRESS') && !l.next,
  },
  {
    name: 'five accepted gates in a row flags upshift eligibility',
    dir: () =>
      fixture(
        charter({
          cap: 10,
          ledgerRows: [1, 2, 3, 4, 5].map((n) => ({ result: 'DONE', gate: `gates/g${n}.md` })),
        }),
        queueIndex(BASE_QUEUE),
        Object.fromEntries([1, 2, 3, 4, 5].map((n) => [`g${n}.md`, gateFile(`accepted by tester (gate ${n})`)]))
      ),
    expect: (l) => !l.halt && l.acceptedStreak === 5 && l.upshiftEligible && l.next?.plan === '001',
  },
];

let failed = false;
for (const c of cases) {
  const dir = c.dir();
  const result = computeStatus(dir);
  const loop = result.loops?.[0];
  const ok = loop && c.expect(loop);
  if (!ok) {
    console.error(`✗ ${c.name}`);
    console.error('    got:', JSON.stringify(loop, null, 2).slice(0, 600));
    failed = true;
  } else {
    console.log(`✓ ${c.name}`);
  }
  fs.rmSync(dir, { recursive: true, force: true });
}

{
  const dir = fixture(charter(), queueIndex(BASE_QUEUE), {
    '2026-06-12-a-gate.md': '# Gate: a\n\n**Review:** PENDING\n\n## Seed\n',
    '2026-06-12-b-gate.md': '# Gate: b\n\n**Review:** accepted by tester 2026-06-12\n\n## Seed\n',
  });
  const pending = listPendingGates(path.join(dir, '.omakaseagent'));
  if (pending.length !== 1 || !pending[0].rel.includes('a-gate')) {
    console.error('✗ listPendingGates returns only pending gates');
    failed = true;
  } else {
    console.log('✓ listPendingGates returns only pending gates');
  }
  fs.rmSync(dir, { recursive: true, force: true });
}

if (failed) process.exit(1);
console.log(`All ${cases.length + 1} status checks passed.`);
