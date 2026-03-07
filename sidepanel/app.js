/**
 * sidepanel/app.js - 사이드 패널 앱 로직
 *
 * Stage 1-2: 탭 전환, 스토리지 연동 테스트, 기본 단어 목록 렌더링.
 * Stage 5-6: 검색(디바운스), 필터/정렬 드롭다운, 상세 뷰, 수정/삭제.
 * Stage 9: 통계 대시보드 (Chart.js 기반 차트 시각화).
 */

import { getAllWords, getWordById, updateWord, deleteWord, getMeta, getStats, getSettings, saveSettings, updateTestStats } from '../lib/storage.js';
import { initI18n, t, setLanguage, getCurrentLang, getLocaleCode, onLanguageChange, translatePage } from '../lib/i18n.js';

// ============================================================
// 앱 상태
// ============================================================

const state = {
  allWords: [],
  filteredWords: [],
  searchQuery: '',
  filterLangPair: 'all',
  filterPos: new Set(),  // empty = 전체, Set(['동사','명사']) = 멀티 선택
  sortBy: 'newest',
  activeTab: 'stats',
  detailWordId: null,

  // 차트 인스턴스 (Stage 9)
  charts: {},

  // 테스트 세션 상태 (Stage 7-8)
  test: {
    phase: 'idle',      // 'idle' | 'question' | 'feedback' | 'results'
    questions: [],      // 준비된 문제 배열
    currentIndex: 0,
    answers: [],        // { wordId, word, correct, userAnswer, correctAnswer, matchedText, maskedSentence, hintSentence }
    startTime: null,
    config: { questionCount: 10, range: 'all' },
  },
};

// ============================================================
// DOM 요소
// ============================================================

const tabButtons = document.querySelectorAll('.tabs__btn');
const contentArea = document.getElementById('content');
const toolbar = document.getElementById('toolbar');
const searchInput = document.getElementById('searchInput');
const filterBtn = document.getElementById('filterBtn');
const filterDropdown = document.getElementById('filterDropdown');
const sortBtn = document.getElementById('sortBtn');
const sortDropdown = document.getElementById('sortDropdown');

// ============================================================
// 탭 네비게이션
// ============================================================

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
  });
});

function switchTab(tabName) {
  state.activeTab = tabName;
  state.detailWordId = null;

  // 통계 탭에서 벗어날 때 차트 정리
  if (tabName !== 'stats') destroyAllCharts();

  // 테스트 탭 진입 시 항상 초기 상태로 리셋
  if (tabName === 'test') {
    state.test.phase = 'idle';
    state.test.questions = [];
    state.test.answers = [];
    state.test.currentIndex = 0;
  }

  tabButtons.forEach(btn => {
    btn.classList.toggle('tabs__btn--active', btn.dataset.tab === tabName);
  });

  toolbar.style.display = tabName === 'words' ? 'flex' : 'none';

  renderTabContent(tabName);
}

// ============================================================
// 필터/정렬 파이프라인
// ============================================================

function applyFiltersAndSort() {
  let words = [...state.allWords];

  // 1. 검색
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    words = words.filter(w =>
      w.word.toLowerCase().includes(q) ||
      w.definitions?.some(d =>
        d.meanings?.some(m =>
          (m.korean || '').toLowerCase().includes(q)
        )
      )
    );
  }

  // 2. 언어쌍 필터
  if (state.filterLangPair !== 'all') {
    const [src, tgt] = state.filterLangPair.split('-');
    words = words.filter(w =>
      w.context?.sourceLanguage === src &&
      w.context?.targetLanguage === tgt
    );
  }

  // 3. 품사 필터 (멀티 선택)
  if (state.filterPos.size > 0) {
    words = words.filter(w =>
      w.definitions?.some(d => state.filterPos.has(d.pos))
    );
  }

  // 4. 정렬
  switch (state.sortBy) {
    case 'newest':
      words.sort((a, b) => new Date(b.metadata?.savedAt || 0) - new Date(a.metadata?.savedAt || 0));
      break;
    case 'oldest':
      words.sort((a, b) => new Date(a.metadata?.savedAt || 0) - new Date(b.metadata?.savedAt || 0));
      break;
    case 'alphabetical':
      words.sort((a, b) => (a.word || '').localeCompare(b.word || ''));
      break;
    case 'review-needed':
      words.sort((a, b) => {
        const now = new Date();
        const aNeeds = !a.metadata?.nextReview || new Date(a.metadata.nextReview) <= now;
        const bNeeds = !b.metadata?.nextReview || new Date(b.metadata.nextReview) <= now;
        if (aNeeds !== bNeeds) return aNeeds ? -1 : 1;
        return (a.metadata?.masteryLevel || 0) - (b.metadata?.masteryLevel || 0);
      });
      break;
  }

  state.filteredWords = words;
}

// ============================================================
// 검색 (디바운스 300ms)
// ============================================================

let searchDebounceTimer = null;

searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    state.searchQuery = searchInput.value.trim();

    // 다른 탭이면 단어장 탭으로 전환
    if (state.activeTab !== 'words') {
      switchTab('words');
      return;
    }

    applyFiltersAndSort();
    state.detailWordId = null;
    renderWordsTab();
  }, 300);
});

// ============================================================
// 드롭다운 토글
// ============================================================

function closeAllDropdowns() {
  document.querySelectorAll('.toolbar__dropdown--open').forEach(d =>
    d.classList.remove('toolbar__dropdown--open')
  );
  document.querySelectorAll('.toolbar__btn[aria-expanded="true"]').forEach(b =>
    b.setAttribute('aria-expanded', 'false')
  );
}

function toggleDropdown(btn, dropdown) {
  const isOpen = dropdown.classList.contains('toolbar__dropdown--open');
  closeAllDropdowns();
  if (!isOpen) {
    dropdown.classList.add('toolbar__dropdown--open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

filterBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleDropdown(filterBtn, filterDropdown);
});

sortBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleDropdown(sortBtn, sortDropdown);
});

document.addEventListener('click', () => {
  closeAllDropdowns();
});

// ============================================================
// 필터 드롭다운 동적 채우기
// ============================================================

