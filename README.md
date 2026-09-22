# Semester VII portal

A static document portal for this repository: it discovers every subject
folder and file automatically and lets you search, browse and preview them
in the browser. No backend, no build step, no API keys.

## How it finds content

Nothing here is hard-coded. `portal/config.js` lists which top-level folders
are download-restricted (currently `FYP`) and holds a couple of optional
display overrides — everything else about the site's content comes from
walking the repository itself. Add a new folder or file anywhere in the
repo and it appears in the portal automatically, with no code changes.

- **`manifest.json`** (repo root) is the fast path: a flat list of every
  file with its size and last-modified date. The included GitHub Actions
  workflow (`.github/workflows/pages.yml`) regenerates it on every push to
  `main` using `.github/scripts/generate-manifest.mjs`, then deploys the
  site to GitHub Pages.
- If `manifest.json` is missing or stale, the portal falls back to a
  single call to the public GitHub API (no token), cached for 15 minutes
  in the visitor's browser so a rate limit doesn't leave the site empty.

## The one rule that matters

Anything whose path is inside `FYP/` can be viewed but never downloaded —
enforced in exactly one place, `portal/js/core/permissions.js`, by path,
never by filename. `portal/js/core/urls.js#downloadUrl()` is the only
function that ever produces a download link, and it returns `null` for a
restricted path. To restrict (or un-restrict) a different folder, edit
`restrictedFolders` in `portal/config.js`.

## Previews

PDF, Word, PowerPoint, Excel/CSV, images, HTML (sandboxed), Jupyter
notebooks, Markdown/text and source code all render in place — see
`portal/js/viewers/`. Each viewer library is vendored under
`portal/vendor/` (see `portal/vendor/licenses/`) and is only fetched the
first time a matching file is opened.

## Setting this up on GitHub Pages

1. Copy everything in this folder into the root of the repository
   (`index.html`, `manifest.json`, `portal/`, `.github/` sit alongside
   `FYP/`).
2. In the repository's **Settings → Pages**, set the source to
   **GitHub Actions**.
3. Push to `main`. The included workflow regenerates `manifest.json` and
   deploys automatically from then on.

No further configuration is required — this works whether the repository's
**Settings -> Pages -> Source** is set to "GitHub Actions" *or* to "Deploy
from a branch". Either way, the workflow commits a freshly regenerated
`manifest.json` straight back into `main` on every push, so the file GitHub
Pages actually serves is always current.

## "I added files and the portal still shows the old list"

This almost always means `manifest.json` never got updated after your push.
Check, in order:

1. **Repo -> Actions tab**: did the "Update manifest & deploy Semester VII
   portal" workflow run after your push, and did its `manifest` job succeed?
   If Actions are disabled for this repository, nothing here can run
   automatically — either enable them, or run
   `node .github/scripts/generate-manifest.mjs` yourself locally and commit
   the resulting `manifest.json`.
2. **manifest.json's commit history**: it should have a commit from
   `github-actions[bot]` after your own push. If it doesn't, the workflow
   didn't run or didn't have permission to push (Settings -> Actions ->
   General -> Workflow permissions -> "Read and write permissions").
3. Give GitHub Pages a minute or two after that commit to actually
   redeploy — a successful workflow run doesn't mean the live site has
   updated *yet*.

The portal itself never needs a code change for new content — only
`manifest.json` needs to be current, and the workflow's only job is
keeping it that way.
