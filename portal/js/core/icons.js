// A small original line-icon set, inlined so the portal has no icon-font dependency.
const svg = (body, vb = '0 0 24 24') =>
  `<svg viewBox="${vb}" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const PATHS = {
  folder: '<path d="M3 6.5a1 1 0 0 1 1-1h4.5l1.6 1.8H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6.5Z"/>',
  doc: '<path d="M6.5 2.5h8L19 7v14a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z"/><path d="M14 2.5V7a.5.5 0 0 0 .5.5H19"/><path d="M8.2 12h7.2M8.2 15.2h7.2M8.2 18h4.6"/>',
  slides: '<rect x="2.5" y="4.5" width="19" height="12.5" rx="1.3"/><path d="M7.5 21h9M12 17v4"/><path d="M6.5 13.5l3-3.2 2.4 2.2 3-3.6 2.6 3"/>',
  sheet: '<rect x="3" y="3.5" width="18" height="17" rx="1.3"/><path d="M3 9h18M3 14.3h18M9.3 3.5V20.5M15 3.5v17"/>',
  web: '<circle cx="12" cy="12" r="9.2"/><path d="M2.8 12h18.4M12 2.8c2.6 2.6 4 5.8 4 9.2s-1.4 6.6-4 9.2c-2.6-2.6-4-5.8-4-9.2s1.4-6.6 4-9.2Z"/>',
  notebook: '<rect x="4" y="2.8" width="16" height="18.4" rx="1.3"/><path d="M8 2.8v18.4" /><path d="M11.5 7.5h5M11.5 10.7h5M11.5 13.9h3.2"/>',
  text: '<path d="M6.5 2.5h8L19 7v14a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z"/><path d="M14 2.5V7a.5.5 0 0 0 .5.5H19"/><path d="M8.2 11.2h7.2M8.2 14.4h7.2M8.2 17.6h4.6"/>',
  image: '<rect x="2.8" y="4" width="18.4" height="16" rx="1.3"/><circle cx="8.3" cy="9.3" r="1.7"/><path d="M4 17.5l5.2-5.3a1.4 1.4 0 0 1 2 0l1.6 1.6 3-3.3a1.4 1.4 0 0 1 2 0l3.2 3.6"/>',
  code: '<path d="M9 7.5 4.2 12 9 16.5M15 7.5 19.8 12 15 16.5"/>',
  media: '<circle cx="12" cy="12" r="9.2"/><path d="M9.8 8.3v7.4l6-3.7-6-3.7Z"/>',
  archive: '<rect x="3.2" y="3" width="17.6" height="18" rx="1.3"/><path d="M7.2 3v18M11 8h2.4M11 11.4h2.4M11 14.8h2.4"/>',
  file: '<path d="M6.5 2.5h8L19 7v14a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z"/><path d="M14 2.5V7a.5.5 0 0 0 .5.5H19"/>',
  legacy: '<path d="M6.5 2.5h8L19 7v14a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z"/><path d="M14 2.5V7a.5.5 0 0 0 .5.5H19"/><path d="M9 12.2l2.4 2.6L15 10.8"/>',

  download: '<path d="M12 3v12.2M7 11l5 5 5-5"/><path d="M4.5 17.5V20a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-2.5"/>',
  external: '<path d="M9.5 6H6.2A1.2 1.2 0 0 0 5 7.2v10.6A1.2 1.2 0 0 0 6.2 19h10.6a1.2 1.2 0 0 0 1.2-1.2V14.5"/><path d="M13.5 4.5h6v6M19 5l-8.5 8.5"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="M20 20l-4.6-4.6"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  'chevron-down': '<path d="M5 9l7 7 7-7"/>',
  'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  sun: '<circle cx="12" cy="12" r="4.3"/><path d="M12 2.6v2.6M12 18.8v2.6M4.6 4.6l1.9 1.9M17.5 17.5l1.9 1.9M2.6 12h2.6M18.8 12h2.6M4.6 19.4l1.9-1.9M17.5 6.5l1.9-1.9"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="1.4"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  info: '<circle cx="12" cy="12" r="9.2"/><path d="M12 11v6M12 7.3v.1"/>',
  warning: '<path d="M12 3.5 21.5 20h-19L12 3.5Z"/><path d="M12 9.8v4.2M12 17v.1"/>',
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1"/>',
  list: '<path d="M8.5 6h12M8.5 12h12M8.5 18h12"/><path d="M3.7 6h.01M3.7 12h.01M3.7 18h.01"/>',
  menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
  home: '<path d="M4 11.2 12 4l8 7.2"/><path d="M6 10v9.5a.7.7 0 0 0 .7.7h10.6a.7.7 0 0 0 .7-.7V10"/>',
  spinner: '<circle cx="12" cy="12" r="9" stroke-opacity=".25"/><path d="M21 12a9 9 0 0 0-9-9"/>',
};

export function icon(name, { size, class: cls = '' } = {}) {
  const body = PATHS[name] || PATHS.file;
  const s = svg(body);
  return `<span class="icon icon--${name} ${cls}" style="${size ? `font-size:${size}` : ''}">${s}</span>`;
}

/** Same as icon(), but returns a real DOM node — use this whenever an icon sits among other children. */
export function iconEl(name, opts) {
  const span = document.createElement('span');
  span.innerHTML = icon(name, opts);
  return span.firstChild;
}
