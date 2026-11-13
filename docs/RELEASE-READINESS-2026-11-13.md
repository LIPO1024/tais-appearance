# TAIS Appearance 2.4.0 — Release readiness

Date: 2026-11-13  
Repository: https://github.com/LIPO1024/tais-appearance  
Candidate: v2.4.0 Stable
Supported native material target: Windows 11 / Zotero 10.0.8 / PDF.js 5.7.0

The connected Windows device reports Windows 11 Home China build 26300. The active Zotero main window reports 120 DPI (125%) during inspection, with one remote-session display at 1536×960. The active Zotero profile still has TAIS Appearance 2.3.0 installed; 2.4.0 was built and packaged but not installed into the user's primary profile. This is environment inspection, not a claim of a complete 2.4.0 visual acceptance run.

## Scope

2.4.0 is a hardening and release-engineering update, not a theme expansion. It preserves the existing 12 themes, appearance settings, local backgrounds, profiles, undo/recovery, Safe Mode, and native PDF.js drawing hooks.

## Changes

- Added a platform adapter architecture document and a compatibility matrix.
- Researched macOS AppKit `NSVisualEffectView` and Linux compositor effects. Neither adapter is shipped or claimed as supported.
- Added CI static build validation on Windows, macOS, and Linux. The matrix validates source/tests/build only; it is not native Zotero UI acceptance.
- Added a release workflow for XPI and SHA-256 generation.
- Added GitHub bug/feature templates and a pull request checklist.
- Added 9 reader-safety invariants for PDF.js engine gating, non-mutation of PDF glyph/canvas/text layer, print fallback, forced colors, reduced transparency, Safe Mode, and teardown.
- Added a five-language terminology glossary and reviewer workflow.
- Updated all README variants and the product showcase to link to compatibility and platform architecture information.
- Preserved the pure open-source distribution policy and removed all funding/payment configuration in 2.3.2.

## Build and automated verification

- Version: 2.4.0 Stable
- Package: dist/TAIS_Appearance-2.4.0.xpi
- Size: 298,403 bytes
- SHA-256: 0616024d5c489c10e3dff1267a1f319b3ed1e1e8869dc6c16b56ba65ed06662a
- Packaged files: 61
- JavaScript files checked: 18
- CSS files checked: 7
- Reproducible build: passed (Python 3.12.13 local package exactly matches the published Python 3.12.16 release asset byte-for-byte)
- XPI archive integrity: passed

- Version: 2.4.0
- Package: `dist/TAIS_Appearance-2.4.0.xpi`
- Source files: 61 (expected to change only if future additions require it)
- JavaScript syntax: checked by build.py
- CSS parsing: checked by build.py
- XML parsing: checked by build.py
- Appearance/contrast regression: 12 groups
- Dark policy/native bridge: 10 groups
- Appearance contracts: 11 groups
- UI/static/inspection: 13 groups
- Additional reliability: 10 groups
- Brand/final invariants: 10 groups
- Five-locale coverage: 6 groups
- Showcase: 6 groups
- Reader safety invariants: 9 groups
- Reproducible package and XPI integrity: checked by build.py; local Python 3.12 build matches the published asset exactly

Automated locale coverage is not native-speaker review. The five translations remain drafts pending external linguistic review.

## Platform findings

- Windows: current DWM adapter remains the only shipped native material backend.
- macOS: AppKit `NSVisualEffectView` is the appropriate native primitive for translucency/vibrancy, but safe Objective-C runtime bridging, NSWindow view lifecycle, accessibility settings, full-screen behavior, and cleanup require a dedicated real-Mac implementation and acceptance run.
- Linux: X11 and Wayland lack a single portable blur API. Wayland `ext-background-effect-v1` is staging and compositor-dependent. No Linux native material support is claimed.
- Cross-OS CI checks are static build checks, not UI support certification.

## Host acceptance limits

The connected Windows development environment is Windows 11 Home China build 26300 with Zotero 10.0.8 installed/running. This pass did not complete a full matrix of system DPI settings, mixed-DPI multi-monitor transitions, physical printing, eight-hour soak, all third-party plugin combinations, screen-reader acceptance, or macOS/Linux host tests. These are explicitly not claimed as passed.

The 2.4.0 Stable label applies to the documented Windows 11 / Zotero 10.0.8 / PDF.js 5.7.0 target and the release scope above. It does not imply universal platform support or zero defects.

## Open source and license

The maintainers do not charge users and do not collect donations or sponsorship payments. All 12 themes and core features remain available to everyone. The project is distributed under applicable AGPL terms; this maintainer distribution policy does not narrow downstream license rights.

## Community publication

- GitHub source, release, and product showcase are the primary distribution points.
- Zotero community marketplace PR #315 remains subject to maintainer review; submission is not acceptance.
- No Zotero-operated official add-on directory listing is claimed.
