# Coding Style Guide

이 문서는 프로젝트의 코딩 컨벤션을 정리한 것입니다.
AI 에이전트 및 기여자는 코드 작성 시 이 가이드를 따라주세요.

---

## 1. 파일 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| JS/CSS/HTML 파일 | kebab-case | `service-worker.js`, `content-script.js` |
| JSON 데이터 파일 | kebab-case | `messages.json` |
| 디렉토리 | kebab-case 또는 단일 단어 | `sidepanel/`, `lib/`, `_locales/` |

---

## 2. 네이밍 컨벤션

### JavaScript

```js
// 변수: camelCase
const currentLang = 'ko';
let searchDebounceTimer = null;

// 함수: camelCase
function switchTab(tabName) { ... }
async function getAllWords() { ... }

// 내부(private) 함수/변수: _camelCase (언더스코어 접두사)
let _cachedSelectors = null;
function _defaultMeta() { ... }

// 상수 객체: UPPER_SNAKE_CASE
const STORAGE_KEYS = { WORDS: 'vocabulary_words', META: 'vocabulary_meta' };
const STATE = { selectors: null, observer: null };

// Boolean 함수: is 접두사
function isGoogleTranslatePage() { ... }
function isSavedWord() { ... }

// Getter 함수: get 접두사
function getSettings() { ... }
function getAllWords() { ... }
```

### CSS

```css
/* BEM 컨벤션 (Block__Element--Modifier) */
.word-card { }
.word-card__word { }
.word-card__meta { }
.tabs__btn--active { }

/* Content script: vocab- 접두사로 네임스페이스 격리 */
.vocab-save-btn { }
.vocab-save-btn--saved { }
.vocab-toast { }

/* CSS 변수: --카테고리-이름 */
--color-primary: #1a73e8;
--space-4: 16px;
--radius-md: 8px;
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.12);

/* Content script CSS 변수: --vocab- 접두사 */
--vocab-primary: #1a73e8;
--vocab-success: #34a853;
```

### HTML

```html
<!-- i18n 데이터 속성 -->
<h1 data-i18n="popup_title">단어장</h1>
<input data-i18n-placeholder="search_placeholder" placeholder="검색...">
<button data-i18n-aria="filter_label" aria-label="필터">필터</button>
```

---

## 3. 포매팅

| 항목 | 규칙 |
|------|------|
| 들여쓰기 | **2칸 스페이스** (탭 사용 금지) |
| 따옴표 (JS) | **작은따옴표** `'string'` |
| 따옴표 (HTML 속성) | **큰따옴표** `class="name"` |
| 따옴표 (템플릿 리터럴 내 HTML) | **큰따옴표** `` `<div class="card">` `` |
| 세미콜론 | **항상 사용** |
| 최대 줄 길이 | ~120자 (HTML 템플릿 리터럴은 예외 허용) |

---

## 4. 함수 스타일

```js
// 최상위 함수: function 선언문 사용 (화살표 함수 X)
function switchTab(tabName) { ... }
async function init() { ... }

// 콜백/인라인: 화살표 함수 사용
words.filter(w => w.metadata?.savedAt?.startsWith(today));
tabButtons.forEach(btn => { ... });
btn.addEventListener('click', () => { ... });
```

**규칙**: 최상위 named 함수는 반드시 `function` 선언문, 콜백은 화살표 함수.

---

## 5. 비동기 패턴

```js
// 기본: async/await 사용
async function loadData() {
  try {
    const words = await getAllWords();
    const settings = await getSettings();
    // ...
  } catch (error) {
    console.error('[VocabBuilder] Error loading data:', error);
    return [];
  }
}

// Chrome callback API 래핑 시에만 new Promise() 사용
function localGet(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve(result);
    });
  });
}
```

**규칙**: `.then()` 체인 대신 `async/await` 사용. `new Promise()`는 콜백 API 래핑에만 허용.

