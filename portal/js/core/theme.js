import { prefs } from './store.js';

const media = () => window.matchMedia('(prefers-color-scheme: dark)');
export const storedTheme = () => prefs.get('theme');            // 'light' | 'dark' | null (follow system)
export const currentTheme = () => document.documentElement.dataset.theme || (media().matches ? 'dark' : 'light');

export function applyTheme(theme, { animate = false } = {}) {
  const root = document.documentElement;
  if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-shift');
    setTimeout(() => root.classList.remove('theme-shift'), 320);
  }
  root.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"][data-dynamic]');
  if (meta) meta.content = theme === 'dark' ? '#0f1512' : '#f2f4f2';
  document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  prefs.set('theme', next);
  applyTheme(next, { animate: true });
  return next;
}

/** Follow the system setting until the visitor picks a theme themselves. */
export function initTheme() {
  applyTheme(storedTheme() || (media().matches ? 'dark' : 'light'));
  media().addEventListener?.('change', (e) => { if (!storedTheme()) applyTheme(e.matches ? 'dark' : 'light'); });
}
