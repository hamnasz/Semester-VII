// In-memory search over subjects, folders and files.
export const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function buildIndex(repo) {
  const entry = (node) => ({
    node,
    name: norm(node.name),
    path: norm(node.path),
    kind: norm(node.kind === 'dir' ? 'folder' : `${node.type.label} ${node.ext}`),
    ext: node.kind === 'file' ? node.ext : '',
    depth: node.path.split('/').length,
  });
  return [...repo.dirs.filter((d) => d.path).map(entry), ...repo.files.map(entry)];
}

const WORD_START = /[\s_\-.()[\]/,]/;

function scoreToken(e, t) {
  let s = 0;
  if (e.name === t) s = 100;
  else if (e.name.startsWith(t)) s = 60;
  else {
    const i = e.name.indexOf(t);
    if (i > 0 && WORD_START.test(e.name[i - 1])) s = 40;
    else if (i >= 0) s = 25;
  }
  if (!s && e.path.includes(t)) s = 8;
  if (e.ext === t) s = Math.max(s, 14);
  else if (!s && e.kind.includes(t)) s = 6;
  return s;
}

export function ranges(name, tokens) {
  const n = norm(name);
  if (n.length !== name.length) return [];
  const out = [];
  for (const t of tokens) {
    const i = n.indexOf(t);
    if (i >= 0) out.push([i, i + t.length]);
  }
  out.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const r of out) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  return merged;
}

/** kind: 'all' | 'file' | 'dir'.  group: a file-type group id (files only). */
export function search(index, query, { kind = 'all', group = '', limit = 300 } = {}) {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (!tokens.length && !group) return { results: [], tokens, total: 0 };
  const scored = [];
  for (const e of index) {
    const n = e.node;
    if (group && (n.kind !== 'file' || n.type.group !== group)) continue;
    if (kind === 'file' && n.kind !== 'file') continue;
    if (kind === 'dir' && n.kind !== 'dir') continue;
    let total = 0, ok = true;
    for (const t of tokens) {
      const s = scoreToken(e, t);
      if (!s) { ok = false; break; }
      total += s;
    }
    if (!ok) continue;
    if (n.kind === 'dir') total += e.depth === 1 ? 6 : 2;
    total -= e.name.length * 0.02;
    scored.push({ node: n, score: total });
  }
  scored.sort((a, b) => b.score - a.score || (a.node.path < b.node.path ? -1 : 1));
  return { results: scored.slice(0, limit), tokens, total: scored.length };
}
