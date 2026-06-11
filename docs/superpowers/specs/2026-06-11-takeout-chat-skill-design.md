# Takeout: Omakase for Claude desktop/web and ChatGPT

**Date:** 2026-06-11
**Status:** Approved direction; pending implementation plan

## Goal

Let non-technical people use the Omakase standard in chat apps (Claude web/desktop, ChatGPT) with no terminal: download a zip from the site, upload it in settings, done. Keep the artifact structurally incapable of going stale, and deploy the site itself via GitHub Pages.

## Facts this design rests on

- claude.ai web and Claude Desktop accept custom skill zips: Settings → Capabilities → Skills → Upload (Pro, Max, Team, Enterprise; code execution enabled).
- ChatGPT supports the same SKILL.md format in beta on Business, Enterprise, and Edu plans (Skills → New skill → Upload from your computer). Not consumer Plus/Free.
- What works in chat is the standard (principles, twelve rules, critique gate). Leads, `.omakaseagent/` memory, `omakase learn`, and the factory assume a repo and filesystem and must not appear in the chat skill.
- `dist/` is committed by convention; `scripts/build.js` enforces a strict allowlist of dist paths and fails on strays.

## Components

### 1. Chat skill source: `skill/chat/SKILL.md.tmpl` → built `SKILL.md`

A single-file skill authored for chat contexts, assembled at build time so the rules and rubric are never hand-duplicated:

- Template holds frontmatter + chat-specific framing; build injects the canonical text of OMAKASE-PRINCIPLES.md, OMAKASE-RULES.md, OMAKASE-CRITIQUE.md via marker comments (same injection idea as omakase-core).
- Frontmatter `name: omakase`, `description` tuned for chat triggering: applying the chef's standard to writing, plans, analysis, documents, and code; zero AI slop; critique before delivery.
- Two repo-bound rules are adapted in a short "In chat" section appended after the injected rules (the injected canonical text stays verbatim):
  - Persistent Taste Memory → honor preferences, files, and project context the user has shared; ask before assuming.
  - Audit Trail → end substantial work with a brief note of what was produced and why this approach.
- Explicitly out: router commands, leads/teams, Task tools, `.omakaseagent/`, `omakase learn`, factory/gate machinery.

### 2. Build target: `dist/chat/omakase/SKILL.md` + `dist/omakase-skill.zip`

- `scripts/build.js` renders the template, writes `dist/chat/omakase/SKILL.md`, and zips it as `omakase-skill.zip` whose single entry path is `omakase/SKILL.md`.
- Deterministic zip: fixed mtime epoch, sorted entries, no extra fields — the binary only changes when content changes. Implemented with `fflate` (first devDependency; tiny, zero transitive deps).
- Guard updates: add `dist/chat/omakase/` and `dist/omakase-skill.zip` to the build's ALLOWED_PREFIXES; add a required-file check for the zip and the rendered SKILL.md (fail fast if injection markers are unresolved).

### 3. Site: "Takeout" block in How to Order (お持ち帰り)

After the harness table, before the memory strip:

- Heading: "Takeout" with 持ち帰り styling consistent with ticket heads.
- Vermillion download button → `omakase-skill.zip` (same-origin; the Pages deploy publishes the zip beside the site).
- Two short numbered step lists:
  - Claude (web or desktop, paid plans): Download → Settings → Capabilities → Skills → Upload → toggle on → just ask for work.
  - ChatGPT (Business/Enterprise/Edu): Skills → New skill → Upload from your computer.
- One honest line: chat serves the standard (rules + critique gate) applied to whatever you bring; the full kitchen (leads, project memory) lives in a coding harness.
- New Japanese glyphs (持ち帰り etc.) require re-running `site/fonts/update-fonts.mjs`.

### 4. GitHub Pages deployment: `.github/workflows/pages.yml`

- Trigger: push to `main`.
- Steps: checkout → assemble artifact dir (`site/` contents + `dist/omakase-skill.zip` at artifact root) → `actions/upload-pages-artifact` → `actions/deploy-pages`.
- No site build step exists or is added; the artifact is file copies only.
- Repo setting required (manual, one-time): Pages → Source → GitHub Actions.
- Site URL: `https://rblalock.github.io/omakaseagent/` until a custom domain is added. Note: site links are already relative, so subpath hosting works.

### 5. README

One short "No terminal?" paragraph under Install: download link (site URL), upload steps in a sentence each, the chat-scope caveat.

## Decisions and trade-offs

- **Committed zip over release assets or on-the-fly CI builds:** follows the repo's existing committed-dist convention; freshness is enforced by the same review/CI culture; zero new release process. Cost: a small binary in git history (~tens of KB), mitigated by deterministic builds (no churn without content change).
- **Same-origin download from day one** (Pages serves the zip) rather than raw.githubusercontent.com interim.
- **Single-file skill** (no bundled reference files) keeps upload small and chat-context lean; canonical docs are injected, not linked.

## Edge cases / failure modes

- Injection markers missing or core files absent → build fails loudly (required-file check).
- Zip nondeterminism (timestamps) → prevented by fixed-mtime zip writer; verified by building twice in CI-adjacent script if desired (nice-to-have, not required).
- Pages not yet enabled → workflow fails visibly on first run until the repo setting is flipped; documented in the PR description.
- ChatGPT consumer plans lack skills → copy names the supported plans so non-eligible users aren't sent on a dead end.

## Testing / verification

- `npm run build` twice → `git status` clean the second time (determinism).
- Unzip `dist/omakase-skill.zip` → exactly `omakase/SKILL.md`, frontmatter valid, injected sections present, no repo-machinery strings (`omakase learn`, `.omakaseagent/`, `Task`, lead names).
- Site: Takeout block renders desktop + mobile; download link resolves in the Pages artifact layout.
- Workflow: green run on main; site live; `/omakase-skill.zip` downloads.

## Out of scope

- Custom domain.
- A ChatGPT-specific skill variant (one zip serves both).
- Vercel/preview deployments.
- Renaming `npx omakase` references inside `skill/` internals (rides with the npm publish).