function populateFilterDropdown() {
  const langPairs = new Map();
  const posSet = new Set();

  state.allWords.forEach(w => {
    const src = w.context?.sourceLanguage;
    const tgt = w.context?.targetLanguage;
    if (src && tgt) {
      const key = `${src}-${tgt}`;
      if (!langPairs.has(key)) {
        langPairs.set(key, `${src} \u2192 ${tgt}`);
      }
    }
    w.definitions?.forEach(d => {
      if (d.pos) posSet.add(d.pos);
    });
  });

  // 언어쌍 섹션
  const langAllBtn = filterDropdown.querySelector('[data-filter-lang="all"]');
  const langSection = langAllBtn.parentElement;
  langAllBtn.classList.toggle('toolbar__dropdown-item--active', state.filterLangPair === 'all');
  langSection.querySelectorAll('[data-filter-lang]:not([data-filter-lang="all"])').forEach(el => el.remove());
  langPairs.forEach((label, key) => {
    const item = document.createElement('button');
    item.className = 'toolbar__dropdown-item';
    item.dataset.filterLang = key;
    item.textContent = label;
    if (state.filterLangPair === key) item.classList.add('toolbar__dropdown-item--active');
    langSection.appendChild(item);
  });

  // 품사 섹션
  const posAllBtn = filterDropdown.querySelector('[data-filter-pos="all"]');
  const posSection = posAllBtn.parentElement;
  posAllBtn.classList.toggle('toolbar__dropdown-item--active', state.filterPos.size === 0);
  posSection.querySelectorAll('[data-filter-pos]:not([data-filter-pos="all"])').forEach(el => el.remove());
  posSet.forEach(pos => {
    const item = document.createElement('button');
    item.className = 'toolbar__dropdown-item';
    item.dataset.filterPos = pos;
    item.textContent = pos;
    if (state.filterPos.has(pos)) item.classList.add('toolbar__dropdown-item--active');
    posSection.appendChild(item);
  });

  // 필터 버튼 활성 표시
  updateFilterBtnLabel();
}

function updateFilterBtnLabel() {
  const activeCount = (state.filterLangPair !== 'all' ? 1 : 0) + state.filterPos.size;
  filterBtn.textContent = activeCount > 0
    ? t('sidepanel_filterCount', { count: activeCount })
    : t('sidepanel_filter');
  filterBtn.classList.toggle('toolbar__btn--active-filter', activeCount > 0);
}

// ============================================================
// 필터/정렬 이벤트 위임
// ============================================================

filterDropdown.addEventListener('click', (e) => {
  e.stopPropagation();
  const langItem = e.target.closest('[data-filter-lang]');
  const posItem = e.target.closest('[data-filter-pos]');

  if (langItem) {
    const value = langItem.dataset.filterLang;
    // 토글: 같은 항목 재클릭 또는 '전체' 클릭 시 해제
    if (value === 'all' || state.filterLangPair === value) {
      state.filterLangPair = 'all';
    } else {
      state.filterLangPair = value;
    }
    filterDropdown.querySelectorAll('[data-filter-lang]').forEach(el =>
      el.classList.toggle('toolbar__dropdown-item--active',
        state.filterLangPair === 'all'
          ? el.dataset.filterLang === 'all'
          : el.dataset.filterLang === state.filterLangPair
      )
    );
  }

  if (posItem) {
    const value = posItem.dataset.filterPos;
    if (value === 'all') {
      // '전체 품사' 클릭 → 모두 해제
      state.filterPos.clear();
    } else {
      // 토글: 클릭 시 추가/제거
      if (state.filterPos.has(value)) {
        state.filterPos.delete(value);
      } else {
        state.filterPos.add(value);
      }
    }
    filterDropdown.querySelectorAll('[data-filter-pos]').forEach(el => {
      if (el.dataset.filterPos === 'all') {
        el.classList.toggle('toolbar__dropdown-item--active', state.filterPos.size === 0);
      } else {
        el.classList.toggle('toolbar__dropdown-item--active', state.filterPos.has(el.dataset.filterPos));
      }
    });
  }

  if (langItem || posItem) {
    updateFilterBtnLabel();
    applyFiltersAndSort();
    state.detailWordId = null;
    renderWordsTab();
  }
});

sortDropdown.addEventListener('click', (e) => {
  e.stopPropagation();
  const item = e.target.closest('[data-sort]');
  if (!item) return;

  state.sortBy = item.dataset.sort;
  sortDropdown.querySelectorAll('[data-sort]').forEach(el =>
    el.classList.toggle('toolbar__dropdown-item--active', el === item)
  );
  applyFiltersAndSort();
  state.detailWordId = null;
  renderWordsTab();
});

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

// ============================================================
// Stage 9: 통계 대시보드
// ============================================================

function destroyAllCharts() {
  for (const chart of Object.values(state.charts)) {
    try { chart.destroy(); } catch (_) {}
  }
  state.charts = {};
}

