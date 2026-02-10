# Coding Style Guide

이 프로젝트 고유의 코딩 컨벤션. AI 에이전트 및 기여자는 이 가이드를 따를 것.

## 포매팅

2칸 스페이스, 작은따옴표, 세미콜론 필수. 템플릿 리터럴 내 HTML 속성은 큰따옴표.

## 네이밍

- **Private**: `_camelCase` (언더스코어 접두사) — `_cachedSelectors`, `_defaultMeta()`
- **상수 객체**: `UPPER_SNAKE_CASE` — `STORAGE_KEYS`, `STATE`, `I18N`
- **Boolean 함수**: `is` 접두사 — `isGoogleTranslatePage()`, `isSavedWord()`
- **CSS**: BEM (`Block__Element--Modifier`). Content script는 `vocab-` 접두사로 호스트 페이지와 격리
- **CSS 변수**: `--color-`, `--space-`, `--radius-`, `--shadow-` 접두사. Content script는 `--vocab-` 접두사. 4px 그리드 시스템

## 함수

최상위는 `function` 선언문, 콜백만 화살표 함수. `new Promise()`는 Chrome callback API 래핑에만 허용.

## 모듈

- **named export만** 사용 (default export 금지), 파일 하단에 모아서 export
- Content script는 ES Module 사용 불가 → IIFE `(function() { 'use strict'; ... })()` 래핑

## 에러 처리

- try/catch에서 **안전한 기본값 반환** (`[]`, `null`, `false`) — re-throw 금지
- 콘솔 로그: **`[VocabBuilder]`** 접두사 필수, **영문**으로 작성

## 주석

- **파일 헤더** `/** */`: 한국어로 파일 목적 설명
- **JSDoc**: 설명은 한국어, `@param`/`@returns` 타입은 영문
- **섹션 구분**: `// ============ 한국어 제목 ============`
- **인라인**: 한국어, 간결하게

## DOM

- 동적 렌더링: `innerHTML` + 템플릿 리터럴 + `.map().join('')`
- 이벤트 위임: `e.target.closest('.selector')` 패턴
- 사용자 입력은 반드시 `escapeHtml()` 처리

## i18n

HTML에서 `data-i18n`, `data-i18n-placeholder`, `data-i18n-aria`, `data-i18n-title` 속성 사용. 기본 한국어 텍스트를 인라인 폴백으로 제공.

## 상태 관리

중앙화된 `state` 객체 + `chrome.storage.onChanged` 리스너로 반응형 갱신. 프레임워크 없음.

## 초기화

모든 진입점은 `async function init()` → 하단에서 호출. Content script는 `document.readyState` 체크 후 호출.

## 아키텍처

```
lib/           공유 모듈 (DOM 접근 금지) — storage.js, i18n.js, constants.js
background/    Service Worker (이벤트 + 메시지 라우팅)
popup/         팝업 UI (자체 완결: app.js + styles.css + index.html)
sidepanel/     사이드패널 UI (자체 완결)
content/       Content Script (Google Translate 페이지 주입, IIFE)
```

Content script에서 사용하는 정적 리소스는 `manifest.json`의 `web_accessible_resources`에 등록 필수.
