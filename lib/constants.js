/**
 * constants.js - HTML 파싱 상수 로더
 *
 * html_parsing_mapping_table.json에서 CSS 셀렉터를 로드하여 제공합니다.
 * Google 번역 DOM 구조 변경 시 JSON 파일만 수정하면 됩니다.
 *
 * Usage:
 *   import { getSelectors, getSelector } from './constants.js';
 *   const selectors = await getSelectors();
 *   const wordEl = document.querySelector(selectors.dictionaryWord.wordText);
 */

let _cachedSelectors = null;

/**
 * 매핑 테이블 전체를 로드합니다. 최초 로드 후 캐싱됩니다.
 * @returns {Promise<Object>}
 */
async function getSelectors() {
  if (_cachedSelectors) {
    return _cachedSelectors;
  }

  try {
    const url = chrome.runtime.getURL('lib/html_parsing_mapping_table.json');
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load mapping table: ${response.status}`);
    }

    _cachedSelectors = await response.json();
    console.log('[VocabBuilder] Parsing selectors loaded, version:', _cachedSelectors._version);
    return _cachedSelectors;
  } catch (error) {
    console.error('[VocabBuilder] Failed to load parsing selectors:', error);
    throw error;
  }
}

/**
 * 특정 셀렉터 그룹을 키 이름으로 가져옵니다.
 * @param {string} key - 셀렉터 그룹명 (예: 'dictionaryWord', 'meanings')
 * @returns {Promise<Object|null>}
 */
async function getSelector(key) {
  const selectors = await getSelectors();
  return selectors[key] || null;
}

/**
 * 특정 셀렉터가 유효한 값(null이 아닌)을 가지는지 확인합니다.
 * _TODO_ 항목 체크에 유용합니다.
 * @param {string} key - 셀렉터 그룹명
 * @param {string} field - 그룹 내 필드명
 * @returns {Promise<boolean>}
 */
async function isSelectorAvailable(key, field) {
  const group = await getSelector(key);
  if (!group) return false;
  return group[field] != null;
}

/**
 * 매핑 테이블 버전을 반환합니다.
 * @returns {Promise<string>}
 */
async function getMappingVersion() {
  const selectors = await getSelectors();
  return selectors._version || 'unknown';
}

/**
 * 캐시된 셀렉터를 초기화합니다.
 */
function clearSelectorCache() {
  _cachedSelectors = null;
}

export {
  getSelectors,
  getSelector,
  isSelectorAvailable,
  getMappingVersion,
  clearSelectorCache
};