async function renderStatsTab() {
  destroyAllCharts();

  const [words, stats] = await Promise.all([getAllWords(), getStats()]);

  // — 숙련도 분포 (allWords 기준)
  const masteryCount = [0, 0, 0, 0, 0, 0];
  for (const w of words) {
    const lv = w.metadata?.masteryLevel ?? 0;
    masteryCount[lv] = (masteryCount[lv] || 0) + 1;
  }

  // — 언어 분포 (allWords 기준)
  const langMap = {};
  for (const w of words) {
    const pair = `${w.context?.sourceLanguage ?? '?'}→${w.context?.targetLanguage ?? '?'}`;
    langMap[pair] = (langMap[pair] || 0) + 1;
  }

  // — 품사 분포 (allWords 기준)
  const posMap = {};
  for (const w of words) {
    for (const def of (w.definitions || [])) {
      if (def.pos) posMap[def.pos] = (posMap[def.pos] || 0) + 1;
    }
  }

  // — 주간 활동: 최근 7일 날짜 배열
  const weekDates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekDates.push(d.toISOString().split('T')[0]);
  }

  // 단어 저장일로 날짜별 카운트
  const wordsPerDay = {};
  for (const w of words) {
    const day = (w.metadata?.savedAt || '').split('T')[0];
    if (weekDates.includes(day)) wordsPerDay[day] = (wordsPerDay[day] || 0) + 1;
  }

  // 테스트 완료 수는 stats.dailyActivity 에서
  const testsPerDay = {};
  for (const entry of (stats.dailyActivity || [])) {
    if (weekDates.includes(entry.date)) testsPerDay[entry.date] = entry.testsCompleted || 0;
  }

  const weekWordsData = weekDates.map(d => wordsPerDay[d] || 0);
  const weekTestsData = weekDates.map(d => testsPerDay[d] || 0);

  // — 점수
  const avgScore = stats.testStats?.averageScore ?? 0;
  const totalTests = stats.testStats?.totalTests ?? stats.total?.tests ?? 0;

  // — 날짜 레이블 (M/D 형식)
  const locale = getCurrentLang() === 'ko' ? 'ko-KR' : 'en-US';
  const weekLabels = weekDates.map(d => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString(locale, { month: 'numeric', day: 'numeric' });
  });

  const chartColors = {
    primary: '#1a73e8',
    success: '#34a853',
    warning: '#fbbc04',
    error: '#ea4335',
    purple: '#9c27b0',
    teal: '#009688',
    mastery: ['#e8eaed', '#fbbc04', '#ff9800', '#34a853', '#1a73e8', '#9c27b0'],
    langPalette: ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#9c27b0', '#009688', '#ff5722'],
  };

  const masteryLabels = [0, 1, 2, 3, 4, 5].map(i => t(`stats_mastery_${i}`));

  contentArea.innerHTML = `
    <div class="stats-overview">

      <!-- 요약 카드 -->
      <div class="stats-summary">
        <div class="stats-card">
          <div class="stats-card__label">${t('stats_totalWords')}</div>
          <div class="stats-card__value">${words.length}</div>
        </div>
        <div class="stats-card">
          <div class="stats-card__label">${t('stats_totalTests')}</div>
          <div class="stats-card__value">${totalTests}</div>
        </div>
        <div class="stats-card">
          <div class="stats-card__label">${t('stats_avgScore')}</div>
          <div class="stats-card__value">${totalTests > 0 ? avgScore : '-'}<span class="stats-card__unit">${totalTests > 0 ? '%' : ''}</span></div>
        </div>
      </div>

      ${words.length === 0 ? `<p class="stats-empty">${t('stats_noWords')}</p>` : `

      <!-- 숙련도 분포 -->
      <div class="stats-section">
        <div class="stats-section__title">${t('stats_section_mastery')}</div>
        <div class="stats-chart-wrap">
          <canvas id="chartMastery"></canvas>
        </div>
      </div>

      <!-- 주간 활동 -->
      <div class="stats-section">
        <div class="stats-section__title">${t('stats_section_activity')}</div>
        <div class="stats-chart-wrap">
          <canvas id="chartActivity"></canvas>
        </div>
      </div>

      <!-- 언어별 분포 -->
      ${Object.keys(langMap).length > 0 ? `
      <div class="stats-section">
        <div class="stats-section__title">${t('stats_section_lang')}</div>
        <div class="stats-chart-wrap stats-chart-wrap--doughnut">
          <canvas id="chartLang"></canvas>
        </div>
      </div>` : ''}

      <!-- 품사별 분포 -->
      ${Object.keys(posMap).length > 0 ? `
      <div class="stats-section">
        <div class="stats-section__title">${t('stats_section_pos')}</div>
        <div class="stats-chart-wrap">
          <canvas id="chartPos"></canvas>
        </div>
      </div>` : ''}

      `}
    </div>
  `;

  if (words.length === 0) return;

  const chartDefaults = {
    plugins: { legend: { labels: { font: { size: 11 }, color: '#5f6368', boxWidth: 12 } } },
  };

  // 숙련도 차트 (수평 막대)
  const masteryCtx = document.getElementById('chartMastery');
  if (masteryCtx) {
    state.charts.mastery = new Chart(masteryCtx, {
      type: 'bar',
      data: {
        labels: masteryLabels,
        datasets: [{
          data: masteryCount,
          backgroundColor: chartColors.mastery,
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.x}${t('stats_words_label')}`,
            },
          },
        },
        scales: {
          x: { ticks: { stepSize: 1, font: { size: 11 }, color: '#5f6368' }, grid: { color: '#e0e0e0' } },
          y: { ticks: { font: { size: 11 }, color: '#5f6368' }, grid: { display: false } },
        },
      },
    });
  }

  // 주간 활동 차트
  const activityCtx = document.getElementById('chartActivity');
  if (activityCtx) {
    state.charts.activity = new Chart(activityCtx, {
      type: 'bar',
      data: {
        labels: weekLabels,
        datasets: [
          {
            label: t('stats_words_label'),
            data: weekWordsData,
            backgroundColor: chartColors.primary,
            borderRadius: 3,
          },
          {
            label: t('stats_tests_label'),
            data: weekTestsData,
            backgroundColor: chartColors.success,
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          ...chartDefaults.plugins,
          legend: { ...chartDefaults.plugins.legend, position: 'bottom' },
        },
        scales: {
          x: { ticks: { font: { size: 11 }, color: '#5f6368' }, grid: { display: false } },
          y: { ticks: { stepSize: 1, font: { size: 11 }, color: '#5f6368' }, grid: { color: '#e0e0e0' } },
        },
      },
    });
  }

  // 언어 분포 도넛 차트
  const langCtx = document.getElementById('chartLang');
  if (langCtx) {
    const langEntries = Object.entries(langMap).sort((a, b) => b[1] - a[1]);
    state.charts.lang = new Chart(langCtx, {
      type: 'doughnut',
      data: {
        labels: langEntries.map(([k]) => k),
        datasets: [{
          data: langEntries.map(([, v]) => v),
          backgroundColor: chartColors.langPalette.slice(0, langEntries.length),
          borderWidth: 2,
          borderColor: '#ffffff',
        }],
      },
      options: {
        responsive: true,
        plugins: {
          ...chartDefaults.plugins,
          legend: { ...chartDefaults.plugins.legend, position: 'bottom' },
        },
        cutout: '60%',
      },
    });
  }

  // 품사 분포 수평 막대 차트
  const posCtx = document.getElementById('chartPos');
  if (posCtx) {
    const posEntries = Object.entries(posMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    state.charts.pos = new Chart(posCtx, {
      type: 'bar',
      data: {
        labels: posEntries.map(([k]) => k),
        datasets: [{
          data: posEntries.map(([, v]) => v),
          backgroundColor: chartColors.langPalette.slice(0, posEntries.length),
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.x}${t('stats_words_label')}`,
            },
          },
        },
        scales: {
          x: { ticks: { stepSize: 1, font: { size: 11 }, color: '#5f6368' }, grid: { color: '#e0e0e0' } },
          y: { ticks: { font: { size: 11 }, color: '#5f6368' }, grid: { display: false } },
        },
      },
    });
  }
}

