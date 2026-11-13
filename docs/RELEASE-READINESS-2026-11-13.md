# TAIS Appearance — Release readiness record

Date: 2026-11-13  
Repository: https://github.com/LIPO1024/tais-appearance  
Current public tag: v2.3.1 (Beta)

## Work completed in this pass

- Reworked the repository landing README around the user journey: understand the product, inspect feature visuals, try the interactive demo, download the XPI, then consult the five-language guides.
- Synced the English README variant with the main English README; the Chinese README and Japanese, Korean, French README variants remain available.
- Added direct links to all five user guides in the live showcase.
- Added a multilingual support/licensing section to the showcase. It states that all 12 bundled themes remain free, sponsorship onboarding is not confirmed, and Alipay merchant checkout is not configured.
- Localized the support/licensing copy for Simplified Chinese, English, Japanese, Korean, and French.
- Committed and pushed changes to `main`:
  - `900109c` — product onboarding and multilingual showcase.
  - `4cf8027` — release verification record.
  - `052f58c` — English README synchronization.
- GitHub Pages deployment for the showcase commit completed successfully. The live website returned HTTP 200 and included the support section and five-language guide links.

## Build and verification evidence

- Version: 2.3.1 Beta
- Local package: dist/TAIS_Appearance-2.3.1.xpi
- Public build SHA-256: `4fb20eb21d4e96ef08f65596aacecd1d1cc38402c0174c0f485fa8b3dc336a18`
- Package size: 302,851 bytes
- Packaged source files: 61
- JavaScript files checked: 18
- CSS files checked: 7
- Reproducible twice in the same local build environment: passed
- Local public-build SHA-256 exactly matches the published GitHub Release asset digest.
- XPI archive integrity: passed
- JavaScript/CSS/XML validation: passed
- Appearance/contrast regression groups: 12 passed
- Dark policy/native bridge groups: 10 passed
- Appearance contract groups: 11 passed
- UI/static/inspection groups: 13 passed
- Additional reliability groups: 10 passed
- Brand/final invariant groups: 10 passed
- Five-locale coverage checks: 6 passed
- Showcase Node checks: 6 passed
- Showcase inline JavaScript syntax check: passed
- All five user-guide files: present
- Published XPI download endpoint: HTTP 200
- GitHub Pages endpoint: HTTP 200

The five locale dictionaries cover all extracted UI strings, but the translation process is recorded as machine-translation draft. Automated coverage is not evidence of native-speaker review.

## Release and publication boundaries

1. This pass does not change the plugin runtime version or manifest. The package is a reproducible 2.3.1 Beta build, not a new stable release.
2. No replacement GitHub Release asset was uploaded; the local public build exactly reproduces the existing asset. A new versioned release decision is required before publishing a different XPI.
3. GitHub Pages showcase is deployed at https://lipo1024.github.io/tais-appearance/
4. Community marketplace PR #315 remains open and unmerged, awaiting maintainer review. Submission is not acceptance.
5. No Zotero-operated official add-on directory listing is claimed.
6. The GitHub Sponsors profile URL returns HTTP 200, but no active one-time sponsorship tier or checkout was verified. Creator onboarding and payout eligibility remain unconfirmed.
7. Alipay merchant acquiring, hosted checkout, settlement, refund policy, and merchant verification are not configured.
8. Native-speaker review of all five languages remains required. No native review is claimed.
9. macOS/Linux remain unsupported by the current Windows DWM material adapter. The validated target remains Windows 11 / Zotero 10.0.8 / PDF.js 5.7.0.

## Licensing decision

The project contains Mica for Zotero-derived code and is distributed under applicable AGPL terms. All 12 bundled themes and covered core functionality remain available to everyone. A payment key must not be used to remove rights granted under the applicable license. A one-time US$1 contribution can be offered as voluntary support, not as a paywall for those themes.

## Remaining external dependencies

- Maintainer-side GitHub Sponsors onboarding, tax/KYC, creation of a one-time tier and payout setup.
- If desired, a verified Alipay merchant/acquirer agreement and hosted checkout.
- Native-speaker review and approval of zh-CN, en-US, ja-JP, ko-KR and fr-FR strings and guides.
- Marketplace maintainer decision on PR #315.
- Separate stable-release approval after cross-machine and compatibility acceptance.
