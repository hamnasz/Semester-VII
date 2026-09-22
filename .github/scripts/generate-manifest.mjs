#!/usr/bin/env node
// Regenerates portal/manifest.json from the files actually committed to this repository.
// Run from the repository root (that's what the deploy workflow does).
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const { CONFIG } = await import(path.join(ROOT, 'portal', 'config.js'));

// Mirrors portal/js/core/repo.js#isIgnored, kept in step with the same CONFIG.ignore rules
// the browser uses, so the manifest and the live UI never disagree about what counts as content.
function isIgnored(p, ignore) {
  const segs = p.split('/');
  const low = segs.map((s) => s.toLowerCase());
  if (ignore.hidden && segs.some((s) => s.startsWith('.'))) return true;
  if (ignore.roots.includes(low[0])) return true;
  return low.some((s) => ignore.anywhere.includes(s));
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

const files = entries.filter((e) => !isIgnored(e.path, CONFIG.ignore));

// One shared date for the run keeps this fast; per-file dates are still exact because
// each is the commit that last touched that path, not just "when the Action ran".
for (const f of files) {
  try {
    f.modified = git(['log', '-1', '--format=%cI', '--', f.path]).trim() || null;
  } catch {
    f.modified = null;
  }
}

const manifest = {
  schema: 1,
  files: files.map(({ path: p, size, modified }) => ({ path: p, size, modified })),
  generatedAt: new Date().toISOString(),
};

const outPath = path.join(ROOT, 'manifest.json');
writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote ${files.length} file${files.length === 1 ? '' : 's'} to ${path.relative(ROOT, outPath)}`);
