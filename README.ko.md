# Google Translate Vocabulary Builder (구글 번역 학습 단어장)

[English README](./README.md)

구글 번역을 사용하는 흐름 안에서 사전 보기를 이용할 때 **단어를 저장하고 학습/관리**할 수 있도록 돕는 크롬 확장 프로그램입니다. 사전 패널에서 제공하는 품사/뜻/영문 정의/유의어/예문과 번역 컨텍스트를 함께 저장하고, 사이드 패널에서 검색/필터/정렬/상세보기로 단어장을 관리합니다.

## 다운로드

- 크롬 다운로드: `미등록`
- 크롬 웹스토어: `미등록`
  - `https://chromewebstore.google.com/detail/google-translate-vocabulary-builder/coming-soon`

현재는 웹스토어가 없으므로 **압축해제된 확장 프로그램 로드(Load unpacked)** 방식으로 설치합니다.

## 라이선스

본 프로젝트는 **AGPL-3.0** 라이선스를 따릅니다.

- 요약: 사용/수정/배포가 가능하지만, 배포/배치되는 수정본은 라이선스 고지 유지 및 소스 공개 의무가 있습니다(AGPL 특성상 네트워크 상호작용 공개 의무 포함).
- 자세한 내용:
  - `LICENSE.ko.md`
  - `LICENSE_README.md`

## 사용 방법 (자세히)

### 1) 설치 (개발/언팩)

1. 크롬에서 `chrome://extensions` 접속
2. 우측 상단 **개발자 모드** ON
3. **압축해제된 확장 프로그램을 로드합니다(Load unpacked)** 클릭
4. `manifest.json`이 있는 프로젝트 루트 폴더 선택
5. 확장 프로그램 목록에서 **Google Translate Vocabulary Builder**가 보이는지 확인

### 2) 구글 번역에서 단어 저장하기

1. 구글 번역 접속 (영어 -> 한국어의 경우):
   - `https://translate.google.com/?sl=en&tl=ko&op=translate`
2. 단어 입력 (예: `hello`, `use`, `run`) 후 사전 패널이 뜰 때까지 잠시 대기
3. 페이지에 주입된 버튼 **Save to Vocabulary** 클릭
4. 이미 저장된 단어면 버튼이 **Saved**로 표시됩니다.

저장되는 정보(요약):
- `word`, `pronunciation`
- `definitions[]` (품사별 그룹)
- 각 meaning: 한국어 뜻, 영문 정의, 유의어, 예문(있을 경우)
- 컨텍스트: 원문/번역문, 언어쌍, 현재 URL

### 3) 사이드 패널(단어장) 열기

1. `translate.google.com` 상태에서 크롬 사이드 패널을 엽니다.
2. 상단 드롭다운에서 **Google Translate Vocabulary Builder** 선택
3. 탭 구성:
   - 통계: 기본 카운터(Phase 1)
   - 단어장: 카드 리스트/검색/필터/정렬/상세보기
   - 테스트: 이후 단계에서 확장 예정

### 4) 검색/필터/정렬

- 검색:
  - 영어 단어(word) 및 한국어 뜻(meaning) 기반 검색
  - 입력 디바운스(300ms)로 빠르게 동작
- 필터:
  - 언어쌍 필터 (예: `en -> ko`)
  - 품사 필터는 멀티 선택 지원
- 정렬:
  - 최신순/오래된순/가나다순/복습 필요 순(향후 학습 데이터 기반)

### 5) 상세 보기, 메모/태그, 삭제

1. 단어 카드 클릭 -> 상세 보기 진입
2. 메모(`userNote`) 저장
3. 태그(`tags[]`) 추가/삭제
4. 삭제 버튼으로 단어 삭제(확인 절차 포함)

### 6) 문제 해결(트러블슈팅)

- 저장 버튼이 안 보일 때:
  - `chrome://extensions`에서 확장 프로그램 새로고침
  - 구글 번역 페이지 새로고침
  - 사전 패널이 동적으로 렌더링되므로 잠시 대기 필요
- Saved 상태가 갱신되지 않을 때:
  - `chrome.storage.local`을 사용하므로 권한/확장 프로그램 상태 확인
  - DevTools Console에서 `[VocabBuilder]` 로그 확인
- 사전 정보가 제대로 안 잡힐 때:
  - 구글 번역 DOM 구조가 바뀔 수 있습니다.
  - 셀렉터는 `lib/html_parsing_mapping_table.json`에서 관리합니다.
  - 파싱 기준 문서: `refs/10 HTML 파싱 체크리스트.md`

## 프로젝트 관리 방식

이 저장소는 문서 기반으로 가볍게 관리합니다.

- 제품/스프린트 관리:
  - `product_backlog.md`에서 백로그를 만들고 스프린트 단위로 체크리스트를 관리합니다.
- 이슈 관리:
  - `issue_log.md`에 재현, 원인 분석, 수정 내용, 검증 체크리스트를 남깁니다.
- 레퍼런스 문서:
  - `refs/`에 기획/설계/스펙 문서를 유지하고 코드 변경과 정합성을 맞춥니다.
- 수동 테스트 가이드:
  - `test_guides/`에 단계별 수동 테스트 체크리스트를 유지합니다.

## 디렉토리 구조 (요약)

- `manifest.json`: 확장 프로그램 엔트리/권한 (Manifest V3)
- `content/`: translate.google.com에서 DOM 관찰/파싱 + 저장 버튼 주입
- `background/`: 서비스 워커(설치/업데이트/향후 백그라운드 기능)
- `sidepanel/`: 단어장 UI(검색/필터/정렬/상세보기)
- `popup/`: 툴바 팝업 UI(요약/바로가기)
- `lib/`: 공용 로직(스토리지 래퍼, 상수, 파싱 셀렉터 매핑)
- `assets/`: 아이콘 등 정적 자산
- `refs/`: 기획/설계/데이터 구조/파싱 체크리스트 등 문서
- `test_guides/`: 수동 테스트 가이드 및 결과 메모

## 프로그램 작동 로직 (간단)

1. `content/content-script.js`가 현재 활성 사전 카드(root)를 잡고 DOM을 관찰합니다.
2. `lib/html_parsing_mapping_table.json`의 셀렉터로 단어 정보를 파싱합니다.
3. Save 버튼을 주입하고 `chrome.storage.local`에 데이터를 저장합니다.
4. `sidepanel/app.js`가 저장된 단어를 읽어 UI로 제공합니다.

## 프라이버시

- 핵심 기능은 브라우저 로컬(`chrome.storage.local`)에 저장됩니다.
- 외부 서버 전송 없이 동작하도록 설계되어 있습니다.
- 내보내기/온라인 연동 기능(향후)은 사용자 주도 동작을 원칙으로 합니다.

## 비공식 프로젝트 고지

본 프로젝트는 Google과 무관합니다. "Google Translate"는 Google의 상표입니다.

