# Changelog / 更新紀錄

本 fork 的變更。每個版本**先列中文、再列英文**（不逐句交錯）。
Changes in this fork. Each version lists **Chinese first, then English** (not interleaved).

## [3.0.23] - 2026-10-07

### 新增

- **服務健康監控**：服務設定新增「**全部測試**」按鈕，逐一測試所有翻譯服務；每個服務列會顯示**狀態小點**（綠＝可用、紅＝失敗），滑過顯示延遲／錯誤與結果預覽；並顯示「上次檢查」時間。
- **設定單檔匯出／匯入**：備份設定新增「**匯出設定**」「**匯入設定**」，可把整個 `config.json` 存成／讀回單一 JSON 檔（方便備份或換機）。
- **一鍵錯誤回報**：關於頁新增「**回報問題（匯出診斷）**」，把 App 版本／系統／語言與**日誌尾段**打包成一個 txt 檔（不含任何 API key）。

### Added

- **Service health check**: the Services settings gain a "**Test all**" button that tests every translation service in turn; each row shows a **status dot** (green = OK, red = failed) with latency/error and a result preview on hover, plus a "Last check" time.
- **Single-file settings export/import**: the Backup settings gain "**Export settings**" / "**Import settings**" to save/load the whole `config.json` as one JSON file (handy for backups or moving to another machine).
- **One-click error report**: the About page gains "**Report issue (export diagnostics)**", bundling the app version/OS/locale and a **log tail** into a single txt file (no API keys included).

## [3.0.22] - 2026-10-07

### 新增

- **強調色與圓角**：一般設定新增「**強調色**」（預設／藍／綠／紫／粉／橙／紅）與「**圓角**」（預設／小／中／大），即時套用到整個介面。
- **視窗透明度與縮放**：翻譯設定新增「**視窗透明度**」（100%～60%）與「**視窗縮放**」（80%～150%）。
- **貼齊螢幕邊緣**：翻譯設定新增開關；拖動視窗靠近螢幕邊緣、放開停頓後自動吸附。

### Added

- **Accent color & corner radius**: General settings gain an "**Accent color**" (default/blue/green/purple/pink/orange/red) and "**Corner radius**" (default/small/medium/large), applied to the whole UI instantly.
- **Window opacity & zoom**: Translate settings gain "**Window opacity**" (100%–60%) and "**Window zoom**" (80%–150%).
- **Snap to screen edges**: a toggle in Translate settings; the window snaps flush to a screen edge when you release it near one.

## [3.0.21] - 2026-10-06

### 修正

- **翻譯視窗無法拖動**：修正 3.0.19 科技感改版時，標題列被 `z-index` 蓋住 `data-tauri-drag-region`，導致翻譯視窗拖不動的問題（未釘選也無法移動）。
- **結果空白空窗**：結果的「交叉淡入」改為 keyed `motion.div` 淡入（移除 `AnimatePresence mode='wait'`），避免切換服務／語言時出現內容空窗。

### Fixed

- **Window cannot be dragged**: fixed a regression from the 3.0.19 tech-look update where the title bar's `z-index` covered the `data-tauri-drag-region`, making the translate window undraggable (even when not pinned).
- **Blank result gap**: the result cross-fade now uses a keyed `motion.div` fade instead of `AnimatePresence mode='wait'`, avoiding a blank gap when switching service/language.

## [3.0.20] - 2026-10-06

### 修正

- **缺漏的翻譯文字**：補上 `config.hotkey.failed`（快捷鍵註冊失敗提示，zh_CN / zh_TW）與 `services.translate.ecdict.title`（zh_TW），避免介面顯示原始 key。

### 調整

- **清理**：移除 `SourceArea` 未使用的 import；`.gitignore` 加入 `.env`、`.env.*`、`*.key`、`*.pem`、`*.p12`（避免誤 commit 金鑰）。

### Fixed

- **Missing translations**: added `config.hotkey.failed` (hotkey registration failure message, zh_CN / zh_TW) and `services.translate.ecdict.title` (zh_TW) so raw keys are no longer shown.

### Changed

- **Cleanup**: removed unused imports in `SourceArea`; `.gitignore` now ignores `.env`, `.env.*`, `*.key`, `*.pem`, `*.p12` (prevents accidental key commits).

## [3.0.19] - 2026-10-06

### 調整

- **科技感視覺**：卡片與語言列改為**毛玻璃**（半透明 + backdrop-blur）、hover 有**微光邊框**、卡片內有**滑鼠跟隨高光**、視窗加**漸層＋噪點背景**；動效改用**彈性 spring**、卡片**展開／收合**更流體，翻譯中加上 **shimmer** 流光。
- **外觀設定**：翻譯設定頁新增「**外觀**」區塊，可**個別開關**毛玻璃、微光邊框、滑鼠跟隨高光、漸層背景、介面動畫、載入流光（不喜歡科技感的使用者可全部關掉）。

### Changed

