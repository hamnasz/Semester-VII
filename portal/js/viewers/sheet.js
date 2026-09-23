import { el, clear } from '../core/dom.js';
import { libs } from '../core/loader.js';

const ROW_CAP = 1000;
const COL_CAP = 60;

function buildTable(rows) {
  const table = el('table', { class: 'sheet-table' });
  const capped = rows.slice(0, ROW_CAP);
  const [head, ...body] = capped;
  const colCount = Math.min(COL_CAP, Math.max(0, ...capped.map((r) => r.length)));

  if (head) {
    const tr = el('tr', {}, [el('th', {}, ''), ...Array.from({ length: colCount }, (_, i) => el('th', {}, String(head[i] ?? '')))]);
    table.append(el('thead', {}, tr));
  }
  const tbody = el('tbody');
  body.forEach((row, i) => {
    const tr = el('tr', {}, [el('th', { scope: 'row' }, String(i + 1)), ...Array.from({ length: colCount }, (_, c) => el('td', {}, String(row[c] ?? '')))]);
    tbody.append(tr);
  });
  table.append(tbody);
  return { table, truncated: rows.length > ROW_CAP, total: rows.length };
}

export async function render(node, ctx) {
  const XLSX = await libs.xlsx();
  const isCsv = node.type.id === 'csv';
  let wb;
  if (isCsv) {
    const text = await (await fetch(ctx.contentUrl)).text();
    wb = XLSX.read(text, { type: 'string' });
  } else {
    const buf = await (await fetch(ctx.contentUrl)).arrayBuffer();
    wb = XLSX.read(buf, { type: 'array' });
  }

  const tabs = el('div', { class: 'sheet-tabs', role: 'tablist' });
  const scroll = el('div', { class: 'sheet-scroll' });
  const note = el('p', { class: 'state__desc', style: 'padding:0.5rem 1rem 0;margin:0' });
  ctx.host.append(tabs, scroll);

  const showSheet = (name) => {
    [...tabs.children].forEach((t) => t.setAttribute('aria-selected', String(t.dataset.name === name)));
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: false, defval: '' });
    const { table, truncated, total } = buildTable(rows);
    clear(scroll);
    if (!rows.length) { scroll.append(el('p', { class: 'state__desc', style: 'padding:2rem' }, 'This sheet is empty.')); return; }
    scroll.append(table);
    note.textContent = truncated ? `Showing the first ${ROW_CAP.toLocaleString('en')} of ${total.toLocaleString('en')} rows.` : '';
  };

  for (const name of wb.SheetNames) {
    const tab = el('button', { class: 'sheet-tab', role: 'tab', dataset: { name }, onClick: () => showSheet(name) }, isCsv ? node.name : name);
    tabs.append(tab);
  }
  if (wb.SheetNames.length <= 1) tabs.style.display = 'none';
  ctx.host.append(note);
  showSheet(wb.SheetNames[0]);
}
