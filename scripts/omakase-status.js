#!/usr/bin/env node
/**
 * omakase status — deterministic loop-state check for agents and runners.
 * Reads .omakaseagent/loops/<slug>.md + backlog/README.md and computes what an
 * agent must otherwise re-derive every iteration: approval, Stop conditions,
 * and the next eligible queue item. See skill/reference/loops.md.
 *
 * Exit codes: 0 = work available, 2 = halted / no eligible work, 1 = error.
 */

const fs = require('fs');
const path = require('path');

function readSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function parseCharter(content) {
  const approvalLine = content.split('\n').find((l) => l.includes('**Approval:**')) || null;
  const approved = !!approvalLine && !approvalLine.includes('UNAPPROVED');

  const ceilingMatch = content.match(/\*\*Risk class ceiling:\*\*\s*(\d+)/);
  const capMatch = content.match(/Iteration cap:\s*(\d+)/i);

  const ledger = [];
  const ledgerSection = content.split(/^## Ledger\s*$/m)[1];
  if (ledgerSection) {
    for (const line of ledgerSection.split('\n')) {
      const cells = splitRow(line);
      if (!cells || !/^\d+$/.test(cells[0])) continue;
      ledger.push({
        item: cells[2] || '',
        gate: cells[3] || '',
        result: (cells[4] || '').trim(),
      });
    }
  }

  return {
    approvalLine: approvalLine ? approvalLine.trim() : null,
    approved,
    ceiling: ceilingMatch ? parseInt(ceilingMatch[1], 10) : null,
    cap: capMatch ? parseInt(capMatch[1], 10) : null,
    ledger,
  };
}

function splitRow(line) {
  const t = line.trim();
  if (!t.startsWith('|') || !t.endsWith('|')) return null;
  const cells = t.slice(1, -1).split('|').map((c) => c.trim());
  if (cells.every((c) => /^[-\s:]*$/.test(c))) return null; // separator row
  return cells;
}

/** Gate review marker: humans flip `**Review:**` to accepted/rejected at batch review. */
function gateReview(memDir, gateCell) {
  if (!gateCell || /^[—\-\s]*$/.test(gateCell)) return null; // no gate on this row
  const rel = gateCell.replace(/^\.omakaseagent\//, '').replace(/^`|`$/g, '');
  const content = readSafe(path.join(memDir, rel));
  if (content === null) return { rel, state: 'missing' };
  const line = content.split('\n').find((l) => l.includes('**Review:**'));
  if (!line) return { rel, state: 'pending' };
  const t = line.toLowerCase();
  if (t.includes('rejected')) return { rel, state: 'rejected' };
  if (t.includes('accepted')) return { rel, state: 'accepted' };
  return { rel, state: 'pending' };
}

/** Queue index columns: Plan | Title | Priority | Effort | Risk | Depends on | Status */
function parseQueue(content) {
  const items = [];
  for (const line of content.split('\n')) {
    const cells = splitRow(line);
    if (!cells || cells.length < 7 || !/^\d+$/.test(cells[0])) continue;
    const statusWord = (cells[6].toUpperCase().match(/^[A-Z]+(?:\s+[A-Z]+)?/) || [''])[0].trim();
    items.push({
      plan: cells[0],
      title: cells[1],
      risk: parseInt(cells[4], 10),
      deps: /^[—\-\s]*$/.test(cells[5]) ? [] : cells[5].match(/\d+/g) || [],
      status: statusWord.startsWith('IN') ? 'IN PROGRESS' : statusWord,
    });
  }
  return items;
}

const UPSHIFT_STREAK = 5; // accepted gates in a row before an upshift proposal (reference/loops.md gearbox)

function evaluate(charter, queue, memDir) {
  const iterations = charter.ledger.filter((r) => r.result !== 'EMPTY' && !r.result.startsWith('EMPTY'));
  const last = charter.ledger[charter.ledger.length - 1] || null;
  const resultWord = (r) => (r ? r.result.split(/[\s(]/)[0] : '');

  const reviews = charter.ledger.map((r) => gateReview(memDir, r.gate));
  const rejected = reviews.find((rv) => rv && rv.state === 'rejected') || null;
  const accepted = reviews.filter((rv) => rv && rv.state === 'accepted').length;
  const pending = reviews.filter((rv) => rv && (rv.state === 'pending' || rv.state === 'missing')).length;

  let acceptedStreak = 0;
  for (let i = charter.ledger.length - 1; i >= 0; i--) {
    const row = charter.ledger[i];
    if (resultWord(row) === 'EMPTY' || resultWord(row) === 'SKIPPED') continue;
    if (resultWord(row) === 'DONE' && reviews[i] && reviews[i].state === 'accepted') acceptedStreak++;
    else break;
  }

  let halt = null;
  if (!charter.approvalLine) {
    halt = 'charter has no Approval line — add one; agents halt without it';
  } else if (!charter.approved) {
    halt = 'charter UNAPPROVED — human approval required before any run';
  } else if (charter.ceiling === null) {
    halt = 'charter has no risk class ceiling — fix the Scope section';
  } else if (rejected) {
    halt = `gate rejected at review (${rejected.rel}) — downshift; fix and get human re-accept before looping`;
  } else if (last && resultWord(last) === 'HALT') {
    halt = `ledger shows HALT (${last.result})`;
  } else if (last && resultWord(last) === 'EMPTY') {
    halt = 'ledger shows EMPTY — queue was drained';
  } else if (charter.cap !== null && iterations.length >= charter.cap) {
    halt = `iteration cap reached (${iterations.length} of ${charter.cap})`;
  } else if (
    charter.ledger.length >= 2 &&
    resultWord(charter.ledger[charter.ledger.length - 1]) === 'FAILED' &&
    resultWord(charter.ledger[charter.ledger.length - 2]) === 'FAILED'
  ) {
    halt = 'two consecutive failed iterations';
  }

  const done = new Set(queue.filter((i) => i.status === 'DONE').map((i) => i.plan));
  let next = null;
  const flagged = [];
  const waiting = [];
  for (const item of queue) {
    if (item.status !== 'TODO') continue;
    if (charter.ceiling !== null && item.risk > charter.ceiling) {
      flagged.push(item);
      continue;
    }
    if (!item.deps.every((d) => done.has(d) || done.has(d.padStart(3, '0')))) {
      waiting.push(item);
      continue;
    }
    if (!next) next = item;
  }

  const counts = {};
  for (const item of queue) counts[item.status] = (counts[item.status] || 0) + 1;

  return {
    halt,
    next: halt ? null : next,
    flagged,
    waiting,
    counts,
    iterations: iterations.length,
    last,
    reviews: { accepted, pending, total: reviews.filter(Boolean).length },
    acceptedStreak,
    upshiftEligible: acceptedStreak >= UPSHIFT_STREAK,
  };
}

function computeStatus(cwd, options = {}) {
  const memDir = path.join(cwd, '.omakaseagent');
  const loopsDir = path.join(memDir, 'loops');
  if (!fs.existsSync(memDir)) {
    return { error: 'missing_omakaseagent', message: 'No .omakaseagent/ here — run `omakase init` then `omakase learn`.' };
  }
  if (!fs.existsSync(loopsDir)) {
    return { error: 'missing_loops', message: 'No .omakaseagent/loops/ — run `omakase learn` to scaffold a charter.' };
  }

  let slugs = fs
    .readdirSync(loopsDir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => f.replace(/\.md$/, ''));
  if (options.loop) slugs = slugs.filter((s) => s === options.loop);
  if (slugs.length === 0) {
    return {
      error: 'missing_charter',
      message: options.loop
        ? `No charter named '${options.loop}' under .omakaseagent/loops/.`
        : 'No loop charters under .omakaseagent/loops/ — run `omakase learn`.',
    };
  }

  const queueRaw = readSafe(path.join(memDir, 'backlog', 'README.md'));
  const queue = queueRaw ? parseQueue(queueRaw) : [];
  const queueError = queueRaw
    ? queue.length === 0
      ? 'no parseable plan table in backlog/README.md'
      : null
    : 'missing .omakaseagent/backlog/README.md';

  const loops = slugs.map((slug) => {
    const charterPath = path.join(loopsDir, `${slug}.md`);
    const charter = parseCharter(readSafe(charterPath) || '');
    return { slug, charterPath: path.relative(cwd, charterPath), charter, queueError, ...evaluate(charter, queue, memDir) };
  });

  return { loops, workAvailable: loops.some((l) => l.next) };
}

function formatLoop(l) {
  const lines = [`loop: ${l.slug}`];
  lines.push(`  charter:    ${l.charterPath}`);
  lines.push(`  approval:   ${l.charter.approved ? 'approved' : 'NOT APPROVED'}${l.charter.approvalLine ? ` — ${l.charter.approvalLine.replace('**Approval:**', '').trim()}` : ''}`);
  lines.push(
    `  iterations: ${l.iterations}${l.charter.cap !== null ? ` of cap ${l.charter.cap}` : ''}${l.last ? ` (last: ${l.last.result})` : ''}`
  );
  if (l.reviews.total > 0) {
    lines.push(`  review:     ${l.reviews.accepted} accepted / ${l.reviews.pending} awaiting human review`);
  }
  lines.push(`  stop:       ${l.halt ? `HALT — ${l.halt}` : 'CLEAR'}`);
  if (l.upshiftEligible) {
    lines.push(`  upshift:    ${l.acceptedStreak} accepted gates in a row — propose promotion via decisions.md (human approves)`);
  }
  if (!l.halt) {
    if (l.next) {
      lines.push(`  next:       ${l.next.plan} ${l.next.title} (risk ${l.next.risk} <= ceiling ${l.charter.ceiling})`);
    } else if (l.queueError) {
      lines.push(`  next:       none — ${l.queueError}`);
    } else {
      lines.push('  next:       none — queue drained; append an EMPTY ledger row and stop');
    }
  }
  for (const f of l.flagged) {
    lines.push(`  flagged:    ${f.plan} ${f.title} (risk ${f.risk} > ceiling ${l.charter.ceiling}) — needs interactive run`);
  }
  for (const w of l.waiting) {
    lines.push(`  waiting:    ${w.plan} ${w.title} (depends on ${w.deps.join(', ')})`);
  }
  const countStr = Object.entries(l.counts)
    .map(([k, v]) => `${v} ${k}`)
    .join(' / ');
  lines.push(`  queue:      ${countStr || 'empty'}`);
  return lines;
}

function runStatus(options = {}) {
  const result = computeStatus(process.cwd(), options);
  if (result.error) {
    console.log(`error: ${result.message}`);
    process.exit(1);
  }
  for (const l of result.loops) {
    if (options.quiet) {
      console.log(
        l.halt ? `${l.slug}: HALT — ${l.halt}` : l.next ? `${l.slug}: NEXT ${l.next.plan} ${l.next.title}` : `${l.slug}: EMPTY`
      );
    } else {
      console.log(formatLoop(l).join('\n'));
    }
  }
  process.exit(result.workAvailable ? 0 : 2);
}

module.exports = { computeStatus, parseCharter, parseQueue, evaluate, formatLoop, runStatus };
