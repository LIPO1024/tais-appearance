# TAIS Appearance 2.3.2 Beta — Release readiness

Date: 2026-11-13  
Repository: https://github.com/LIPO1024/tais-appearance  
Candidate: v2.3.2 Beta

## Project direction

TAIS Appearance is maintained as a free and open-source project. The maintainers do not charge users and do not collect donations, sponsorship payments, license fees, or other payments.

- No paid edition, subscription, membership, activation key, theme lock, or feature lock.
- No payment SDK, checkout flow, payment credential, QR code, or commercial activation service.
- All 12 bundled themes and core appearance features are available to everyone.
- The repository funding configuration has been removed.
- The five runtime locale dictionaries and Fluent catalogs no longer contain the obsolete purchase, license-key, restore-purchase, or hosted-checkout strings.
- README files, showcase, user guides, support, security, contribution, changelog, and project policy describe the same free distribution model.
- The project policy does not add a non-commercial restriction to the AGPL rights granted to downstream users.

## 2.3.2 Beta changes

- Remove 17 obsolete purchase/license strings from each of the five locale dictionaries.
- Remove the corresponding legacy UI catalog entries in all five locales.
- Update runtime version constants and manifest to 2.3.2.
- Clarify free distribution, privacy, support, and contribution guidance.
- Replace the former monetization document with `docs/OPEN-SOURCE-POLICY.md`.
- Remove the obsolete payment setup document and GitHub funding configuration.
- Preserve all 12 themes, profiles, backgrounds, Safe Mode, recovery, and native PDF rendering behavior.

## Build evidence

- Version: 2.3.2
- Package: `dist/TAIS_Appearance-2.3.2.xpi`
- Size: 298,486 bytes
- SHA-256: `1d26a262e94317d8eb52b205f7ad8b595463d8f9a62a9fa8809f6eabc2811c96`
- Packaged files: 61
- JavaScript files checked: 18
- CSS files checked: 7
- Reproducible build in the same environment: passed
- XPI archive integrity: passed
- JavaScript/CSS/XML validation: passed
- Appearance/contrast regression groups: 12 passed
- Dark policy/native bridge groups: 10 passed
- Appearance contract groups: 11 passed
- UI/static/inspection groups: 13 passed
- Additional reliability groups: 10 passed
- Brand/final invariant groups: 10 passed
- Five-locale coverage checks: 6 passed
- Showcase checks: 6 passed
- Five locale dictionaries: 561 entries each; 558 extracted source keys covered.

Automated localization coverage is complete as a draft. Native-speaker review is still required; this report does not claim native review.

## Compatibility and publication boundaries

- Validated target remains Windows 11 / Zotero 10.0.8 / PDF.js 5.7.0.
- macOS/Linux remain unsupported by the current Windows DWM material adapter.
- Other Zotero versions and third-party plugin combinations require separate validation.
- The community marketplace PR #315 remains subject to maintainer review; submission is not acceptance.
- Zotero's own documentation currently says it does not provide a general official plugin directory.
- The release remains Beta, not Stable. Cross-machine, system-DPI, multi-monitor, print, long-duration, and broader compatibility acceptance remain separate work.

## License and upstream notices

The project includes code derived from Mica for Zotero and is distributed under the applicable GNU AGPL terms. Upstream notices and corresponding source are retained. This project's free distribution policy describes the maintainers' practice and does not narrow downstream license rights.

## Community maintenance

The project is sustained through non-financial contributions: reproducible bug reports, translation review, compatibility testing, documentation, code review, and pull requests. No payment is required or requested to use or contribute to the project.
