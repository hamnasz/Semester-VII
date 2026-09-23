import { el } from '../core/dom.js';
import { icon } from '../core/icons.js';

export function EmptyState({ title, desc, iconName = 'folder', action = null }) {
  return el('div', { class: 'state state--center' }, [
    el('span', { class: 'state__icon', html: icon(iconName) }),
    el('p', { class: 'state__title' }, title),
    desc ? el('p', { class: 'state__desc' }, desc) : null,
    action,
  ].filter(Boolean));
}

export function ErrorState({ title, desc, retry = null }) {
  return el('div', { class: 'state state--center state--error' }, [
    el('span', { class: 'state__icon', html: icon('warning') }),
    el('p', { class: 'state__title' }, title),
    desc ? el('p', { class: 'state__desc' }, desc) : null,
    retry ? el('button', { class: 'btn btn-secondary', onClick: retry }, 'Try again') : null,
  ].filter(Boolean));
}

export function SkeletonGrid(n = 6) {
  return el('div', { class: 'skeleton-grid', 'aria-hidden': 'true' }, Array.from({ length: n }, () => el('div', { class: 'skeleton skeleton-card' })));
}

export function SkeletonList(n = 6) {
  return el('div', { class: 'node-list', 'aria-hidden': 'true' }, Array.from({ length: n }, () => el('div', { class: 'skeleton skeleton-row' })));
}

export function SpinnerLine(text) {
  return el('div', { class: 'state', style: 'flex-direction:row;align-items:center;gap:.75rem;border-style:solid;' }, [
    el('span', { class: 'icon', style: 'animation:spin 1s linear infinite', html: icon('spinner') }),
    el('span', { class: 'state__desc', style: 'margin:0' }, text),
  ]);
}
