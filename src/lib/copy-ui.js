import {copyText} from '@/lib/color-utils.js';

/** @type {ReturnType<typeof setTimeout> | null} */
let toastTimer = null;

export function showToast(message = 'Скопировано') {
  const toast = document.getElementById('copy-toast');
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add('is-visible');
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.hidden = true;
  }, 1600);
}

export async function handleCopy(text, label) {
  const ok = await copyText(text);
  showToast(ok ? `${label} скопирован` : 'Не удалось скопировать');
}