async function renderWordsTab() {
  // 상세 뷰가 열려있으면 상세 뷰 렌더링
  if (state.detailWordId) {
    await renderDetailView(state.detailWordId);
    return;
  }

  toolbar.style.display = 'flex';
  const words = state.filteredWords;

  if (state.allWords.length === 0) {
    contentArea.innerHTML = `
      <div class="content__empty">
        <p>${t('sidepanel_emptyTitle')}</p>
        <p>${t('sidepanel_emptyDesc')}</p>
      </div>
    `;
    return;
  }

  if (words.length === 0) {
    contentArea.innerHTML = `
      <div class="content__empty">
        <p>${t('sidepanel_noResults')}</p>
      </div>
    `;
    return;
  }

  const countHtml = state.allWords.length !== words.length
    ? `<div class="content__count">${t('words_countFiltered', { count: words.length, total: state.allWords.length })}</div>`
    : `<div class="content__count">${t('words_countTotal', { count: words.length })}</div>`;

  contentArea.innerHTML = countHtml + words.map(word => `
    <div class="word-card" data-id="${word.id}">
      <div class="word-card__header">
        <span class="word-card__word">${escapeHtml(word.word)}</span>
      </div>
      <div class="word-card__meta">
        ${escapeHtml(word.definitions?.map(d => d.pos).filter(Boolean).join(' \u00b7 ') || '')} | ${escapeHtml(word.definitions?.[0]?.meanings?.[0]?.korean || '')}
      </div>
      <div class="word-card__context">"${escapeHtml((word.context?.sourceText || '').substring(0, 60))}..."</div>
      <div class="word-card__footer">
        <span>${timeAgo(word.metadata?.savedAt)}</span>
        <span>${t('words_reviewCount', { count: word.metadata?.reviewCount || 0 })}</span>
      </div>
    </div>
  `).join('');
}

// ============================================================
// 테스트 모드 (Stage 7-8)
// ============================================================

function renderTestTab() {
  switch (state.test.phase) {
    case 'question':  renderTestQuestion(); break;
    case 'feedback':  break; // renderTestFeedback가 직접 렌더링
    case 'results':   renderTestResults(); break;
    default:          renderTestSetup(); break;
  }
}

// --- 유틸리티 ---

function fisherYatesShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (minutes > 0) return t('test_duration_min_sec', { m: minutes, s: seconds });
  return t('test_duration_sec', { s: seconds });
}

function computeNewMastery(currentLevel, isCorrect) {
  if (isCorrect) return Math.min((currentLevel || 0) + 1, 5);
  return Math.max((currentLevel || 0) - 1, 0);
}

/**
 * sourceText에 단어가 포함되어 있어 테스트 출제 가능한지 확인
 */
function isWordTestable(word) {
  if (!word.context?.sourceText) return false;
  if (!word.word) return false;
  const sourceLower = word.context.sourceText.toLowerCase();
  const wordLower = word.word.toLowerCase();
  return sourceLower.includes(wordLower);
}

/**
 * 설정 화면에서 출제 가능한 단어 수를 계산
 */
function countEligibleWords(range) {
  let pool = [...state.allWords];
  if (range === 'recent30') {
    pool = [...pool]
      .sort((a, b) => new Date(b.metadata?.savedAt || 0) - new Date(a.metadata?.savedAt || 0))
      .slice(0, 30);
  } else if (range === 'wrong') {
    const wrongPool = pool.filter(w => w.metadata?.testResults?.some(r => !r.correct));
    if (wrongPool.length > 0) pool = wrongPool;
  }
  return pool.filter(w => isWordTestable(w)).length;
}

/**
 * 문장에서 단어를 ____로 마스킹.
 * 정확한 단어 경계 매칭 → 활용형 prefix 매칭 순으로 시도.
 * @returns {{ masked: string, matched: string }}
 */
function maskWordInSentence(sentence, word) {
  const esc = escapeRegex(word);

  // 1. 정확한 단어 경계 매칭 (대소문자 무시)
  const exactPattern = new RegExp(
    `(^|[^a-zA-Z])(${esc})([^a-zA-Z]|$)`, 'i'
  );
  const m1 = exactPattern.exec(sentence);
  if (m1) {
    const before = sentence.slice(0, m1.index + m1[1].length);
    const after = sentence.slice(m1.index + m1[1].length + m1[2].length);
    return { masked: before + '____' + after, matched: m1[2] };
  }

  // 2. 활용형 prefix 매칭 (e.g. provide → provides, provided)
  const prefixPattern = new RegExp(
    `(^|[^a-zA-Z])(${esc}[a-zA-Z]*)([^a-zA-Z]|$)`, 'i'
  );
  const m2 = prefixPattern.exec(sentence);
  if (m2) {
    const before = sentence.slice(0, m2.index + m2[1].length);
    const after = sentence.slice(m2.index + m2[1].length + m2[2].length);
    return { masked: before + '____' + after, matched: m2[2] };
  }

  // 3. 마지막 수단: 단어를 찾지 못한 경우
  return { masked: sentence, matched: word };
}

function buildQuestionFromWord(w) {
  const { masked, matched } = maskWordInSentence(w.context.sourceText, w.word);
  return {
    wordId: w.id,
    word: w.word,
    maskedSentence: masked,
    hintSentence: w.context.translatedText || '',
    correctAnswer: w.word.toLowerCase().trim(),
    matchedText: matched,
  };
}

/**
 * 출제 범위에 따라 단어 풀 필터링, 셔플, 문제 생성
 */
function buildQuestions({ questionCount, range }) {
  let pool = [...state.allWords];

  if (range === 'recent30') {
    pool = [...pool]
      .sort((a, b) => new Date(b.metadata?.savedAt || 0) - new Date(a.metadata?.savedAt || 0))
      .slice(0, 30);
  } else if (range === 'wrong') {
    const wrongPool = pool.filter(w => w.metadata?.testResults?.some(r => !r.correct));
    if (wrongPool.length > 0) pool = wrongPool;
  }

  const eligible = pool.filter(w => isWordTestable(w));
  const shuffled = fisherYatesShuffle(eligible);
  const selected = shuffled.slice(0, questionCount);
  return selected.map(w => buildQuestionFromWord(w));
}

/**
 * 정답 검증: base form 또는 실제 매칭된 활용형 모두 수락
 */
function validateAnswer(userAnswer, question) {
  const normalized = userAnswer.trim().toLowerCase();
  return normalized === question.correctAnswer ||
         normalized === question.matchedText.toLowerCase();
}

// --- 설정 화면 ---

