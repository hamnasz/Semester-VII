import { el, esc } from '../core/dom.js';
import { href } from '../core/router.js';
import { iconEl } from '../core/icons.js';
import { subjectInfo } from '../core/repo.js';
import { plural, formatDate } from '../core/format.js';

export function SubjectCard(dir) {
  const info = subjectInfo(dir);
  const card = el('a', { class: 'subject-card', href: href.browse(dir.path), style: `--hue:${info.hue}` }, [
    el('h3', { class: 'subject-card__title font-serif' }, info.title),
    el('p', { class: 'subject-card__desc' }, info.description),
    el('div', { class: 'subject-card__meta' }, [
      dir.restricted ? el('span', { class: 'badge-restricted' }, [iconEl('lock'), 'View only']) : null,
      el('span', {}, plural(dir.fileCount, 'file')),
      dir.modified ? el('span', {}, `Updated ${formatDate(dir.modified)}`) : null,
    ].filter(Boolean)),
  ]);
  return card;
}
