# Takeout Chat Skill + Pages Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a chat-app variant of the Omakase skill as a deterministic `dist/omakase-skill.zip`, surface it on the site as a "Takeout" path with no-terminal instructions, and deploy the site (plus the zip) via GitHub Pages.

**Architecture:** A root-level template (`skill-chat/SKILL.md.tmpl`) is rendered by the existing `scripts/build.js` (injecting the three canonical OMAKASE-*.md docs) into `dist/chat/omakase/SKILL.md`, then zipped deterministically with `fflate` into `dist/omakase-skill.zip` (committed, like all of dist/). The site gains a Takeout block linking to a same-origin `/omakase-skill.zip`. A GitHub Actions workflow publishes `site/` + the zip to GitHub Pages on every push to main.

**Tech Stack:** Node ≥18 (no framework), `fflate` (first devDependency), GitHub Actions Pages deployment, plain HTML/CSS site.

**Spec:** `docs/superpowers/specs/2026-06-11-takeout-chat-skill-design.md`

**Note on testing:** this repo has no test framework; its convention is `scripts/verify-*.js` checks and build-time hard failures. Tasks below follow that convention: each behavior gets a command with an expected, checkable output instead of a unit test.

---

### Task 1: Chat skill template

**Files:**
- Create: `skill-chat/SKILL.md.tmpl`

- [ ] **Step 1: Write the template**

Create `skill-chat/SKILL.md.tmpl` with exactly this content:

```markdown
---
name: omakase
description: Apply the Omakase standard, the chef's standard for quality, to writing, plans, analysis, documents, and code. Use when the user mentions omakase, when quality matters more than speed, or before delivering any substantial piece of work. Enforces twelve rules and a critique gate so nothing mediocre is delivered.
---

# Omakase — The Chef's Standard

The user states the goal. You decide how to get it done, and you deliver work
that feels like it came from a top-tier expert. Nothing mediocre reaches the
table.

<!-- INJECT:OMAKASE-PRINCIPLES.md -->

<!-- INJECT:OMAKASE-RULES.md -->

## In chat

You are running inside a chat app, not a coding harness. Two rules adapt:

- **Persistent Taste Memory** — there are no taste files here. Honor the
  preferences, files, and project context the user has shared in this
  conversation or project; ask before assuming.
- **Audit Trail** — end substantial work with a brief note of what was
  produced and why this approach.

Everything else applies as written. There are no sub-agents to delegate to;
you hold every role yourself, including the critic.

## The Gate

Before delivering any substantial output, judge it against the rubric below
yourself, harshly. If it fails any check, revise it before the user ever sees
it. Never mention the gate unless asked; the user only sees work that passed.

<!-- INJECT:OMAKASE-CRITIQUE.md -->
```

- [ ] **Step 2: Verify the injection sources exist**

Run: `ls OMAKASE-PRINCIPLES.md OMAKASE-RULES.md OMAKASE-CRITIQUE.md`
Expected: all three filenames print, no error.

- [ ] **Step 3: Commit**

```bash
git add skill-chat/SKILL.md.tmpl
git commit -m "feat(chat-skill): chat-app skill template"
```

---

### Task 2: Add fflate devDependency

**Files:**
- Modify: `package.json` (add devDependencies)
- Create: `package-lock.json` (generated)

- [ ] **Step 1: Install**

Run: `npm install --save-dev fflate@^0.8.2`
Expected: package.json gains `"devDependencies": { "fflate": "^0.8.2" }`, package-lock.json created, node_modules/ appears (already gitignored; confirm with `git status --short` showing only package.json + package-lock.json).

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add fflate for deterministic skill zip"
```

---

### Task 3: Build target — render + deterministic zip

**Files:**
- Modify: `scripts/build.js` (add chat build before the final guard scan; extend ALLOWED_PREFIXES)

- [ ] **Step 1: Add the chat-skill build function**

In `scripts/build.js`, after the `generateNativeAgents()` call and codex marker block (around line 130), insert:

```js
// Chat-app skill: rendered single-file SKILL.md + deterministic zip for
// claude.ai / Claude Desktop / ChatGPT upload. Spec:
// docs/superpowers/specs/2026-06-11-takeout-chat-skill-design.md
const { zipSync, strToU8 } = require('fflate');

