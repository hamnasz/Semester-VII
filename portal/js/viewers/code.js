import { el } from '../core/dom.js';
import { libs } from '../core/loader.js';

export async function render(node, ctx) {
  const [text, { hljs }] = await Promise.all([(await fetch(ctx.contentUrl)).text(), libs.markdown()]);
  const code = el('code', { class: node.type.lang ? `language-${node.type.lang}` : '' });
  code.textContent = text;
  const pre = el('pre', {}, code);
  ctx.host.append(el('div', { class: 'code-view' }, pre));
  try { hljs.highlightElement(code); } catch { /* best-effort */ }
}
