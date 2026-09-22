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

No further configuration is required. If you'd rather not use GitHub
Actions, the site works from a plain `git push` too — it will just use the
GitHub API fallback (and the manifest committed here) instead of a
freshly generated manifest.
