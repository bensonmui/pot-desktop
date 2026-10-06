# Changelog / 更新紀錄

本 fork 的變更，中英雙語。
Notable changes in this fork, in Chinese and English.

## [3.0.13] - 2026-10-06

### Added / 新增

- **Papago** 翻譯服務（Naver OpenAPI，需免費 key）。 / **Papago** translation service (Naver OpenAPI, free key).
- **自訂 HTTP 標頭**：OpenAI 相容服務可加自訂標頭，解鎖需特殊標頭的端點。 / **Custom HTTP headers** for OpenAI-compatible services.
- **IPA 音標**：Bing 詞典對英文單詞補上國際音標。 / **IPA phonetics** for the Bing dictionary (English words).
- **Markdown 渲染**（可選）：翻譯結果以 Markdown 顯示。 / **Optional Markdown rendering** of results.
- **剪貼簿監聽**開關加入設定頁（原本只在系統匣）。 / **Clipboard monitor toggle** in Settings.

### Changed / 調整

- **翻譯快取**：相同文字 5 分鐘內直接回上次結果（更快、省額度）。 / **Translation cache**: repeated text within 5 minutes returns the cached result (faster, saves quota).

## [3.0.12] - 2026-10-06

### Changed / 調整

- **PDF / OCR 文字清理強化** — 翻譯前清理 PDF 複製或 OCR 的文字時，會自動去除跨行連字號、合併段落內換行，並保留空行分段（不再把整段壓成一行）。
  **Better PDF / OCR text cleaning** — before translating, copied PDF or OCR text is de-hyphenated across line breaks, single line breaks inside a paragraph are joined, and blank-line paragraph breaks are preserved (instead of flattening everything to one line).
- **增量貼上以空行分段接合** — `incremental_translate` 收集文字時改用空行分隔，較易閱讀。
  **Incremental paste joins with a blank line** — `incremental_translate` now separates collected pieces with a blank line.

> 註：**靜默 OCR**（OCR → 自動複製 + 隱藏視窗）與**增量**（`incremental_translate`）本已存在；本次只是強化文字清理。
> Note: **Silent OCR** (auto copy + hidden window) and **incremental** already existed; this release only improves text cleaning.

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
