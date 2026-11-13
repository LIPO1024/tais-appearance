# TAIS Appearance

<p align="center">
  <img src="docs/images/01-cover.png" alt="TAIS Appearance — a calm Glass reading workspace for Zotero" width="900">
</p>

<p align="center">
  <strong>A calmer way to read in Zotero.</strong><br>
  A refined Glass appearance system for focused reading, research, and annotation.
</p>

<p align="center">
  <a href="https://lipo1024.github.io/tais-appearance/"><strong>Explore the live demo</strong></a> ·
  <a href="https://github.com/LIPO1024/tais-appearance/releases/latest"><strong>Download for Zotero</strong></a> ·
  <a href="docs/USER_GUIDE.en-US.md"><strong>Read the user guide</strong></a>
</p>

<p align="center">
  <img alt="12 themes" src="https://img.shields.io/badge/themes-12-64748b">
  <img alt="Languages" src="https://img.shields.io/badge/languages-5-64748b">
  <img alt="License" src="https://img.shields.io/badge/license-AGPL--3.0-blue">
  <img alt="Platform" src="https://img.shields.io/badge/tested-Windows%2011-64748b">
</p>

## What it does

TAIS Appearance gives Zotero a quieter, more coherent visual environment without taking control of the PDF itself. Tune translucent application surfaces, light and dark appearances, annotation typography, and the reading surround — while Zotero/PDF.js continues to render PDF text, selection, and annotations.

**In short:** make the workspace easier to look at during long reading sessions, without turning the document into a visual effect.

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

*These are product feature previews. Check the compatibility section before installing; platform support is not universal.*

## What is included

- **12 Glass presets** — six light and six dark themes across four visual families.
- **Readable typography** — separate controls for Zotero interface text and annotation cards.
- **A tunable reading surface** — adjust the page surround and paper surface independently, with contrast safeguards.
- **Reversible previews** — compare, preview, apply, cancel, undo, and restore.
- **Local backgrounds** — built-in Stage Mist and custom images processed locally.
- **Profiles and recovery** — save appearance setups, import scoped settings, inspect conflicts, and restore native appearance.
- **Five interface languages** — Simplified Chinese, English, Japanese, Korean, and French, with automatic locale selection.

## Try it before you install

**[Open the interactive product tour](https://lipo1024.github.io/tais-appearance/)**

The showcase demonstrates light/dark appearances, the 12 theme palettes, reading-surface controls, and the main feature set. It is designed to run without analytics or external image/font requests.

## Install

**Current public build: [TAIS Appearance 2.3.1 Beta (.xpi)](https://github.com/LIPO1024/tais-appearance/releases/download/v2.3.1/TAIS_Appearance-2.3.1.xpi)** · [Release notes and SHA-256](https://github.com/LIPO1024/tais-appearance/releases/tag/v2.3.1)

1. Download the XPI from the release above.
2. In Zotero, open **Tools → Plugins**.
3. Open the gear menu and choose **Install Plugin From File**.
4. Select the downloaded XPI.

This is a **Beta** build. Test it in a separate Zotero profile first and export your settings before upgrading a primary profile.

### Compatibility

| Environment | Current status |
|---|---|
| Windows 11 | Primary tested platform |
| Zotero 10.0.8 | Validated target |
| PDF.js 5.7.0 | Validated target |
| macOS / Linux | Not supported by the current Windows DWM material adapter |
| Other Zotero versions | Not yet verified |

Do not infer cross-platform support from the five-language interface. Localization and operating-system compatibility are separate.

## Free and open source

The core plugin is free and open source. **All 12 bundled themes and core appearance controls are available to every user.** This project includes code derived from Mica for Zotero and is distributed under the applicable AGPL terms. The project cannot use a payment key to take away rights already granted by that license.

If TAIS Appearance is useful in your daily work, you can optionally support its maintenance with a one-time contribution. Support is voluntary; it does not unlock themes, remove a feature restriction, or change AGPL rights.

**Funding setup is not yet confirmed.** The repository has a GitHub Sponsors funding configuration, but creator onboarding and payout eligibility still need to be completed and verified. Until the sponsor page accepts contributions, please treat this as a planned support channel, not an active checkout. Alipay merchant collection is also not configured.

- [Funding and licensing policy](docs/MONETIZATION.md)
- [Payment setup notes (简体中文)](docs/PAYMENT-SETUP.zh-CN.md)
- [GitHub Sponsors](https://github.com/sponsors/LIPO1024) — availability depends on account onboarding

## Documentation in five languages

| Language | User guide | Project overview |
|---|---|---|
| 简体中文 | [使用手册](docs/USER_GUIDE.zh-CN.md) | [中文项目说明](README.zh-CN.md) |
| English | [User guide](docs/USER_GUIDE.en-US.md) | [README](README.en-US.md) |
| 日本語 | [ユーザーガイド](docs/USER_GUIDE.ja-JP.md) | [プロジェクト紹介](README.ja-JP.md) |
| 한국어 | [사용자 가이드](docs/USER_GUIDE.ko-KR.md) | [프로젝트 소개](README.ko-KR.md) |
| Français | [Guide utilisateur](docs/USER_GUIDE.fr-FR.md) | [Présentation](README.fr-FR.md) |

Translation coverage is complete as a **draft**, not as a native-speaker-certified translation. See [internationalization status](docs/I18N-STATUS.md). Native review is still required before claiming professionally reviewed localization.

## Zotero add-on directories

A submission has been opened with the community-maintained [Zotero Add-ons Scraper](https://github.com/syt2/zotero-addons-scraper), which feeds the [Add-on Market for Zotero](https://github.com/syt2/zotero-addons). Maintainer review is pending; this is **not** an official Zotero directory listing.

[Track community submission PR #315](https://github.com/syt2/zotero-addons-scraper/pull/315)

Zotero's own documentation currently does not provide a general official add-on directory. Community directories are independently maintained and have their own review processes.

## Privacy and safety

- Custom backgrounds are processed locally.
- The plugin does not need Zotero cloud credentials.
- It does not intentionally read or upload document contents.
- PDF rendering and document data remain under Zotero/PDF.js control.
- No payment SDK, payment credential, activation server, or theme-locking system is included.

Zotero plugins can have broad access to Zotero and your computer. Install only software you trust, and review the source and release notes.

## Build from source

Requirements are listed in `requirements-build.txt`.

```powershell
python -m pip install -r requirements-build.txt
python build.py
```

The build checks JavaScript, CSS, XML, and regression suites, then produces a reproducible XPI. Public release builds require reviewed HTTPS metadata and explicit release approval.

## License and third-party notices

This derivative is distributed under the applicable **GNU Affero General Public License v3.0 (AGPL-3.0)** terms. It includes modified code derived from [Mica for Zotero](https://github.com/northword/zotero-mica). Preserve the upstream notices and corresponding-source obligations.

- [LICENSE](LICENSE)
- [NOTICE](NOTICE)
- [Third-party notices and corresponding source](docs/THIRD_PARTY_NOTICES.md)
- [Internationalization status](docs/I18N-STATUS.md)

---

<p align="center">
  <strong>Theatre AI Studio · TAIS Appearance</strong><br>
  <a href="https://lipo1024.github.io/tais-appearance/">Website</a> ·
  <a href="https://github.com/LIPO1024/tais-appearance">GitHub</a> ·
  <a href="https://github.com/LIPO1024/tais-appearance/issues">Issues</a> ·
  <a href="docs/MONETIZATION.md">Support the project</a>
</p>
