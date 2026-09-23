import { el } from '../core/dom.js';
import { iconEl } from '../core/icons.js';
import { downloadUrl } from '../core/urls.js';

/**
 * Renders nothing but a quiet "view only" note for restricted files — never a download
 * link built from a filename. The only source of truth for the URL is downloadUrl().
 */
export function DownloadButton(node, { compact = false } = {}) {
  const url = downloadUrl(node);
  if (!url) {
    return el('span', { class: 'badge-restricted', title: 'This file is available to view only.' }, [
      iconEl('lock'), compact ? null : 'View only',
    ]);
  }
  return el('a', {
    class: compact ? 'btn btn-icon' : 'btn btn-secondary',
    href: url, download: node.name, 'aria-label': `Download ${node.name}`,
  }, compact ? iconEl('download') : [iconEl('download'), 'Download']);
}
