# TAIS Appearance 2.4.1 — Maintenance release candidate

This patch corrects distribution metadata and strengthens release automation. It does not expand the theme collection or redesign the approved interface.

## Fixes

- The source manifest now uses the public Zotero update-feed URL rather than localhost and includes the official product homepage.
- The update feed, add-on manifest, adapter registry, runtime constants, build version, localized READMEs, website, and showcase are checked for consistency.
- A dedicated release-metadata test checks the XPI URL, Zotero compatibility range, public homepage/update feed, runtime versions, current download links, and relative documentation links.
- The build derives the XPI version from the canonical add-on manifest instead of maintaining a second hard-coded version.
- GitHub Actions are pinned to immutable commit SHAs; artifact upload uses the Node 24-compatible v6 release.
- CI jobs have least-privilege permissions and timeouts. Release automation validates tag/version agreement and refuses to overwrite an existing release.
- Dependabot checks GitHub Actions and Python build dependencies weekly.
- Corrected two obvious Japanese and Korean README grammar errors.

## Compatibility and scope

The supported native-material target remains Windows 11 / Zotero 10.0.8 / PDF.js 5.7.0. macOS and Linux native material adapters are not shipped. Automated translations remain drafts pending native-speaker review.

All 12 themes, appearance preferences, local backgrounds, profiles, undo/recovery, Safe Mode, AGPL terms, upstream notices, and PDF.js rendering behavior are preserved.

## Verification gate

The candidate must pass the complete build suite, release metadata and link checks, GitHub CI on Windows/macOS/Linux, and Pages deployment checks before a v2.4.1 Stable tag is created.
