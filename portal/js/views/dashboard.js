import { el } from '../core/dom.js';
import { href } from '../core/router.js';
import { CONFIG } from '../../config.js';
import { SubjectCard } from '../components/subjectCard.js';
import { NodeList } from '../components/nodeRow.js';
import { EmptyState } from '../components/states.js';
import { plural, formatDate, relativeTime } from '../core/format.js';
import { icon } from '../core/icons.js';

function recentFiles(repo, count) {
  return [...repo.files].filter((f) => f.modified).sort((a, b) => (a.modified < b.modified ? 1 : -1)).slice(0, count);
}

export function DashboardView(repo) {
  const root = el('div');

  root.append(el('section', { class: 'hero' }, [
    el('p', { class: 'hero__eyebrow' }, 'Semester VII \u00b7 document portal'),
    el('h1', { class: 'hero__title font-serif' }, CONFIG.site.title),
    el('p', { class: 'hero__desc' }, CONFIG.site.description),
    el('div', { class: 'hero__stats' }, [
      el('div', {}, [el('strong', {}, String(repo.totals.files)), plural(repo.totals.files, 'file')]),
      el('div', {}, [el('strong', {}, String(repo.subjects.length)), plural(repo.subjects.length, 'subject')]),
      repo.latest ? el('div', {}, [el('strong', {}, formatDate(repo.latest)), 'last updated']) : null,
    ].filter(Boolean)),
  ]));

  root.append(el('section', { class: 'section' }, [
    el('div', { class: 'section__head' }, el('h2', { class: 'section__title font-serif' }, 'Subjects')),
    repo.subjects.length
      ? el('div', { class: 'subject-grid' }, repo.subjects.map(SubjectCard))
      : EmptyState({ title: 'No subjects yet', desc: 'Folders you add to the repository will appear here automatically \u2014 nothing to configure.', iconName: 'folder' }),
  ]));

  if (repo.rootFiles.length) {
    root.append(el('section', { class: 'section' }, [
      el('div', { class: 'section__head' }, el('h2', { class: 'section__title font-serif' }, 'In the repository root')),
      NodeList(repo.rootFiles),
    ]));
  }

  const recent = repo.hasDates ? recentFiles(repo, CONFIG.recentCount) : [];
  if (recent.length) {
    root.append(el('section', { class: 'section' }, [
      el('div', { class: 'section__head' }, el('h2', { class: 'section__title font-serif' }, 'Recently updated')),
      el('div', { class: 'recent-grid' }, recent.map((f) => el('a', { class: 'recent-card', href: href.view(f.path) }, [
        el('span', { class: 'icon', style: 'color:var(--ink-faint);font-size:1.3rem', html: icon(f.type.glyph) }),
        el('span', {}, [
          el('div', { class: 'recent-card__title' }, f.name),
          el('div', { class: 'recent-card__meta' }, `${f.type.label} \u00b7 ${relativeTime(f.modified)}`),
        ]),
      ]))),
    ]));
  }

  return root;
}
