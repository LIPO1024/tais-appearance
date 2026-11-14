# Changelog

## 2.4.1 — Update and release hardening

- Fix the source manifest update URL so locally built XPI packages no longer point to localhost.
- Add the public product homepage to the source manifest and validate update metadata against the published XPI URL.
- Add automated release-metadata consistency tests to the required build and CI checks.
- Make release automation version-driven, tag-checked, and safe against overwriting an existing release.
- Pin GitHub Actions to reviewed immutable commit SHAs and update artifact upload to the Node 24-compatible v6 release.
- Add weekly Dependabot checks for GitHub Actions and Python build dependencies.
- Correct two obvious Japanese/Korean README grammar errors without claiming native-speaker review.

## 2.4.0 — Stable · Windows

- Establish a shared platform-adapter architecture and publish a verified compatibility matrix.
- Document the macOS AppKit and Linux compositor research paths without claiming unsupported native material.
- Add cross-OS static build CI, release automation, issue templates, pull-request checklist, and repository hygiene checks.
- Add reader-safety invariants for PDF.js version gating, native canvas/text-layer non-mutation, print fallback, accessibility preferences, and reversible teardown.
- Add a five-language terminology glossary and native-review workflow.
- Preserve the 12 Glass presets, user profiles, local backgrounds, Safe Mode, recovery, and existing PDF.js native rendering hooks.
- Keep all features free and open source under applicable AGPL terms; no payments or feature locks.

## 2.3.2 — Open-source cleanup beta

- Remove dormant purchase, license-key, restore-purchase, and hosted-checkout strings from all five locale dictionaries and UI catalogs.
- Remove repository funding configuration and all payment/sponsorship calls to action.
- Make the free distribution policy explicit: no paid edition, donations, sponsorship collection, payment SDK, activation service, or feature locks.
- Improve multilingual project overview, user documentation, contribution, security, and support guidance.
- Preserve AGPL rights, upstream notices, and corresponding source obligations.
- No runtime appearance behavior or PDF rendering hooks are intentionally changed.

## 2.3.1 — Internationalization beta

- Add Simplified Chinese, English, Japanese, Korean and French interface dictionaries.
- Add automatic language selection based on Zotero locale and an in-app language selector.
- Add five localized user guides and an interactive multilingual product showcase.
- Add localization coverage tests and repeatable build checks.
- Preserve Zotero/PDF.js native PDF rendering, user settings, profiles, backgrounds, and recovery behavior.
- All bundled themes and core features are free to everyone. No paid tier, donations, sponsorship payments, payment integration, or feature locks.
- Machine-generated translations are complete as a draft and still require native-speaker review.

## 2.3.0

- Previous local beta baseline.
