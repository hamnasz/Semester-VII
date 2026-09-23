import { el } from '../core/dom.js';

export async function render(node, ctx) {
  const text = await (await fetch(ctx.contentUrl)).text();
  ctx.host.append(el('pre', { class: 'txt-plain' }, text));
}
