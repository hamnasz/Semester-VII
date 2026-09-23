// The single source of truth for what the UI may offer for a file.
// The rule looks at the repository PATH only, never at a file name or type.
import { CONFIG } from '../../config.js';
import { normalize } from './paths.js';

const key = (p) => normalize(p).toLowerCase();

export function createPermissions(restrictedFolders) {
  const restricted = restrictedFolders.map(key).filter(Boolean);
  const isRestricted = (path) => {
    const k = key(path);
    return restricted.some((r) => k === r || k.startsWith(r + '/'));
  };
  return { isRestricted, canDownload: (path) => !isRestricted(path) };
}

const defaults = createPermissions(CONFIG.restrictedFolders);
export const isRestricted = defaults.isRestricted;
export const canDownload = defaults.canDownload;
