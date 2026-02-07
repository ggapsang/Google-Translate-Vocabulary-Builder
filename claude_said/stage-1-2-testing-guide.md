# Stage 1-2 수동 테스트 가이드

## 사전 준비

- Chrome 브라우저 최신 버전 (116 이상 권장)
- 프로젝트 폴더에 모든 파일이 존재하는지 확인

---

## Test 1: 확장 프로그램 로드

### 절차:
1. Chrome 주소창에 `chrome://extensions` 입력
2. 우측 상단 **"개발자 모드"** 토글 ON
3. **"압축해제된 확장 프로그램을 로드합니다"** 클릭
4. 프로젝트 루트 폴더 선택 (`manifest.json`이 있는 폴더)

### 확인 사항:
- [ ] 확장 프로그램이 오류 없이 로드됨
- [ ] "Google Translate Vocabulary Builder" 이름 표시
- [ ] 버전 "0.1.0" 표시
- [ ] Chrome 툴바에 아이콘 나타남 (파란색 사각형)
- [ ] 빨간색 "오류" 버튼이 없음

### 트러블슈팅:
- 오류 발생 시 → "오류" 버튼 클릭하여 상세 메시지 확인
- `manifest.json` 문법 오류가 가장 흔한 원인

---

## Test 2: Content Script 주입

### 절차:
1. https://translate.google.com 접속
2. F12로 개발자 도구 열기 → Console 탭

### 확인 사항:
- [ ] `[VocabBuilder] Content script loaded on Google Translate` 출력
- [ ] `[VocabBuilder] URL: https://translate.google.com/...` 출력
- [ ] `[VocabBuilder] Stage 1-2 content script initialization complete.` 출력

### DOM 접근 테스트 (페이지 로드 2초 후):
1. 아무 단어(예: "hello")를 영어 → 한국어로 번역 입력
2. 사전 정보가 나타날 때까지 기다린 후 콘솔 확인

- [ ] `[VocabBuilder] DOM Access Test Results:` 출력
  - `PASS: Source textarea` (텍스트 입력 영역)
  - `PASS: Page body`
  - `Translation output`과 `Dictionary panel`은 단어 검색 시에만 PASS

### 메시지 테스트:
- [ ] `[VocabBuilder] Messaging test PASSED: {type: "PONG", timestamp: ...}` 출력

---

## Test 3: Background Service Worker

### 절차:
1. `chrome://extensions` 페이지에서 확장 프로그램 카드 찾기
2. **"서비스 워커"** 링크 클릭 → DevTools 열림
3. Console 탭 확인

### 확인 사항 (최초 설치 시):
- [ ] `[VocabBuilder] Extension installed/updated: install` 출력
- [ ] `[VocabBuilder] Initializing storage with defaults...` 출력
- [ ] `[VocabBuilder] Storage initialized` 출력
- [ ] `[VocabBuilder] Initial setup complete` 출력

### 확인 사항 (translate.google.com에서 PING 수신 시):
- [ ] `[VocabBuilder] Message received: {type: "PING"}` 출력

---

## Test 4: Storage API

### 절차:
서비스 워커 DevTools Console에서 아래 명령 실행.

#### 4-1. 초기 데이터 확인
```javascript
chrome.storage.local.get(null, (data) => console.log('Local Storage:', data));
chrome.storage.sync.get(null, (data) => console.log('Sync Storage:', data));
```

### 확인 사항:
- [ ] `vocabulary_words`: 빈 배열 `[]`
- [ ] `vocabulary_meta`: `{version: "0.1.0", totalWords: 0, ...}`
- [ ] `vocabulary_stats`: `{total: {words: 0, reviews: 0, tests: 0}, ...}`
- [ ] `vocabulary_index`: 빈 객체 `{}`
- [ ] `settings`: `{theme: "light", language: "ko", ...}`

