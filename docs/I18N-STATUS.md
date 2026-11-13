# Internationalization status

## Supported languages

- zh-CN — Simplified Chinese
- en-US — English
- ja-JP — Japanese
- ko-KR — Korean
- fr-FR — French
- Automatic — follows Zotero's locale when it can be normalized to a supported language; otherwise falls back to English.

## Runtime

The extension loads bundled, offline JSON dictionaries. It does not call a translation service at runtime. Language choice is stored in the existing TAIS preference namespace. The settings UI localizes exact strings and known source fragments, including composed status messages.

## Automated coverage

See `locale-coverage.json` for the per-language audit against extracted source strings. All extracted strings have entries in all five dictionaries. The 326 previously missing source strings were machine-translated to complete the draft dictionaries.

**Automated coverage is not native-speaker review.** Terminology, grammar, punctuation, date and number formats, accessibility labels, error messages, and dynamic messages still need review by native speakers familiar with Zotero and academic software.

Community translation contributions are welcome through GitHub Issues and Pull Requests. Please include the locale, source string, proposed translation, and context.

## Known limits

Zotero's own menus and third-party plugins remain in their own languages. TAIS Appearance localizes its own interface, bundled guides, and promotional pages. The current native material adapter is Windows-only; localization does not imply macOS/Linux compatibility.

## Project policy

TAIS Appearance is free and open source. There are no paid language packs, translation unlocks, or feature restrictions by locale.
