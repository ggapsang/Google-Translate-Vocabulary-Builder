/**
 * service-worker.js - 백그라운드 서비스 워커
 *
 * 확장 프로그램 생명주기 이벤트와 메시지 처리를 담당합니다.
 * Stage 1-2: 설치 핸들러, 스토리지 초기화, 사이드 패널 설정.
 */

import { initializeStorage } from '../lib/storage.js';

// ============================================================
// 확장 프로그램 생명주기
// ============================================================

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[VocabBuilder] Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    await initializeStorage();
    console.log('[VocabBuilder] Initial setup complete');
  }

  // 사이드 패널 동작 설정
  if (chrome.sidePanel) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  }
});

// ============================================================
// 메시지 핸들러
// ============================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[VocabBuilder] Message received:', message);

  if (message.type === 'PING') {
    sendResponse({ type: 'PONG', timestamp: Date.now() });
    return true;
  }

  // Stage 3-4에서 추가 메시지 핸들러 구현 예정
  return false;
});
