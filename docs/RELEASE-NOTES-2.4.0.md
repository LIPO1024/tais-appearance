# TAIS Appearance 2.4.0 Stable

TAIS Appearance 2.4.0 is the first stable release of the current free and open-source product line. The supported native material target remains Windows 11 with Zotero 10.0.8 and PDF.js 5.7.0. macOS and Linux are not yet supported by the native material adapter.

## What changed

- Added a shared platform-adapter architecture and an explicit OS compatibility matrix.
- Documented macOS AppKit `NSVisualEffectView` and Linux compositor research paths without claiming unimplemented platform support.
- Added CI static build jobs on Windows, macOS, and Linux. These validate source, tests, and packaging; they do not claim native UI support on macOS/Linux.
- Added automated release packaging with SHA-256 checksum generation.
- Added structured bug reports, feature requests, and pull-request checklists.
- Added reader-safety tests for PDF.js version gating, non-mutation of native canvas/text-layer content, print fallback, forced colors, reduced transparency, Safe Mode, and teardown.
- Added a five-language terminology glossary and a documented native-review workflow.
- Preserved all 12 Glass presets, profiles, local backgrounds, undo/recovery, Safe Mode, and the existing native PDF.js rendering hooks.
- The project remains free and open source. No paid edition, payment integration, donations, sponsorship collection, or feature locks.

## Compatibility

Validated target: Windows 11 / Zotero 10.0.8 / PDF.js 5.7.0.

- macOS: unsupported; AppKit adapter is documented but not shipped.
- Linux X11/Wayland: unsupported; compositor effects are not portable and Wayland background-effect support remains compositor-dependent.
- Other Zotero versions, multi-monitor/DPI transitions, physical printing, long-duration soak, and all third-party plugin combinations are not claimed as fully accepted.

See [compatibility matrix](COMPATIBILITY.md) and [platform adapter architecture](PLATFORM-ADAPTER-ARCHITECTURE.md).

## Localization

Simplified Chinese, English, Japanese, Korean, and French are included. Automated coverage passes; native-speaker linguistic review is still outstanding. See [localization glossary and review workflow](LOCALIZATION-GLOSSARY.md).

## Reader safety

The PDF.js native rendering hooks remain version-gated to PDF.js 5.7.0. The extension changes the reading surround and a guarded page background only. It does not intentionally alter PDF glyph pixels, source canvas pixels, text-layer content, native selection, or document data. Forced colors, reduced transparency, Safe Mode, and print styles retain native/opaque fallbacks.

## License

Distributed under the applicable GNU AGPL terms. Upstream Mica for Zotero notices and corresponding source are preserved. All users receive the same free features.

## Package verification

- XPI size: 298,403 bytes
- SHA-256: 0616024d5c489c10e3dff1267a1f319b3ed1e1e8869dc6c16b56ba65ed06662a
- Reproducible local build and archive integrity: passed