- **Tech-inspired look**: cards and the language bar now use **frosted glass** (translucent + backdrop-blur), a **glow border** on hover, a **cursor-following highlight** inside cards, and a **gradient + noise** window background; motion now uses **spring**, card **expand/collapse** is more fluid, and a **shimmer** line shows while translating.
- **Appearance settings**: the Translate settings page gains an "**Appearance**" section to **individually toggle** frosted glass, glow border, cursor highlight, gradient background, UI animations, and loading shimmer (users who dislike the effects can turn them all off).

## [3.0.18] - 2026-10-06

### 新增

- **介面動畫**（`framer-motion`）：翻譯卡**進場**（淡入＋上滑）、**結果切換交叉淡入**、**翻譯視窗開啟／關閉**動畫、**語言交換**圖示旋轉與標籤交叉淡入、**按鈕／圖示微互動**（hover 放大、點擊縮小）。

### Added

- **UI animations** (`framer-motion`): translation cards **fade/slide in**, results **cross-fade** when switching, the window **fades in/out**, the language-swap icon **rotates** with label cross-fade, and buttons/icons have **hover/tap micro-interactions**.

## [3.0.17] - 2026-10-06

### 新增

- **服務測試按鈕**：翻譯服務清單每個服務右側新增 **⚡** 測試鈕，按一下送測試句，顯示成功與延遲（或失敗原因），可快速看出哪個服務可用。
- **歷史記錄強化**：新增**搜尋框**（過濾原文／譯文）、**匯出 JSON**（檔案對話框），以及**單筆刪除**。
- **雙語並排**：翻譯設定新增「**原文與譯文並排**」開關，翻譯視窗改為**左欄原文／右欄翻譯卡**；語言列並改為**固定在頂端**（捲動時不消失）。
- **新增服務**：**LibreTranslate** 與 **DeepLX**（皆可自訂請求位址；DeepLX 可填存取權杖）。
- **TTS**：新增 **Google TTS**（免 API Key），修補朗讀功能——原本的 Lingva TTS 依賴已離線的公共實例。

### Added

- **Service test button**: each translation service now has a **⚡** test button that sends a test phrase and shows success + latency (or the failure), so you can quickly see which services work.
- **History improvements**: a **search box** (filters source/result), **export to JSON** (file dialog), and **delete a single entry**.
- **Side-by-side**: a new "**Side-by-side source & translation**" toggle in Translate settings lays the window out as **source (left) / results (right)**; the **language bar is now pinned to the top** while scrolling.
- **New services**: **LibreTranslate** and **DeepLX** (both with a configurable request path; DeepLX accepts an access token).
- **TTS**: added **Google TTS** (no API key), fixing read-aloud — the previous Lingva TTS relied on an offline public instance.

## [3.0.16] - 2026-10-06

### 新增

- **設定說明圖示**：翻譯設定頁在較不直觀的開關（**增量翻譯、動態翻譯、自動刪除換行、翻譯快取、渲染 Markdown**）左側新增 **ⓘ** 圖示，滑過去顯示作用說明（en / zh_CN / zh_TW）。

### Added

- **Setting info icons**: on the Translate settings page, the less obvious toggles (**incremental translate, dynamic translate, auto-remove line breaks, translation cache, Markdown rendering**) now have an **ⓘ** icon on their left; hover it for an explanation (en / zh_CN / zh_TW).

## [3.0.15] - 2026-10-06

### 新增

- **LaTeX 渲染**：開啟 Markdown 渲染時，`$...$` 與 `$$...$$` 公式會以 KaTeX 呈現（適合技術文件、論文）。
- **每張卡片記住翻譯服務**：在卡片標題的服務下拉切換後，該卡片的選擇會被記住，下次開啟仍保留。
- **Lingva 可設定實例**：Lingva 服務新增「請求位址」，可指向自架或可用的 Lingva 相容實例（官方公共實例已離線）。

### 修正

- **語言偵測延遲**：預設改用**本機（離線）偵測**；線上偵測引擎加上**逾時並回退**到本機／啟發式，避免慢或被封的端點（例如用 Google 偵測時被 429）拖延翻譯。先前截圖 OCR／截圖翻譯會因此約延遲 2 秒才開始翻譯。
- **介面中英混雜**：新增的設定與服務標籤（剪貼簿監聽、翻譯快取、Markdown、自訂標頭、Papago 欄位等）改為可翻譯（已加 en / zh_CN / zh_TW）。

### Added

- **LaTeX rendering**: with Markdown rendering on, `$...$` and `$$...$$` math is rendered with KaTeX (useful for technical docs and papers).
- **Per-card service memory**: after switching a card's service via its header dropdown, the choice is remembered across sessions.
- **Configurable Lingva instance**: the Lingva service gains a "Request Path" setting to point at a self-hosted or working instance (the public instance is offline).

### Fixed

- **Language detection delay**: default to **local (offline) detection**; remote engines now **time out and fall back** to local / heuristic, so a slow or blocked endpoint (e.g. Google returning 429) no longer delays translation. This previously added ~2s before screenshot OCR / translate started.
- **Mixed-language UI**: new settings and service labels (clipboard monitor, translation cache, Markdown, custom headers, Papago fields, …) are now translatable (en / zh_CN / zh_TW added).

## [3.0.13] - 2026-10-06

### 新增

