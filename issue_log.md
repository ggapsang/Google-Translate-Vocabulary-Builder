# 이슈 로그
---


---
## **completed Issue**
### 1. 여러 개의 품사가 있는 단어 저장 오류
#### 대상
- 백로그 항목: `product_backlog.md` Sprint 1 마지막 체크박스
- 기준 문서: `refs/10 HTML 파싱 체크리스트.md`의 `특수 케이스 B. 여러 품사가 있는 경우`

#### 문제 요약 (Pending)
- 증상:
1. `use` 저장 시 명사/동사 분리가 깨지거나 첫 POS 중심으로 저장됨
2. 뜻 리스트가 품사별로 분리되지 않고 섞여 보일 수 있음
- 영향:
1. `definitions[].pos` 정확도 저하
2. 품사 필터/상세 표시 신뢰도 저하

#### 원인 분석
- 기존 취약점:
1. 파싱 범위가 `document` 전역 기준이라 활성 카드 외 DOM이 섞일 수 있음
2. 멀티 POS 감지 실패 시 단일 fallback도 전역 뜻 수집 가능성이 있었음
3. POS 상세(영문 정의/예문/유의어) 매칭이 텍스트 일치 1차 방식만 의존

#### 구현 반영 사항
- 파일: `content/content-script.js`
1. `getActiveDictionaryRoot(selectors)` 추가
2. `queryFirstIn(root, ...)`, `queryAllIn(root, ...)` 추가
3. `parseDefinitions(root, selectors)`로 시그니처 변경
4. 멀티 POS 그룹핑 로직을 `tbody` + `tr` 혼합 구조 대응으로 강화
5. `parseMeanings(root, selectors)`, `parseSynonyms(root, selectors)`로 스코프 고정
6. 멀티 POS 실패 시 `console.debug` 로그 남기고 동일 root에서 단일 fallback 실행
7. POS 라벨 정규화(`normalizePosLabel`) + 인덱스 fallback 매칭 추가

#### 재현 케이스
- 멀티 POS: `use`, `run`
- 단일 POS 회귀 확인: `hello`, `beautiful`
- DOM 잔존 확인: `hello` 저장 후 `use` 저장 반복
- 사전 없음 예외: `How are you?`

#### 검증 체크리스트
- [x] `use` 저장 시 `definitions.length >= 2`
- [x] 각 POS(명사/동사)별 한국어 뜻이 섞이지 않음
- [x] 단일 POS 단어 저장 품질 회귀 없음
- [x] 직전 검색 단어 DOM 영향 없이 현재 카드 기준으로만 저장됨
- [x] 사전 정보 없는 입력에서 오류 없이 안전 처리됨

#### 비고
- `product_backlog.md` 체크박스 상태 변경은 PM(Human) 담당.
