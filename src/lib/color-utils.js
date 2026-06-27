/** @typedef {{ r: number, g: number, b: number }} Rgb */
/** @typedef {{ h: number, s: number, l: number }} Hsl */

import {colorByName} from '@/data/html-colors.mjs';

const HEX3 = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
const HEX6 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
const RGB = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i;
const HSL = /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/i;

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function normalizeHex(input) {
  if (!input) {
    return null;
  }
  let hex = String(input).trim();
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  if (HEX3.test(hex)) {
    hex = hex.replace(HEX3, (_, r, g, b) => r + r + g + g + b + b);
  }
  if (!/^[a-f\d]{6}$/i.test(hex)) {
    return null;
  }
  return `#${hex.toUpperCase()}`;
}

/** @param {Rgb} rgb */
export function rgbToHex({r, g, b}) {
  const to = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

/** @returns {Rgb | null} */
export function hexToRgb(hex) {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return null;
  }
  const match = normalized.slice(1).match(HEX6);
  if (!match) {
    return null;
  }
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

/** @param {Rgb} rgb @returns {Hsl} */
export function rgbToHsl({r, g, b}) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      default:
        h = ((rn - gn) / d + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/** @param {Hsl} hsl @returns {Rgb} */
export function hslToRgb({h, s, l}) {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

/** @returns {Rgb | null} */
export function parseColor(input) {
  if (!input && input !== 0) {
    return null;
  }
  const raw = String(input).trim();
  if (!raw) {
    return null;
  }

  const named = colorByName.get(raw.toLowerCase());
  if (named) {
    return hexToRgb(named);
  }

  const hexRgb = hexToRgb(raw);
  if (hexRgb) {
    return hexRgb;
  }

  const rgbMatch = raw.match(RGB);
  if (rgbMatch) {
    return {
      r: clamp(+rgbMatch[1], 0, 255),
      g: clamp(+rgbMatch[2], 0, 255),
      b: clamp(+rgbMatch[3], 0, 255),
    };
  }

  const hslMatch = raw.match(HSL);
  if (hslMatch) {
    return hslToRgb({
      h: +hslMatch[1],
      s: clamp(+hslMatch[2], 0, 100),
      l: clamp(+hslMatch[3], 0, 100),
    });
  }

  return null;
}

/** @param {Rgb} rgb */
export function formatRgb({r, g, b}) {
  return `rgb(${r}, ${g}, ${b})`;
}

/** @param {Hsl} hsl */
export function formatHsl({h, s, l}) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/** @param {Rgb} a @param {Rgb} b */
function relativeLuminance({r, g, b}) {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** @param {Rgb} fg @param {Rgb} bg */
export function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** @param {number} ratio */
export function wcagLabel(ratio) {
  if (ratio >= 7) {
    return 'AAA';
  }
  if (ratio >= 4.5) {
    return 'AA';
  }
  if (ratio >= 3) {
    return 'AA Large';
  }
  return 'Fail';
}

/** @param {Rgb} rgb */
export function findColorName(rgb) {
  const hex = rgbToHex(rgb);
  for (const [name, value] of colorByName.entries()) {
    if (value.toUpperCase() === hex) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  return null;
}

/** @param {Rgb} rgb @param {number} degrees */
export function rotateHue(rgb, degrees) {
  const hsl = rgbToHsl(rgb);
  return hslToRgb({...hsl, h: (hsl.h + degrees + 360) % 360});
}

/** @param {Rgb} rgb */
export function getHarmonies(rgb) {
  return {
    complement: rotateHue(rgb, 180),
    triadic1: rotateHue(rgb, 120),
    triadic2: rotateHue(rgb, 240),
    analogous1: rotateHue(rgb, 30),
    analogous2: rotateHue(rgb, -30),
    split1: rotateHue(rgb, 150),
    split2: rotateHue(rgb, 210),
  };
}

/** @param {Rgb} rgb @param {number} amount 0..1 */
export function lighten(rgb, amount) {
  const hsl = rgbToHsl(rgb);
  return hslToRgb({...hsl, l: clamp(hsl.l + amount * 100, 0, 100)});
}

/** @param {Rgb} rgb @param {number} amount 0..1 */
export function darken(rgb, amount) {
  return lighten(rgb, -amount);
}

/** @param {string} text */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** @param {Rgb} rgb */
export function colorFromQuery(hex) {
  const rgb = parseColor(hex);
  if (!rgb) {
    return null;
  }
  const hsl = rgbToHsl(rgb);
  return {
    hex: rgbToHex(rgb),
    rgb,
    hsl,
    name: findColorName(rgb),
    css: findColorName(rgb) ?? rgbToHex(rgb),
  };
}

export function readColorFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('c') ?? params.get('color');
  return q ? colorFromQuery(q) : null;
}

/** @param {string} hex */
export function writeColorToUrl(hex) {
  const url = new URL(window.location.href);
  url.searchParams.set('c', hex);
  history.replaceState(null, '', url);
}
