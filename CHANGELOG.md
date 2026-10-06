# Changelog / 更新紀錄

本 fork 的變更，中英雙語。
Notable changes in this fork, in Chinese and English.

## [3.0.11] - 2026-10-06

### Added / 新增

- **Auto（自動回退）翻譯服務** — 依序嘗試 Google → Bing → MyMemory，第一個成功者即回傳，單一服務掛掉不會整排失敗。
  **Auto (fallback) translation service** — tries Google → Bing → MyMemory in order and returns the first success, so one broken service no longer fails every card.
- **OpenAI 相容服務的模型下拉選單** — 自動讀取 `/v1/models` 讓使用者直接點選。
  **Model picker for OpenAI-compatible services** — fetches `/v1/models` so a model can be picked instead of typed.
- **自動更新（Windows x64）** — App 可從本 repo 的更新來源自動更新。
  **Auto-update (Windows x64)** — the app can update itself from this repository's release manifest.
- **更多建置目標** — Windows x86 / arm64、macOS（arm64 / x64）、Linux（deb / AppImage）。
  **More build targets** — Windows x86 / arm64, macOS (arm64 / x64), Linux (deb / AppImage).

### Fixed / 修正

- **Google 翻譯** — 主端點被限流（HTTP 429）時自動改用可用端點；長文改為自動分段。
  **Google Translate** — falls back to a working endpoint when `translate.google.com` is rate-limited (HTTP 429); long text is now split into chunks.

## [3.0.10] - 2026-10-06

### Added / 新增

- **MyMemory 翻譯服務**（免費、免 API Key）。
  **MyMemory translation service** (free, no API key).

### Fixed / 修正

- **Bing 翻譯 / Bing 詞典** — 長文自動切成約 1000 字分段再合併（Bing 網頁端點過長會回 `statusCode 400`）。
  **Bing Translate / Bing Dictionary** — long input is split into ~1000-character chunks (the web endpoint rejects longer text with `statusCode 400`).
- **Google 翻譯** — 被 429 限流時自動回退到可用端點。
  **Google Translate** — falls back to a working endpoint when rate-limited (429).
- **Ollama** — 送出 `think: false`，本地模型直接翻譯。
  **Ollama** — sends `think: false` so local models translate directly.

## [3.0.9] - 2026-10-06

### Fixed / 修正

- **Bing 翻譯 / Bing 詞典** — 改用 `bing.com` 網頁端點（舊端點已下線 / 停用）。
  **Bing Translate / Bing Dictionary** — switched to `bing.com` web endpoints (the old endpoints were retired / disabled).

### Changed / 調整

- 精選上游未合併修正：視窗尺寸/位置（LogicalSize）、熱鍵註冊強化、中文輸入法語言偵測、OpenAI 非串流、音效播放。
  Selected unmerged upstream fixes: window size/position (LogicalSize), robust hotkey registration, IME language detection, OpenAI non-streaming, audio playback.

## [3.0.8] - 2026-10-06

### Changed / 調整

- 由本 repo 自己的 GitHub Actions 建置（Windows NSIS）；更新來源指向本 repo。
  Built with this repo's own GitHub Actions workflow (Windows NSIS); updater endpoints point to this repo.
- 版本與文件的變更紀錄。
  Version and documentation.

## [3.0.7] - 2025-05-10 (upstream)

- signed macOS app
- fix screenshot on macOS
- rm tray click event on macOS
