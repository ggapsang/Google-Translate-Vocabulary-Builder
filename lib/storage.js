/**
 * storage.js - Chrome Storage API 래퍼
 *
 * chrome.storage.local(단어 데이터)과 chrome.storage.sync(설정)에 대한
 * CRUD 기능을 Promise 기반으로 제공합니다.
 *
 * Storage Keys (local):
 *   - vocabulary_words: Array<VocabularyWord>
 *   - vocabulary_meta: MetaData
 *   - vocabulary_stats: Statistics
 *   - vocabulary_index: Record<string, string> (word -> id)
 *
 * Storage Keys (sync):
 *   - settings: UserSettings
 */

// ============================================================
// Storage Key 상수
// ============================================================

const STORAGE_KEYS = {
  WORDS: 'vocabulary_words',
  META: 'vocabulary_meta',
  STATS: 'vocabulary_stats',
  INDEX: 'vocabulary_index',
  SETTINGS: 'settings'
};

const CURRENT_VERSION = '0.1.0';

// ============================================================
// 저수준 Promise 래퍼
// ============================================================

function localGet(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result);
      }
    });
  });
}

function localSet(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

function localRemove(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

function syncGet(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result);
      }
    });
  });
}

function syncSet(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

// ============================================================
// 단어 CRUD
// ============================================================

/**
 * 모든 단어를 가져옵니다.
 * @returns {Promise<Array>}
 */
async function getAllWords() {
  try {
    const result = await localGet(STORAGE_KEYS.WORDS);
    return result[STORAGE_KEYS.WORDS] || [];
  } catch (error) {
    console.error('[VocabBuilder] Error getting words:', error);
    return [];
  }
}

/**
 * ID로 단어를 가져옵니다.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function getWordById(id) {
  try {
    const words = await getAllWords();
    return words.find(w => w.id === id) || null;
  } catch (error) {
    console.error('[VocabBuilder] Error getting word by ID:', error);
    return null;
  }
}

/**
 * 단어 텍스트로 검색합니다 (인덱스 사용).
 * @param {string} wordText
 * @returns {Promise<Object|null>}
 */
async function getWordByText(wordText) {
  try {
    const result = await localGet(STORAGE_KEYS.INDEX);
    const index = result[STORAGE_KEYS.INDEX] || {};
    const id = index[wordText.toLowerCase()];
    if (!id) return null;
    return getWordById(id);
  } catch (error) {
    console.error('[VocabBuilder] Error getting word by text:', error);
    return null;
  }
}

/**
 * 새 단어를 저장합니다.
 * @param {Object} wordData - VocabularyWord 객체
 * @returns {Promise<boolean>}
 */
async function addWord(wordData) {
  try {
    if (!wordData.id) {
      wordData.id = `${Date.now()}-${wordData.word}`;
    }

    const words = await getAllWords();

    // 중복 체크
    const exists = words.some(w => w.word === wordData.word);
    if (exists) {
      console.warn('[VocabBuilder] Word already exists:', wordData.word);
      return false;
    }

    words.push(wordData);
    await localSet({ [STORAGE_KEYS.WORDS]: words });

    // 인덱스 업데이트
    const result = await localGet(STORAGE_KEYS.INDEX);
    const index = result[STORAGE_KEYS.INDEX] || {};
    index[wordData.word.toLowerCase()] = wordData.id;
    await localSet({ [STORAGE_KEYS.INDEX]: index });

    // 메타 업데이트
    await _updateMeta(words.length);

    console.log('[VocabBuilder] Word saved:', wordData.word);
    return true;
  } catch (error) {
    console.error('[VocabBuilder] Error adding word:', error);
    return false;
  }
}

/**
 * 기존 단어를 업데이트합니다.
 * @param {string} id
 * @param {Object} updates - 업데이트할 필드
 * @returns {Promise<boolean>}
 */
async function updateWord(id, updates) {
  try {
    const words = await getAllWords();
    const idx = words.findIndex(w => w.id === id);

    if (idx === -1) {
      console.warn('[VocabBuilder] Word not found for update:', id);
      return false;
    }

    words[idx] = { ...words[idx], ...updates };
    await localSet({ [STORAGE_KEYS.WORDS]: words });

    console.log('[VocabBuilder] Word updated:', id);
    return true;
  } catch (error) {
    console.error('[VocabBuilder] Error updating word:', error);
    return false;
  }
}

/**
 * 단어를 삭제합니다.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
async function deleteWord(id) {
  try {
    const words = await getAllWords();
    const idx = words.findIndex(w => w.id === id);

    if (idx === -1) {
      console.warn('[VocabBuilder] Word not found for deletion:', id);
      return false;
    }

    const deletedWord = words[idx];
    words.splice(idx, 1);

    await localSet({ [STORAGE_KEYS.WORDS]: words });

    // 인덱스에서 제거
    const result = await localGet(STORAGE_KEYS.INDEX);
    const index = result[STORAGE_KEYS.INDEX] || {};
    delete index[deletedWord.word.toLowerCase()];
    await localSet({ [STORAGE_KEYS.INDEX]: index });

    await _updateMeta(words.length);

    console.log('[VocabBuilder] Word deleted:', deletedWord.word);
    return true;
  } catch (error) {
    console.error('[VocabBuilder] Error deleting word:', error);
    return false;
  }
}

// ============================================================
// 메타 & 통계
// ============================================================

/**
 * 단어장 메타데이터를 가져옵니다.
 * @returns {Promise<Object>}
 */
async function getMeta() {
  try {
    const result = await localGet(STORAGE_KEYS.META);
    return result[STORAGE_KEYS.META] || _defaultMeta();
  } catch (error) {
    console.error('[VocabBuilder] Error getting meta:', error);
    return _defaultMeta();
  }
}

/**
 * 학습 통계를 가져옵니다.
 * @returns {Promise<Object>}
 */
async function getStats() {
  try {
    const result = await localGet(STORAGE_KEYS.STATS);
    return result[STORAGE_KEYS.STATS] || _defaultStats();
  } catch (error) {
    console.error('[VocabBuilder] Error getting stats:', error);
    return _defaultStats();
  }
}

// ============================================================
// 설정 (Sync Storage)
// ============================================================

/**
 * 사용자 설정을 가져옵니다.
 * @returns {Promise<Object>}
 */
async function getSettings() {
  try {
    const result = await syncGet(STORAGE_KEYS.SETTINGS);
    return result[STORAGE_KEYS.SETTINGS] || _defaultSettings();
  } catch (error) {
    console.error('[VocabBuilder] Error getting settings:', error);
    return _defaultSettings();
  }
}

/**
 * 사용자 설정을 저장합니다.
 * @param {Object} settings
 * @returns {Promise<boolean>}
 */
async function saveSettings(settings) {
  try {
    await syncSet({ [STORAGE_KEYS.SETTINGS]: settings });
    console.log('[VocabBuilder] Settings saved');
    return true;
  } catch (error) {
    console.error('[VocabBuilder] Error saving settings:', error);
    return false;
  }
}

// ============================================================
// 초기화
// ============================================================

/**
 * 스토리지를 기본값으로 초기화합니다.
 * 확장 프로그램 최초 설치 시 호출됩니다.
 * @returns {Promise<void>}
 */
async function initializeStorage() {
  try {
    const result = await localGet(STORAGE_KEYS.META);

    if (!result[STORAGE_KEYS.META]) {
      console.log('[VocabBuilder] Initializing storage with defaults...');
      await localSet({
        [STORAGE_KEYS.WORDS]: [],
        [STORAGE_KEYS.META]: _defaultMeta(),
        [STORAGE_KEYS.STATS]: _defaultStats(),
        [STORAGE_KEYS.INDEX]: {}
      });
      await syncSet({
        [STORAGE_KEYS.SETTINGS]: _defaultSettings()
      });
      console.log('[VocabBuilder] Storage initialized');
    }
  } catch (error) {
    console.error('[VocabBuilder] Error initializing storage:', error);
  }
}

// ============================================================
// 내부 헬퍼
// ============================================================

async function _updateMeta(totalWords) {
  const meta = await getMeta();
  meta.totalWords = totalWords;
  meta.lastModified = new Date().toISOString();
  await localSet({ [STORAGE_KEYS.META]: meta });
}

function _defaultMeta() {
  return {
    version: CURRENT_VERSION,
    totalWords: 0,
    lastBackup: null,
    lastSync: null,
    languagePairs: [],
    posDistribution: {}
  };
}

function _defaultStats() {
  return {
    total: { words: 0, reviews: 0, tests: 0 },
    dailyActivity: [],
    progress: {
      level0: 0, level1: 0, level2: 0,
      level3: 0, level4: 0, level5: 0
    },
    testStats: {
      totalTests: 0, averageScore: 0,
      bestScore: 0, worstScore: 0
    }
  };
}

function _defaultSettings() {
  return {
    theme: 'light',
    language: 'ko',
    defaultSourceLang: 'en',
    defaultTargetLang: 'ko',
    dailyGoals: { newWords: 10, reviews: 20 },
    notifications: {
      enabled: false,
      time: '09:00',
      days: ['mon', 'tue', 'wed', 'thu', 'fri']
    },
    testDefaults: {
      questionCount: 20,
      testType: 'multiple-choice',
      difficulty: 'review-needed'
    },
    advanced: {
      autoSave: false,
      syncEnabled: false,
      backupFrequency: 'weekly'
    }
  };
}

// ============================================================
// Exports
// ============================================================

export {
  STORAGE_KEYS,
  getAllWords,
  getWordById,
  getWordByText,
  addWord,
  updateWord,
  deleteWord,
  getMeta,
  getStats,
  getSettings,
  saveSettings,
  initializeStorage
};
