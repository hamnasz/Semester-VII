// Lazy loader for the vendored preview libraries. Nothing is fetched until a viewer needs it.
const base = new URL('../../vendor/', import.meta.url);
const inflight = new Map();

function once(key, create) {
  if (!inflight.has(key)) {
    const p = create();
    p.catch(() => inflight.delete(key));   // allow a retry after a failure
    inflight.set(key, p);
  }
  return inflight.get(key);
}

const script = (rel) => once(rel, () => new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = new URL(rel, base).href;
  s.async = true;
  s.onload = () => resolve();
  s.onerror = () => { s.remove(); reject(new Error(`Could not load ${rel}`)); };
  document.head.append(s);
}));

const style = (rel) => once(rel, () => new Promise((resolve, reject) => {
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = new URL(rel, base).href;
  l.onload = () => resolve();
  l.onerror = () => { l.remove(); reject(new Error(`Could not load ${rel}`)); };
  document.head.append(l);
}));

export const libs = {
  async pdfjs() {
    return once('pdfjs', async () => {
      const m = await import(new URL('pdfjs/pdf.min.mjs', base).href);
      m.GlobalWorkerOptions.workerSrc = new URL('pdfjs/pdf.worker.min.mjs', base).href;
      return m;
    });
  },
  async docx() {
    await script('docx/jszip.min.js');
    await script('docx/docx-preview.min.js');
    return window.docx;
  },
  async jszip() { await script('docx/jszip.min.js'); return window.JSZip; },
  async xlsx() { await script('xlsx/xlsx.full.min.js'); return window.XLSX; },
  async pptx() { await script('pptx/pptx-preview.umd.js'); return window.pptxPreview; },
  async markdown() {
    await Promise.all([
      script('markdown/marked.umd.js'), script('markdown/purify.min.js'), script('markdown/highlight.min.js'),
      script('markdown/katex/katex.min.js'), style('markdown/katex/katex.min.css'),
    ]);
    return { marked: window.marked, DOMPurify: window.DOMPurify, hljs: window.hljs, katex: window.katex };
  },
};
