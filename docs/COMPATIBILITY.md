# Compatibility matrix

This matrix distinguishes code that can build on a platform from native material support and actual host acceptance. A CI build on macOS or Linux is **not** proof that the Zotero interface is visually supported there.

## Current release target

| Platform | Zotero | Native window material | Interface styling | Acceptance status |
|---|---|---|---|---|
| Windows 11 22H2+ | 10.0.8 | DWM Acrylic/system backdrop | Enabled | Primary validated target |
| Windows 10 / older Windows 11 | 10.x | DWM fallback is not guaranteed | Limited | Not accepted |
| macOS | 10.x | AppKit adapter not implemented in this release | Not enabled | Unsupported |
| Linux X11 | 10.x | No portable compositor material API | Not enabled | Unsupported |
| Linux Wayland | 10.x | Compositor-dependent; staging background-effect protocol only | Not enabled | Unsupported |

## Verified environment

- OS: Windows 11 Home China, build 26300
- Zotero: 10.0.8 installed and running during inspection
- PDF.js: 5.7.0 validated in the prior release build
- Build: 2.4.1 release candidate
- Test classes: static build, unit/contract suites, locale coverage, showcase checks
- Host-only checks not represented by automated build: multiple DPI, multi-monitor transitions, physical printing, long-duration soak, all third-party plugin combinations, macOS AppKit, Linux X11/Wayland.

## Platform strategy

The product has three independent layers:

1. **Core UI and reading policy** — shared settings, theme tokens, typography, contrast safeguards, PDF.js non-mutation guarantees, profiles, undo/recovery.
2. **Native material adapter** — platform-specific window handle and backdrop APIs.
3. **Capability and fallback policy** — detect OS, Zotero version, native API availability, reduced transparency, forced colors, and compositor support; fail closed to readable opaque surfaces when unsupported.

A platform is not listed as supported until all three layers have been tested on real Zotero builds.

## macOS investigation

The native approach is AppKit `NSVisualEffectView`, which provides translucency and vibrancy. A separate native adapter must safely obtain the relevant NSWindow, attach a view behind the content hierarchy, manage view lifetime and window recreation, respect appearance/accessibility settings, and remove the view on plugin disable/shutdown. The existing Windows ctypes/DWM bridge cannot be reused.

A public Zotero Glass project demonstrates an AppKit/Objective-C runtime approach for macOS, but it is a separate project and does not establish that its code is compatible with this plugin's existing architecture or licensing. Any implementation must be independently reviewed, tested, and attributed as required.

## Linux investigation

X11 and Wayland do not expose one universal application-level blur API. Wayland's `ext-background-effect-v1` is a staging protocol with compositor-dependent availability. It must be treated as optional capability negotiation, not a baseline Linux feature. On unsupported compositors, use opaque/translucent color surfaces without blur and preserve contrast.

## Release gate

Do not add a platform badge or claim support based on static CI. Require real-host smoke tests for main library, PDF reader, preferences, menus, popups, window focus, theme changes, restore/uninstall, accessibility preferences, and multiple displays.
