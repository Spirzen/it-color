import {colorGroups, namedColorCount, uniqueColorCount} from '@/data/html-colors.mjs';
import {hexToRgb, formatRgb} from '@/lib/color-utils.js';
import {handleCopy} from '@/lib/copy-ui.js';

const searchInput = document.getElementById('catalog-search');
const viewGridBtn = document.getElementById('view-grid');
const viewTableBtn = document.getElementById('view-table');
const gridView = document.getElementById('catalog-grid-view');
const tableView = document.getElementById('catalog-table-view');
const resultsCount = document.getElementById('catalog-results-count');

/** @type {'grid' | 'table'} */
let viewMode = 'grid';

function normalizeQuery(q) {
  return q.trim().toLowerCase();
}

function matchesColor(color, query) {
  if (!query) {
    return true;
  }
  const rgb = hexToRgb(color.hex);
  const rgbStr = rgb ? formatRgb(rgb).toLowerCase() : '';
  return (
    color.name.toLowerCase().includes(query) ||
    color.hex.toLowerCase().includes(query) ||
    rgbStr.includes(query)
  );
}

function studioUrl(hex) {
  const base = window.location.origin + window.location.pathname.replace(/\/html-colors\/?$/, '/');
  return `${base}?c=${encodeURIComponent(hex)}`;
}

function createTableRow(color) {
  const rgb = hexToRgb(color.hex);
  const tr = document.createElement('tr');
  tr.dataset.hex = color.hex;
  tr.innerHTML = `
    <td><button type="button" class="color-table__swatch" style="background:${color.hex}" title="Открыть в студии" aria-label="${color.name}"></button></td>
    <td class="color-table__name">${color.name}</td>
    <td class="color-table__hex"><code>${color.hex}</code></td>
    <td class="color-table__rgb"><code>${rgb ? formatRgb(rgb) : ''}</code></td>
    <td class="color-table__actions"></td>
  `;

  const actions = tr.querySelector('.color-table__actions');
  const copyHex = document.createElement('button');
  copyHex.type = 'button';
  copyHex.textContent = 'HEX';
  copyHex.addEventListener('click', () => handleCopy(color.hex, 'HEX'));

  const copyName = document.createElement('button');
  copyName.type = 'button';
  copyName.textContent = 'Имя';
  copyName.addEventListener('click', () => handleCopy(color.name, 'Имя'));

  const openStudio = document.createElement('button');
  openStudio.type = 'button';
  openStudio.textContent = 'Студия';
  openStudio.addEventListener('click', () => {
    window.location.href = studioUrl(color.hex);
  });

  actions?.append(copyHex, copyName, openStudio);

  tr.querySelector('.color-table__swatch')?.addEventListener('click', () => {
    window.location.href = studioUrl(color.hex);
  });

  return tr;
}

function createColorCard(color) {
  const card = document.createElement('article');
  card.className = 'color-card';
  card.title = `Открыть ${color.name} в студии`;
  card.innerHTML = `
    <div class="color-card__fill" style="background:${color.hex}"></div>
    <div class="color-card__meta">
      <span class="color-card__name">${color.name}</span>
      <span class="color-card__hex">${color.hex}</span>
    </div>
  `;

  card.addEventListener('click', () => {
    window.location.href = studioUrl(color.hex);
  });

  card.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    handleCopy(color.hex, 'HEX');
  });

  return card;
}

function renderCatalog(query = '') {
  const q = normalizeQuery(query);
  let visible = 0;

  for (const group of colorGroups) {
    const filtered = group.colors.filter((c) => matchesColor(c, q));
    visible += filtered.length;

    const gridGroupEl = document.querySelector(`[data-group-id="${group.id}"]`);
    if (gridGroupEl) {
      gridGroupEl.classList.toggle('is-hidden', filtered.length === 0);
      const gridEl = gridGroupEl.querySelector('[data-group-grid]');
      if (gridEl) {
        gridEl.replaceChildren();
        for (const color of filtered) {
          gridEl.appendChild(createColorCard(color));
        }
      }
    }

    const tableGroupEl = document.querySelector(`[data-table-group-id="${group.id}"]`);
    if (tableGroupEl) {
      tableGroupEl.classList.toggle('is-hidden', filtered.length === 0);
      const tableBody = tableGroupEl.querySelector('[data-group-table]');
      if (tableBody) {
        tableBody.replaceChildren();
        for (const color of filtered) {
          tableBody.appendChild(createTableRow(color));
        }
      }
    }
  }

  if (resultsCount) {
    resultsCount.textContent = q
      ? `Найдено: ${visible} из ${namedColorCount}`
      : `${namedColorCount} имён · ${uniqueColorCount} уникальных HEX`;
  }
}

function setView(mode) {
  viewMode = mode;
  viewGridBtn?.classList.toggle('is-active', mode === 'grid');
  viewTableBtn?.classList.toggle('is-active', mode === 'table');
  gridView?.classList.toggle('is-hidden', mode !== 'grid');
  tableView?.classList.toggle('is-hidden', mode !== 'table');
}

function init() {
  renderCatalog();

  searchInput?.addEventListener('input', () => {
    renderCatalog(searchInput.value);
  });

  viewGridBtn?.addEventListener('click', () => setView('grid'));
  viewTableBtn?.addEventListener('click', () => setView('table'));

  setView('grid');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
