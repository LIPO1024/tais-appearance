# Localization glossary and review workflow

## Product terminology

| Source concept | zh-CN | en-US | ja-JP | ko-KR | fr-FR |
|---|---|---|---|---|---|
| Appearance | 外观 | Appearance | 外観 | 외관 | Apparence |
| Reading surface | 阅读表面 | Reading surface | 読書面 | 읽기 표면 | Surface de lecture |
| Page surround | 页面外围 | Page surround | ページ周辺 | 페이지 주변 영역 | Zone périphérique de la page |
| Paper surface | 纸面 | Paper surface | 紙面 | 종이 표면 | Surface de la page |
| Annotation | 批注 | Annotation | 注釈 | 주석 | Annotation |
| Profile | 个人方案 | Profile | プロファイル | 프로필 | Profil |
| Preview | 预览 | Preview | プレビュー | 미리보기 | Aperçu |
| Restore native appearance | 恢复原生外观 | Restore native appearance | 標準の外観に戻す | 기본 외관 복원 | Restaurer l’apparence native |
| Safe Mode | 安全模式 | Safe Mode | セーフモード | 안전 모드 | Mode sans échec |
| Background image | 背景图片 | Background image | 背景画像 | 배경 이미지 | Image d’arrière-plan |
| Contrast protection | 对比度保护 | Contrast protection | コントラスト保護 | 대비 보호 | Protection du contraste |

## Rules

- Keep the product name exactly **TAIS Appearance** in every language.
- Do not translate Zotero, PDF.js, Glass, Acrylic, Mica, Stage Mist, or Safe Mode when they are product/API identifiers.
- Distinguish the PDF page itself from the surrounding UI surface. Never translate "page surround" as PDF transparency.
- Distinguish a profile from a Zotero collection or library.
- Do not claim a PDF font changes when only annotation/interface typography changes.
- Prefer concise control labels; put procedural explanations in the user guide.
- Keep error messages actionable and preserve technical identifiers.

## Review workflow

1. Every source-string change updates `locale-strings.json`, `source/content/locales/messages.json`, and all five Fluent catalogs.
2. A native reviewer familiar with Zotero checks terminology, grammar, tone, truncation, date/number conventions, and accessibility names.
3. Reviewers test the actual settings UI at 100%, 125%, 150%, and 200% scaling where available.
4. Record reviewer, locale, date, commit, changed keys, and unresolved questions in a locale review log.
5. CI checks key coverage and fallback behavior; CI cannot certify linguistic quality.

Current status: automated coverage exists for all five locales. Native-speaker review is not yet recorded and must not be claimed.
