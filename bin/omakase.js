#!/usr/bin/env node
/**
 * omakase — the chef's standard
 * Minimal, zero-dep CLI for distribution (skills install). Real behavior lives in the markdown skill.
 * Tone: direct, precise, zero fluff.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];
const sub = args[1];

const root = path.resolve(__dirname, '..');
const distRoot = path.join(root, 'dist');
const pkg = require(path.join(root, 'package.json'));
const VERSION = pkg.version;

const HARNESS_CONFIG = {
  cursor: { dotDir: '.cursor', label: 'Cursor' },
  claude: { dotDir: '.claude', label: 'Claude Code' },
  agents: { dotDir: '.agents', label: 'Agents-style' },
};

function detectHarness() {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, '.cursor'))) return 'cursor';
  if (fs.existsSync(path.join(cwd, '.claude'))) return 'claude';
  if (fs.existsSync(path.join(cwd, '.agents'))) return 'agents';
  // Default: most portable harness skeleton
  return 'agents';
}

function isValidHarness(h) {
  return !!HARNESS_CONFIG[h];
}

function getSkillFileCount(skillDir) {
  let count = 0;
  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d)) {
      const p = path.join(d, e);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else count++;
    }
  }
  walk(skillDir);
  return count;
}

function installSkills(targetHarness, options = {}) {
  const harness = targetHarness || detectHarness();
  const isTest = !!options.test;

  if (targetHarness && !isValidHarness(harness)) {
    console.log(`Unknown harness "${targetHarness}". Supported: cursor | claude | agents`);
    process.exit(1);
  }

  const cfg = HARNESS_CONFIG[harness];
  const treeSource = path.join(distRoot, harness);
  const dotDirName = cfg.dotDir;
  const marker = path.join(treeSource, dotDirName);

  if (!fs.existsSync(treeSource) || !fs.existsSync(marker)) {
    console.log(`No valid dist bundle for ${harness}. Run \`npm run build\` then retry.`);
    process.exit(1);
  }

  const cwd = process.cwd();
  const targetDot = path.join(cwd, dotDirName);
  const skillName = isTest ? 'omakase-test' : 'omakase';
  const alreadyPresent = fs.existsSync(path.join(targetDot, `skills/${skillName}/SKILL.md`));
  const action = alreadyPresent ? 'refresh' : (isTest ? 'test-install' : 'install');

  console.log(`\nOmakase v${VERSION} — ${action} for ${harness}`);
  console.log(`  source: ${path.relative(root, treeSource)}`);
  console.log(`  target: ${dotDirName}/skills/${skillName}`);

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

  // Overlay the harness tree (dist/<h>/.xxx/...) into cwd.
  // Exactly matches manual: cp -r dist/<harness>/<dotdir> .
  copyRecursive(treeSource, cwd);

  // Make --test actually deliver an isolated omakase-test install (post-copy rename).
  // This fixes the previous lie where the flag only affected logs/variables but not the filesystem.
  if (isTest) {
    const installedDir = path.join(targetDot, 'skills/omakase');
    const testDir = path.join(targetDot, 'skills/omakase-test');
    if (fs.existsSync(installedDir)) {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
      fs.renameSync(installedDir, testDir);
    }
  }

  const finalSkillDir = path.join(cwd, dotDirName, `skills/${skillName}`);
  const fileCount = getSkillFileCount(finalSkillDir);

  console.log(`✓ ${fileCount} files → ${path.relative(cwd, finalSkillDir)}`);

  if (isTest) {
    console.log('Test install complete. To remove everywhere, run: npx omakase skills uninstall --test');
  } else {
    console.log('Reload harness. Then: /omakase init  or  /omakase <goal>\n');
  }
}

function showHelp() {
  console.log(`omakase v${VERSION} — the chef's standard

Usage:
  npx omakase skills install [cursor|claude|agents] [--test]
    Install or refresh the skill.
    Use --test to install as "omakase-test" (isolated folder, easy to remove).

  npx omakase --version
    Print version.

  npx omakase help
    This text.

The skill (in your harness) does the real work:
  /omakase init
  /omakase engineer <task>
  /omakase critique [target]
  /omakase <natural language goal>

Core standard ships inside every bundle:
  OMAKASE-PRINCIPLES.md, OMAKASE-RULES.md, OMAKASE-CRITIQUE.md

(OMAKASE-SPEC.md was the original implementation spec and has been retired.)
`);
}

if (command === 'skills' && sub === 'install') {
  const explicit = args[2];
  const isTest = args.includes('--test') || args.includes('-t');
  installSkills(explicit, { test: isTest });
} else if (command === 'skills' && sub === 'uninstall') {
  // Test installs are isolated folders — removal is intentionally manual and obvious.
  console.log('Remove test installs by deleting the omakase-test skill folder:');
  console.log('  .cursor/skills/omakase-test');
  console.log('  .claude/skills/omakase-test');
  console.log('  .agents/skills/omakase-test');
} else if (command === 'version' || command === '--version' || command === '-v') {
  console.log(VERSION);
} else if (!command || command === 'help' || command === '--help') {
  showHelp();
} else if (command === 'skills' && (sub === 'help' || !sub)) {
  showHelp();
} else {
  console.log('Unknown command. See: npx omakase help');
  process.exit(1);
}
