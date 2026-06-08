/**
 * Repo Class 2 path rules for factory gate enforcement.
 * Keep aligned with risk classes in scripts/omakase-learn.js (riskGuide).
 */

const CLASS2_PREFIXES = ['skill/', 'bin/'];

/** Scripts that change product/CLI behavior (not mechanical verify-only). */
const CLASS2_SCRIPT_PREFIXES = ['scripts/native-agents/', 'scripts/build.js', 'scripts/omakase-learn.js'];

function normalize(relPath) {
  return relPath.replace(/\\/g, '/');
}

function isClass2Path(relPath) {
  const p = normalize(relPath);
  if (CLASS2_PREFIXES.some((pre) => p.startsWith(pre))) return true;
  if (p.startsWith('scripts/verify-')) return false;
  if (p.startsWith('scripts/') && !p.endsWith('.md')) return true;
  if (CLASS2_SCRIPT_PREFIXES.some((pre) => p === pre || p.startsWith(pre))) return true;
  return false;
}

function isGatePath(relPath) {
  const p = normalize(relPath);
  if (/^\.omakaseagent\/gates\/[^/]+\.md$/.test(p)) return true;
  if (/^examples\/[^/]+\/gates\/[^/]+\.md$/.test(p)) return true;
  return false;
}

module.exports = { isClass2Path, isGatePath, CLASS2_PREFIXES };
