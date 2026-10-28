'use strict';
const THEME_KEY = 'kotlin-theme-v1';
function applyTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#121c18' : '#f7f7f0');
  const button = document.querySelector('#theme-toggle');
  if (button) {
    button.textContent = dark ? 'Modo claro' : 'Modo oscuro';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
  }
}
let initialTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
try {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') initialTheme = saved;
} catch { /* La preferencia del sistema permite usar el tema sin almacenamiento. */ }
applyTheme(initialTheme);