function buildChatSkill() {
  const tmplPath = path.join(root, 'skill-chat/SKILL.md.tmpl');
  if (!fs.existsSync(tmplPath)) {
    console.error('\nBUILD FAILED: skill-chat/SKILL.md.tmpl missing');
    process.exit(1);
  }
  let rendered = fs.readFileSync(tmplPath, 'utf8').replace(
    /<!-- INJECT:([A-Z\-]+\.md) -->/g,
    (_, f) => {
      const p = path.join(root, f);
      if (!fs.existsSync(p)) {
        console.error(`\nBUILD FAILED: chat skill injection source missing: ${f}`);
        process.exit(1);
      }
      return fs.readFileSync(p, 'utf8').trim();
    }
  );

  if (rendered.includes('<!-- INJECT:')) {
    console.error('\nBUILD FAILED: unresolved INJECT marker in chat skill');
    process.exit(1);
  }
  const banned = [
    'omakase learn',
    'omakase-router',
    '@omakase-engineer',
    '@omakase-critic',
    '@omakase-archivist',
  ];
  const hit = banned.find(s => rendered.includes(s));
  if (hit) {
    console.error(`\nBUILD FAILED: repo machinery leaked into chat skill: "${hit}"`);
    process.exit(1);
  }

  const chatDir = path.join(distRoot, 'chat/omakase');
  rimraf(path.join(distRoot, 'chat'));
  fs.mkdirSync(chatDir, { recursive: true });
  fs.writeFileSync(path.join(chatDir, 'SKILL.md'), rendered);

  // Deterministic zip: fixed mtime, single sorted entry, fixed compression.
  const zipped = zipSync(
    { 'omakase/SKILL.md': [strToU8(rendered), { mtime: new Date('2000-01-01T00:00:00Z') }] },
    { level: 9 }
  );
  fs.writeFileSync(path.join(distRoot, 'omakase-skill.zip'), Buffer.from(zipped));
  console.log(`✓ Chat skill → dist/chat/omakase/SKILL.md + dist/omakase-skill.zip (${zipped.length} bytes)`);
}

