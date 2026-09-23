import { el } from '../core/dom.js';
import { libs } from '../core/loader.js';
import { renderMarkdownInto } from './markdown.js';

const asText = (v) => (Array.isArray(v) ? v.join('') : String(v ?? ''));
const stripAnsi = (s) => s.replace(/\u001b\[[0-9;]*m/g, '');

function outputBlock(kind, node) { return el('div', { class: `nb-output nb-output--${kind}` }, node); }

function renderOutputs(outputs, libsBundle) {
  const wrap = document.createDocumentFragment();
  for (const out of outputs || []) {
    if (out.output_type === 'stream') {
      wrap.append(outputBlock('stream', el('pre', {}, stripAnsi(asText(out.text)))));
    } else if (out.output_type === 'error') {
      const trace = stripAnsi(asText(out.traceback).replace(/\n?$/, out.traceback?.length ? '\n' : ''));
      wrap.append(outputBlock('error', el('pre', {}, `${out.ename}: ${out.evalue}\n${trace}`)));
    } else if (out.output_type === 'execute_result' || out.output_type === 'display_data') {
      const data = out.data || {};
      if (data['image/png']) {
        wrap.append(outputBlock('image', el('img', { src: `data:image/png;base64,${asText(data['image/png']).replace(/\s+/g, '')}` })));
      } else if (data['image/svg+xml']) {
        const box = outputBlock('image', '');
        box.innerHTML = libsBundle.DOMPurify.sanitize(asText(data['image/svg+xml']));
        wrap.append(box);
      } else if (data['text/html']) {
        const box = outputBlock('html', '');
        box.innerHTML = libsBundle.DOMPurify.sanitize(asText(data['text/html']));
        wrap.append(box);
      } else if (data['text/plain']) {
        wrap.append(outputBlock('text', el('pre', {}, asText(data['text/plain']))));
      }
    }
  }
  return wrap;
}

export async function render(node, ctx) {
  const [raw, libsBundle] = await Promise.all([(await fetch(ctx.contentUrl)).text(), libs.markdown()]);
  let nb;
  try { nb = JSON.parse(raw); }
  catch { ctx.host.append(el('div', { class: 'viewer-pad' }, el('p', { class: 'state__desc' }, 'This notebook file could not be parsed as JSON.'))); return; }

  const lang = nb.metadata?.kernelspec?.language || nb.metadata?.language_info?.name || 'python';
  const container = el('div', { class: 'notebook' });
  ctx.host.append(container);

  for (const cell of nb.cells || []) {
    const source = asText(cell.source);
    if (cell.cell_type === 'markdown') {
      const box = el('div', { class: 'nb-cell nb-cell--markdown' });
      container.append(box);
      renderMarkdownInto(box, source, libsBundle);
    } else if (cell.cell_type === 'code') {
      const label = el('div', { class: 'nb-cell__label' }, `In [${cell.execution_count ?? ' '}]`);
      const code = el('code', { class: `language-${lang}` });
      code.textContent = source;
      const sourceBox = el('div', { class: 'nb-cell__source' }, el('pre', {}, code));
      const cellEl = el('div', { class: 'nb-cell nb-cell--code' }, [label, sourceBox]);
      try { libsBundle.hljs.highlightElement(code); } catch { /* best-effort */ }
      const outputs = renderOutputs(cell.outputs, libsBundle);
      if (outputs.childNodes.length) cellEl.append(outputs);
      container.append(cellEl);
    } else if (cell.cell_type === 'raw' && source.trim()) {
      container.append(el('div', { class: 'nb-cell' }, el('pre', { class: 'txt-plain', style: 'padding:1rem' }, source)));
    }
  }

  if (!nb.cells?.length) container.append(el('p', { class: 'state__desc' }, 'This notebook has no cells.'));
}
