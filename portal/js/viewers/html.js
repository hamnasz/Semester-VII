import { el } from '../core/dom.js';

/**
 * Rendered pages are shown in a sandboxed iframe via srcdoc, so the page has an opaque
 * origin: scripting is allowed (the decks in this repo use it for slide navigation and
 * fullscreen) but it can never read cookies/storage or navigate the parent page, because
 * "allow-same-origin" is deliberately left out of the sandbox.
 */
export async function render(node, ctx) {
  const text = await (await fetch(ctx.contentUrl)).text();
  const iframe = el('iframe', {
    sandbox: 'allow-scripts allow-popups',
    allow: 'fullscreen',
    allowfullscreen: true,
    referrerpolicy: 'no-referrer',
    title: node.name,
  });
  ctx.host.append(el('div', { class: 'html-frame-wrap' }, iframe));
  iframe.srcdoc = text;
}