buildChatSkill();
```

- [ ] **Step 2: Extend the dist allowlist**

In the same file, extend `ALLOWED_PREFIXES` (currently ending with `'dist/codex/.codex/agents/'`):

```js
  'dist/codex/.codex/agents/',
  'dist/chat/omakase/',
  'dist/omakase-skill.zip',
];
```

- [ ] **Step 3: Run the build and verify outputs**

Run: `npm run build`
Expected: log includes `✓ Chat skill → dist/chat/omakase/SKILL.md + dist/omakase-skill.zip (...)` and ends with `Guard passed`.

Run: `grep -c "INJECT" dist/chat/omakase/SKILL.md`
Expected: `0`

Run: `grep -c "Persistent Taste Memory" dist/chat/omakase/SKILL.md`
Expected: `2` (once in injected rules, once in the In-chat adaptation)

- [ ] **Step 4: Verify zip determinism and contents**

Run: `sha1sum dist/omakase-skill.zip && npm run build >/dev/null && sha1sum dist/omakase-skill.zip`
Expected: identical hashes.

Run: `unzip -l dist/omakase-skill.zip`
Expected: exactly one entry, `omakase/SKILL.md`.

Run: `git status --short` after a second build
Expected: dist/ shows no changes beyond the first build's (determinism in git terms).

- [ ] **Step 5: Commit (including built dist)**

```bash
git add scripts/build.js dist/chat dist/omakase-skill.zip
git commit -m "feat(build): render chat skill and emit deterministic omakase-skill.zip"
```

---

### Task 4: Site — Takeout block

**Files:**
- Modify: `site/index.html` (insert after `.harness-table` div, before `.memory-strip`)
- Modify: `site/styles.css` (new `.takeout` styles after the `.harness-table` rules)
- Modify: `site/fonts/*.woff2` (regenerated subsets; new glyphs 持/帰/→ etc.)

- [ ] **Step 1: Insert the Takeout HTML**

In `site/index.html`, directly after the closing `</div>` of `<div class="harness-table reveal">` and before `<aside class="memory-strip reveal">`, insert:

```html
      <div class="takeout reveal">
        <div class="takeout-intro">
          <h3>Takeout <span class="jp-inline" lang="ja">お持ち帰り</span></h3>
          <p>No terminal? Omakase works in chat apps too. You get the standard
             (the twelve rules and the critique gate) applied to whatever you
             bring: writing, plans, analysis, code. The full kitchen, with
             leads and project memory, lives in a coding harness.</p>
          <a class="btn" href="omakase-skill.zip" download>Download the skill</a>
        </div>
        <div class="takeout-apps">
          <div class="takeout-app">
            <h4>Claude, web or desktop</h4>
            <ol>
              <li>Download the skill above</li>
              <li>Settings → Capabilities → Skills → Upload skill</li>
              <li>Toggle it on, then ask for work as usual</li>
            </ol>
            <p class="plan-note">Pro, Max, Team, and Enterprise plans</p>
          </div>
          <div class="takeout-app">
            <h4>ChatGPT</h4>
            <ol>
              <li>Download the skill above</li>
              <li>Skills → New skill → Upload from your computer</li>
              <li>Enable it, then ask for work as usual</li>
            </ol>
            <p class="plan-note">Business, Enterprise, and Edu plans</p>
          </div>
        </div>
      </div>
```

- [ ] **Step 2: Add the Takeout CSS**

In `site/styles.css`, after the `.harness-table tr:hover td` rule, insert:

```css
/* ---------- takeout (chat apps) ---------- */

.takeout {
  margin-top: var(--s-8);
  border: var(--border);
  background: var(--paper);
  box-shadow: var(--shadow);
  display: grid;
  grid-template-columns: minmax(260px, 1.1fr) 1.6fr;
}

.takeout-intro {
  padding: var(--s-6);
  border-right: 1px solid oklch(0.24 0.015 60 / 0.25);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-4);
}

.takeout-intro h3 {
  font-family: var(--display);
  font-size: 1.35rem;
  display: flex;
  align-items: baseline;
  gap: var(--s-3);
}

.takeout-intro h3 .jp-inline {
  font-family: var(--serif);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.25em;
  color: var(--vermillion-deep);
}

.takeout-intro p { color: var(--ink-soft); font-size: 0.95rem; }

.takeout-apps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.takeout-app { padding: var(--s-6); }

.takeout-app + .takeout-app { border-left: 1px solid oklch(0.24 0.015 60 / 0.25); }

.takeout-app h4 { font-family: var(--display); font-size: 1rem; margin-bottom: var(--s-3); }

.takeout-app ol { padding-left: 1.2em; font-size: 0.92rem; color: var(--ink-soft); }

.takeout-app li { padding-block: var(--s-1); }

.takeout-app .plan-note {
  margin-top: var(--s-3);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--vermillion-deep);
}