---

## 6. 변수 선언

```js
// const: 기본값. 재할당이 없는 모든 경우
const words = await getAllWords();
const tabButtons = document.querySelectorAll('.tabs__btn');

// let: 재할당이 필요한 경우에만
let currentLang = 'ko';
let searchDebounceTimer = null;

// var: 사용 금지
```

---

## 7. 에러 처리

```js
// storage/data 함수: try/catch + 안전한 기본값 반환
async function getAllWords() {
  try {
    const result = await localGet(STORAGE_KEYS.WORDS);
    return result[STORAGE_KEYS.WORDS] || [];
  } catch (error) {
    console.error('[VocabBuilder] Error getting words:', error);
    return [];  // 안전한 기본값
  }
}

// 콘솔 로그 형식: [VocabBuilder] 접두사 필수
console.error('[VocabBuilder] Error <동작>:', error);
console.warn('[VocabBuilder] <경고 메시지>:', context);
console.log('[VocabBuilder] <정보 메시지>');
```

**규칙**: 에러 시 안전한 기본값(`[]`, `null`, `false`, 기본 객체) 반환. 에러를 re-throw하지 않음 (critical 초기화 제외).

---

## 8. 모듈 시스템

```js
// ES Module named export (파일 하단에 모아서)
export {
  getAllWords,
  getWordById,
  addWord,
  deleteWord,
};

// named import
import { getAllWords, getMeta, getSettings } from '../lib/storage.js';
import { initI18n, t } from '../lib/i18n.js';

// default export: 사용하지 않음
```

**규칙**:
- named export만 사용, default export 금지.
- export는 파일 하단에 모아서 작성.
- HTML script 태그에 `type="module"` 명시.
- Content script는 IIFE로 래핑 (ES Module 사용 불가).

---

## 9. DOM 조작

```js
// 단일 요소: getElementById
const el = document.getElementById('totalCount');

// 요소 컬렉션: querySelectorAll + forEach
document.querySelectorAll('[data-i18n]').forEach(el => { ... });

// 동적 콘텐츠 렌더링: innerHTML + 템플릿 리터럴
contentArea.innerHTML = words.map(word => `
  <div class="word-card" data-id="${word.id}">
    <span class="word-card__word">${escapeHtml(word.word)}</span>
  </div>
`).join('');

// 이벤트 위임: closest() 패턴
contentArea.addEventListener('click', (e) => {
  const card = e.target.closest('.word-card');
  if (!card) return;
  // ...
});

// 클래스 토글: classList.toggle + boolean
btn.classList.toggle('tabs__btn--active', btn.dataset.tab === tabName);

// HTML 이스케이프: 사용자 입력은 반드시 escapeHtml() 처리
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
```

---

## 10. 객체/배열 패턴

```js
// Optional chaining: 중첩 프로퍼티 접근 시 적극 사용
w.metadata?.savedAt?.startsWith(today);
word.definitions?.map(d => d.pos);

// OR 기본값: || 사용 (?? 대신)
return result[STORAGE_KEYS.WORDS] || [];

// Spread: 객체 업데이트 및 배열 복사
words[idx] = { ...words[idx], ...updates };
let sorted = [...state.allWords];

// 배열 destructuring
const [src, tgt] = state.filterLangPair.split('-');

// computed property name: 동적 스토리지 키
await localSet({ [STORAGE_KEYS.WORDS]: words });

// 중복 제거
return Array.from(new Set(values));
```

---

## 11. 상태 관리

```js
// 중앙화된 state 객체 사용
const state = {
  allWords: [],
  filteredWords: [],
  searchQuery: '',
  filterLangPair: 'all',
  filterPos: new Set(),
  sortBy: 'newest',
  activeTab: 'stats',
  detailWordId: null,
};

// chrome.storage.onChanged로 반응형 업데이트
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEYS.WORDS]) {
    refreshData();
  }
});
```

