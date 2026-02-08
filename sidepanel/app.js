/**
 * sidepanel/app.js - 사이드 패널 앱 로직
 *
 * Stage 1-2: 탭 전환, 스토리지 연동 테스트, 기본 단어 목록 렌더링.
 * Stage 5-6: 검색(디바운스), 필터/정렬 드롭다운, 상세 뷰, 수정/삭제.
 */

import { getAllWords, getWordById, updateWord, deleteWord, getMeta, getStats } from '../lib/storage.js';

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
  filterBtn.textContent = activeCount > 0 ? `\ud544\ud130 (${activeCount})` : '\ud544\ud130';
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

async function renderStatsTab() {
  const meta = await getMeta();
  const stats = await getStats();

  contentArea.innerHTML = `
    <div class="stats-overview">
      <div class="stats-card">
        <div class="stats-card__label">\ucd1d \ub2e8\uc5b4 \uc218</div>
        <div class="stats-card__value">${meta.totalWords}</div>
      </div>
      <div class="stats-card">
        <div class="stats-card__label">\ucd1d \ubcf5\uc2b5 \ud69f\uc218</div>
        <div class="stats-card__value">${stats.total.reviews}</div>
      </div>
      <div class="stats-card">
        <div class="stats-card__label">\ucd1d \ud14c\uc2a4\ud2b8 \ud69f\uc218</div>
        <div class="stats-card__value">${stats.total.tests}</div>
      </div>
    </div>
    <p style="text-align:center; color: var(--color-text-secondary); margin-top: 24px;">
      \ud1b5\uacc4 \ucc28\ud2b8\ub294 Phase 2\uc5d0\uc11c \uad6c\ud604\ub429\ub2c8\ub2e4.
    </p>
  `;
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
        <p>\uc544\uc9c1 \uc800\uc7a5\ub41c \ub2e8\uc5b4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>
        <p>\uad6c\uae00 \ubc88\uc5ed\uc5d0\uc11c \ub2e8\uc5b4\ub97c \uac80\uc0c9\ud558\uace0 \uc800\uc7a5\ud574\ubcf4\uc138\uc694!</p>
      </div>
    `;
    return;
  }

  if (words.length === 0) {
    contentArea.innerHTML = `
      <div class="content__empty">
        <p>\uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>
      </div>
    `;
    return;
  }

  const countHtml = state.allWords.length !== words.length
    ? `<div class="content__count">${words.length}\uac1c / ${state.allWords.length}\uac1c</div>`
    : `<div class="content__count">${words.length}\uac1c \ub2e8\uc5b4</div>`;

  contentArea.innerHTML = countHtml + words.map(word => `
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
        <span>\ubcf5\uc2b5 ${word.metadata?.reviewCount || 0}\ud68c</span>
      </div>
    </div>
  `).join('');
}

function renderTestTab() {
  contentArea.innerHTML = `
    <div class="content__empty">
      <p>\ud14c\uc2a4\ud2b8 \uae30\ub2a5\uc740 Phase 2\uc5d0\uc11c \uad6c\ud604\ub429\ub2c8\ub2e4.</p>
    </div>
  `;
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
        <button class="detail-view__back-btn" id="detailBackBtn" aria-label="\ub4a4\ub85c">\u2190 \ub4a4\ub85c</button>
        <div class="detail-view__actions" id="detailActions">
          <button class="detail-view__action-btn" id="detailDeleteBtn" aria-label="\uc0ad\uc81c" title="\uc0ad\uc81c">\ud83d\uddd1\ufe0f</button>
        </div>
      </div>

      <div class="detail-view__word-section">
        <h2 class="detail-view__word">${escapeHtml(word.word)}</h2>
        ${word.pronunciation ? `<span class="detail-view__pronunciation">${escapeHtml(word.pronunciation)}</span>` : ''}
      </div>

      <div class="detail-view__divider"></div>

      ${(word.definitions || []).map(def => `
        <div class="detail-view__section">
          <div class="detail-view__section-title">\ud488\uc0ac: ${escapeHtml(def.pos || '')}</div>

          ${(def.meanings || []).length > 0 ? `
            <div class="detail-view__subsection">
              <div class="detail-view__subsection-title">\ud55c\uad6d\uc5b4 \ub73b</div>
              <ol class="detail-view__meaning-list">
                ${def.meanings.map(m => `<li>${escapeHtml(m.korean || '(\ub73b \uc5c6\uc74c)')}</li>`).join('')}
              </ol>
            </div>
          ` : ''}

          ${def.meanings?.[0]?.english ? `
            <div class="detail-view__subsection">
              <div class="detail-view__subsection-title">\uc601\uc5b4 \uc815\uc758</div>
              <p class="detail-view__english-def">${escapeHtml(def.meanings[0].english)}</p>
            </div>
          ` : ''}

          ${(def.meanings?.[0]?.synonyms || []).length > 0 ? `
            <div class="detail-view__subsection">
              <div class="detail-view__subsection-title">\uc720\uc758\uc5b4</div>
              <div class="detail-view__synonyms">
                ${def.meanings[0].synonyms.map(s => `<span class="detail-view__synonym-chip">${escapeHtml(s)}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${def.meanings?.[0]?.example ? `
            <div class="detail-view__subsection">
              <div class="detail-view__subsection-title">\uc608\ubb38</div>
              <p class="detail-view__example">"${escapeHtml(def.meanings[0].example)}"</p>
            </div>
          ` : ''}
        </div>
      `).join('')}

      <div class="detail-view__divider"></div>

      ${word.context?.sourceText ? `
        <div class="detail-view__section">
          <div class="detail-view__section-title">\ubc88\uc5ed \ucee8\ud14d\uc2a4\ud2b8</div>
          <div class="detail-view__subsection">
            <div class="detail-view__subsection-title">\uc6d0\ubb38 (${escapeHtml(word.context.sourceLanguage || '')})</div>
            <p class="detail-view__context-text">${escapeHtml(word.context.sourceText)}</p>
          </div>
          ${word.context.translatedText ? `
            <div class="detail-view__subsection">
              <div class="detail-view__subsection-title">\ubc88\uc5ed (${escapeHtml(word.context.targetLanguage || '')})</div>
              <p class="detail-view__context-text">${escapeHtml(word.context.translatedText)}</p>
            </div>
          ` : ''}
        </div>
        <div class="detail-view__divider"></div>
      ` : ''}

      <div class="detail-view__section">
        <div class="detail-view__section-title">\ud559\uc2b5 \ud604\ud669</div>
        <div class="detail-view__stats-grid">
          <div class="detail-view__stat">
            <span class="detail-view__stat-label">\ubcf5\uc2b5 \ud69f\uc218</span>
            <span class="detail-view__stat-value">${word.metadata?.reviewCount || 0}\ud68c</span>
          </div>
          <div class="detail-view__stat">
            <span class="detail-view__stat-label">\ub9c8\uc9c0\ub9c9 \ubcf5\uc2b5</span>
            <span class="detail-view__stat-value">${word.metadata?.lastReviewed ? timeAgo(word.metadata.lastReviewed) : '\uc5c6\uc74c'}</span>
          </div>
          <div class="detail-view__stat">
            <span class="detail-view__stat-label">\uc219\ub828\ub3c4</span>
            <span class="detail-view__stat-value">${renderMasteryStars(word.metadata?.masteryLevel || 0)}</span>
          </div>
          <div class="detail-view__stat">
            <span class="detail-view__stat-label">\uc800\uc7a5\uc77c</span>
            <span class="detail-view__stat-value">${word.metadata?.savedAt ? new Date(word.metadata.savedAt).toLocaleDateString('ko-KR') : ''}</span>
          </div>
        </div>
      </div>

      <div class="detail-view__divider"></div>

      <div class="detail-view__section">
        <div class="detail-view__section-title">\uba54\ubaa8</div>
        <textarea class="detail-view__note" id="detailNote" placeholder="\uba54\ubaa8\ub97c \uc785\ub825\ud558\uc138\uc694..." rows="3">${escapeHtml(word.userNote || '')}</textarea>
        <button class="detail-view__save-note-btn" id="saveNoteBtn">\uba54\ubaa8 \uc800\uc7a5</button>
      </div>

      <div class="detail-view__section">
        <div class="detail-view__section-title">\ud0dc\uadf8</div>
        <div class="detail-view__tags" id="detailTags">
          ${(word.tags || []).map(tag => `
            <span class="detail-view__tag">${escapeHtml(tag)} <button class="detail-view__tag-remove" data-tag="${escapeHtml(tag)}" aria-label="\ud0dc\uadf8 \uc81c\uac70">x</button></span>
          `).join('')}
        </div>
        <div class="detail-view__tag-input-wrap">
          <input type="text" class="detail-view__tag-input" id="tagInput" placeholder="\ud0dc\uadf8 \ucd94\uac00..." maxlength="20">
          <button class="detail-view__tag-add-btn" id="addTagBtn">\ucd94\uac00</button>
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
      showDetailToast('\uba54\ubaa8\uac00 \uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4.');
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
    const newTags = (word.tags || []).filter(t => t !== tagToRemove);
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
      <span class="detail-view__delete-confirm-text">"${escapeHtml(word.word)}" \uc0ad\uc81c?</span>
      <button class="detail-view__delete-confirm-yes" id="confirmDeleteBtn">\uc0ad\uc81c</button>
      <button class="detail-view__delete-confirm-no" id="cancelDeleteBtn">\ucde8\uc18c</button>
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
      <button class="detail-view__action-btn" id="detailDeleteBtn" aria-label="\uc0ad\uc81c" title="\uc0ad\uc81c">\ud83d\uddd1\ufe0f</button>
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
// 유틸리티
// ============================================================

function timeAgo(isoString) {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return '\ubc29\uae08 \uc804';
  if (diffMin < 60) return `${diffMin}\ubd84 \uc804`;
  if (diffHr < 24) return `${diffHr}\uc2dc\uac04 \uc804`;
  return `${diffDay}\uc77c \uc804`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// 초기화
// ============================================================

async function init() {
  console.log('[VocabBuilder] Side panel loaded (Stage 5-6)');

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
