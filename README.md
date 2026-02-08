# Google Translate Vocabulary Builder

[한국어 README](./README.ko.md)

A Chrome extension that helps you **save and review vocabulary while using Google Translate**. It captures dictionary information (part of speech, meanings, English definition, synonyms, example sentence) and the translation context, then stores everything locally so you can search, filter, and manage your own vocabulary list.

## Download

- Chrome download: `https://www.google.com/chrome/`
- Chrome Web Store: (placeholder, not published yet)
  - `https://chromewebstore.google.com/detail/google-translate-vocabulary-builder/coming-soon`

For now, install via **Load unpacked** (see below).

## License

This project is licensed under **AGPL-3.0**.

- Summary: You can use/modify/distribute, but you must keep license notices and provide source code for distributed/deployed modifications (including network use obligations under AGPL).
- Details:
  - `LICENSE.ko.md`
  - `LICENSE_README.md`

## How To Use (Detailed)

### 1) Install (development/unpacked)

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the project root folder (the folder that contains `manifest.json`).
5. Confirm the extension appears as **Google Translate Vocabulary Builder**.

### 2) Save a word from Google Translate

1. Go to Google Translate (English -> Korean recommended):
   - `https://translate.google.com/?sl=en&tl=ko&op=translate`
2. Enter a word (e.g., `hello`, `use`, `run`) and wait until the dictionary panel is rendered.
3. Click the injected button **Save to Vocabulary**.
4. If the word is already saved, the button shows **Saved**.

What gets saved (high level):
- `word`, `pronunciation`
- `definitions[]` grouped by part of speech
- Each meaning: Korean meaning, English definition, synonyms, example (if available)
- Context: source text, translated text, language pair, current URL

### 3) Open the Side Panel (your vocabulary list)

1. While you are on `translate.google.com`, open Chrome Side Panel.
2. Select **Google Translate Vocabulary Builder**.
3. Use tabs:
   - Stats: simple counters (Phase 1 baseline)
   - Words: your vocabulary list
   - Test: placeholder for later phases

### 4) Search, filter, and sort

- Search:
  - Matches by word text (English) and by Korean meanings.
  - Debounced search (fast even with many words).
- Filter:
  - Language pair filter (e.g., `en -> ko`)
  - Part-of-speech filter supports multi-select.
- Sort:
  - Newest / Oldest / Alphabetical / Review-needed (future-driven)

### 5) View details, add notes/tags, delete

1. Click a word card to open the detail view.
2. Edit and save:
   - Note (`userNote`)
   - Tags (`tags[]`)
3. Delete a word from the detail view (with confirmation).

### 6) Troubleshooting

- Save button does not show:
  - Reload the extension in `chrome://extensions`.
  - Refresh the Google Translate page.
  - Wait a moment: the dictionary panel is rendered dynamically.
- Saved state does not update:
  - The extension uses `chrome.storage.local`; ensure the Storage permission is granted.
  - Open DevTools Console to check `[VocabBuilder]` logs.
- Dictionary info not captured:
  - Google Translate DOM can change. Update selectors in `lib/html_parsing_mapping_table.json`.
  - See the parsing checklist: `refs/10 HTML 파싱 체크리스트.md`.

## Project Management (How We Work)

This repository is managed with lightweight documents (no heavy tooling required).

- Product planning:
  - `product_backlog.md` defines backlog items and sprint checklists.
  - Work is executed sprint-by-sprint with clear acceptance criteria.
- Issue tracking:
  - `issue_log.md` records investigation, root cause, reproduction steps, and verification checklist for parsing/UI issues.
- References:
  - `refs/` contains planning/design/spec documents that should stay aligned with the code.
- Manual test guides:
  - `test_guides/` contains staged checklists for validating behavior in Chrome.

## Directory Structure (Quick Map)

- `manifest.json`: Chrome Extension entrypoints and permissions (Manifest V3).
- `content/`: content script that runs on `translate.google.com` and injects the Save button.
- `background/`: service worker for extension lifecycle and future background features.
- `sidepanel/`: main UI for vocabulary list, search/filter/sort, detail view.
- `popup/`: toolbar popup UI (quick overview).
- `lib/`: shared logic (storage wrapper, constants, selector mapping).
- `assets/`: icons.
- `refs/`: project docs (specs, data model, parsing checklist).
- `test_guides/`: manual test scenarios and results notes.

## How It Works (Program Logic)

1. `content/content-script.js` observes the Google Translate page and determines the current active dictionary card.
2. It parses the DOM using selectors from `lib/html_parsing_mapping_table.json`.
3. It injects a Save button and stores captured data to `chrome.storage.local`.
4. `sidepanel/app.js` reads stored words and provides UI for managing and reviewing them.

## Privacy

- The extension stores data in your browser (`chrome.storage.local`).
- No external server is required for core features.
- Export/online sync features (planned) should be user-initiated only.

## Not Affiliated

This project is not affiliated with Google. "Google Translate" is a trademark of Google.