- **Papago** 翻譯服務（Naver OpenAPI，需免費 key）。
- **自訂 HTTP 標頭**：OpenAI 相容服務可加自訂標頭，解鎖需特殊標頭的端點。
- **IPA 音標**：Bing 詞典對英文單詞補上國際音標。
- **Markdown 渲染**（可選）：翻譯結果以 Markdown 顯示。
- **剪貼簿監聽**開關加入設定頁（原本只在系統匣）。

### 調整

- **翻譯快取**：相同文字 5 分鐘內直接回上次結果（更快、省額度）。

### Added

- **Papago** translation service (Naver OpenAPI, free key).
- **Custom HTTP headers** for OpenAI-compatible services.
- **IPA phonetics** for the Bing dictionary (English words).
- **Optional Markdown rendering** of results.
- **Clipboard monitor toggle** in Settings.

### Changed

- **Translation cache**: repeated text within 5 minutes returns the cached result (faster, saves quota).

## [3.0.12] - 2026-10-06

### 調整

- **PDF / OCR 文字清理強化** — 翻譯前清理 PDF 複製或 OCR 的文字時，會自動去除跨行連字號、合併段落內換行，並保留空行分段（不再把整段壓成一行）。
- **增量貼上以空行分段接合** — `incremental_translate` 收集文字時改用空行分隔，較易閱讀。

### Changed

- **Better PDF / OCR text cleaning** — before translating, copied PDF or OCR text is de-hyphenated across line breaks, single line breaks inside a paragraph are joined, and blank-line paragraph breaks are preserved (instead of flattening everything to one line).
- **Incremental paste joins with a blank line** — `incremental_translate` now separates collected pieces with a blank line.

> 註：**靜默 OCR**（OCR → 自動複製 + 隱藏視窗）與**增量**（`incremental_translate`）本已存在；本次只是強化文字清理。
> Note: **Silent OCR** (auto copy + hidden window) and **incremental** already existed; this release only improves text cleaning.

## [3.0.11] - 2026-10-06

### 新增

- **Auto（自動回退）翻譯服務** — 依序嘗試 Google → Bing → MyMemory，第一個成功者即回傳，單一服務掛掉不會整排失敗。
- **OpenAI 相容服務的模型下拉選單** — 自動讀取 `/v1/models` 讓使用者直接點選。
- **自動更新（Windows x64）** — App 可從本 repo 的更新來源自動更新。
- **更多建置目標** — Windows x86 / arm64、macOS（arm64 / x64）、Linux（deb / AppImage）。

### 修正

- **Google 翻譯** — 主端點被限流（HTTP 429）時自動改用可用端點；長文改為自動分段。

### Added

- **Auto (fallback) translation service** — tries Google → Bing → MyMemory in order and returns the first success, so one broken service no longer fails every card.
- **Model picker for OpenAI-compatible services** — fetches `/v1/models` so a model can be picked instead of typed.
- **Auto-update (Windows x64)** — the app can update itself from this repository's release manifest.
- **More build targets** — Windows x86 / arm64, macOS (arm64 / x64), Linux (deb / AppImage).

### Fixed

- **Google Translate** — falls back to a working endpoint when `translate.google.com` is rate-limited (HTTP 429); long text is now split into chunks.

## [3.0.10] - 2026-10-06

### 新增

- **MyMemory 翻譯服務**（免費、免 API Key）。

### 修正

- **Bing 翻譯 / Bing 詞典** — 長文自動切成約 1000 字分段再合併（Bing 網頁端點過長會回 `statusCode 400`）。
- **Google 翻譯** — 被 429 限流時自動回退到可用端點。
- **Ollama** — 送出 `think: false`，本地模型直接翻譯。

### Added

- **MyMemory translation service** (free, no API key).

### Fixed

- **Bing Translate / Bing Dictionary** — long input is split into ~1000-character chunks (the web endpoint rejects longer text with `statusCode 400`).
- **Google Translate** — falls back to a working endpoint when rate-limited (429).
- **Ollama** — sends `think: false` so local models translate directly.

## [3.0.9] - 2026-10-06

### 修正

- **Bing 翻譯 / Bing 詞典** — 改用 `bing.com` 網頁端點（舊端點已下線 / 停用）。

### 調整

- 精選上游未合併修正：視窗尺寸/位置（LogicalSize）、熱鍵註冊強化、中文輸入法語言偵測、OpenAI 非串流、音效播放。

### Fixed

- **Bing Translate / Bing Dictionary** — switched to `bing.com` web endpoints (the old endpoints were retired / disabled).

### Changed

- Selected unmerged upstream fixes: window size/position (LogicalSize), robust hotkey registration, IME language detection, OpenAI non-streaming, audio playback.

## [3.0.8] - 2026-10-06

### 調整

- 由本 repo 自己的 GitHub Actions 建置（Windows NSIS）；更新來源指向本 repo。
- 版本與文件的變更紀錄。

### Changed

- Built with this repo's own GitHub Actions workflow (Windows NSIS); updater endpoints point to this repo.
- Version and documentation.

## [3.0.7] - 2025-05-10 (upstream)

- signed macOS app
- fix screenshot on macOS
- rm tray click event on macOS
