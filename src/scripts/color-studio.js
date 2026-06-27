import {
  clamp,
  parseColor,
  rgbToHex,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  formatRgb,
  formatHsl,
  findColorName,
  contrastRatio,
  wcagLabel,
  getHarmonies,
  readColorFromUrl,
  writeColorToUrl,
} from '@/lib/color-utils.js';
import {handleCopy} from '@/lib/copy-ui.js';

const DEFAULT = hexToRgb('#6366F1');

/** @type {{ hex: string, rgb: import('@/lib/color-utils.js').Rgb, hsl: import('@/lib/color-utils.js').Hsl, name: string | null }} */
let state = buildState(DEFAULT);

function buildState(rgb) {
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  return {hex, rgb, hsl, name: findColorName(rgb)};
}

function $(id) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing #${id}`);
  }
  return el;
}

function setStateFromRgb(rgb, {updateUrl = true} = {}) {
  state = buildState(rgb);
  renderAll();
  if (updateUrl) {
    writeColorToUrl(state.hex);
  }
}

function renderSwatch() {
  const swatch = $('swatch-main');
  swatch.style.backgroundColor = state.hex;
  $('swatch-hex-label').textContent = state.hex;
}

function renderFields() {
  $('input-hex').value = state.hex;
  $('input-color').value = state.hex;
  $('input-r').value = String(state.rgb.r);
  $('input-g').value = String(state.rgb.g);
  $('input-b').value = String(state.rgb.b);
  $('input-h').value = String(state.hsl.h);
  $('input-s').value = String(state.hsl.s);
  $('input-l').value = String(state.hsl.l);
  $('range-r').value = String(state.rgb.r);
  $('range-g').value = String(state.rgb.g);
  $('range-b').value = String(state.rgb.b);
  $('range-h').value = String(state.hsl.h);
  $('range-s').value = String(state.hsl.s);
  $('range-l').value = String(state.hsl.l);
}

function renderCopyChips() {
  const name = state.name ?? '—';
  const cssValue = state.name ?? state.hex;
  $('chip-hex').querySelector('.copy-chip__value').textContent = state.hex;
  $('chip-rgb').querySelector('.copy-chip__value').textContent = formatRgb(state.rgb);
  $('chip-hsl').querySelector('.copy-chip__value').textContent = formatHsl(state.hsl);
  $('chip-name').querySelector('.copy-chip__value').textContent = name;
  $('chip-css').querySelector('.copy-chip__value').textContent = cssValue;
}

function renderContrast() {
  const white = {r: 255, g: 255, b: 255};
  const black = {r: 0, g: 0, b: 0};
  const onWhite = contrastRatio(state.rgb, white);
  const onBlack = contrastRatio(state.rgb, black);

  const whiteSample = $('contrast-white-sample');
  whiteSample.style.backgroundColor = '#ffffff';
  whiteSample.style.color = state.hex;
  whiteSample.textContent = 'Aa';

  const blackSample = $('contrast-black-sample');
  blackSample.style.backgroundColor = '#000000';
  blackSample.style.color = state.hex;
  blackSample.textContent = 'Aa';

  $('contrast-white-meta').textContent = `${onWhite.toFixed(2)} · ${wcagLabel(onWhite)}`;
  $('contrast-black-meta').textContent = `${onBlack.toFixed(2)} · ${wcagLabel(onBlack)}`;
}

function renderHarmonies() {
  const harmonies = getHarmonies(state.rgb);
  const container = $('harmony-row');
  container.replaceChildren();

  const labels = {
    complement: 'Компл.',
    triadic1: '+120°',
    triadic2: '+240°',
    analogous1: '+30°',
    analogous2: '−30°',
    split1: '+150°',
    split2: '+210°',
  };

  for (const [key, rgb] of Object.entries(harmonies)) {
    const hex = rgbToHex(rgb);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'harmony-swatch';
    btn.title = hex;
    btn.innerHTML = `<span class="harmony-swatch__color" style="background:${hex}"></span><span>${labels[key] ?? key}</span>`;
    btn.addEventListener('click', () => setStateFromRgb(rgb));
    container.appendChild(btn);
  }
}

