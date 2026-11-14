# TAIS Appearance 2.4.1 patch QA

## Change scope
This patch is based on the public 2.4.0 Stable mainline. It corrects the extension preference branch used by the locale selector and one Korean navigation translation. It does not change PDF rendering, native material adapters, the 12 theme presets, profiles, or the free/open-source policy.

## Automated verification
- 8/8 localization tests passed, including extension-pref branch, automatic locale, invalid persisted locale fallback, five-language coverage and Korean navigation.
- 25 core transaction tests passed.
- 12 paper/contrast calculation tests passed.
- 10 dark policy/native bridge groups passed.
- 11 appearance contract groups passed.
- 13 UI/static/inspection groups passed.
- 10 additional reliability groups passed.
- 10 brand/invariant groups passed.
- 6 showcase checks passed.
- 9 reader-safety invariants passed.
- JavaScript syntax, CSS parsing, XHTML parsing, reproducible XPI build and ZIP integrity passed.

## Real Zotero host verification
Environment: Windows 11 / Zotero 10.0.8 / PDF.js 5.7.0.
- Upgrade from locally installed 2.3.3 to 2.4.1 succeeded.
- Plugin active; no pending recovery transaction; Safe Mode off.
- Appearance settings, saved profiles, Zotero global font size, local background metadata and language preference preserved.
- Five languages switched in the actual preferences window: zh-CN, en-US, ja-JP, ko-KR, fr-FR.
- Product name remains exactly TAIS Appearance in every locale.
- After the test, language preference returned to Automatic and appearance/profile/font/background state matched the pre-test snapshot.

## Not claimed
- Native-speaker review of all 561 strings per locale is not complete.
- Full DPI/multi-monitor matrix, 8-hour soak, all third-party plugin combinations, macOS/Linux native materials and physical printer matrix are not newly certified by this patch.
- 2.4.1 is a patch candidate on mainline; do not publish a new Stable release until GitHub CI and release approval pass.