async function renderTestSetup() {
  state.test.phase = 'idle';
  const settings = await getSettings();
  const savedCount = settings.testDefaults?.questionCount || 10;
  const savedRange = settings.testDefaults?.difficulty || 'all';
  // settings의 difficulty 값 → state.test.config.range 매핑
  const rangeMap = { 'review-needed': 'all', 'all': 'all', 'recent30': 'recent30', 'wrong': 'wrong' };
  state.test.config.questionCount = savedCount;
  state.test.config.range = rangeMap[savedRange] || 'all';

  const eligibleCount = countEligibleWords(state.test.config.range);

  const countOptions = [10, 20, 30].map(n => `
    <input type="radio" class="test-setup__radio-option" name="testCount" id="testCount${n}" value="${n}" ${state.test.config.questionCount === n ? 'checked' : ''}>
    <label class="test-setup__radio-label" for="testCount${n}">${n}</label>
  `).join('');

  const rangeOptions = [
    { value: 'all', labelKey: 'test_setup_rangeAll' },
    { value: 'recent30', labelKey: 'test_setup_rangeRecent' },
    { value: 'wrong', labelKey: 'test_setup_rangeWrong' },
  ].map(opt => `
    <input type="radio" class="test-setup__radio-option" name="testRange" id="testRange_${opt.value}" value="${opt.value}" ${state.test.config.range === opt.value ? 'checked' : ''}>
    <label class="test-setup__radio-label" for="testRange_${opt.value}">${t(opt.labelKey)}</label>
  `).join('');

  const isDisabled = eligibleCount === 0;

  contentArea.innerHTML = `
    <div class="test-setup">
      <h2 class="test-setup__title">${t('test_setup_title')}</h2>

      <div class="test-setup__section">
        <div class="test-setup__label">${t('test_setup_questionCount')}</div>
        <div class="test-setup__radio-group" id="testCountGroup">${countOptions}</div>
      </div>

      <div class="test-setup__section">
        <div class="test-setup__label">${t('test_setup_range')}</div>
        <div class="test-setup__radio-group" id="testRangeGroup">${rangeOptions}</div>
      </div>

      <div class="test-setup__word-count ${isDisabled ? 'test-setup__word-count--zero' : ''}" id="testEligibleCount">
        ${t('test_setup_eligibleCount', { count: eligibleCount })}
      </div>

      ${isDisabled ? `<div class="test-setup__error">${t('test_setup_noEligible')}<br>${t('test_setup_noEligibleDesc')}</div>` : ''}

      <button class="test-setup__start-btn" id="testStartBtn" ${isDisabled ? 'disabled' : ''}>
        ${t('test_setup_startBtn')}
      </button>
    </div>
  `;

  bindTestSetupEvents();
}

function bindTestSetupEvents() {
  document.getElementById('testCountGroup').addEventListener('change', (e) => {
    if (e.target.name === 'testCount') {
      state.test.config.questionCount = parseInt(e.target.value);
    }
  });

  document.getElementById('testRangeGroup').addEventListener('change', (e) => {
    if (e.target.name === 'testRange') {
      state.test.config.range = e.target.value;
      const count = countEligibleWords(state.test.config.range);
      const countEl = document.getElementById('testEligibleCount');
      const startBtn = document.getElementById('testStartBtn');
      if (countEl) {
        countEl.textContent = t('test_setup_eligibleCount', { count });
        countEl.classList.toggle('test-setup__word-count--zero', count === 0);
      }
      if (startBtn) startBtn.disabled = count === 0;
    }
  });

  document.getElementById('testStartBtn').addEventListener('click', async () => {
    const questions = buildQuestions(state.test.config);
    if (questions.length === 0) return;

    state.test.questions = questions;
    state.test.currentIndex = 0;
    state.test.answers = [];
    state.test.startTime = Date.now();
    state.test.phase = 'question';

    // 설정 저장
    await saveTestConfig(state.test.config);
    renderTestQuestion();
  });
}

async function saveTestConfig(config) {
  const settings = await getSettings();
  settings.testDefaults = settings.testDefaults || {};
  settings.testDefaults.questionCount = config.questionCount;
  settings.testDefaults.difficulty = config.range;
  await saveSettings(settings);
}

// --- 문제 화면 ---

function renderTestQuestion() {
  const q = state.test.questions[state.test.currentIndex];
  const total = state.test.questions.length;
  const current = state.test.currentIndex + 1;
  const progressPct = Math.round(((current - 1) / total) * 100);

  // 마스킹된 문장을 HTML로 렌더링 (____를 styled span으로)
  const sentenceParts = q.maskedSentence.split('____');
  const sentenceHtml = sentenceParts.map(p => escapeHtml(p)).join(
    `<span class="test-question__blank">____</span>`
  );

  contentArea.innerHTML = `
    <div class="test-question">
      <div class="test-progress">
        <div class="test-progress__bar">
          <div class="test-progress__fill" style="width: ${progressPct}%"></div>
        </div>
        <div class="test-progress__label">${t('test_progress', { current, total })}</div>
      </div>

      ${q.hintSentence ? `
        <div>
          <div class="test-question__hint-label">${t('test_hint_label')}</div>
          <div class="test-question__hint">${escapeHtml(q.hintSentence)}</div>
        </div>
      ` : ''}

      <div class="test-question__divider"></div>

      <div>
        <div class="test-question__sentence-label">${t('test_question_label')}</div>
        <p class="test-question__sentence">${sentenceHtml}</p>
      </div>

      <div class="test-question__input-wrap">
        <input type="text" class="test-question__input" id="testAnswerInput"
          placeholder="${t('test_input_placeholder')}" autocomplete="off" autocorrect="off"
          autocapitalize="off" spellcheck="false">
        <button class="test-question__submit-btn" id="testSubmitBtn">${t('test_submit')}</button>
      </div>
    </div>
  `;

  document.getElementById('testAnswerInput').focus();
  bindTestQuestionEvents(q);
}

function bindTestQuestionEvents(question) {
  const input = document.getElementById('testAnswerInput');
  const submitBtn = document.getElementById('testSubmitBtn');

  function handleSubmit() {
    const userAnswer = input.value;
    if (userAnswer.trim() === '') return;
    submitBtn.disabled = true;
    input.disabled = true;

    const isCorrect = validateAnswer(userAnswer, question);

    // 입력창 색상 피드백
    input.classList.add(isCorrect ? 'test-question__input--correct' : 'test-question__input--wrong');

    // 답변 기록
    state.test.answers.push({
      wordId: question.wordId,
      word: question.word,
      correct: isCorrect,
      userAnswer: userAnswer.trim(),
      correctAnswer: question.word,
      matchedText: question.matchedText,
      maskedSentence: question.maskedSentence,
      hintSentence: question.hintSentence,
    });

    state.test.phase = 'feedback';
    // 짧은 딜레이 후 피드백 화면 전환
    setTimeout(() => renderTestFeedback(question, userAnswer, isCorrect), 200);
  }

  submitBtn.addEventListener('click', handleSubmit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });
}