@media (max-width: 880px) {
  .takeout { grid-template-columns: 1fr; }
  .takeout-intro { border-right: none; border-bottom: 1px solid oklch(0.24 0.015 60 / 0.25); }
  .takeout-app + .takeout-app { border-left: none; border-top: 1px solid oklch(0.24 0.015 60 / 0.25); }
}
```

(`.takeout-app + .takeout-app` is a 1px hairline divider, consistent with the page's column rules; the side-stripe ban applies to >1px colored accents.)

- [ ] **Step 3: Regenerate font subsets (new glyphs: 持 帰 →)**

Run: `cd site && node fonts/update-fonts.mjs && cd ..`
Expected: four `fonts/*.woff2  NN.N KB  (NNN chars requested)` lines, char count higher than before.

- [ ] **Step 4: Visual check**

Run: `cd site && python3 -m http.server 4173` (background), then with browser tooling: load `http://localhost:4173`, scroll to How to Order, screenshot the Takeout block at 1440px and 390px widths.
Expected: two-column layout desktop (intro left, app steps right), stacked on mobile; 持ち帰り renders in Shippori Mincho (serif, not fallback); arrows render. The download link 404s locally; that's expected (zip is assembled into the artifact by the deploy workflow).

- [ ] **Step 5: Commit**

```bash
git add site/index.html site/styles.css site/fonts
git commit -m "feat(site): takeout section - chat-app install path + skill download"
```

---

### Task 5: GitHub Pages workflow

**Files:**
- Create: `.github/workflows/pages.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Deploy site to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - name: Assemble artifact (site + skill zip)
        run: |
          mkdir -p _site
          cp -r site/. _site/
          cp dist/omakase-skill.zip _site/omakase-skill.zip
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Sanity-check the artifact assembly locally**

Run: `mkdir -p /tmp/_site && cp -r site/. /tmp/_site/ && cp dist/omakase-skill.zip /tmp/_site/ && ls /tmp/_site/ && rm -rf /tmp/_site`
Expected: listing shows `index.html styles.css app.js fonts omakase-skill.zip`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/pages.yml
git commit -m "ci: deploy site + skill zip to GitHub Pages"
```

- [ ] **Step 4: One-time repo setting (manual, after merge)**

In GitHub: Settings → Pages → Build and deployment → Source → **GitHub Actions**. Without this the first workflow run fails with a Pages-not-enabled error. Record this step in the PR description.

---

### Task 6: README

**Files:**
- Modify: `README.md` (after the Install section)

- [ ] **Step 1: Add the no-terminal paragraph**

After the Install section's last code block (the `npx skills add` line area), add:

```markdown
**No terminal?** Omakase works in chat apps. Download
[omakase-skill.zip](https://rblalock.github.io/omakaseagent/omakase-skill.zip),
then upload it in Claude (Settings → Capabilities → Skills; Pro/Max/Team) or
ChatGPT (Skills → New skill → Upload; Business/Enterprise/Edu plans). In chat
you get the standard (rules + critique gate); the full kitchen (leads, project
memory) needs a coding harness.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: no-terminal install path via chat apps"
```

---

### Task 7: End-to-end verification + Omakase gate

- [ ] **Step 1: Full build + verify suite**

Run: `npm run build && npm run verify:native-agents && npm run verify:drift`
Expected: all pass.

- [ ] **Step 2: Zip content audit**

Run: `cd /tmp && rm -rf zt && mkdir zt && cd zt && unzip /run/media/rblalock/ExtDev/repos/omakaseagent/dist/omakase-skill.zip && head -5 omakase/SKILL.md && grep -c "Excellence Gate" omakase/SKILL.md`
Expected: unzip lists one file; head shows frontmatter starting `---` / `name: omakase`; grep ≥ 2 (rule 8 + rubric item).

- [ ] **Step 3: Omakase critique pass**

Dispatch `@omakase-critic` (report-only) over: `skill-chat/SKILL.md.tmpl`, the rendered `dist/chat/omakase/SKILL.md`, `scripts/build.js` changes, the site Takeout block, `pages.yml`, README paragraph. Apply real findings.

- [ ] **Step 4: Push to the open PR**

```bash
git push
```
The `site` branch PR (#10) gains these commits; the PR description gets a note about the one-time Pages setting.
