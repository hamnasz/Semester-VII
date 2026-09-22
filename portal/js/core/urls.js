import { CONFIG } from '../../config.js';
import { encodePath } from './paths.js';
import { canDownload } from './permissions.js';

/** Folder that contains index.html, e.g. https://user.github.io/Semester-VII/ (works under any base path). */
export const siteBase = () => new URL('./', document.baseURI);

function contentBase() {
  const { owner, name, branch } = CONFIG.repo;
  if (CONFIG.contentBase === 'raw') return new URL(`https://raw.githubusercontent.com/${owner}/${name}/${branch}/`);
  return new URL(CONFIG.contentBase, siteBase());
}

/** URL the viewers read from. Internal: never put this in a link for a restricted file. */
export const contentUrl = (node) => new URL(encodePath(node.path), contentBase()).href;

export const isSameOrigin = (url) => new URL(url, location.href).origin === location.origin;

/** The only place a download/raw URL is produced. Returns null for restricted files. */
export function downloadUrl(node) {
  return canDownload(node.path) ? contentUrl(node) : null;
}

export const repoUrl = () => `https://github.com/${CONFIG.repo.owner}/${CONFIG.repo.name}`;
