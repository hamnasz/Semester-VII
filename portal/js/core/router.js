// Hash-based routing: works on GitHub Pages without any server rules.
//   #/                     dashboard
//   #/browse/<path>        folder
//   #/view/<path>          file viewer
//   #/search?q=..&type=..  search results

const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
const clean = (segs) => segs.map(safeDecode).filter((s) => s && s !== '.' && s !== '..');
const enc = (p) => String(p).split('/').filter(Boolean).map(encodeURIComponent).join('/');

export function parseHash(hash = '') {
  let h = String(hash).replace(/^#/, '');
  if (!h.startsWith('/')) h = '/' + h;
  const [pathPart, query = ''] = h.split('?');
  const [name, ...rest] = pathPart.split('/').filter(Boolean);
  const params = new URLSearchParams(query);
  switch (name) {
    case undefined: return { name: 'home' };
    case 'browse': return { name: 'browse', path: clean(rest).join('/') };
    case 'view': return { name: 'view', path: clean(rest).join('/') };
    case 'search': return { name: 'search', q: params.get('q') || '', type: params.get('type') || '', kind: params.get('kind') || '' };
    default: return { name: 'notfound', raw: h };
  }
}

export const href = {
  home: () => '#/',
  browse: (path) => (path ? `#/browse/${enc(path)}` : '#/'),
  view: (path) => `#/view/${enc(path)}`,
  search: ({ q = '', type = '', kind = '' } = {}) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (type) p.set('type', type);
    if (kind) p.set('kind', kind);
    const s = p.toString();
    return s ? `#/search?${s}` : '#/search';
  },
  node: (node) => (node.kind === 'dir' ? href.browse(node.path) : href.view(node.path)),
};

let pushed = false;
export const markPush = () => { pushed = true; };

export function startRouter(onRoute) {
  // Any click on an in-app link counts as a forward navigation (scroll to top);
  // back/forward buttons restore the previous scroll position.
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#/"]');
    if (a && !e.defaultPrevented) markPush();
  }, true);
  const scrollMemory = new Map();
  let lastKey = location.hash;
  const run = () => {
    scrollMemory.set(lastKey, window.scrollY);
    const key = location.hash;
    const restore = !pushed ? scrollMemory.get(key) : undefined;
    pushed = false;
    lastKey = key;
    Promise.resolve(onRoute(parseHash(key), { restoreScroll: restore })).catch(console.error);
  };
  window.addEventListener('hashchange', run);
  run();
}

export function navigate(hash, { replace = false } = {}) {
  markPush();
  if (replace) history.replaceState(null, '', hash), window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = hash;
}
