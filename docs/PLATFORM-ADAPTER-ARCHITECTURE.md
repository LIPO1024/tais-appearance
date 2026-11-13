# Platform adapter architecture

## Goal

Separate TAIS's reading and appearance policy from OS-native window material. Preserve one shared product behavior while allowing independent platform implementations.

## Layers

- `AppearanceCore`: theme tokens, contrast policy, user preferences, undo/recovery, Safe Mode.
- `ReaderSurface`: PDF page surround and page surface policy. Never mutate source PDF data, native glyph pixels, text layer, or annotations.
- `PlatformAdapter`: native window discovery, backdrop application, readback, and teardown.
- `CapabilityPolicy`: detect OS/API/compositor/accessibility capability and choose native material, CSS-only fallback, or opaque native appearance.

## Required adapter contract

Each adapter should expose:

- `probe()`: returns platform, OS build, API availability, capability flags, and a reason when unsupported.
- `apply(window, theme, material)`: applies material idempotently and returns requested vs actual native state.
- `readback(window)`: verifies effective material state rather than trusting the request result.
- `restore(window)`: removes native view/effect and restores prior native attributes.
- `dispose()`: unregisters listeners, observers, native references, and callbacks.

All operations must be exception-safe. Unsupported APIs fail closed. Never use private binary patching, system-wide injection, helper daemons, or undocumented global hooks.

## Windows

Current backend: DWM system backdrop/Acrylic bridge. Keep it isolated from shared appearance logic. Verify HWND validity, OS build, HRESULT, actual DWM readback, focus changes, window recreation, and cleanup. The DWM adapter must never be called on non-Windows systems.

## macOS

Candidate backend: AppKit `NSVisualEffectView`. This requires a separately tested Objective-C runtime bridge and safe insertion into the Zotero NSWindow view hierarchy. The bridge must restore the original hierarchy and handle window recreation, full-screen transitions, reduced transparency, increase contrast, dark/light appearance, and multiple windows. No production adapter is included until real macOS Zotero acceptance is complete.

## Linux

Candidate backends are not uniform:
- X11 compositors may provide compositor-specific blur hints.
- Wayland's `ext-background-effect-v1` is staging and compositor-dependent.
- When no supported compositor capability is present, use an opaque or simple translucent CSS surface without blur.

Do not equate compositor protocol presence with working application support.

## Safety invariants

- Safe Mode removes native material and returns to a readable opaque interface.
- Disable/uninstall removes all native views and listeners.
- PDF canvas/textLayer/selection/copy/print remain untouched.
- Reduced transparency and forced-colors preferences override blur.
- Capability detection is reported in diagnostics without exposing personal paths or document content.

## References

- Zotero plugin runtime and internal Firefox APIs: https://www.zotero.org/support/dev/client_coding/plugin_development
- Zotero platform integration and OS detection (Zotero.isWin, Zotero.isMac, Zotero.isLinux): https://www.zotero.org/support/dev/zotero_7_for_developers
- Apple AppKit NSVisualEffectView: https://developer.apple.com/documentation/appkit/nsvisualeffectview
- Wayland staging background-effect protocol: https://wayland.app/protocols/ext-background-effect-v1
- Independent macOS Zotero Glass implementation used as a research reference only: https://github.com/Avi7ii/Zotero-glass

These references support platform feasibility research. They do not establish TAIS compatibility or authorize copying third-party implementation code.