---

## 12. 주석 스타일

```js
/**
 * 파일 상단 헤더: 파일 목적 설명 (한국어)
 *
 * storage.js - Chrome Storage API 래퍼
 *
 * chrome.storage.local(단어 데이터)과 chrome.storage.sync(설정)에 대한
 * CRUD 기능을 Promise 기반으로 제공합니다.
 */

/**
 * JSDoc: 한국어 설명 + 영문 타입 어노테이션
 * @param {Object} wordData - VocabularyWord 객체
 * @returns {Promise<boolean>}
 */
async function addWord(wordData) { ... }

// ============================================================
// 섹션 구분: 한국어 제목
// ============================================================

// 인라인 주석: 한국어 (간결하게)
// 중복 체크
// 인덱스 업데이트
```

**규칙**:
- JSDoc 설명은 한국어, `@param`/`@returns` 타입은 영문.
- 콘솔 로그 메시지는 영문 (`[VocabBuilder] ...`).
- 섹션 구분선: `// ===...===` + 한국어 제목.

---

## 13. CSS 구조

```css
/* 파일 상단: 목적 설명 주석 */

/* Reset/Base */
* { margin: 0; padding: 0; box-sizing: border-box; }

/* :root 에서 CSS 변수 정의 */
:root {
  --color-primary: #1a73e8;
  --color-success: #34a853;
  --color-text: #202124;
  --color-surface: #f8f9fa;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --radius-md: 8px;
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.12);
}

/* 이후 컴포넌트별 섹션 (시각적 계층 순서) */
/* ============================================================
   Header
   ============================================================ */
```

**규칙**: Reset -> CSS 변수 -> 컴포넌트 (시각적 계층 순서). 4px 그리드 스페이싱 시스템.

---

## 14. HTML 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>페이지 제목</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- 시맨틱 HTML 사용 -->
  <header class="popup__header"> ... </header>
  <main id="content"> ... </main>
  <footer> ... </footer>

  <!-- 스크립트: body 끝에 배치 -->
  <script src="app.js" type="module"></script>
</body>
</html>
```

**규칙**: 시맨틱 태그 사용. 스크립트는 `</body>` 직전. `type="module"` 필수. `lang="ko"`.

---

## 15. 초기화 패턴

```js
// 모든 app.js는 init() 함수로 시작
async function init() {
  const settings = await getSettings();
  await initI18n(settings.language);
  // UI 초기화...
}
init();

// Content script: readyState 체크
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

---

## 16. 프로젝트 아키텍처

```
lib/           공유 라이브러리 (DOM 의존성 없음)
  ├── storage.js      Chrome Storage API 래퍼 (CRUD)
  ├── constants.js    CSS 셀렉터 매핑 로더
  └── i18n.js         다국어 지원 모듈

background/    Service Worker (이벤트 핸들링)
popup/         팝업 UI (독립 미니앱: app.js + styles.css + index.html)
sidepanel/     사이드패널 UI (독립 미니앱: app.js + styles.css + index.html)
content/       Content Script (Google Translate 페이지 주입)
```

**규칙**: `lib/`은 순수 데이터/유틸리티 (DOM 접근 금지). 각 UI 디렉토리는 자체 완결적 구조.

---

## 요약: 핵심 원칙

1. **프레임워크 없음** - Vanilla JS + Chrome Extension API
2. **ES Module** - named export, 하단 모아서 export
3. **async/await** - 비동기의 기본
4. **BEM CSS** - 일관된 클래스 네이밍
5. **2칸 들여쓰기** + **작은따옴표** + **세미콜론 필수**
6. **한국어 주석** + **영문 타입/로그**
7. **안전한 에러 처리** - catch에서 기본값 반환
8. **이벤트 위임** - `closest()` 패턴
9. **Optional chaining** - 중첩 접근 시 필수
10. **const 기본** - `let`은 재할당 시에만, `var` 금지