// --- 피드백 화면 ---

function renderTestFeedback(question, userAnswer, isCorrect) {
  const total = state.test.questions.length;
  const current = state.test.currentIndex + 1;
  const progressPct = Math.round((current / total) * 100);
  const isLast = current === total;

  // 마스킹된 문장에서 ____를 정답/오답 강조 span으로 교체
  const sentenceParts = question.maskedSentence.split('____');
  let highlightSpan;
  if (isCorrect) {
    highlightSpan = `<span class="test-feedback__word--correct">${escapeHtml(question.matchedText)}</span>`;
  } else {
    highlightSpan = `<span class="test-feedback__word--wrong">${escapeHtml(userAnswer.trim() || t('test_no_answer'))}</span>`;
  }
  const sentenceHtml = sentenceParts.map(p => escapeHtml(p)).join(highlightSpan);

  contentArea.innerHTML = `
    <div class="test-question">
      <div class="test-progress">
        <div class="test-progress__bar">
          <div class="test-progress__fill" style="width: ${progressPct}%"></div>
        </div>
        <div class="test-progress__label">${t('test_progress', { current, total })}</div>
      </div>

      <div class="test-feedback__result ${isCorrect ? 'test-feedback__result--correct' : 'test-feedback__result--wrong'}">
        <span class="test-feedback__icon">${isCorrect ? '✓' : '✗'}</span>
        <span class="test-feedback__label">${isCorrect ? t('test_correct') : t('test_incorrect')}</span>
      </div>

      ${question.hintSentence ? `
        <div>
          <div class="test-question__hint-label">${t('test_hint_label')}</div>
          <div class="test-question__hint">${escapeHtml(question.hintSentence)}</div>
        </div>
      ` : ''}

      <div class="test-question__divider"></div>

      <div>
        <div class="test-question__sentence-label">${t('test_question_label')}</div>
        <p class="test-question__sentence">${sentenceHtml}</p>
      </div>

      ${!isCorrect ? `
        <div class="test-feedback__correct-answer">
          <span class="test-feedback__correct-label">${t('test_correct_answer_label')}</span>
          <span class="test-feedback__correct-word">${escapeHtml(question.word)}</span>
        </div>
      ` : ''}

      <button class="test-question__next-btn" id="testNextBtn">
        ${isLast ? t('test_see_results') : t('test_next')}
      </button>
    </div>
  `;

  const nextBtn = document.getElementById('testNextBtn');
  nextBtn.addEventListener('click', advanceQuestion);
  nextBtn.focus();
}

// --- 진행 ---

async function advanceQuestion() {
  state.test.currentIndex++;

  if (state.test.currentIndex >= state.test.questions.length) {
    state.test.phase = 'results';
    await persistTestResults();
    renderTestResults();
  } else {
    state.test.phase = 'question';
    renderTestQuestion();
  }
}

async function persistTestResults() {
  const now = new Date().toISOString();

  for (const answer of state.test.answers) {
    const word = state.allWords.find(w => w.id === answer.wordId);
    if (!word) continue;

    const newMetadata = {
      ...word.metadata,
      testResults: [
        ...(word.metadata?.testResults || []),
        { date: now, correct: answer.correct, testType: 'context-match' },
      ],
      masteryLevel: computeNewMastery(word.metadata?.masteryLevel, answer.correct),
      lastReviewed: now,
      reviewCount: (word.metadata?.reviewCount || 0) + 1,
    };

    await updateWord(word.id, { metadata: newMetadata });
    word.metadata = newMetadata; // in-memory 업데이트
  }

  await updateTestStats(state.test.answers);
}

// --- 결과 화면 ---

function renderTestResults() {
  const answers = state.test.answers;
  const correctCount = answers.filter(a => a.correct).length;
  const totalCount = answers.length;
  const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const wrongAnswers = answers.filter(a => !a.correct);
  const elapsed = Date.now() - (state.test.startTime || Date.now());

  const wrongListHtml = wrongAnswers.map(a => `
    <div class="test-results__wrong-card">
      <div class="test-results__wrong-word">${escapeHtml(a.word)}</div>
      <div class="test-results__wrong-row">
        <span class="test-results__wrong-label">${t('test_your_answer')}</span>
        <span class="test-results__wrong-val">${escapeHtml(a.userAnswer || t('test_no_answer'))}</span>
      </div>
      <div class="test-results__wrong-row">
        <span class="test-results__wrong-label">${t('test_correct_answer')}</span>
        <span class="test-results__wrong-val test-results__wrong-correct">${escapeHtml(a.word)}</span>
      </div>
      ${a.hintSentence ? `<div class="test-results__wrong-context">${escapeHtml(a.hintSentence)}</div>` : ''}
    </div>
  `).join('');

  contentArea.innerHTML = `
    <div class="test-results">
      <h2 class="test-results__title">${t('test_results_title')}</h2>

      <div class="test-results__score-card">
        <div class="test-results__percent">${scorePercent}%</div>
        <div class="test-results__score">${t('test_results_score', { correct: correctCount, total: totalCount })}</div>
        <div class="test-results__duration">${t('test_results_duration', { time: formatDuration(elapsed) })}</div>
      </div>

      ${wrongAnswers.length > 0 ? `
        <div>
          <div class="test-results__section-title">${t('test_wrong_section')}</div>
          ${wrongListHtml}
        </div>
      ` : `<div class="test-results__perfect">${t('test_perfect')}</div>`}

      <div class="test-results__actions">
        <button class="test-results__retry-btn" id="testRetryBtn">${t('test_retry')}</button>
        <button class="test-results__words-btn" id="testWordsBtn">${t('test_back_to_words')}</button>
      </div>
    </div>
  `;

  document.getElementById('testRetryBtn').addEventListener('click', () => {
    state.test.phase = 'idle';
    renderTestSetup();
  });
  document.getElementById('testWordsBtn').addEventListener('click', () => {
    switchTab('words');
  });
}

// ============================================================
// 카드 클릭 -> 상세 뷰
// ============================================================

contentArea.addEventListener('click', (e) => {
  // 상세 뷰 내부 클릭은 무시 (별도 이벤트 처리)
  if (e.target.closest('.detail-view')) return;

  const card = e.target.closest('.word-card');
  if (!card) return;

  const wordId = card.dataset.id;
  if (!wordId) return;

  state.detailWordId = wordId;
  renderDetailView(wordId);
});

// ============================================================
// 상세 뷰 렌더링
// ============================================================

