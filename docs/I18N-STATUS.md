# Internationalization status

## Languages
- zh-CN — Simplified Chinese
- en-US — English
- ja-JP — Japanese
- ko-KR — Korean
- fr-FR — French
- Automatic — follows Zotero's locale when it can be normalized to one of the supported languages; otherwise falls back to English.

## Runtime
The extension loads a bundled, offline JSON dictionary. It does not call a translation service at runtime. Language choice is stored in the existing TAIS preference namespace. The settings UI translates exact strings and known source fragments so composed status messages can also be localized.

## Coverage
See locale-coverage.json for a per-language audit against extracted source strings. All extracted strings have entries in all five dictionaries. The 326 previously missing source strings were machine-translated to complete the draft dictionaries. This is not native-speaker review. Before claiming a fully reviewed international release, review terminology, grammar, punctuation, date/number formats, accessibility labels, error messages, and dynamic messages with native speakers.

## Known limits
Zotero's own menus and third-party plugins remain in their own languages. TAIS Appearance localizes its own interface, bundled guides, and promotional pages. The current native material adapter is Windows-only; localization does not imply macOS/Linux compatibility.
