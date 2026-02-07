/**
 * sidepanel/app.js - 사이드 패널 앱 로직
 *
 * Stage 1-2: 탭 전환, 스토리지 연동 테스트, 기본 단어 목록 렌더링.
 * Stage 5-6에서 추가: 검색, 필터, 상세 뷰.
 */

import { getAllWords, getMeta, getStats } from '../lib/storage.js';

// ============================================================
// DOM 요소
// ============================================================

const tabButtons = document.querySelectorAll('.tabs__btn');
const contentArea = document.getElementById('content');
const toolbar = document.getElementById('toolbar');

// ============================================================
// 탭 네비게이션
// ============================================================

let activeTab = 'stats';

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
  });
});

function switchTab(tabName) {
  activeTab = tabName;

  tabButtons.forEach(btn => {
    btn.classList.toggle('tabs__btn--active', btn.dataset.tab === tabName);
  });

  toolbar.style.display = tabName === 'words' ? 'flex' : 'none';

  renderTabContent(tabName);
}

// ============================================================
// 탭 콘텐츠 렌더링
// ============================================================

async function renderTabContent(tabName) {
  switch (tabName) {
    case 'stats':
      await renderStatsTab();
      break;
    case 'words':
      await renderWordsTab();
      break;
    case 'test':
      renderTestTab();
      break;
  }
}

async function renderStatsTab() {
  const meta = await getMeta();
  const stats = await getStats();

  contentArea.innerHTML = `
    <div class="stats-overview">
      <div class="stats-card">
        <div class="stats-card__label">총 단어 수</div>
        <div class="stats-card__value">${meta.totalWords}</div>
      </div>
      <div class="stats-card">
        <div class="stats-card__label">총 복습 횟수</div>
        <div class="stats-card__value">${stats.total.reviews}</div>
      </div>
      <div class="stats-card">
        <div class="stats-card__label">총 테스트 횟수</div>
        <div class="stats-card__value">${stats.total.tests}</div>
      </div>
    </div>
    <p style="text-align:center; color: var(--color-text-secondary); margin-top: 24px;">
      통계 차트는 Phase 2에서 구현됩니다.
    </p>
  `;
}

async function renderWordsTab() {
  const words = await getAllWords();

  if (words.length === 0) {
    contentArea.innerHTML = `
      <div class="content__empty">
        <p>아직 저장된 단어가 없습니다.</p>
        <p>구글 번역에서 단어를 검색하고 저장해보세요!</p>
      </div>
    `;
    return;
  }

  contentArea.innerHTML = words.map(word => `
    <div class="word-card" data-id="${word.id}">
      <div class="word-card__header">
        <span class="word-card__word">${escapeHtml(word.word)}</span>
      </div>
      <div class="word-card__meta">
        ${escapeHtml(word.definitions?.[0]?.pos || '')} | ${escapeHtml(word.definitions?.[0]?.meanings?.[0]?.korean || '')}
      </div>
      <div class="word-card__context">"${escapeHtml((word.context?.sourceText || '').substring(0, 60))}..."</div>
      <div class="word-card__footer">
        <span>${timeAgo(word.metadata?.savedAt)}</span>
        <span>복습 ${word.metadata?.reviewCount || 0}회</span>
      </div>
    </div>
  `).join('');
}

function renderTestTab() {
  contentArea.innerHTML = `
    <div class="content__empty">
      <p>테스트 기능은 Phase 2에서 구현됩니다.</p>
    </div>
  `;
}

// ============================================================
// 유틸리티
// ============================================================

function timeAgo(isoString) {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHr < 24) return `${diffHr}시간 전`;
  return `${diffDay}일 전`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// 초기화
// ============================================================

async function init() {
  console.log('[VocabBuilder] Side panel loaded');
  switchTab('stats');
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (activeTab === 'words' && changes.vocabulary_words) {
    renderWordsTab();
    return;
  }
  if (activeTab === 'stats' && (changes.vocabulary_meta || changes.vocabulary_stats || changes.vocabulary_words)) {
    renderStatsTab();
  }
});

init();
