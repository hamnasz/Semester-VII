import { el, esc } from '../core/dom.js';
import { href } from '../core/router.js';
import { iconEl } from '../core/icons.js';

/** ancestors: root-first list of dir nodes (not including the repo root itself). current: node being shown, or null on the dashboard. */
export function Breadcrumbs(ancestors, current) {
  const nav = el('nav', { class: 'breadcrumbs', 'aria-label': 'Breadcrumb' });
  nav.append(el('a', { href: href.home() }, [iconEl('home'), el('span', { class: 'visually-hidden' }, 'Home')]));
  for (const dir of ancestors) {
    nav.append(el('span', { class: 'breadcrumbs__sep', 'aria-hidden': 'true' }, iconEl('chevron')));
    nav.append(el('a', { href: href.browse(dir.path) }, dir.name));
  }
  if (current) {
    nav.append(el('span', { class: 'breadcrumbs__sep', 'aria-hidden': 'true' }, iconEl('chevron')));
    nav.append(el('span', { class: 'breadcrumbs__current', 'aria-current': 'page' }, current.name));
  }
  return nav;
}
