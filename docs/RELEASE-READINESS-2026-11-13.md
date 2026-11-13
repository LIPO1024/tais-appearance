# TAIS Appearance — Release readiness record

Date: 2026-11-13  
Repository: https://github.com/LIPO1024/tais-appearance  
Current public tag: v2.3.1 (Beta)

## Work completed in this pass

- Reworked the repository landing README around the user journey: understand the product, inspect feature visuals, try the interactive demo, download the XPI, then consult the five-language guides.
- Clarified the distinction between free/open-source functionality and voluntary project support.
- Added a showcase section linking all five user guides directly.
- Added a support and licensing section to the public showcase. It states that all 12 bundled themes remain free, sponsorship onboarding is not confirmed, and Alipay merchant checkout is not configured.
- Localized the support/licensing copy for Simplified Chinese, English, Japanese, Korean, and French.
- Rebuilt the 2.3.1 XPI locally from the current source and ran the bundled regression/build checks.
- Committed and pushed the changes to `main` in commit `900109c4b9382485efb51261c77f81df199e0a97`.
- GitHub Pages deployment for that commit completed successfully. The live website returned HTTP 200 and included the new support section and French guide entry.

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
- Published XPI download endpoint: HTTP 200; existing release asset size 302,851 bytes.

The newly rebuilt local XPI is not byte-identical to the existing published asset: local SHA-256 is `98e2444d...`, while GitHub reports the existing release asset digest as `4fb20eb2...`. The published asset was not replaced. This avoids silently changing a public Beta download under the same version number.

The five locale dictionaries cover all extracted UI strings, but the translation process is recorded as machine-translation draft. Automated coverage is not evidence of native-speaker review.

## Release and publication boundaries

1. This pass does not change the plugin runtime version or manifest. The locally rebuilt package is a reproducible 2.3.1 Beta build, not a new stable release.
2. No replacement GitHub Release asset was uploaded. A new versioned release decision is required before distributing a different XPI.
3. GitHub Pages deployment for commit `900109c` completed successfully; live URL: https://lipo1024.github.io/tais-appearance/
4. Community marketplace PR #315 remains open and unmerged, awaiting maintainer review. Submission is not acceptance.
5. No Zotero-operated official add-on directory listing is claimed.
6. The GitHub Sponsors profile URL returns HTTP 200, but no active one-time sponsorship tier or checkout was verified. Creator onboarding and payout eligibility remain unconfirmed.
7. Alipay merchant acquiring, hosted checkout, settlement, refund policy, and merchant verification are not configured.
8. Native-speaker review of all five languages remains required. No native review is claimed.
9. macOS/Linux remain unsupported by the current Windows DWM material adapter. The validated target remains Windows 11 / Zotero 10.0.8 / PDF.js 5.7.0.
10. The optional Python showcase test file was not present in the public publishing checkout and was not run. The repository build suite and Node showcase suite did pass.

## Licensing decision

The project contains Mica for Zotero-derived code and is distributed under applicable AGPL terms. All 12 bundled themes and covered core functionality remain available to everyone. A payment key must not be used to remove rights granted under the applicable license. A one-time US$1 contribution can be offered as voluntary support, not as a paywall for those themes.

## Remaining external dependencies

- Maintainer-side GitHub Sponsors onboarding, tax/KYC, creation of a one-time tier and payout setup.
- If desired, a verified Alipay merchant/acquirer agreement and hosted checkout.
- Native-speaker review and approval of zh-CN, en-US, ja-JP, ko-KR and fr-FR strings and guides.
- Marketplace maintainer decision on PR #315.
- Separate stable-release approval after cross-machine and compatibility acceptance.
