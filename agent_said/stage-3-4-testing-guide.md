# Stage 3-4 수동 테스트 가이드

## 사전 준비
- Chrome 최신 버전
- 확장 프로그램 재로드 완료 (`chrome://extensions` > 새로고침)
- `translate.google.com` 접속

---

## Test 1: Stage 3-4 초기화 로그 확인

### 목적
- 매핑 테이블 로드, Stage 3-4 초기화, 기존 메시징 테스트가 정상 동작하는지 확인

### 절차
1. `translate.google.com`에서 DevTools Console 열기
2. 페이지 새로고침
3. 콘솔 로그 확인

### 확인 사항
- [x] `[VocabBuilder] Content script loaded on Google Translate`
- [x] `[VocabBuilder] Parsing selectors loaded: ...`
- [x] `[VocabBuilder] Stage 3-4 features initialized.`
- [x] `[VocabBuilder] Messaging test PASSED: {type: "PONG", ...}`

---

## Test 2: 저장 버튼 주입 확인

### 목적
- 사전 패널이 뜨면 저장 버튼이 자동 주입되는지 확인

### 절차
1. `hello` 같은 단어를 영어→한국어로 검색
2. 우측 사전 패널이 나타날 때까지 대기

### 확인 사항
- [x] 우측 사전 패널 하단에 `Save to Vocabulary` 버튼 표시
- [x] 버튼 스타일(파란색) 정상 표시
- [x] 단어를 다른 것으로 바꾸면 버튼 상태가 갱신됨

---

## Test 3: DOM 파싱 + 저장 동작 확인

### 목적
- Stage 3-4 파싱 결과가 storage 구조에 맞게 저장되는지 확인

### 절차
1. 사전 패널이 보이는 상태에서 `Save to Vocabulary` 클릭
2. 버튼이 `Saving...` → `Saved`로 변경되는지 확인
3. 콘솔에서 아래 실행

```javascript
chrome.storage.local.get(['vocabulary_words', 'vocabulary_index', 'vocabulary_meta'], (data) => {
  const words = data.vocabulary_words || [];
  const latest = words[words.length - 1];
  console.log('totalWords(meta):', data.vocabulary_meta?.totalWords);
  console.log('latest.word:', latest?.word);
  console.log('latest.pos:', latest?.definitions?.[0]?.pos);
  console.log('latest.meanings:', latest?.definitions?.[0]?.meanings?.map(m => m.korean));
  console.log('latest.english:', latest?.definitions?.[0]?.meanings?.[0]?.english);
  console.log('latest.synonyms:', latest?.definitions?.[0]?.meanings?.[0]?.synonyms);
  console.log('latest.example:', latest?.definitions?.[0]?.meanings?.[0]?.example);
  console.log('latest.context:', latest?.context);
  console.log('indexHit:', data.vocabulary_index?.[(latest?.word || '').toLowerCase()]);
});
```

### 확인 사항
- [x] 저장 성공 토스트 표시 (`Saved: <word>`)
- [x] `vocabulary_words`에 새 항목 추가
- [x] `vocabulary_index[word]`가 id를 가리킴
- [x] `vocabulary_meta.totalWords` 값 증가
- [x] `context.sourceText`, `context.translatedText`, `sourceLanguage`, `targetLanguage` 저장

---

## Test 4: 중복 저장 방지 확인

### 목적
- 같은 단어 재저장 시 중복 데이터가 생기지 않는지 확인

### 절차
1. 이미 저장한 단어 화면에서 버튼 상태 확인
2. 필요 시 페이지 새로고침 후 같은 단어 다시 검색
3. 저장 버튼 클릭 시도
4. 콘솔에서 개수 확인

```javascript
chrome.storage.local.get('vocabulary_words', (data) => {
  const words = data.vocabulary_words || [];
  const grouped = words.reduce((acc, w) => {
    const key = (w.word || '').toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  console.log('word counts:', grouped);
});
```

### 확인 사항
- [x] 저장된 단어는 버튼이 `Saved` 상태로 표시
- [x] 재클릭 시 중복 항목이 늘어나지 않음
- [x] 중복 시 토스트 메시지 표시 (`Already saved: <word>`)
  버튼을 다시 활성화해보고 싶다면 콘솔에서 다음을 실행하세요:
  const btn = document.getElementById('vocab-save-btn');
  if (btn) {
    btn.classList.remove('vocab-save-btn--saved');
    btn.disabled = false;
    btn.textContent = 'Save to Vocabulary';
  }
  그러면 setButtonState('default')와 비슷한 효과를 얻기 때문에 재클릭하면 showToast('Already saved: ...', 'success')가 실행됩니다.
  반복 확인이 필요하면 btn.addEventListener('click')를 콘솔에서 재등록하거나, STATE.lastWord = ''을 강제로 지우고 ensureSaveButton()을 다시 호출하면 토글 상태를 새로 잡는 방식으로 테스트할 수도 있습니다.

---

## Test 5: MutationObserver 재주입 확인

### 목적
- 동적 DOM 변경(단어 변경, URL 파라미터 변경)에도 버튼이 유지/갱신되는지 확인

### 절차
1. `hello` 저장 후 `run`, `bank`, `beautiful` 순서로 검색어 변경
2. 각 단어마다 우측 사전 패널이 갱신되는지 확인
3. 각 상태에서 버튼 표시/상태 확인

### 확인 사항
- [x] 단어 변경마다 버튼이 사라지지 않고 재주입됨
- [x] 저장한 단어는 `Saved`, 미저장 단어는 `Save to Vocabulary`로 상태 분기
- [x] 콘솔에 치명적인 오류(`Uncaught`) 없음

---

## Test 6: 문장 입력(사전 없음) 예외 확인

### 목적
- 사전 정보가 없는 문장 번역에서는 버튼이 잘못 노출되지 않는지 확인

### 절차
1. `How are you?` 같은 문장 검색
2. 우측 패널에서 사전 정보 없음 상태 확인

### 확인 사항
- [x] 저장 버튼이 노출되지 않거나 클릭 불가 상태
- [x] 콘솔 오류 없음

---

## Test 7: Side Panel 반영 확인

### 목적
- 저장된 데이터가 Side Panel 목록에 즉시 반영되는지 확인

### 절차
1. 확장 팝업에서 `단어장 열기` 클릭
2. Side Panel의 `단어장` 탭 이동

### 확인 사항
- [x] 방금 저장한 단어 카드 표시
- [x] 단어/품사/뜻/문맥 일부가 카드에 출력
- [x] 저장 개수와 목록이 일치

---

## 정리 체크리스트

| 테스트 | 결과 |
|--------|------|
| Test 1: 초기화 로그 | [x] |
| Test 2: 버튼 주입 | [x] |
| Test 3: 파싱+저장 | [x] |
| Test 4: 중복 저장 방지 | [x] |
| Test 5: MutationObserver | [x] |
| Test 6: 사전 없음 예외 | [x] |
| Test 7: Side Panel 반영 | [x] |

### Stage 3-4 완료 기준
- 저장 버튼이 Google Translate 사전 패널에서 안정적으로 동작한다.
- 클릭 시 단어 데이터가 `vocabulary_words/index/meta`에 저장된다.
- 동일 단어 중복 저장이 차단된다.
- DOM 동적 변경에도 버튼/상태 갱신이 유지된다.
