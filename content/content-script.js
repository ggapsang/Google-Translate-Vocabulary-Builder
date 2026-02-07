/**
 * content-script.js - 구글 번역 페이지 콘텐트 스크립트
 *
 * translate.google.com에 주입되어 실행됩니다.
 * Stage 1-2: 페이지 감지, DOM 접근 확인, 백그라운드 메시징 테스트.
 * Stage 3-4에서 추가: DOM 파싱, 저장 버튼 주입, MutationObserver.
 */

(function () {
  'use strict';

  // ============================================================
  // 페이지 감지
  // ============================================================

  function isGoogleTranslatePage() {
    return window.location.hostname === 'translate.google.com';
  }

  // ============================================================
  // DOM 접근 테스트
  // ============================================================

  function testDOMAccess() {
    const tests = {
      'Source textarea': !!document.querySelector('textarea.er8xn'),
      'Translation output (HwtZe)': !!document.querySelector('span.HwtZe'),
      'Dictionary panel (m2ySsc)': !!document.querySelector('.m2ySsc'),
      'Page body': !!document.body
    };

    console.log('[VocabBuilder] DOM Access Test Results:');
    Object.entries(tests).forEach(([name, found]) => {
      console.log(`  ${found ? 'PASS' : 'FAIL'}: ${name}`);
    });

    return tests;
  }

  // ============================================================
  // 백그라운드 서비스 워커 통신 테스트
  // ============================================================

  function testMessaging() {
    chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[VocabBuilder] Messaging test FAILED:', chrome.runtime.lastError.message);
      } else {
        console.log('[VocabBuilder] Messaging test PASSED:', response);
      }
    });
  }

  // ============================================================
  // 초기화
  // ============================================================

  function init() {
    if (!isGoogleTranslatePage()) {
      console.warn('[VocabBuilder] Not on Google Translate page. Aborting.');
      return;
    }

    console.log('[VocabBuilder] Content script loaded on Google Translate');
    console.log('[VocabBuilder] URL:', window.location.href);

    // Google 번역은 콘텐츠를 동적으로 로드하므로 약간의 지연 후 테스트 실행
    setTimeout(() => {
      testDOMAccess();
      testMessaging();
    }, 2000);

    console.log('[VocabBuilder] Stage 1-2 content script initialization complete.');
    console.log('[VocabBuilder] DOM parsing will be implemented in Stage 3-4.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
