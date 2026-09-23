import { el } from '../core/dom.js';
import { libs } from '../core/loader.js';

export async function render(node, ctx) {
  const [text, { marked, DOMPurify, hljs, katex }] = await Promise.all([(await fetch(ctx.contentUrl)).text(), libs.markdown()]);
  const prose = el('div', { class: 'prose' });
  ctx.host.append(prose);
  renderMarkdownInto(prose, text, { marked, DOMPurify, hljs, katex });
}

/** Shared by the markdown viewer and notebook markdown cells. */
export function renderMarkdownInto(target, source, { marked, DOMPurify, hljs, katex }) {
  const withMath = protectMath(source);
  marked.setOptions({ gfm: true, breaks: false });
  const rawHtml = marked.parse(withMath.text);
  target.innerHTML = DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['target'] });
  target.querySelectorAll('pre code').forEach((block) => { try { hljs.highlightElement(block); } catch { /* ignore */ } });
  if (katex && withMath.placeholders.size) restoreMath(target, withMath.placeholders, katex);
  target.querySelectorAll('a[href^="http"]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
}

// Pull out $$..$$ and $..$ before Markdown parsing (so underscores/asterisks inside
// math are not mangled), render with KaTeX, then splice the results back in.
function protectMath(src) {
  const placeholders = new Map();
  let i = 0;
  const text = src
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => { const k = `\u0000M${i++}\u0000`; placeholders.set(k, { expr, display: true }); return k; })
    .replace(/(^|[^\\$])\$([^\n$]+?)\$/g, (_, pre, expr) => { const k = `\u0000M${i++}\u0000`; placeholders.set(k, { expr, display: false }); return pre + k; });
  return { text, placeholders };
}

function restoreMath(target, placeholders, katex) {
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  const hits = [];
  let n;
  while ((n = walker.nextNode())) if (n.nodeValue.includes('\u0000M')) hits.push(n);
  for (const node of hits) {
    const parts = node.nodeValue.split(/(\u0000M\d+\u0000)/);
    if (parts.length === 1) continue;
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      const m = placeholders.get(part);
      if (!m) { frag.append(part); continue; }
      const span = document.createElement('span');
      try { katex.render(m.expr, span, { throwOnError: false, displayMode: m.display }); }
      catch { span.textContent = m.expr; }
      frag.append(span);
    }
    node.replaceWith(frag);
  }
}