async function renderDetailView(wordId) {
  const word = await getWordById(wordId);
  if (!word) {
    state.detailWordId = null;
    renderWordsTab();
    return;
  }

  toolbar.style.display = 'none';

  contentArea.innerHTML = `
    <div class="detail-view">
      <div class="detail-view__header">
        <button class="detail-view__back-btn" id="detailBackBtn" aria-label="${t('detail_backLabel')}">${t('detail_back')}</button>
        <div class="detail-view__actions" id="detailActions">
          <button class="detail-view__action-btn" id="detailDeleteBtn" aria-label="${t('detail_deleteLabel')}" title="${t('detail_deleteLabel')}"><img src="../assets/buttons/btn_delete18.png" alt="" width="18" height="18"></button>
        </div>
      </div>

      <div class="detail-view__word-section">
        <h2 class="detail-view__word">${escapeHtml(word.word)}</h2>
        ${word.pronunciation ? `<span class="detail-view__pronunciation">${escapeHtml(word.pronunciation)}</span>` : ''}
      </div>

      <div class="detail-view__divider"></div>

      ${(word.definitions || []).map(def => `
        <div class="detail-view__section">
          <div class="detail-view__section-title">${t('detail_pos', { pos: escapeHtml(def.pos || '') })}</div>

          ${(def.meanings || []).some(m => m.korean) ? `
            <div class="detail-view__subsection">
              <div class="detail-view__subsection-title">${t('detail_koreanMeaning')}</div>
              <ol class="detail-view__meaning-list">
                ${def.meanings.filter(m => m.korean).map(m => `<li>${escapeHtml(m.korean)}</li>`).join('')}
              </ol>
            </div>
          ` : ''}

          ${(def.meanings || []).some(m => m.english) ? `
            <div class="detail-view__subsection">
              <div class="detail-view__subsection-title">${t('detail_englishDef')}</div>
              <ol class="detail-view__english-def-list">
                ${def.meanings.filter(m => m.english).map(m => `
                  <li>
                    <p class="detail-view__english-def">${escapeHtml(m.english)}</p>
                    ${m.example ? `<p class="detail-view__example">"${escapeHtml(m.example)}"</p>` : ''}
                    ${(m.synonyms || []).length > 0 ? `
                      <div class="detail-view__synonyms">
                        ${m.synonyms.map(s => `<span class="detail-view__synonym-chip">${escapeHtml(s)}</span>`).join('')}
                      </div>
                    ` : ''}
                  </li>
                `).join('')}
              </ol>
            </div>
          ` : ''}
        </div>
      `).join('')}

      <div class="detail-view__divider"></div>

      ${word.context?.sourceText ? `
        <div class="detail-view__section">
          <div class="detail-view__section-title">${t('detail_translationContext')}</div>
          <div class="detail-view__subsection">
            <div class="detail-view__subsection-title">${t('detail_sourceText', { lang: escapeHtml(word.context.sourceLanguage || '') })}</div>
            <p class="detail-view__context-text">${escapeHtml(word.context.sourceText)}</p>
          </div>
          ${word.context.translatedText ? `
            <div class="detail-view__subsection">
              <div class="detail-view__subsection-title">${t('detail_translatedText', { lang: escapeHtml(word.context.targetLanguage || '') })}</div>
              <p class="detail-view__context-text">${escapeHtml(word.context.translatedText)}</p>
            </div>
          ` : ''}
        </div>
        <div class="detail-view__divider"></div>
      ` : ''}

      <div class="detail-view__section">
        <div class="detail-view__section-title">${t('detail_learningStatus')}</div>
        <div class="detail-view__stats-grid">
          <div class="detail-view__stat">
            <span class="detail-view__stat-label">${t('detail_reviewCountLabel')}</span>
            <span class="detail-view__stat-value">${t('detail_reviewCountValue', { count: word.metadata?.reviewCount || 0 })}</span>
          </div>
          <div class="detail-view__stat">
            <span class="detail-view__stat-label">${t('detail_lastReview')}</span>
            <span class="detail-view__stat-value">${word.metadata?.lastReviewed ? timeAgo(word.metadata.lastReviewed) : t('detail_lastReviewNone')}</span>
          </div>
          <div class="detail-view__stat">
            <span class="detail-view__stat-label">${t('detail_mastery')}</span>
            <span class="detail-view__stat-value">${renderMasteryStars(word.metadata?.masteryLevel || 0)}</span>
          </div>
          <div class="detail-view__stat">
            <span class="detail-view__stat-label">${t('detail_savedDate')}</span>
            <span class="detail-view__stat-value">${word.metadata?.savedAt ? new Date(word.metadata.savedAt).toLocaleDateString(getLocaleCode()) : ''}</span>
          </div>
        </div>
      </div>

      <div class="detail-view__divider"></div>

      <div class="detail-view__section">
        <div class="detail-view__section-title">${t('detail_memo')}</div>
        <textarea class="detail-view__note" id="detailNote" placeholder="${t('detail_memoPlaceholder')}" rows="3">${escapeHtml(word.userNote || '')}</textarea>
        <button class="detail-view__save-note-btn" id="saveNoteBtn">${t('detail_memoSave')}</button>
      </div>

      <div class="detail-view__section">
        <div class="detail-view__section-title">${t('detail_tags')}</div>
        <div class="detail-view__tags" id="detailTags">
          ${(word.tags || []).map(tag => `
            <span class="detail-view__tag">${escapeHtml(tag)} <button class="detail-view__tag-remove" data-tag="${escapeHtml(tag)}" aria-label="${t('detail_tagRemoveLabel')}">x</button></span>
          `).join('')}
        </div>
        <div class="detail-view__tag-input-wrap">
          <input type="text" class="detail-view__tag-input" id="tagInput" placeholder="${t('detail_tagPlaceholder')}" maxlength="20">
          <button class="detail-view__tag-add-btn" id="addTagBtn">${t('detail_tagAdd')}</button>
        </div>
      </div>
    </div>
  `;

  bindDetailViewEvents(word);
}

function renderMasteryStars(level) {
  const filled = Math.min(level, 5);
  const empty = 5 - filled;
  return '<span class="detail-view__stars">' +
    '\u2605'.repeat(filled) + '\u2606'.repeat(empty) +
    '</span>';
}

// ============================================================
// 상세 뷰 이벤트 바인딩
// ============================================================

