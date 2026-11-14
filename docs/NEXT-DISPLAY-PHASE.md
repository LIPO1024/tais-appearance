# Display and accessibility phase — 2.5.0beta1

Status: development candidate. The public release, website download links and Zotero update feed remain **2.4.1**. No macOS/Linux native support is introduced. No personal Zotero profile is upgraded by this phase.

## Implemented

`source/content/display-policy.js` provides a pure capability decision and per-window observer. It detects the device-pixel ratio exposed by the host, forced colors, reduced transparency, reduced motion and increased contrast. Resolution listeners are re-armed after changes; resize/focus bursts are coalesced. Unchanged geometry does not trigger a material refresh. Unload/disposal cancels timers and removes listeners.

`source/content/display-runtime.js` applies that policy at the existing native-material entry point. Unsupported platforms do not probe DWM. Safe Mode, disabled appearance, missing native capability or unreadable media queries fail closed. Forced colors/reduced transparency restore TAIS-owned appearance and detach TAIS reader hooks before returning to an opaque surface. The original native apply path is not called first. When the preference is lifted, existing user settings are reused without preference writes.

`source/content/display-policy.css` guards the early chrome-window transparency stylesheet and provides an opaque background for the owned fallback state. This is scoped to Zotero chrome or roots explicitly marked by TAIS, not arbitrary websites or PDF text layers.

The new observer never changes operating-system scaling, application font sizes, PDF zoom, canvas dimensions, annotation positions or document data. PDF.js remains responsible for rendering at the new display scale. Existing PDF.js hooks and the 12 theme definitions are not redesigned.

## Evidence and boundaries

Automated tests use simulated windows/media queries and real production modules. They verify capability gates, 1/1.25/1.5/2 DPR transitions, independent windows, event coalescing, accessibility changes, Safe Mode, unload/disposal, 1,000 listener lifecycle cycles, privacy of diagnostics and protected-source hashes. These are **not** real monitor or PDF-pixel acceptance tests.

The isolated host harness uses a new profile and a new data directory, with syncing and the connector server disabled. The tested copy includes a test-only bootstrap entry and probe script; the distributable candidate does not include those files. It checks the data-directory identity before importing the original test PDF. It never loads a private document. It exercises native PDF.js zoom, text selection and movement of its own window, then writes a local report and exits. A successful DOM selection check does not certify clipboard transfer, annotation placement or physical printing. A requested window move does not certify mixed-DPI operation unless the measured DPR actually changes.

Media-query availability varies by host/browser. A false result for an unsupported reduced-transparency query is not proof that the OS preference is disabled. Actual Windows accessibility preferences and a complete display matrix remain acceptance gates.

## Recorded isolated host run

Windows Zotero 10.0.8 / PDF.js 5.7.0 loaded 2.5.0beta1 in a separate profile/data directory. The final run recorded **11 completed checks passed, 1 interaction check not run**. Native zoom at 0.75, 1, 1.5 and 2 produced one finished, unfiltered native canvas. Moving the isolated window between two display positions retained rendering; measured DPR was 1.25 at both positions, so this is not mixed-DPI acceptance. Safe Mode suppressed the new policy and the test profile's appearance snapshot was restored. The isolated process exited.

The host exposes `customAnnotationLayer`, not a standard PDF.js DOM `.textLayer`. The first generic DOM-selection probe failed for that reason. Source text extraction succeeded, but is **not** counted as selection/clipboard verification. That check remains not-run and full host acceptance remains false. See [structured acceptance record](QA-DISPLAY-20261114.json).

To reproduce, first build the candidate, install the optional `reportlab` test dependency, then run `python tests/prepare-isolated-host.py`. It creates only `qa-local/profile` and `qa-local/data` and refuses to reuse an existing profile. Launch that profile with Zotero's `-no-remote -profile` flags. The probe confirms its data directory before importing the original fixture. Review the move positions for the local monitor arrangement; defaults do not leave the primary display. Logs, databases and test profiles are not committed.

## Candidate release boundary

`release-plan.json` separates source version 2.5.0beta1 from public version 2.4.1. Build metadata records the development gate. The Stable workflow rejects a candidate version or the presence of this plan. CI may upload a clearly versioned candidate artifact, but must not publish it as Stable or change the stable update feed.

## macOS decision

The executable capability boundary now returns `unsupported-platform` for macOS/Linux without native calls. This is not an AppKit adapter.

A macOS implementation requires a real Mac with a supported Zotero version, a documented way to obtain the NSWindow, a reviewed Objective-C ABI bridge, correct NSVisualEffectView insertion and lifetime management, and reversible cleanup. Verification must include reduced transparency, increased contrast, full screen, window recreation, Retina/non-Retina transitions and multiple windows. No AppKit library is loaded and no speculative Objective-C bridge is shipped here.

## Remaining acceptance matrix

| Check | Required evidence |
|---|---|
| Windows display scaling | Real 100%, 125%, 150%, 200% host checks; state the measured DPR |
| Mixed-DPI monitors | Actual window transitions with changing DPR, preserved selection and native backdrop readback |
| PDF fidelity | Same-scale before/after raster comparison, text selection and clipboard transfer, annotations, rotated/scanned PDFs |
| Accessibility | Real forced-colors/reduced-transparency transitions, keyboard focus and screen-reader checks |
| Lifecycle | Disable/re-enable, window closure, restart, no residual native effect or listener |
| Soak and printing | Long-duration usage and real printing, separately recorded |
| macOS | A native adapter and real-host acceptance, not CI builds |

## Technical references

- Mozilla: devicePixelRatio and resolution-query re-arming — https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
- Mozilla: forced colors — https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors
- Mozilla: reduced transparency — https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency
- Zotero: separate instances require separate profile/data directories — https://www.zotero.org/support/kb/multiple_instances
- Apple: NSVisualEffectView — https://developer.apple.com/documentation/AppKit/NSVisualEffectView
- Apple: reduced transparency — https://developer.apple.com/documentation/appkit/nsworkspace/accessibilitydisplayshouldreducetransparency

## 中文摘要

本轮完成显示比例与无障碍策略模块、可逆原生材质入口保护和独立测试机制。2.5.0beta1 只作为开发候选，公开下载和自动更新继续使用 2.4.1。模拟测试、真实 Zotero 测试和未验收项目分别记录；不宣称 macOS 已支持，不把文献选择、像素保真、批注与打印混成同一个“通过”。
