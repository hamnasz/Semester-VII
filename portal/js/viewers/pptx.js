import { el } from '../core/dom.js';
import { libs } from '../core/loader.js';

export async function render(node, ctx) {
  const pptxPreview = await libs.pptx();
  const buf = await (await fetch(ctx.contentUrl)).arrayBuffer();

  const width = Math.min(ctx.host.clientWidth - 48, 960) || 800;
  const stage = el('div', { class: 'pptx-stage', style: `width:${width}px;height:${Math.round((width * 9) / 16)}px` });
  const prevBtn = el('button', { class: 'btn btn-icon', 'aria-label': 'Previous slide', html: '\u2039' });
  const nextBtn = el('button', { class: 'btn btn-icon', 'aria-label': 'Next slide', html: '\u203a' });
  const count = el('span', { class: 'pptx-nav__count' }, 'Loading\u2026');
  const wrap = el('div', { class: 'pptx-wrap' }, [stage, el('div', { class: 'pptx-nav' }, [prevBtn, count, nextBtn])]);
  ctx.host.append(wrap);

  const instance = pptxPreview.init(stage, { width, height: Math.round((width * 9) / 16), mode: 'slide' });
  await instance.preview(buf);
  const total = instance.slideCount ?? 1;
  let current = 1;
  const update = () => { count.textContent = `Slide ${current} of ${total}`; prevBtn.disabled = current <= 1; nextBtn.disabled = current >= total; };
  update();

  prevBtn.addEventListener('click', () => { if (current > 1) { instance.renderPreSlide(); current--; update(); } });
  nextBtn.addEventListener('click', () => { if (current < total) { instance.renderNextSlide(); current++; update(); } });
  document.addEventListener('keydown', function onKey(e) {
    if (!document.body.contains(stage)) { document.removeEventListener('keydown', onKey); return; }
    if (e.key === 'ArrowRight') nextBtn.click(); else if (e.key === 'ArrowLeft') prevBtn.click();
  });
}