function bindDetailViewEvents(word) {
  // 뒤로 가기
  document.getElementById('detailBackBtn').addEventListener('click', () => {
    state.detailWordId = null;
    toolbar.style.display = 'flex';
    renderWordsTab();
  });

  // 삭제
  document.getElementById('detailDeleteBtn').addEventListener('click', () => {
    showDeleteConfirmation(word);
  });

  // 메모 저장
  document.getElementById('saveNoteBtn').addEventListener('click', async () => {
    const note = document.getElementById('detailNote').value;
    const success = await updateWord(word.id, { userNote: note });
    if (success) {
      const idx = state.allWords.findIndex(w => w.id === word.id);
      if (idx !== -1) state.allWords[idx].userNote = note;
      showDetailToast(t('detail_memoSaved'));
    }
  });

  // 태그 추가
  document.getElementById('addTagBtn').addEventListener('click', () => addTag(word));
  document.getElementById('tagInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTag(word);
  });

  // 태그 삭제 (이벤트 위임)
  document.getElementById('detailTags').addEventListener('click', async (e) => {
    const removeBtn = e.target.closest('.detail-view__tag-remove');
    if (!removeBtn) return;

    const tagToRemove = removeBtn.dataset.tag;
    const newTags = (word.tags || []).filter(tg => tg !== tagToRemove);
    const success = await updateWord(word.id, { tags: newTags });
    if (success) {
      word.tags = newTags;
      const idx = state.allWords.findIndex(w => w.id === word.id);
      if (idx !== -1) state.allWords[idx].tags = newTags;
      renderDetailView(word.id);
    }
  });
}

async function addTag(word) {
  const input = document.getElementById('tagInput');
  const newTag = input.value.trim();
  if (!newTag) return;
  if ((word.tags || []).includes(newTag)) {
    input.value = '';
    return;
  }

  const newTags = [...(word.tags || []), newTag];
  const success = await updateWord(word.id, { tags: newTags });
  if (success) {
    word.tags = newTags;
    const idx = state.allWords.findIndex(w => w.id === word.id);
    if (idx !== -1) state.allWords[idx].tags = newTags;
    renderDetailView(word.id);
  }
}

// ============================================================
// 삭제 확인
// ============================================================

function showDeleteConfirmation(word) {
  const actions = document.getElementById('detailActions');
  actions.innerHTML = `
    <div class="detail-view__delete-confirm">
      <span class="detail-view__delete-confirm-text">${t('detail_deleteConfirm', { word: escapeHtml(word.word) })}</span>
      <button class="detail-view__delete-confirm-yes" id="confirmDeleteBtn">${t('detail_deleteBtn')}</button>
      <button class="detail-view__delete-confirm-no" id="cancelDeleteBtn">${t('detail_cancelBtn')}</button>
    </div>
  `;

  document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    const success = await deleteWord(word.id);
    if (success) {
      state.allWords = state.allWords.filter(w => w.id !== word.id);
      applyFiltersAndSort();
      populateFilterDropdown();
      state.detailWordId = null;
      toolbar.style.display = 'flex';
      renderWordsTab();
    }
  });

  document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    actions.innerHTML = `
      <button class="detail-view__action-btn" id="detailDeleteBtn" aria-label="${t('detail_deleteLabel')}" title="${t('detail_deleteLabel')}"><img src="../assets/buttons/btn_delete18.png" alt="" width="18" height="18"></button>
    `;
    document.getElementById('detailDeleteBtn').addEventListener('click', () => {
      showDeleteConfirmation(word);
    });
  });
}

// ============================================================
// 상세 뷰 토스트
// ============================================================

function showDetailToast(message) {
  const existing = document.querySelector('.detail-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'detail-toast';
  toast.textContent = message;
  contentArea.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('detail-toast--fadeout');
    setTimeout(() => toast.remove(), 200);
  }, 1500);
}

// ============================================================
// 키보드 접근성
// ============================================================

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // 설정 오버레이 닫기
    const overlay = document.getElementById('settingsOverlay');
    if (overlay.style.display !== 'none') {
      overlay.style.display = 'none';
      return;
    }

    // 열린 드롭다운 닫기
    const openDropdowns = document.querySelectorAll('.toolbar__dropdown--open');
    if (openDropdowns.length > 0) {
      closeAllDropdowns();
      return;
    }

    // 상세 뷰 닫기
    if (state.detailWordId) {
      state.detailWordId = null;
      toolbar.style.display = 'flex';
      renderWordsTab();
    }
  }
});

// ============================================================
// 설정 오버레이
// ============================================================

const settingsOverlay = document.getElementById('settingsOverlay');
const settingsCloseBtn = document.getElementById('settingsClose');
const languageSelect = document.getElementById('languageSelect');

document.querySelector('.header__settings-btn').addEventListener('click', () => {
  languageSelect.value = getCurrentLang();
  settingsOverlay.style.display = 'flex';
});

settingsCloseBtn.addEventListener('click', () => {
  settingsOverlay.style.display = 'none';
});

settingsOverlay.addEventListener('click', (e) => {
  if (e.target === settingsOverlay) {
    settingsOverlay.style.display = 'none';
  }
});

languageSelect.addEventListener('change', async (e) => {
  const newLang = e.target.value;
  const settings = await getSettings();
  settings.language = newLang;
  await saveSettings(settings);
  await setLanguage(newLang);
});

// ============================================================
// 유틸리티
// ============================================================

function timeAgo(isoString) {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return t('timeAgo_justNow');
  if (diffMin < 60) return t('timeAgo_minutes', { m: diffMin });
  if (diffHr < 24) return t('timeAgo_hours', { h: diffHr });
  return t('timeAgo_days', { d: diffDay });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// 언어 변경 콜백
// ============================================================

onLanguageChange(async () => {
  // 동적 콘텐츠 재렌더링
  populateFilterDropdown();
  updateFilterBtnLabel();
  await renderTabContent(state.activeTab);
});

// ============================================================
// 초기화
// ============================================================

async function init() {
  console.log('[VocabBuilder] Side panel loaded (Stage 5-6)');

  const settings = await getSettings();
  await initI18n(settings.language);

  state.allWords = await getAllWords();
  applyFiltersAndSort();
  populateFilterDropdown();

  switchTab('stats');
}

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'local') return;

  if (changes.vocabulary_words) {
    state.allWords = await getAllWords();
    applyFiltersAndSort();
    populateFilterDropdown();
  }

  if (state.activeTab === 'words') {
    if (changes.vocabulary_words) {
      if (state.detailWordId) {
        renderDetailView(state.detailWordId);
      } else {
        renderWordsTab();
      }
    }
    return;
  }

  if (state.activeTab === 'stats' && (changes.vocabulary_meta || changes.vocabulary_stats || changes.vocabulary_words)) {
    renderStatsTab();
  }
});

init();
