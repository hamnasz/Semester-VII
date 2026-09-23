// Repository path helpers. Paths are always "a/b/c.ext", no leading or trailing slash.

export function normalize(p) {
  return String(p ?? '')
    .normalize('NFC')
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/')
    .replace(/^(?:\.?\/)+/, '')
    .replace(/\/+$/, '');
}

export const segments = (p) => normalize(p).split('/').filter((s) => s && s !== '.' && s !== '..');
export const basename = (p) => segments(p).pop() || '';
export const dirname = (p) => segments(p).slice(0, -1).join('/');
export const join = (...parts) => segments(parts.filter(Boolean).join('/')).join('/');

/** Extension in lower case without the dot. Dotfiles like ".gitignore" have none. */
export function extname(name) {
  const i = String(name).lastIndexOf('.');
  return i > 0 && i < name.length - 1 ? name.slice(i + 1).toLowerCase() : '';
}

export const stem = (name) => {
  const i = String(name).lastIndexOf('.');
  return i > 0 ? name.slice(0, i) : name;
};

/** Encode every segment for use in a URL path. */
export const encodePath = (p) => segments(p).map(encodeURIComponent).join('/');

export const isInside = (path, folder) => path === folder || path.startsWith(folder + '/');
