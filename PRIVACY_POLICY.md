# Privacy Policy / 개인정보 처리방침

**Google Translate Vocabulary Builder (구글 번역 단어장)**

Last updated / 최종 수정일: 2026-02-16

---

## English

### 1. Introduction

Google Translate Vocabulary Builder ("the Extension") is a Chrome browser extension that helps users save and manage vocabulary from Google Translate's dictionary panel. This Privacy Policy explains how the Extension handles user data.

### 2. Data Collection

The Extension collects and stores the following types of data **locally in your browser**:

#### 2-1. Vocabulary Data (User Activity)
When you click the "Save to Vocabulary" button, the Extension captures:
- **Word text** and pronunciation
- **Dictionary information**: part-of-speech, meanings, English definitions, synonyms, example sentences
- **Translation context**: source text, translated text, source/target language pair, page URL
- **Timestamps**: when the word was saved and last modified

#### 2-2. User-Created Content
- Personal **notes** you write for each word
- **Tags** you assign to words for organization

#### 2-3. User Preferences
- UI theme preference (light/dark)
- Language setting
- Daily learning goals
- Test configuration

#### 2-4. Website Content
- Dictionary panel content from Google Translate (`translate.google.com`) is parsed to extract word information
- This content is only read from Google Translate and is not collected from any other website

### 3. Data Storage

- **All data is stored locally** in your browser using Chrome's `chrome.storage.local` and `chrome.storage.sync` APIs.
- `chrome.storage.local`: Vocabulary words, metadata, statistics, and search index
- `chrome.storage.sync`: User preferences/settings (synced across your Chrome devices via your Google account)
- **No data is transmitted to any external server** operated by the Extension developer or any third party.

### 4. Data Usage

Your data is used exclusively for:
- Displaying your saved vocabulary in the side panel and popup
- Enabling search, filter, and sort functionality
- Showing learning statistics
- Persisting your preferences across sessions

### 5. Data Sharing

- **We do not sell** your data to any third party.
- **We do not transfer** your data to any external server.
- **We do not use** your data for advertising, analytics, or any purpose unrelated to the Extension's core vocabulary management functionality.
- **We do not use** your data to determine creditworthiness or for lending purposes.

### 6. Data Retention and Deletion

- Data persists in your browser as long as the Extension is installed.
- You can delete individual words through the Extension's side panel interface.
- Uninstalling the Extension will remove all locally stored data.
- You can manually clear all Extension data via Chrome Settings → Extensions → Google Translate Vocabulary Builder → Details → Clear data.

### 7. Permissions

The Extension requires the following permissions:

| Permission | Purpose |
|-----------|---------|
| `storage` | Save vocabulary data locally and sync user preferences |
| `activeTab` | Interact with the current Google Translate tab when the user clicks the Extension icon |
| `sidePanel` | Display the vocabulary manager in Chrome's side panel |
| `https://translate.google.com/*` | Run the content script on Google Translate to parse dictionary data and inject the save button |

### 8. Third-Party Services

The Extension does not use any third-party services, APIs, or analytics tools. All functionality is self-contained within the browser.

### 9. Children's Privacy

The Extension does not knowingly collect personal information from children under the age of 13. The Extension does not collect any personally identifiable information from any user.

### 10. Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected in the "Last updated" date at the top of this document. Continued use of the Extension after changes constitutes acceptance of the updated policy.

### 11. Contact

