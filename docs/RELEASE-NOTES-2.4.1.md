# TAIS Appearance 2.4.1 — Maintenance release candidate

This maintenance release corrects distribution metadata and improves release automation. It does not add themes or change the approved reading interface.

## Fixes

- The source manifest now contains the public product homepage and public update-feed URL. Local XPI builds no longer inherit a localhost update URL.
- The update feed, add-on manifest, runtime version constants, adapter registry, README links, showcase download links, and build version are checked for consistency.
- A dedicated release-metadata regression test is part of every build.
- GitHub Actions use reviewed immutable action commit references, Node 24-compatible artifact upload, least-privilege job permissions, and job timeouts.
- Release automation derives the XPI name from the manifest version, verifies that the pushed tag matches that version, and refuses to overwrite an existing release.
- Dependabot checks GitHub Actions and Python build dependencies weekly.
- Corrected two obvious Japanese and Korean README grammar errors.

## Compatibility and scope

The supported native-material target remains Windows 11 / Zotero 10.0.8 / PDF.js 5.7.0. macOS and Linux native material adapters are not shipped. Automated translations remain drafts pending native-speaker review.

All 12 themes, existing appearance preferences, local backgrounds, profiles, undo/recovery, Safe Mode, AGPL terms, upstream notices, and PDF.js rendering behavior are preserved.

## Verification

The release candidate must pass the full local build suite, release-metadata consistency test, GitHub CI on Windows/macOS/Linux, and website link/deployment checks before a v2.4.1 release tag is created.
