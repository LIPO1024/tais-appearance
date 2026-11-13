# TAIS Appearance — Release readiness record

Date: 2026-11-13  
Repository: https://github.com/LIPO1024/tais-appearance  
Current public tag: v2.3.1 (Beta)

## Work completed in this pass

- Reworked the repository landing README around the user journey: understand the product, inspect real feature visuals, try the interactive demo, download the XPI, then consult the five-language guides.
- Clarified the distinction between free/open-source functionality and voluntary project support.
- Added a dedicated multilingual showcase section for all five user guides.
- Added a support and licensing section to the public showcase. The section explicitly states that all 12 bundled themes remain free, that sponsorship onboarding is not confirmed, and that Alipay merchant checkout is not configured.
- Localized the support/licensing copy for Simplified Chinese, English, Japanese, Korean, and French.
- Rebuilt the 2.3.1 XPI locally from the current source and ran the project's bundled regression/build checks.

## Build evidence

- Version: 2.3.1
- Local package: dist/TAIS_Appearance-2.3.1.xpi
- SHA-256: 98e2444d8b66c256c8c798cfc88de3fca54eb23137383825ac35df93b6e8fe64
- Package size: 302,812 bytes
- Packaged source files: 61
- JavaScript files checked: 18
- CSS files checked: 7
- Reproducible twice in the same local build environment: passed
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

The five locale dictionaries cover all extracted UI strings, but the translation process is recorded as machine-translation draft. Automated coverage is not evidence of native-speaker review.

## Release and publication boundaries

1. This pass does not change the plugin runtime version or manifest. The locally rebuilt package is a reproducible 2.3.1 Beta build, not a new stable release.
2. No replacement GitHub Release asset was uploaded. Replacing an existing public release asset with a locally rebuilt file without a versioned release decision would create ambiguity for existing users.
3. GitHub Pages deployment depends on the repository's configured publishing workflow/source. The website changes are committed to the source branch; public availability must be verified after GitHub finishes publishing.
4. Community marketplace PR #315 remains subject to maintainer review. Submission is not acceptance.
5. No Zotero-operated official add-on directory listing is claimed.
6. GitHub Sponsors onboarding and payout eligibility have not been verified. The funding link is not represented as a confirmed checkout.
7. Alipay merchant acquiring, hosted checkout, settlement, refund policy, and merchant verification are not configured.
8. Native-speaker review of all five languages remains required. No native review is claimed.
9. macOS/Linux remain unsupported by the current Windows DWM material adapter. The validated target remains Windows 11 / Zotero 10.0.8 / PDF.js 5.7.0.

## Licensing decision

The project contains Mica for Zotero-derived code and is distributed under applicable AGPL terms. All 12 bundled themes and covered core functionality remain available to everyone. A payment key must not be used to remove rights granted under the applicable license. A one-time US$1 contribution can be offered as voluntary support, not as a paywall for those themes.

## Remaining external dependencies

- Maintainer-side GitHub Sponsors onboarding, tax/KYC and payout setup.
- If desired, a verified Alipay merchant/acquirer agreement and hosted checkout.
- Native-speaker review and approval of zh-CN, en-US, ja-JP, ko-KR and fr-FR strings and guides.
- Marketplace maintainer decision on PR #315.
- Confirmation of GitHub Pages deployment and post-deploy smoke test.
- Separate stable-release approval after cross-machine and compatibility acceptance.
