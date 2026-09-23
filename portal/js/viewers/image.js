import { el } from '../core/dom.js';

export async function render(node, ctx) {
  const img = el('img', { src: ctx.contentUrl, alt: node.name, loading: 'eager' });
  ctx.host.append(el('div', { class: 'image-wrap' }, img));
  await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
}
