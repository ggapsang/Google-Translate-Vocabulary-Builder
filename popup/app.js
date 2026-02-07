/**
 * popup/app.js - 팝업 앱 로직
 *
 * Stage 1-2: 단어 수 표시, 오늘 통계, 복습 단어 목록.
 */

import { getAllWords, getMeta } from '../lib/storage.js';

async function init() {
  console.log('[VocabBuilder] Popup loaded');

  const meta = await getMeta();
  const words = await getAllWords();

  // 총 단어 수
  document.getElementById('totalCount').textContent =
    `${meta.totalWords}개 단어 저장됨`;

  // 오늘 통계
  const today = new Date().toISOString().split('T')[0];
  const todaySaved = words.filter(w =>
    w.metadata?.savedAt?.startsWith(today)
  ).length;
  document.getElementById('todaySaved').textContent = `${todaySaved}개`;

  // 복습할 단어
  const now = new Date().toISOString();
  const reviewWords = words.filter(w =>
    w.metadata?.nextReview && w.metadata.nextReview <= now
  );

  const reviewList = document.getElementById('reviewList');
  if (reviewWords.length > 0) {
    const maxShow = 5;
    const toShow = reviewWords.slice(0, maxShow);
    reviewList.innerHTML = toShow.map(w =>
      `<li>${escapeHtml(w.word)}</li>`
    ).join('');

    if (reviewWords.length > maxShow) {
      reviewList.innerHTML += `<li>+${reviewWords.length - maxShow}개 더보기</li>`;
    }
  }

  // 단어장 열기 버튼
  document.getElementById('openSidePanel').addEventListener('click', () => {
    if (chrome.sidePanel) {
      chrome.sidePanel.open({ windowId: chrome.windows?.WINDOW_ID_CURRENT });
    }
  });

  // 테스트 시작 버튼 (Phase 2에서 구현)
  document.getElementById('startTest').addEventListener('click', () => {
    console.log('[VocabBuilder] Test mode not yet implemented');
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
