## Purpose
Describe the user problem and the smallest change that addresses it.

## Scope
- [ ] Appearance only; no PDF source data or annotation mutation
- [ ] No changes to native PDF.js glyph/canvas/text-layer behavior
- [ ] All five locale dictionaries and catalogs updated where strings changed
- [ ] Existing profiles and settings remain backward compatible
- [ ] Recovery / Safe Mode behavior considered

## Verification
- [ ] `python build.py`
- [ ] `node test-i18n.cjs`
- [ ] `node test-showcase.cjs`
- [ ] `node test-brand.cjs`
- [ ] `node test-release-metadata.cjs`
- [ ] Additional tests listed below

## Platforms actually tested
List OS, Zotero, PDF.js, DPI/scaling, display setup, and whether this was a real Zotero host test or a simulation.

## Screenshots / diagnostics
Attach only redacted screenshots and diagnostics. Never attach private PDFs, Zotero databases, access tokens, or unredacted paths.
