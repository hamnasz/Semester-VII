import { el, clear } from '../core/dom.js';
import { libs } from '../core/loader.js';

const MIN_SCALE = 0.5, MAX_SCALE = 3;

async function renderPage(doc, num, scale, dpr) {
  const page = await doc.getPage(num);
  const viewport = page.getViewport({ scale });
  const canvas = el('canvas', { width: Math.ceil(viewport.width * dpr), height: Math.ceil(viewport.height * dpr) });
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  const wrap = el('div', { class: 'pdf-page', id: `pdf-page-${num}`, style: `width:${viewport.width}px;height:${viewport.height}px` }, canvas);

  await page.render({ canvasContext: canvas.getContext('2d'), viewport, transform: [dpr, 0, 0, dpr, 0, 0] }).promise;

  const layer = el('div', { class: 'textLayer' });
  layer.style.setProperty('--total-scale-factor', String(scale));
  wrap.append(layer);
  const pdfjs = await libs.pdfjs();
  const textLayer = new pdfjs.TextLayer({ textContentSource: page.streamTextContent(), container: layer, viewport });
  await textLayer.render();

  return wrap;
}

export async function render(node, ctx) {
  const pdfjs = await libs.pdfjs();
  const buf = await (await fetch(ctx.contentUrl)).arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const width = ctx.host.clientWidth || 800;
  const first = await doc.getPage(1);
  let scale = Math.min(Math.max((width - 96) / first.getViewport({ scale: 1 }).width, MIN_SCALE), MAX_SCALE);

  const status = el('span', {}, `${doc.numPages} page${doc.numPages === 1 ? '' : 's'}`);
  const jump = el('input', { type: 'number', min: '1', max: String(doc.numPages), value: '1', 'aria-label': 'Jump to page' });
  jump.addEventListener('change', () => {
    const n = Math.min(Math.max(1, Number(jump.value) || 1), doc.numPages);
    document.getElementById(`pdf-page-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const zoomOut = el('button', { class: 'btn btn-icon', 'aria-label': 'Zoom out', text: '\u2212' });
  const zoomIn = el('button', { class: 'btn btn-icon', 'aria-label': 'Zoom in', text: '+' });

  const controls = el('div', { class: 'pdf-controls' }, [zoomOut, jump, status, zoomIn]);
  const scroll = el('div', { class: 'pdf-scroll' });
  ctx.host.append(controls, scroll);

  const draw = async () => {
    clear(scroll);
    scroll.append(el('p', { class: 'state__desc' }, 'Rendering pages\u2026'));
    const pages = [];
    for (let n = 1; n <= doc.numPages; n++) pages.push(await renderPage(doc, n, scale, dpr));
    clear(scroll);
    scroll.append(...pages);
  };

  zoomOut.addEventListener('click', () => { scale = Math.max(MIN_SCALE, scale * 0.87); draw(); });
  zoomIn.addEventListener('click', () => { scale = Math.min(MAX_SCALE, scale * 1.15); draw(); });

  await draw();
}
