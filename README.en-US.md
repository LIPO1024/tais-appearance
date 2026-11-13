# TAIS Appearance

<p align="center">
  <img src="docs/images/01-cover.png" alt="TAIS Appearance — a calm Glass reading workspace for Zotero" width="900">
</p>

<p align="center">
  <strong>A calmer way to read in Zotero.</strong><br>
  A Glass appearance system for focused reading, research, and annotation, built by Theatre AI Studio.
</p>

<p align="center">
  <a href="https://lipo1024.github.io/tais-appearance/"><strong>Explore the live demo</strong></a> ·
  <a href="https://github.com/LIPO1024/tais-appearance/releases/latest"><strong>Download free</strong></a> ·
  <a href="docs/USER_GUIDE.en-US.md"><strong>Read the user guide</strong></a>
</p>

![TAIS Appearance — Glass surfaces for Zotero](docs/images/01-cover.png)

## What it does

TAIS Appearance gives Zotero a coherent visual environment: translucent interface surfaces, light and dark appearances, readable annotation typography, and a tunable reading surround. It styles the workspace around your documents without taking over PDF rendering.

**The principle: the interface may change; the source document must remain clear and reliable.** PDF text, embedded fonts, native selection, and annotations remain under Zotero/PDF.js control.

## Features

- **12 Glass presets** — six light and six dark themes across four visual families.
- **Independent typography controls** — tune Zotero interface text and annotation cards separately.
- **Reading-surface controls** — adjust the page surround and paper surface independently, with contrast safeguards.
- **Reversible previews** — compare, preview, apply, cancel, undo, and restore.
- **Local backgrounds** — built-in Stage Mist and custom images processed locally.
- **Profiles and recovery** — save appearance setups, import/export scoped settings, inspect conflicts, and use Safe Mode.
- **Five interface languages** — Simplified Chinese, English, Japanese, Korean, and French, with automatic locale selection.

## See the difference

| Light appearance | Dark appearance |
|---|---|
| ![Light appearance](docs/images/02-light.png) | ![Dark appearance](docs/images/03-dark.png) |

| Reversible theme preview | Command palette |
|---|---|
| ![Theme preview](docs/images/04-preview.png) | ![Command palette](docs/images/05-command.png) |

| Typography controls | Local reading backgrounds |
|---|---|
| ![Typography](docs/images/06-type.png) | ![Backgrounds](docs/images/07-background.png) |

*These are feature previews. Check the compatibility section for the tested environment and platform limitations.*

## Free and open source — no paid tier

TAIS Appearance is a **free and open-source project** maintained without charging users.

- Every bundled theme and core appearance feature is free.
- There is no paid edition, membership, activation key, theme lock, or feature lock.
- There are no subscription fees, license fees, donations, or sponsorship payments.
- The plugin contains no payment SDK, checkout flow, analytics tracker, or commercial activation service.
- All users receive the same features.

The project includes code derived from Mica for Zotero and is distributed under the applicable GNU AGPL terms. You may use, study, modify, and redistribute the software within the rights and obligations of the license. Preserve upstream notices and corresponding source.

## Product tour and five-language guides

**[Explore the interactive product tour](https://lipo1024.github.io/tais-appearance/)**

| Language | User guide | Project overview |
|---|---|---|
| 简体中文 | [使用手册](docs/USER_GUIDE.zh-CN.md) | [中文 README](README.zh-CN.md) |
| English | [User guide](docs/USER_GUIDE.en-US.md) | [English README](README.en-US.md) |
| 日本語 | [ユーザーガイド](docs/USER_GUIDE.ja-JP.md) | [日本語 README](README.ja-JP.md) |
| 한국어 | [사용자 가이드](docs/USER_GUIDE.ko-KR.md) | [한국어 README](README.ko-KR.md) |
| Français | [Guide utilisateur](docs/USER_GUIDE.fr-FR.md) | [README français](README.fr-FR.md) |

Automated locale coverage is complete as a draft; native-speaker review is still required. See [internationalization status](docs/I18N-STATUS.md).

[Compatibility matrix](docs/COMPATIBILITY.md) · [Platform adapter architecture](docs/PLATFORM-ADAPTER-ARCHITECTURE.md) · [Localization glossary](docs/LOCALIZATION-GLOSSARY.md)

## Install

**Current public build: [TAIS Appearance 2.4.0 Stable (.xpi)](https://github.com/LIPO1024/tais-appearance/releases/download/v2.4.0/TAIS_Appearance-2.4.0.xpi)** · [Release notes and checksum](https://github.com/LIPO1024/tais-appearance/releases/tag/v2.4.0)

1. Download the XPI.
2. In Zotero, open **Tools → Plugins**.
3. Open the gear menu and choose **Install Plugin From File**.
4. Select the downloaded XPI.

This Stable release is validated for Windows 11 / Zotero 10.0.8 / PDF.js 5.7.0. Export your settings before upgrading a primary profile; other platforms and unlisted Zotero versions are not supported or verified.

[Compatibility matrix and platform roadmap](docs/COMPATIBILITY.md) · [Platform adapter architecture](docs/PLATFORM-ADAPTER-ARCHITECTURE.md)

## Compatibility

| Environment | Status |
|---|---|
| Windows 11 | Primary tested platform |
| Zotero 10.0.8 | Validated target |
| PDF.js 5.7.0 | Validated target |
| macOS / Linux | Not supported by the current Windows DWM material adapter |
| Other Zotero versions | Not yet verified |

Five interface languages do not imply support for five operating systems. Follow this compatibility table and the notes for each release.

## Privacy and security

- Custom backgrounds are processed locally.
- The plugin does not need Zotero cloud credentials.
- It does not intentionally read or upload document contents.
- PDF rendering, selection, and annotations remain under Zotero/PDF.js control.
- No analytics, advertising, payment SDK, or commercial activation service is included.

Zotero plugins can have broad access to Zotero and your computer. Install only builds you trust. Redact local paths, profile names, and other private information before sharing diagnostics.

[Read the project policy](docs/OPEN-SOURCE-POLICY.md) · [Read the contribution guide](CONTRIBUTING.md)

## Contribute

Contributions are welcome:

- [Report a bug or suggest a feature](https://github.com/LIPO1024/tais-appearance/issues)
- [Read the contribution guide](CONTRIBUTING.md)
- [Report a security vulnerability](SECURITY.md)
- [Read the changelog](CHANGELOG.md)

Never attach a Zotero database, private PDF, access token, or unredacted personal data.

## Build from source

Requirements are listed in `requirements-build.txt`.

```powershell
python -m pip install -r requirements-build.txt
python build.py
```

The build checks JavaScript, CSS, XML, and regression suites, then produces an XPI. Public releases still require version, compatibility, and license review.

## License and third-party notices

This project is distributed under the applicable **GNU Affero General Public License v3.0 (AGPL-3.0)** terms and includes modified code derived from [Mica for Zotero](https://github.com/northword/zotero-mica).

- [LICENSE](LICENSE)
- [NOTICE](NOTICE)
- [Third-party notices and corresponding source](docs/THIRD_PARTY_NOTICES.md)

---

**Theatre AI Studio · TAIS Appearance**
[Website](https://lipo1024.github.io/tais-appearance/) · [GitHub](https://github.com/LIPO1024/tais-appearance) · [Issues](https://github.com/LIPO1024/tais-appearance/issues)
