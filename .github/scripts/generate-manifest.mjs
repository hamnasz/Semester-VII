#!/usr/bin/env node
// Regenerates portal/manifest.json from the files actually committed to this repository.
// Run from the repository root (that's what the deploy workflow does).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const { CONFIG } = await import(path.join(ROOT, 'portal', 'config.js'));

// Mirrors portal/js/core/repo.js#isIgnored, kept in step with the same CONFIG rules
// the browser uses, so the manifest and the live UI never disagree about what counts as content.
function isIgnored(p, config) {
  const { ignore } = config;
  const segs = p.split('/');
  const low = segs.map((s) => s.toLowerCase());
  if (ignore.hidden && segs.some((s) => s.startsWith('.'))) return true;
  if (ignore.roots.includes(low[0])) return true;
  if (low.some((s) => ignore.anywhere.includes(s))) return true;
  return (config.hiddenSubjects || []).some((h) => h.toLowerCase() === low[0]);
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
}

// Tracked files with their size, straight from the index — nothing here depends on
// what's on disk, so build artifacts or local scratch files can never leak in.
const lsTree = git(['ls-tree', '-r', '-l', '-z', 'HEAD']);
const entries = lsTree.split('\0').filter(Boolean).map((line) => {
  const [meta, filePath] = line.split('\t');
  const [, , , sizeStr] = meta.split(/\s+/);
  const size = sizeStr === '-' ? null : Number(sizeStr);
  return { path: filePath, size };
});

const files = entries.filter((e) => !isIgnored(e.path, CONFIG));

// One shared date for the run keeps this fast; per-file dates are still exact because
// each is the commit that last touched that path, not just "when the Action ran".
for (const f of files) {
  try {
    f.modified = git(['log', '-1', '--format=%cI', '--', f.path]).trim() || null;
  } catch {
    f.modified = null;
  }
}

const newFiles = files.map(({ path: p, size, modified }) => ({ path: p, size, modified }));

// Only touch the file, and only advance generatedAt, when the actual file list changed.
// Otherwise generatedAt would tick forward on every run even with nothing new, which
// would make every run look like a change and commit a no-op update forever.
const outPath = path.join(ROOT, 'manifest.json');
let previous = null;
try {
  previous = JSON.parse(readFileSync(outPath, 'utf8'));
} catch {
  /* no existing manifest, or it doesn't parse: treat as "nothing to compare against" */
}
if (previous && JSON.stringify(previous.files) === JSON.stringify(newFiles)) {
  console.log(`No content changes (${newFiles.length} files) — manifest.json left untouched.`);
  process.exit(0);
}

const manifest = { schema: 1, files: newFiles, generatedAt: new Date().toISOString() };
writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote ${newFiles.length} file${newFiles.length === 1 ? '' : 's'} to ${path.relative(ROOT, outPath)}`);