If you have questions or concerns about this Privacy Policy, please contact us via:
- GitHub Issues: [https://github.com/ggapsang/Google-Translate-Vocabulary-Builder/issues](https://github.com/ggapsang/Google-Translate-Vocabulary-Builder/issues)

### 12. Open Source

This Extension is open source under the AGPL-3.0 license. You can review the complete source code at:
- [https://github.com/ggapsang/Google-Translate-Vocabulary-Builder](https://github.com/ggapsang/Google-Translate-Vocabulary-Builder)

---

## 한국어

### 1. 소개

구글 번역 단어장("본 확장 프로그램")은 구글 번역의 사전 패널에서 단어를 저장하고 관리할 수 있도록 돕는 크롬 브라우저 확장 프로그램입니다. 본 개인정보 처리방침은 확장 프로그램이 사용자 데이터를 어떻게 처리하는지 설명합니다.

### 2. 수집하는 데이터

본 확장 프로그램은 다음 데이터를 **브라우저 로컬에만** 수집 및 저장합니다:

#### 2-1. 단어장 데이터 (사용자 활동)
"Save to Vocabulary" 버튼을 클릭하면 다음 정보가 수집됩니다:
- **단어 텍스트** 및 발음
- **사전 정보**: 품사, 뜻, 영문 정의, 유의어, 예문
- **번역 컨텍스트**: 원문, 번역문, 언어쌍, 페이지 URL
- **타임스탬프**: 저장 시각, 최종 수정 시각

#### 2-2. 사용자 작성 콘텐츠
- 각 단어에 대한 개인 **메모**
- 정리를 위해 단어에 부여하는 **태그**

#### 2-3. 사용자 환경설정
- UI 테마 (라이트/다크)
- 언어 설정
- 일일 학습 목표
- 테스트 설정

#### 2-4. 웹사이트 콘텐츠
- 구글 번역(`translate.google.com`)의 사전 패널 콘텐츠를 파싱하여 단어 정보를 추출합니다
- 구글 번역 외 다른 웹사이트의 콘텐츠는 수집하지 않습니다

### 3. 데이터 저장

- **모든 데이터는 브라우저 로컬에 저장됩니다.** Chrome의 `chrome.storage.local` 및 `chrome.storage.sync` API를 사용합니다.
- `chrome.storage.local`: 단어장 단어, 메타데이터, 통계, 검색 인덱스
- `chrome.storage.sync`: 사용자 환경설정 (Google 계정을 통해 Chrome 기기 간 동기화)
- **확장 프로그램 개발자 또는 제3자가 운영하는 외부 서버로 데이터를 전송하지 않습니다.**

### 4. 데이터 사용 목적

수집된 데이터는 다음 목적으로만 사용됩니다:
- 사이드 패널 및 팝업에서 저장된 단어를 표시
- 검색, 필터, 정렬 기능 제공
- 학습 통계 표시
- 세션 간 환경설정 유지

### 5. 데이터 공유

- 사용자 데이터를 제3자에게 **판매하지 않습니다.**
- 사용자 데이터를 외부 서버로 **전송하지 않습니다.**
- 광고, 분석 또는 핵심 단어장 관리 기능과 무관한 목적으로 데이터를 **사용하지 않습니다.**
- 신용 평가 또는 대출 목적으로 데이터를 **사용하지 않습니다.**

### 6. 데이터 보존 및 삭제

- 확장 프로그램이 설치된 동안 데이터가 브라우저에 유지됩니다.
- 사이드 패널 인터페이스에서 개별 단어를 삭제할 수 있습니다.
- 확장 프로그램을 제거하면 로컬에 저장된 모든 데이터가 삭제됩니다.
- Chrome 설정 → 확장 프로그램 → 구글 번역 단어장 → 세부정보 → 데이터 삭제를 통해 수동으로 모든 데이터를 삭제할 수 있습니다.

### 7. 권한

본 확장 프로그램은 다음 권한을 필요로 합니다:

| 권한 | 용도 |
|------|------|
| `storage` | 단어장 데이터를 로컬에 저장하고 사용자 환경설정을 동기화 |
| `activeTab` | 사용자가 확장 프로그램 아이콘을 클릭할 때 현재 구글 번역 탭과 상호작용 |
| `sidePanel` | 크롬 사이드 패널에 단어장 관리 인터페이스 표시 |
| `https://translate.google.com/*` | 구글 번역에서 사전 데이터를 파싱하고 저장 버튼을 주입하기 위한 콘텐츠 스크립트 실행 |

### 8. 제3자 서비스

본 확장 프로그램은 제3자 서비스, API, 분석 도구를 사용하지 않습니다. 모든 기능은 브라우저 내에서 자체적으로 완결됩니다.

### 9. 아동 개인정보 보호

본 확장 프로그램은 13세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다. 또한 어떤 사용자로부터도 개인식별정보를 수집하지 않습니다.

### 10. 정책 변경

본 개인정보 처리방침은 수시로 업데이트될 수 있습니다. 변경 사항은 문서 상단의 "최종 수정일"에 반영됩니다. 변경 후 확장 프로그램을 계속 사용하면 업데이트된 정책에 동의하는 것으로 간주됩니다.

### 11. 문의

본 개인정보 처리방침에 대해 궁금한 점이 있으시면 다음을 통해 문의해 주세요:
- GitHub Issues: [https://github.com/ggapsang/Google-Translate-Vocabulary-Builder/issues](https://github.com/ggapsang/Google-Translate-Vocabulary-Builder/issues)

### 12. 오픈소스

본 확장 프로그램은 AGPL-3.0 라이선스에 따라 오픈소스로 공개되어 있습니다. 전체 소스 코드는 다음에서 확인할 수 있습니다:
- [https://github.com/ggapsang/Google-Translate-Vocabulary-Builder](https://github.com/ggapsang/Google-Translate-Vocabulary-Builder)
