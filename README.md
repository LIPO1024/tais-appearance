# TAIS Appearance

**A Glass appearance and reading-environment extension for Zotero.** By **Theatre AI Studio (TAIS)**.

TAIS Appearance provides 12 curated Glass presets, light and dark appearances, typography controls for the Zotero interface and annotations, reading-surface controls, local backgrounds, reversible previews, profiles, diagnostics, and Safe Mode.

## Languages
Simplified Chinese, English, Japanese, Korean, French, and automatic language selection based on Zotero. Translation coverage and review status are documented in docs/I18N-STATUS.md.

## Compatibility
Validated target: Windows 11, Zotero 10.0.8, PDF.js 5.7.0. The current bootstrap intentionally exits on non-Windows platforms because its native window-material adapter uses Windows DWM APIs. macOS and Linux are not supported by this release.

## Install
Download the XPI from GitHub Releases. In Zotero open Tools → Plugins → gear menu → Install Plugin From File. If necessary, use TAIS Appearance → Recovery and Diagnostics → Restore Native Zotero Appearance.

## Build
Install requirements-build.txt and run python build.py. The build performs JavaScript, CSS, XML, and automated regression checks. Public builds require reviewed hosting and release configuration.

## Privacy and safety
Background images are processed locally. TAIS does not need Zotero cloud credentials and does not intentionally read or upload document contents. PDF rendering remains owned by Zotero/PDF.js.

## License and notices
The derivative is distributed under applicable AGPL terms. See LICENSE, NOTICE, and docs/THIRD_PARTY_NOTICES.md. The project includes modified code derived from Mica for Zotero by northword. The exact upstream revision and corresponding-source package must accompany public distribution.

## Funding
Sponsorship supports maintenance and documentation; it does not restrict rights granted by the AGPL. All bundled themes remain available to everyone. See docs/MONETIZATION.md.

## Guides
- English: docs/USER_GUIDE.en-US.md
- 简体中文: docs/USER_GUIDE.zh-CN.md
- 日本語: docs/USER_GUIDE.ja-JP.md
- 한국어: docs/USER_GUIDE.ko-KR.md
- Français: docs/USER_GUIDE.fr-FR.md


