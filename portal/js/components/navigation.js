import { el } from '../core/dom.js';
import { icon, iconEl } from '../core/icons.js';
import { href, navigate } from '../core/router.js';
import { CONFIG } from '../../config.js';
import { currentTheme, toggleTheme } from '../core/theme.js';
import { openSearch } from './search.js';

export function Navigation({ index }) {
  const themeBtn = el('button', {
    class: 'btn btn-icon', type: 'button', 'aria-label': 'Toggle colour theme',
    html: icon(currentTheme() === 'dark' ? 'sun' : 'moon'),
    onClick: () => { const t = toggleTheme(); themeBtn.innerHTML = icon(t === 'dark' ? 'sun' : 'moon'); },
  });
  document.addEventListener('themechange', (e) => { themeBtn.innerHTML = icon(e.detail === 'dark' ? 'sun' : 'moon'); });

  const searchBtn = el('button', {
    class: 'search-trigger', type: 'button', 'aria-label': 'Search the portal',
    onClick: () => openSearch(index()),
  }, [
    iconEl('search'),
    el('span', { class: 'search-trigger__label' }, 'Search files & folders'),
    el('span', { class: 'search-trigger__hint' }, '/'),
  ]);

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      e.preventDefault(); openSearch(index());
    }
  });

  return el('header', { class: 'site-header' }, [
    el('div', { class: 'container site-header__bar' }, [
      el('a', { class: 'brand', href: href.home() }, [el('span', { class: 'brand__mark' }, '◆'), CONFIG.site.title]),
      el('div', { class: 'site-header__spacer' }),
      searchBtn,
      el('div', { class: 'nav-actions' }, [themeBtn]),
    ]),
  ]);
}