function renderPlayground() {
  const card = $('playground-card');
  const btn = $('playground-btn');
  const link = $('playground-link');
  const badge = $('playground-badge');

  const bg = document.querySelector('input[name="pg-target"][value="background"]:checked');
  const text = document.querySelector('input[name="pg-target"][value="text"]:checked');
  const accent = document.querySelector('input[name="pg-target"][value="accent"]:checked');
  const border = document.querySelector('input[name="pg-target"][value="border"]:checked');

  if (bg) {
    card.style.backgroundColor = state.hex;
  }
  if (text) {
    card.style.color = state.hex;
  }
  if (accent) {
    btn.style.backgroundColor = state.hex;
    btn.style.color = contrastRatio(state.rgb, {r: 255, g: 255, b: 255}) >= contrastRatio(state.rgb, {r: 0, g: 0, b: 0}) ? '#fff' : '#000';
    link.style.color = state.hex;
  }
  if (border) {
    card.style.border = `2px solid ${state.hex}`;
  }

  badge.style.backgroundColor = state.hex;
  badge.style.color = contrastRatio(state.rgb, {r: 255, g: 255, b: 255}) >= 3 ? '#fff' : '#000';
  badge.style.borderColor = 'transparent';
}

function renderAll() {
  renderSwatch();
  renderFields();
  renderCopyChips();
  renderContrast();
  renderHarmonies();
  renderPlayground();
}

function bindHexInput() {
  $('input-hex').addEventListener('change', () => {
    const rgb = parseColor($('input-hex').value);
    if (rgb) {
      setStateFromRgb(rgb);
    } else {
      renderFields();
    }
  });
}

function bindColorPicker() {
  $('input-color').addEventListener('input', (e) => {
    const target = /** @type {HTMLInputElement} */ (e.target);
    const rgb = hexToRgb(target.value);
    if (rgb) {
      setStateFromRgb(rgb);
    }
  });
}

function bindRgb() {
  const updateFromRgbFields = () => {
    const rgb = {
      r: clamp(+($('input-r').value || 0), 0, 255),
      g: clamp(+($('input-g').value || 0), 0, 255),
      b: clamp(+($('input-b').value || 0), 0, 255),
    };
    setStateFromRgb(rgb);
  };

  for (const id of ['input-r', 'input-g', 'input-b', 'range-r', 'range-g', 'range-b']) {
    $(id).addEventListener('input', updateFromRgbFields);
  }
}

function bindHsl() {
  const updateFromHslFields = () => {
    const hsl = {
      h: clamp(+($('input-h').value || 0), 0, 360),
      s: clamp(+($('input-s').value || 0), 0, 100),
      l: clamp(+($('input-l').value || 0), 0, 100),
    };
    setStateFromRgb(hslToRgb(hsl));
  };

  for (const id of ['input-h', 'input-s', 'input-l', 'range-h', 'range-s', 'range-l']) {
    $(id).addEventListener('input', updateFromHslFields);
  }
}

function bindCopyChips() {
  const map = {
    'chip-hex': () => state.hex,
    'chip-rgb': () => formatRgb(state.rgb),
    'chip-hsl': () => formatHsl(state.hsl),
    'chip-name': () => state.name ?? state.hex,
    'chip-css': () => state.name ?? state.hex,
  };

  for (const [id, getValue] of Object.entries(map)) {
    $(id).addEventListener('click', () => {
      const label = $(id).querySelector('.copy-chip__label')?.textContent ?? 'Значение';
      handleCopy(getValue(), label);
    });
  }
}

function bindEyedropper() {
  const btn = document.getElementById('btn-eyedropper');
  if (!btn || !('EyeDropper' in window)) {
    btn?.remove();
    return;
  }

  btn.addEventListener('click', async () => {
    try {
      // @ts-ignore — EyeDropper is not in all TS libs yet
      const dropper = new EyeDropper();
      const result = await dropper.open();
      const rgb = hexToRgb(result.sRGBHex);
      if (rgb) {
        setStateFromRgb(rgb);
      }
    } catch {
      /* cancelled */
    }
  });
}

function bindPlayground() {
  document.querySelectorAll('input[name="pg-target"]').forEach((el) => {
    el.addEventListener('change', renderPlayground);
  });

  $('btn-apply-playground').addEventListener('click', renderPlayground);

  $('btn-reset-playground').addEventListener('click', () => {
    const card = $('playground-card');
    card.style.backgroundColor = '';
    card.style.color = '';
    card.style.border = '';
    $('playground-btn').style.backgroundColor = '';
    $('playground-btn').style.color = '';
    $('playground-link').style.color = '';
    $('playground-badge').style.backgroundColor = '';
    $('playground-badge').style.color = '';
    $('playground-badge').style.borderColor = '';
  });
}

function bindRandom() {
  $('btn-random').addEventListener('click', () => {
    const rgb = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
    setStateFromRgb(rgb);
  });
}

function initFromUrl() {
  const fromUrl = readColorFromUrl();
  if (fromUrl) {
    setStateFromRgb(fromUrl.rgb, {updateUrl: false});
  } else {
    renderAll();
  }
}

function init() {
  bindHexInput();
  bindColorPicker();
  bindRgb();
  bindHsl();
  bindCopyChips();
  bindEyedropper();
  bindPlayground();
  bindRandom();
  initFromUrl();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {setStateFromRgb};
