// Maps a viewer id (from filetypes.js) to the module that renders it.
// Each module is only fetched once a matching file is actually opened.
const MODULES = {
  pdf: () => import('./pdf.js'),
  docx: () => import('./docx.js'),
  pptx: () => import('./pptx.js'),
  sheet: () => import('./sheet.js'),
  csv: () => import('./sheet.js'),
  html: () => import('./html.js'),
  notebook: () => import('./notebook.js'),
  markdown: () => import('./markdown.js'),
  text: () => import('./text.js'),
  code: () => import('./code.js'),
  image: () => import('./image.js'),
  media: () => import('./media.js'),
  archive: () => import('./archive.js'),
  legacy: () => import('./unavailable.js'),
  unsupported: () => import('./unavailable.js'),
};

export async function getViewer(viewerId) {
  const load = MODULES[viewerId] || MODULES.unsupported;
  const mod = await load();
  return mod.render;
}
