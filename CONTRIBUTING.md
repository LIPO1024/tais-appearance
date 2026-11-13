# Contributing to TAIS Appearance

Thank you for helping improve TAIS Appearance. The maintainers provide the project free of charge. No payment, sponsorship, or paid membership is required to contribute.

## Before opening an issue or pull request

1. Read [LICENSE](LICENSE), [NOTICE](NOTICE), and [third-party notices](docs/THIRD_PARTY_NOTICES.md).
2. Preserve upstream Mica for Zotero copyright notices, license terms, and corresponding source.
3. Do not change PDF.js glyph, canvas, text-layer, native selection, or annotation behavior without dedicated pixel and interaction regression tests.
4. Add tests for every new preference, migration, and asynchronous operation.
5. Keep all user-facing strings in the localization source inventory and update all five locales.
6. Never add secrets, payment credentials, personal Zotero databases, private PDFs, or unredacted screenshots.
7. Run `python build.py` and the relevant test suites before opening a pull request.

## Useful contributions

- Reproducible bug reports and regression test cases.
- Windows/Zotero version and DPI compatibility testing.
- Native-speaker review of Simplified Chinese, English, Japanese, Korean, and French.
- Improvements to installation instructions, accessibility, recovery, and privacy documentation.
- Code review and focused pull requests.

## Bug reports

Include the TAIS Appearance version, Zotero version, Windows version, reproduction steps, expected behavior, actual behavior, and a redacted diagnostic report. Confirm whether the issue also occurs in Safe Mode when investigating plugin conflicts.

Do not attach a Zotero database, private documents, access tokens, or unredacted local paths.

## Pull requests

Keep changes focused, explain the user-facing impact, list tests run, and disclose any compatibility or license implications. Do not claim support for platforms or Zotero versions that have not been tested.
