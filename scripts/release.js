#!/usr/bin/env node
/**
 * Release omakaseagent: verify, bump version, publish, push tag.
 *
 * Usage:
 *   npm run release patch
 *   npm run release minor -- --dry-run
 *   npm run release patch -- --no-push
 */

const { execSync } = require('child_process');

const LEVELS = new Set(['patch', 'minor', 'major']);
const args = process.argv.slice(2);
const level = args.find((a) => LEVELS.has(a));
const dryRun = args.includes('--dry-run');
const noPush = args.includes('--no-push');

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}\n`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function git(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function fail(msg) {
  console.error(`\nrelease — ${msg}`);
  process.exit(1);
}

function usage() {
  console.error('Usage: npm run release <patch|minor|major> [-- --dry-run] [-- --no-push]');
  process.exit(1);
}

function assertGuards() {
  if (git('git status --porcelain')) {
    fail('working tree is not clean — commit or stash changes first');
  }

  const branch = git('git branch --show-current');
  if (branch !== 'main') {
    fail(`expected branch "main", got "${branch}"`);
  }

  try {
    run('git fetch origin main', { stdio: 'pipe' });
  } catch {
    fail('could not fetch origin/main — check network and remote');
  }

  const head = git('git rev-parse HEAD');
  const originMain = git('git rev-parse origin/main');

  if (head !== originMain) {
    const behind = Number(git(`git rev-list --count ${head}..${originMain}`));
    const ahead = Number(git(`git rev-list --count ${originMain}..${head}`));
    if (behind > 0) {
      fail(`behind origin/main by ${behind} commit(s) — pull before releasing`);
    }
    if (ahead > 0) {
      fail(`ahead of origin/main by ${ahead} unpushed commit(s) — push or reset before releasing`);
    }
  }
}

function main() {
  if (!level) usage();

  const pkg = require('../package.json');
  console.log(`release — ${level} from v${pkg.version}${dryRun ? ' (dry-run)' : ''}`);

  assertGuards();

  if (dryRun) {
    console.log('\nrelease — dry-run: would run verify, npm version, npm publish' +
      (noPush ? '' : ', git push --follow-tags'));
    return;
  }

  run('npm run verify');
  run(`npm version ${level} -m "Release %s"`);
  // verify already ran; prepublishOnly stays for stray direct npm publish
  run('npm publish --ignore-scripts');

  if (!noPush) {
    run('git push --follow-tags');
  } else {
    console.log('\nrelease — skipped push (--no-push)');
  }

  const next = require('../package.json').version;
  console.log(`\nrelease — done: v${next}`);
}

main();