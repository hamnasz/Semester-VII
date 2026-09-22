import { el, mount, clear } from './core/dom.js';
import { initTheme } from './core/theme.js';
import { startRouter, parseHash } from './core/router.js';
import { loadRepository, RepoError } from './core/repo.js';
import { buildIndex } from './core/search.js';
import { CONFIG } from '../config.js';
import { Navigation } from './components/navigation.js';
import { ErrorState, SkeletonGrid } from './components/states.js';
import { icon, iconEl } from './core/icons.js';
import { repoUrl } from './core/urls.js';

import { DashboardView } from './views/dashboard.js';
import { BrowseView } from './views/browse.js';
import { FileViewerView } from './views/fileViewer.js';
import { SearchResultsView } from './views/searchResults.js';

initTheme();

const state = { repo: null, index: [], error: null };

const app = el('div', { class: 'app-shell' });
document.body.prepend(app);

app.append(el('a', { class: 'skip-link', href: '#main' }, 'Skip to content'));

const nav = Navigation({ index: () => state.index });
app.append(nav);

const banner = el('div');
const main = el('main', { id: 'main', class: 'main container route-fade', tabindex: '-1' });
app.append(banner, main);

app.append(el('footer', { class: 'site-footer' }, el('div', { class: 'container site-footer__row' }, [
  el('span', {}, `${CONFIG.site.title} \u00b7 a static document portal`),
  CONFIG.showRepoLink ? el('a', { href: repoUrl(), target: '_blank', rel: 'noopener' }, [iconEl('external'), ' Repository on GitHub']) : null,
].filter(Boolean))));

function titleFor(route, repo) {
  const site = CONFIG.site.title;
  if (route.name === 'home') return site;
  if (route.name === 'browse') { const n = route.path ? repo?.byPath.get(route.path) : null; return n ? `${n.name} \u2013 ${site}` : site; }
  if (route.name === 'view') { const n = repo?.byPath.get(route.path); return n ? `${n.name} \u2013 ${site}` : site; }
  if (route.name === 'search') return route.q ? `\u201c${route.q}\u201d \u2013 Search \u2013 ${site}` : `Search \u2013 ${site}`;
  return site;
}

function render(node) {
  clear(main);
  main.append(node);
  main.classList.remove('route-fade');
  void main.offsetWidth;
  main.classList.add('route-fade');
}

function renderRoute(route) {
  if (state.error) { render(errorView()); return; }
  const repo = state.repo;
  switch (route.name) {
    case 'home': render(DashboardView(repo)); break;
    case 'browse': render(BrowseView(repo, route.path)); break;
    case 'view': render(FileViewerView(repo, route.path)); break;
    case 'search': render(SearchResultsView(repo, state.index, { q: route.q, group: route.group })); break;
    default: render(ErrorState({ title: 'Page not found', desc: 'That address doesn\u2019t match anything in this portal.' }));
  }
}

function errorView() {
  const err = state.error;
  const copy = {
    'rate-limit': { title: 'GitHub is limiting requests right now', desc: err.resetAt ? `Please try again after ${err.resetAt.toLocaleTimeString()}.` : 'Please try again in a few minutes.' },
    'not-found': { title: 'Repository not found', desc: 'The configured repository or branch could not be found.' },
    network: { title: 'Couldn\u2019t connect', desc: 'Check your connection and try again.' },
  }[err.kind] || { title: 'Something went wrong', desc: err.message || 'The file list couldn\u2019t be loaded.' };
  return ErrorState({ ...copy, retry });
}

async function loadData() {
  clear(banner);
  try {
    state.repo = await loadRepository();
    state.index = buildIndex(state.repo);
    state.error = null;
    if (state.repo.stale) {
      banner.append(el('div', { class: 'container' }, el('div', { class: 'chip chip--muted', style: 'margin-top:var(--space-4)' }, [
        iconEl('info'), ' Showing a saved copy \u2014 GitHub is temporarily limiting requests from this network.',
      ])));
    }
  } catch (err) {
    state.repo = null; state.index = [];
    state.error = err instanceof RepoError ? err : new RepoError('unknown', err.message);
  }
  nav.querySelector('.search-trigger')?.removeAttribute('aria-disabled');
}

function retry() {
  render(el('div', { class: 'main--tight' }, [
    el('div', { class: 'skeleton skeleton-card', style: 'height:9rem;margin-bottom:var(--space-10)' }),
    SkeletonGrid(),
  ]));
  loadData().then(() => {
    const route = parseHash(location.hash);
    renderRoute(route);
    document.title = titleFor(route, state.repo);
  });
}

async function init() {
  nav.querySelector('.search-trigger')?.setAttribute('aria-disabled', 'true');
  render(el('div', { class: 'main--tight' }, [
    el('div', { class: 'skeleton skeleton-card', style: 'height:9rem;margin-bottom:var(--space-10)' }),
    SkeletonGrid(),
  ]));
  await loadData();
  startRouter((route, { restoreScroll } = {}) => {
    renderRoute(route);
    document.title = titleFor(route, state.repo);
    window.scrollTo(0, restoreScroll ?? 0);
  });
}

init();
