// Repository discovery: turns "a list of paths" into the tree the UI renders.
// The UI never sees the source of that list, so it can come from a manifest or the GitHub API.
import { CONFIG } from '../../config.js';
import { normalize } from './paths.js';
import { getFileType, GROUPS } from './filetypes.js';
import { isRestricted } from './permissions.js';
import { naturalCompare, plural } from './format.js';
import { prefs } from './store.js';

export class RepoError extends Error {
  constructor(kind, message, extra = {}) { super(message); this.name = 'RepoError'; this.kind = kind; Object.assign(this, extra); }
}

const time = (iso) => { const t = Date.parse(iso); return Number.isFinite(t) ? t : 0; };
const later = (a, b) => (time(b) > time(a) ? b : a);

export function isIgnored(path, ignore = CONFIG.ignore) {
  const segs = path.split('/');
  const low = segs.map((s) => s.toLowerCase());
  if (ignore.hidden && segs.some((s) => s.startsWith('.'))) return true;
  if (ignore.roots.includes(low[0])) return true;
  if (low.some((s) => ignore.anywhere.includes(s))) return true;
  // Root-only: the FIRST path segment must match, so a same-named folder nested
  // elsewhere (e.g. FYP/Others/) is a different path and is never affected by this.
  return (CONFIG.hiddenSubjects || []).some((h) => h.toLowerCase() === low[0]);
}

const makeDir = (name, path, parent) => ({
  kind: 'dir', name, path, parent, children: [], restricted: path ? isRestricted(path) : false,
  fileCount: 0, dirCount: 0, size: 0, modified: null, groups: {},
});

const compare = (a, b) => (a.kind !== b.kind ? (a.kind === 'dir' ? -1 : 1) : naturalCompare(a.name, b.name));

/** entries: [{ path, size?, modified? }] -> repository model */
export function buildRepository(entries, meta = {}) {
  const root = makeDir('', '', null);
  const byPath = new Map([['', root]]);
  const files = [];

  for (const e of entries) {
    const path = normalize(e.path);
    if (!path || isIgnored(path)) continue;
    const segs = path.split('/');
    let parent = root;
    for (let i = 0; i < segs.length - 1; i++) {
      const p = segs.slice(0, i + 1).join('/');
      let dir = byPath.get(p);
      if (!dir) { dir = makeDir(segs[i], p, parent); byPath.set(p, dir); parent.children.push(dir); }
      parent = dir;
    }
    const name = segs[segs.length - 1];
    const type = getFileType(name);
    const file = {
      kind: 'file', name, path, parent, ext: type.ext, type, restricted: isRestricted(path),
      size: Number.isFinite(e.size) ? e.size : null, modified: e.modified || null,
    };
    parent.children.push(file);
    byPath.set(path, file);
    files.push(file);
  }

  const dirs = [];
  (function walk(dir) {
    dir.children.sort(compare);
    for (const c of dir.children) {
      if (c.kind === 'dir') {
        walk(c);
        dir.fileCount += c.fileCount; dir.dirCount += 1 + c.dirCount; dir.size += c.size;
        if (c.modified) dir.modified = dir.modified ? later(dir.modified, c.modified) : c.modified;
        for (const [g, n] of Object.entries(c.groups)) dir.groups[g] = (dir.groups[g] || 0) + n;
      } else {
        dir.fileCount += 1; dir.size += c.size || 0;
        if (c.modified) dir.modified = dir.modified ? later(dir.modified, c.modified) : c.modified;
        dir.groups[c.type.group] = (dir.groups[c.type.group] || 0) + 1;
      }
    }
    dirs.push(dir);
  })(root);

  const groups = GROUPS.map((g) => ({ ...g, count: root.groups[g.id] || 0 })).filter((g) => g.count);
  return {
    root, byPath, files, dirs, groups,
    subjects: root.children.filter((c) => c.kind === 'dir'),
    rootFiles: root.children.filter((c) => c.kind === 'file'),
    hasDates: files.some((f) => f.modified),
    totals: { files: files.length, size: root.size },
    latest: root.modified,
    source: meta.source || 'unknown', generatedAt: meta.generatedAt || null, stale: !!meta.stale, truncated: !!meta.truncated,
  };
}

export const getNode = (repo, path) => repo.byPath.get(normalize(path)) || null;

export function ancestors(node) {
  const out = [];
  for (let n = node.parent; n; n = n.parent) out.unshift(n);
  return out; // root first
}

const HUES = [158, 212, 32, 268, 344, 184, 84];
export function subjectInfo(dir) {
  const o = CONFIG.subjects?.[dir.name] || {};
  let h = 5381;
  for (const ch of dir.name) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
  const parts = [plural(dir.fileCount, 'file')];
  if (dir.dirCount) parts.push(`in ${plural(dir.dirCount, 'folder')}`);
  return {
    title: o.title || dir.name,
    description: o.description || parts.join(' '),
    hue: o.hue ?? HUES[h % HUES.length],
  };
}

// ---- loading -------------------------------------------------------------------------------

async function fromManifest() {
  const url = new URL(CONFIG.discovery.manifest, new URL('./', document.baseURI));
  let res;
  try { res = await fetch(url, { cache: 'no-cache' }); } catch { return null; }
  if (!res.ok) return null;
  let data;
  try { data = await res.json(); } catch { return null; }
  if (!data || data.schema !== 1 || !Array.isArray(data.files)) return null;
  return { entries: data.files, meta: { source: 'manifest', generatedAt: data.generatedAt || null } };
}

const CACHE_KEY = 'tree';

async function fromApi() {
  const { owner, name, branch } = CONFIG.repo;
  const url = `https://api.github.com/repos/${owner}/${name}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  let res;
  try { res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } }); }
  catch { throw new RepoError('network', 'Could not reach GitHub.'); }
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset'));
    throw new RepoError('rate-limit', 'GitHub is limiting requests from this network.', { resetAt: reset ? new Date(reset * 1000) : null });
  }
  if (res.status === 404) throw new RepoError('not-found', 'The repository or branch could not be found.');
  if (!res.ok) throw new RepoError('http', `GitHub answered with status ${res.status}.`);
  const data = await res.json();
  const entries = (data.tree || []).filter((t) => t.type === 'blob').map((t) => ({ path: t.path, size: t.size }));
  return { entries, meta: { source: 'api', generatedAt: new Date().toISOString(), truncated: !!data.truncated } };
}

export async function loadRepository() {
  const manifest = CONFIG.discovery.manifest ? await fromManifest() : null;
  if (manifest) return buildRepository(manifest.entries, manifest.meta);
  if (!CONFIG.discovery.useApi) throw new RepoError('no-source', 'No manifest was found and the GitHub API fallback is turned off.');

  const cached = prefs.get(CACHE_KEY);
  const fresh = cached && Date.now() - cached.at < CONFIG.discovery.cacheMinutes * 60000;
  if (fresh) return buildRepository(cached.entries, { source: 'cache', generatedAt: new Date(cached.at).toISOString() });
  try {
    const { entries, meta } = await fromApi();
    prefs.set(CACHE_KEY, { at: Date.now(), entries });
    return buildRepository(entries, meta);
  } catch (err) {
    // Rate limits are common on shared networks. A saved copy beats an error page.
    if (cached) return buildRepository(cached.entries, { source: 'cache', generatedAt: new Date(cached.at).toISOString(), stale: true });
    throw err;
  }
}
