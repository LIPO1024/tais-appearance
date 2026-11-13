# Contributing

1. Read LICENSE, NOTICE, and docs/THIRD_PARTY_NOTICES.md.
2. Do not remove upstream Mica notices or the corresponding source.
3. Do not modify PDF.js glyph/canvas/textLayer behavior without dedicated pixel and selection regression tests.
4. Add tests for every new preference, migration, and asynchronous operation.
5. Keep all strings in the localization source inventory and update all five locales.
6. Never add secrets, payment credentials, personal Zotero databases, PDFs, or unredacted screenshots.
7. Run python build.py and all tests before opening a pull request.
