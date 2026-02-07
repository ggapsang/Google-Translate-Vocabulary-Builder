/**
 * content-script.js - Google Translate content script
 *
 * Stage 1-2:
 *   - page detection
 *   - DOM access check
 *   - service worker message test
 *
 * Stage 3-4:
 *   - HTML parsing using html_parsing_mapping_table.json
 *   - save button injection
 *   - duplicate save prevention
 *   - toast feedback
 *   - MutationObserver based re-injection
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    WORDS: 'vocabulary_words',
    META: 'vocabulary_meta',
    INDEX: 'vocabulary_index'
  };

  const STATE = {
    selectors: null,
    observer: null,
    buttonEl: null,
    lastWord: '',
    lastUrl: window.location.href,
    updateTimer: null,
    toastTimer: null,
    isDisposed: false
  };

  function isGoogleTranslatePage() {
    return window.location.hostname === 'translate.google.com';
  }

  function storageGet(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(result);
      });
    });
  }

  function storageSet(data) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  function safeText(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/\s+/g, ' ').trim();
  }

  function queryFirst(candidates) {
    for (const selector of candidates) {
      if (!selector || typeof selector !== 'string') continue;
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  function queryAll(candidates) {
    for (const selector of candidates) {
      if (!selector || typeof selector !== 'string') continue;
      const list = document.querySelectorAll(selector);
      if (list.length > 0) return Array.from(list);
    }
    return [];
  }

  function urlLanguage(paramName) {
    const value = new URL(window.location.href).searchParams.get(paramName);
    return safeText(value).toLowerCase();
  }

  function toWordId(word) {
    const normalized = word.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return `${Date.now()}-${normalized || 'word'}`;
  }

  async function loadSelectors() {
    if (STATE.selectors) return STATE.selectors;

    const url = chrome.runtime.getURL('lib/html_parsing_mapping_table.json');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load selector mapping (${response.status})`);
    }

    STATE.selectors = await response.json();
    console.log('[VocabBuilder] Parsing selectors loaded:', STATE.selectors._version);
    return STATE.selectors;
  }

  function parseMeanings(selectors) {
    const meaningNodes = queryAll([
      selectors.meanings?.meaningText,
      selectors.meanings?.fallback?.jsname,
      selectors.meanings?.fallback?.dataTermType
    ]);

    const values = meaningNodes.map((node) => safeText(node.textContent)).filter(Boolean);
    return Array.from(new Set(values));
  }

  function parseSynonyms(selectors) {
    const synonymNodes = queryAll([
      selectors.synonyms?.synonymItem,
      selectors.synonyms?.fallback?.jsname
    ]);

    const values = synonymNodes.map((node) => safeText(node.textContent)).filter(Boolean);
    return Array.from(new Set(values));
  }

  function parseTranslatedText(selectors) {
    const chunks = queryAll([
      `${selectors.translatedText?.selector} ${selectors.translatedText?.innerTextSelector}`,
      selectors.translatedText?.innerTextSelector,
      selectors.translatedText?.selector
    ])
      .map((el) => safeText(el.textContent))
      .filter(Boolean);

    if (chunks.length === 0) return '';
    return chunks.join(' ').replace(/\s+/g, ' ').trim();
  }

  function parseSourceText(selectors) {
    const sourceInput = queryFirst([
      selectors.sourceText?.selector,
      selectors.sourceText?.fallback?.jsname,
      selectors.sourceText?.fallback?.ariaLabel
    ]);

    if (!sourceInput) return '';
    return safeText(sourceInput.value || sourceInput.textContent);
  }

  function parseCurrentWordData() {
    if (!STATE.selectors) return null;

    const selectors = STATE.selectors;
    const wordEl = queryFirst([
      selectors.dictionaryWord?.wordText,
      selectors.dictionaryWord?.container
    ]);

    const word = safeText(wordEl ? wordEl.textContent : '');
    if (!word) {
      return null;
    }

    const posEl = queryFirst([selectors.partOfSpeech?.selector]);
    const posText = safeText(posEl ? posEl.textContent : '') || 'unknown';

    const meaningValues = parseMeanings(selectors);
    const englishDefinitionEl = queryFirst([selectors.englishDefinition?.definitionText]);
    const exampleEl = queryFirst([selectors.exampleSentence?.selector]);
    const pronunciationEl = queryFirst([selectors.pronunciation?.selector]);
    const synonyms = parseSynonyms(selectors);

    const sourceText = parseSourceText(selectors);
    const translatedText = parseTranslatedText(selectors);
    const sourceLanguage = urlLanguage(selectors.sourceLanguage?.urlParam || 'sl') || 'auto';
    const targetLanguage = urlLanguage(selectors.targetLanguage?.urlParam || 'tl') || 'ko';

    const englishDefinition = safeText(englishDefinitionEl ? englishDefinitionEl.textContent : '');
    const example = safeText(exampleEl ? exampleEl.textContent : '');
    const pronunciation = safeText(pronunciationEl ? pronunciationEl.textContent : '');

    const meanings = meaningValues.length > 0
      ? meaningValues.map((korean) => ({
        korean,
        english: englishDefinition,
        synonyms,
        example
      }))
      : [{
        korean: '',
        english: englishDefinition,
        synonyms,
        example
      }];

    return {
      id: toWordId(word),
      word,
      pronunciation,
      definitions: [
        {
          pos: posText,
          meanings
        }
      ],
      context: {
        sourceText,
        translatedText,
        sourceLanguage,
        targetLanguage,
        url: window.location.href
      },
      metadata: {
        savedAt: new Date().toISOString(),
        reviewCount: 0,
        lastReviewed: null,
        nextReview: null,
        masteryLevel: 0,
        testResults: []
      },
      userNote: '',
      tags: []
    };
  }

  async function isSavedWord(word) {
    const key = safeText(word).toLowerCase();
    if (!key) return false;

    const result = await storageGet(STORAGE_KEYS.INDEX);
    const index = result[STORAGE_KEYS.INDEX] || {};
    return Boolean(index[key]);
  }

  async function saveWordData(wordData) {
    const key = safeText(wordData.word).toLowerCase();
    const result = await storageGet([
      STORAGE_KEYS.WORDS,
      STORAGE_KEYS.META,
      STORAGE_KEYS.INDEX
    ]);

    const words = result[STORAGE_KEYS.WORDS] || [];
    const meta = result[STORAGE_KEYS.META] || {
      version: '0.1.0',
      totalWords: 0,
      lastBackup: null,
      lastSync: null,
      languagePairs: [],
      posDistribution: {}
    };
    const index = result[STORAGE_KEYS.INDEX] || {};

    if (index[key]) {
      return { saved: false, reason: 'duplicate' };
    }

    words.push(wordData);
    index[key] = wordData.id;
    meta.totalWords = words.length;
    meta.lastModified = new Date().toISOString();

    await storageSet({
      [STORAGE_KEYS.WORDS]: words,
      [STORAGE_KEYS.INDEX]: index,
      [STORAGE_KEYS.META]: meta
    });

    return { saved: true };
  }

  function showToast(message, kind) {
    const existing = document.getElementById('vocab-toast');
    if (existing) {
      existing.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'vocab-toast';
    toast.className = `vocab-toast ${kind === 'error' ? 'vocab-toast--error' : 'vocab-toast--success'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    if (STATE.toastTimer) {
      clearTimeout(STATE.toastTimer);
    }

    STATE.toastTimer = setTimeout(() => {
      toast.classList.add('vocab-toast--fadeout');
      setTimeout(() => toast.remove(), 180);
    }, 2000);
  }

  function setButtonState(status) {
    if (!STATE.buttonEl) return;

    STATE.buttonEl.classList.remove('vocab-save-btn--saved', 'vocab-save-btn--loading');

    if (status === 'saved') {
      STATE.buttonEl.classList.add('vocab-save-btn--saved');
      STATE.buttonEl.textContent = 'Saved';
      STATE.buttonEl.disabled = true;
      return;
    }

    if (status === 'loading') {
      STATE.buttonEl.classList.add('vocab-save-btn--loading');
      STATE.buttonEl.textContent = 'Saving...';
      STATE.buttonEl.disabled = true;
      return;
    }

    STATE.buttonEl.textContent = 'Save to Vocabulary';
    STATE.buttonEl.disabled = false;
  }

  function buildSaveButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vocab-save-btn vocab-container';
    btn.id = 'vocab-save-btn';
    btn.textContent = 'Save to Vocabulary';

    btn.addEventListener('click', async () => {
      try {
        const parsed = parseCurrentWordData();
        if (!parsed) {
          showToast('No dictionary word detected.', 'error');
          return;
        }

        setButtonState('loading');
        const result = await saveWordData(parsed);

        if (!result.saved && result.reason === 'duplicate') {
          setButtonState('saved');
          showToast(`Already saved: ${parsed.word}`, 'success');
          return;
        }

        setButtonState('saved');
        showToast(`Saved: ${parsed.word}`, 'success');
      } catch (error) {
        console.error('[VocabBuilder] Failed to save word:', error);
        setButtonState('default');
        showToast('Failed to save word.', 'error');
      }
    });

    return btn;
  }

  function findButtonAnchor() {
    if (!STATE.selectors) return null;

    const wordContainer = queryFirst([
      STATE.selectors.dictionaryWord?.container,
      STATE.selectors.dictionaryWord?.wordText
    ]);

    if (!wordContainer) return null;

    const sidebarSection = wordContainer.closest('div');
    return sidebarSection || wordContainer;
  }

  function cleanupButtonReference() {
    if (STATE.buttonEl && !document.body.contains(STATE.buttonEl)) {
      STATE.buttonEl = null;
    }
  }

  function isContextInvalidatedError(error) {
    return Boolean(error && /Extension context invalidated/i.test(String(error.message || error)));
  }

  function dispose() {
    STATE.isDisposed = true;

    if (STATE.updateTimer) {
      clearTimeout(STATE.updateTimer);
      STATE.updateTimer = null;
    }

    if (STATE.toastTimer) {
      clearTimeout(STATE.toastTimer);
      STATE.toastTimer = null;
    }

    if (STATE.observer) {
      STATE.observer.disconnect();
      STATE.observer = null;
    }

    STATE.buttonEl = null;
  }

  async function ensureSaveButton() {
    if (STATE.isDisposed) return;
    cleanupButtonReference();
    const currentData = parseCurrentWordData();
    const currentWord = currentData ? currentData.word : '';
    const anchor = findButtonAnchor();

    if (!currentWord || !anchor) {
      if (STATE.buttonEl) {
        STATE.buttonEl.remove();
        STATE.buttonEl = null;
      }
      STATE.lastWord = '';
      return;
    }

    if (!STATE.buttonEl) {
      STATE.buttonEl = buildSaveButton();
    }

    if (!STATE.buttonEl.isConnected) {
      anchor.insertAdjacentElement('afterend', STATE.buttonEl);
    }

    if (STATE.lastWord !== currentWord) {
      const alreadySaved = await isSavedWord(currentWord);
      setButtonState(alreadySaved ? 'saved' : 'default');
      STATE.lastWord = currentWord;
    }
  }

  function scheduleButtonUpdate(delayMs) {
    if (STATE.isDisposed) return;
    if (STATE.updateTimer) {
      clearTimeout(STATE.updateTimer);
    }

    STATE.updateTimer = setTimeout(() => {
      if (STATE.isDisposed) return;
      ensureSaveButton().catch((error) => {
        if (isContextInvalidatedError(error) || STATE.isDisposed) return;
        console.error('[VocabBuilder] Failed to update save button:', error);
      });
    }, delayMs);
  }

  function startDOMObserver() {
    if (STATE.isDisposed) return;
    if (STATE.observer) return;

    STATE.observer = new MutationObserver(() => {
      if (STATE.lastUrl !== window.location.href) {
        STATE.lastUrl = window.location.href;
        STATE.lastWord = '';
      }
      cleanupButtonReference();
      scheduleButtonUpdate(120);
    });

    STATE.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }

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

  function testMessaging() {
    chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[VocabBuilder] Messaging test FAILED:', chrome.runtime.lastError.message);
      } else {
        console.log('[VocabBuilder] Messaging test PASSED:', response);
      }
    });
  }

  async function initStage34() {
    try {
      await loadSelectors();
      await ensureSaveButton();
      startDOMObserver();
      console.log('[VocabBuilder] Stage 3-4 features initialized.');
    } catch (error) {
      console.error('[VocabBuilder] Stage 3-4 initialization failed:', error);
    }
  }

  function init() {
    if (!isGoogleTranslatePage()) {
      console.warn('[VocabBuilder] Not on Google Translate page. Aborting.');
      return;
    }

    console.log('[VocabBuilder] Content script loaded on Google Translate');
    console.log('[VocabBuilder] URL:', window.location.href);

    setTimeout(() => {
      if (STATE.isDisposed) return;
      testDOMAccess();
      testMessaging();
      initStage34();
    }, 1000);
  }

  window.addEventListener('beforeunload', dispose);
  window.addEventListener('pagehide', dispose);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
