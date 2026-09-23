/**
 * Portal configuration. This is the only file you normally need to edit.
 * Subjects, folders and files are discovered from the repository itself,
 * so adding a folder or a file never needs a code change.
 */
export const CONFIG = {
  site: {
    title: 'Semester VII',
    description:
      'Notes, slides, papers and project files for Semester VII in one place. Search across everything and read documents right here in the browser.',
  },

  repo: { owner: 'hamnasz', name: 'Semester-VII', branch: 'main' },

  // Show a "Repository on GitHub" link in the sidebar footer.
  showRepoLink: true,

  // Where file contents are served from.
  //   './'  the same site (GitHub Pages serving this repository); resolved relative to index.html
  //   'raw' raw.githubusercontent.com (only for hosting the portal somewhere else)
  contentBase: './',

  // The repository listing (subjects, folders, files) always comes from one call to the
  // public GitHub REST API (60 requests/hour per visitor IP, no token needed) — there is
  // no manifest and no other file to keep in sync. The result is cached in the visitor's
  // browser for this many minutes, so browsing around the portal doesn't refetch the tree
  // on every click, and a rate limit doesn't leave the site empty.
  discovery: {
    cacheMinutes: 15,
  },

  /**
   * Download rule. Anything whose repository path is inside one of these
   * folders can be viewed but never downloaded from this UI.
   * Paths are matched from the repository root, on folder boundaries, ignoring case
   * (so "FYP" covers "FYP/Others/x.pdf" but not "FYP-old/x.pdf").
   * Everything else, including subjects you add later, gets normal downloads.
   */
  restrictedFolders: ['FYP'],

  /**
   * Folders hidden from the portal entirely (not just view-only). Matched only at the
   * repository ROOT, so listing "Others" here hides the top-level Others/ folder and
   * everything inside it, but a nested folder that happens to share the same name —
   * such as FYP/Others/ — is a different path and stays fully visible.
   */
  hiddenSubjects: ['Others'],

  // Repository items that belong to the site itself and should not show up as content.
  // Compared case-insensitively. Anything starting with a dot is hidden too.
  // 'manifest.json' is listed here only so a stray leftover copy never shows up as a
  // browsable file — nothing reads it anymore; the file list always comes from the API.
  ignore: {
    roots: [
      'index.html', '404.html', 'portal', 'manifest.json', 'readme.md', 'license', 'license.md',
      'license.txt', 'cname', 'robots.txt', 'package.json', 'package-lock.json', 'node_modules',
    ],
    anywhere: ['.ds_store', 'thumbs.db', 'desktop.ini', '__macosx'],
    hidden: true,
  },

  // Optional per-folder display overrides, keyed by the top-level folder name.
  // Folders without an entry get their name and a generated summary.
  subjects: {
    FYP: {
      title: 'FYP',
      description: 'Final year project: DocBot AI proposals, defence slides, research analysis and figures.',
    },
  },

  recentCount: 8,
  // Files bigger than this ask before loading into the previewer.
  maxPreviewMB: 40,
};
