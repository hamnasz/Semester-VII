# Semester VII portal

A static document portal for this repository: it discovers every subject
folder and file automatically and lets you search, browse and preview them
in the browser. No backend, no build step, no API keys, and no file in this
repository lists what content exists — the repository itself is that list.

## How it finds content

Nothing here is hard-coded and nothing is manually maintained. On every
visit, the portal makes one call to the public GitHub REST API
(`GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1`) and gets back
every file path in the repository in a single response. That response —
not a manifest, not a config list — is what builds the subject list,
folder tree, breadcrumbs and search index. `portal/config.js` only holds
display rules (which top-level folder is download-restricted, a couple of
optional title/description overrides) — it never lists subjects or files.

Add a new folder or file anywhere in the repo, push it, and it shows up in
the portal the next time someone loads it — no code change, no rebuild, no
commit back to the repo required.

The API response is cached in the visitor's own browser for a few minutes
(`discovery.cacheMinutes` in `portal/config.js`) so clicking around the
portal doesn't refetch the whole tree on every navigation, and so a
temporary GitHub rate limit shows a saved copy instead of an empty page.
Unauthenticated requests are capped at 60/hour per visitor IP by GitHub —
plenty for browsing, since the whole tree is one request, not one per
folder.

## The one rule that matters

Anything whose path is inside `FYP/` can be viewed but never downloaded —
enforced in exactly one place, `portal/js/core/permissions.js`, by path,
never by filename. `portal/js/core/urls.js#downloadUrl()` is the only
function that ever produces a download link, and it returns `null` for a
restricted path. To restrict (or un-restrict) a different folder, edit
`restrictedFolders` in `portal/config.js`.

The only folder hidden from the portal entirely is the one named `Others`
at the repository **root** — `portal/js/core/repo.js#isIgnored()` matches
it strictly by the first path segment, so `FYP/Others/` or
`SomeSubject/Others/` stay fully visible. Edit `hiddenSubjects` in
`portal/config.js` to change that.

## Previews

PDF, Word, PowerPoint, Excel/CSV, images, HTML (sandboxed), Jupyter
notebooks, Markdown/text and source code all render in place — see
`portal/js/viewers/`. Each viewer library is vendored under
`portal/vendor/` (see `portal/vendor/licenses/`) and is only fetched the
first time a matching file is opened.

## Setting this up on GitHub Pages

1. Copy everything in this folder into the root of the repository
   (`index.html`, `portal/`, `.github/` sit alongside `FYP/` and the
   other subject folders).
2. In the repository's **Settings → Pages**, set the source to either
   **Deploy from a branch** (simplest — GitHub serves `main` directly) or
   **GitHub Actions** (the included `.github/workflows/pages.yml` will
   publish it). Either works; no build step runs either way.
3. Push to `main`. That's it — there is nothing to regenerate.

If you ever see the portal showing an older file list than what's on
GitHub, it's almost always the visitor's own browser cache
(`discovery.cacheMinutes`, 15 minutes by default) — a hard refresh clears
it, or just wait it out.
