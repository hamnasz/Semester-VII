import { el } from '../core/dom.js';
import { libs } from '../core/loader.js';

export async function render(node, ctx) {
  const docx = await libs.docx();
  const buf = await (await fetch(ctx.contentUrl)).arrayBuffer();
  const scroll = el('div', { class: 'docx-scroll' });
  const styleHost = el('div');
  const docHost = el('div', { class: 'docx-host' }, styleHost);
  scroll.append(docHost);
  ctx.host.append(scroll);
  await docx.renderAsync(buf, docHost, styleHost, {
    className: 'docx', inWrapper: true, breakPages: true, ignoreLastRenderedPageBreak: true, useBase64URL: true,
  });
}
