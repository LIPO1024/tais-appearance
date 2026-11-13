# TAIS Appearance — User Guide

## What it does
TAIS Appearance adds a consistent Glass appearance system to Zotero. It changes interface surfaces and reading surroundings while leaving PDF glyphs, native text selection, document contents, and annotations under Zotero/PDF.js control.

## Choose a language
Open Zotero Settings → TAIS Appearance → About → Language. Choose Automatic (follow Zotero), Simplified Chinese, English, Japanese, Korean, or French. The setting is stored locally. Reopen the settings pane if the language does not refresh immediately.

## Change appearance
Use the Light, Dark, or System controls at the top. Open Appearance to browse the 12 Glass presets. A preset starts as a preview; compare the current appearance, inspect the differences, then Apply or Cancel. Preview does not become permanent until confirmed.

## Work scenes
Academic Reading, Research, and Writing are reversible appearance presets. They adjust appearance controls only. They do not edit citations, PDFs, notes, annotation data, custom font sizes, or the background image file.

## Typography
Interface text and annotation text have independent controls. Native mode follows Zotero. Custom mode changes the Zotero interface or annotation panel only; it does not replace fonts embedded in a PDF.

## Reading surfaces
The page surround and page surface are separate. A transparent surround does not mean the PDF text itself is transparent. Contrast protection may raise the effective page opacity. Scanned pages, images, and unusual PDF engines may look different.

## Backgrounds
Built-in Stage Mist and gradient backgrounds are local visual assets. Custom images are processed locally. Only JPG, PNG, and WebP are accepted; oversized images are resized. Removing a TAIS background removes the plugin's saved copy, not the original file selected by the user.

## Profiles and backup
Save a profile after reaching a preferred appearance. Profiles do not contain background image files. Export the desired scope before major upgrades. Import always validates and shows a difference list before applying.

## Command palette
Press Ctrl+K or use the command button. Search for a section, setting, theme, or work scene. Use Up/Down to move, Enter to run, and Esc to close. Avoid invoking shortcuts while typing in editable fields.

## Recovery
If a window becomes difficult to read, use Restore Native Zotero Appearance or Safe Mode. Safe Mode restores Zotero's native interface and blocks appearance writes. Do not delete the Zotero database or clear plugin preferences as a first-line recovery step.

## Compatibility and known limits
The validated target is Windows 11 with Zotero 10.0.8 and PDF.js 5.7.0. macOS and Linux are not supported by this Windows DWM build. PDF pixel, selection, copy, print, multi-monitor, long-duration, and third-party-plugin tests must be checked against the current release QA report.

## Privacy
Background images are processed locally. Diagnostics contain appearance state and error markers, not document text. Redact paths, profile names, and other private details before sharing logs.

## License and support
The project is distributed under AGPL terms with third-party notices. All bundled themes remain available under the license. Optional sponsorship supports maintenance; it is not required to use any theme.
