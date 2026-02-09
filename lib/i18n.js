/**
 * i18n.js - 커스텀 다국어 지원 모듈
 *
 * chrome.i18n API는 브라우저 언어에 종속되어 런타임 전환이 불가하므로,
 * lib/locales/*.json을 동적으로 로드하는 커스텀 방식을 사용합니다.
 */

let currentLang = 'ko';
let translations = {};
const changeListeners = [];

// locale 코드 매핑 (toLocaleDateString 등에 사용)
const LOCALE_MAP = {
  ko: 'ko-KR',
  en: 'en-US',
  zh: 'zh-CN',
  ja: 'ja-JP'
};

/**
 * locale JSON 파일을 로드합니다.
 * @param {string} lang - 'ko', 'en' 등
 */
async function loadLocale(lang) {
  const url = chrome.runtime.getURL(`lib/locales/${lang}.json`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`[i18n] Failed to load locale: ${lang} (${response.status})`);
  }
  translations = await response.json();
}

/**
 * i18n을 초기화합니다.
 * @param {string} [lang='ko'] - 초기 언어 코드
 */
async function initI18n(lang) {
  currentLang = lang || 'ko';
  await loadLocale(currentLang);
  translatePage();
}

/**
 * 번역 문자열을 반환합니다.
 * @param {string} key - 번역 키 (예: 'popup_title')
 * @param {Object} [params] - 파라미터 맵 (예: { count: 5 })
 * @returns {string}
 */
function t(key, params) {
  let str = translations[key];
  if (!str) {
    console.warn(`[i18n] Missing key: ${key} (lang: ${currentLang})`);
    return key;
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replaceAll(`{${k}}`, v);
    }
  }
  return str;
}

/**
 * DOM 요소들의 텍스트를 현재 언어로 번역합니다.
 * data-i18n, data-i18n-placeholder, data-i18n-aria, data-i18n-title 속성을 처리합니다.
 */
function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });

  document.documentElement.lang = currentLang;
}

/**
 * 런타임에 언어를 전환합니다.
 * @param {string} lang - 새 언어 코드
 */
async function setLanguage(lang) {
  if (lang === currentLang && Object.keys(translations).length > 0) return;

  await loadLocale(lang);
  currentLang = lang;
  translatePage();

  for (const cb of changeListeners) {
    try { cb(lang); } catch (e) { console.error('[i18n] Listener error:', e); }
  }
}

/**
 * 현재 언어 코드를 반환합니다.
 * @returns {string}
 */
function getCurrentLang() {
  return currentLang;
}

/**
 * 현재 언어의 locale 코드를 반환합니다 (예: 'ko-KR').
 * @returns {string}
 */
function getLocaleCode() {
  return LOCALE_MAP[currentLang] || 'en-US';
}

/**
 * 언어 변경 시 호출될 콜백을 등록합니다.
 * @param {Function} callback - (lang: string) => void
 */
function onLanguageChange(callback) {
  changeListeners.push(callback);
}

export { initI18n, t, translatePage, setLanguage, getCurrentLang, getLocaleCode, onLanguageChange };
