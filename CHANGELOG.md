# Changelog

All notable changes to this fork are documented here.

## [3.0.10] - 2026-10-06

### Added

- **MyMemory** translation service (free, no API key) as an extra fallback when Bing/Google are unavailable.

### Fixed

- **Bing Translate / Bing Dictionary**: long input is now split into ~1000-character chunks and the results are joined (the Bing web endpoint rejects longer text with `{"statusCode":400}`).
- **Google Translate**: when `translate.google.com` is rate-limited (HTTP 429, "automated queries"), the service now falls back to a working Google endpoint instead of failing.
- **Ollama**: `think: false` is sent so local models translate directly without emitting reasoning text ([#1178](https://github.com/pot-app/pot-desktop/pull/1178)).

## [3.0.9] - 2026-10-05

### Fixed

- **Bing Translate**: the old token endpoint `https://edge.microsoft.com/translate/auth` was retired (HTTP 404). It now uses `https://www.bing.com/ttranslatev3` with the page token from `params_AbusePreventionHelper`.
- **Bing Dictionary**: the old API `https://www.bing.com/api/v6/dictionarywords/search` was disabled (HTTP 403). It now uses `https://www.bing.com/tlookupv3`.
    - Single word -> dictionary card (part of speech + meanings + related words)
    - Sentence / not found -> falls back to normal translation

### Changed (selected upstream fixes)

- Window size & position use `LogicalSize` / `LogicalPosition` (correct on multi-monitor / high-DPI) [#1072](https://github.com/pot-app/pot-desktop/pull/1072)
- More robust global hotkey registration with clear conflict errors [#1292](https://github.com/pot-app/pot-desktop/pull/1292)
- Better language detection during IME composition (Chinese input) [#1230](https://github.com/pot-app/pot-desktop/pull/1230)
- OpenAI non-streaming request fix [#1000](https://github.com/pot-app/pot-desktop/pull/1000)
- Audio playback fix on some platforms [#967](https://github.com/pot-app/pot-desktop/pull/967)

## [3.0.8] - 2026-10-05

### Fixed

- Built-in Bing translation / dictionary services (details above).

### Changed

- Replaced the upstream packaging workflow (which requires private signing secrets) with a Windows NSIS build workflow.
- Updater endpoints point to this repository.

## [3.0.7] - 2025-05-10 (upstream)

### New feature

- signed macOS app

### Bugs fixed

- fix screenshot on macOS
- rm tray click event on macOS