#### 4-2. 테스트 단어 저장
```javascript
chrome.storage.local.get('vocabulary_words', (result) => {
  const words = result.vocabulary_words || [];
  words.push({
    id: Date.now() + '-test',
    word: 'test',
    definitions: [{
      pos: '명사',
      meanings: [{
        korean: '시험',
        english: 'a procedure intended to establish quality',
        synonyms: ['trial', 'experiment'],
        example: 'no sparking was visible during the test'
      }]
    }],
    context: {
      sourceText: 'This is a test sentence.',
      translatedText: '이것은 테스트 문장입니다.',
      sourceLanguage: 'en',
      targetLanguage: 'ko'
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
  });
  chrome.storage.local.set({ vocabulary_words: words }, () => {
    console.log('Test word saved!');
  });
});
```

### 확인 사항:
- [ ] `Test word saved!` 출력
- [ ] 4-1을 다시 실행하면 `vocabulary_words`에 test 단어 존재

#### 4-3. 정리
```javascript
chrome.storage.local.set({
  vocabulary_words: [],
  vocabulary_index: {},
  vocabulary_meta: { version: "0.1.0", totalWords: 0, lastBackup: null, lastSync: null, languagePairs: [], posDistribution: {} }
}, () => console.log('Storage cleaned up'));
```

---

## Test 5: Popup

### 절차:
1. Chrome 툴바에서 확장 프로그램 아이콘 클릭

### 확인 사항:
- [ ] 팝업 윈도우가 열림 (약 350px 너비)
- [ ] **"단어장"** 헤더 표시
- [ ] **"0개 단어 저장됨"** 표시
- [ ] **"오늘 저장한 단어: 0개"** 표시
- [ ] **"복습할 단어가 없습니다"** 표시
- [ ] **"단어장 열기"** 버튼 존재
- [ ] **"테스트 시작"** 버튼 존재

---

## Test 6: Side Panel

### 절차:
1. translate.google.com 접속 상태에서
2. Chrome 메뉴(⋮) → 사이드 패널 열기, 또는 단축키 사용
3. 사이드 패널 상단 드롭다운에서 **"Google Translate Vocabulary Builder"** 선택

### 확인 사항:
- [ ] **"나의 단어장"** 헤더 표시
- [ ] 설정(기어) 아이콘 표시
- [ ] 검색바 표시
- [ ] 탭 3개: 통계 / 단어장 / 테스트

### 탭 전환 테스트:
- [ ] **"통계"** 클릭 → 총 단어 수 0, 총 복습 0, 총 테스트 0 표시. 도구바 숨김.
- [ ] **"단어장"** 클릭 → "아직 저장된 단어가 없습니다" 표시. 도구바(필터/정렬/내보내기) 표시.
- [ ] **"테스트"** 클릭 → "Phase 2에서 구현됩니다" 표시. 도구바 숨김.

---

## Test 7: HTML Parsing Constants 로드

### 절차:
1. translate.google.com의 개발자 도구 Console에서:

```javascript
fetch(chrome.runtime.getURL('lib/html_parsing_mapping_table.json'))
  .then(r => r.json())
  .then(data => {
    console.log('Mapping table loaded:', data);
    console.log('Version:', data._version);
    console.log('Dictionary word selector:', data.dictionaryWord.container);
    console.log('Meanings selector:', data.meanings.meaningText);
    console.log('Source text selector:', data.sourceText.selector);
  })
  .catch(err => console.error('FAILED:', err));
```

### 확인 사항:
- [ ] JSON 파일 로드 성공
- [ ] `_version`: `"0.1.0"`
- [ ] `dictionaryWord.container`: `".m2ySsc"`
- [ ] `meanings.meaningText`: `".ctwFHc"`
- [ ] `sourceText.selector`: `"textarea.er8xn"`

---

## 완료 체크리스트

모든 테스트가 통과하면 Stage 1-2 완료:

| 테스트 | 결과 |
|--------|------|
| Test 1: Extension Loading | [ ] |
| Test 2: Content Script | [ ] |
| Test 3: Service Worker | [ ] |
| Test 4: Storage API | [ ] |
| Test 5: Popup | [ ] |
| Test 6: Side Panel | [ ] |
| Test 7: Parsing Constants | [ ] |

### 다음 단계 (Stage 3-4):
- DOM 파싱 로직 구현 (html_parsing_mapping_table.json 셀렉터 사용)
- 저장 버튼 주입
- 실제 단어 저장 기능
- MutationObserver로 동적 DOM 변화 감지
