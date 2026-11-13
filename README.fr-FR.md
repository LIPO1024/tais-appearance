# TAIS Appearance

**Une extension Glass pour l’apparence et l’environnement de lecture de Zotero.** Développée par Theatre AI Studio (TAIS).

TAIS Appearance propose 12 thèmes Glass, les modes clair et sombre, des réglages typographiques distincts pour l’interface Zotero et les annotations, le contrôle des surfaces de lecture, des arrière-plans locaux, des aperçus réversibles, des profils, des diagnostics et un mode de sécurité.

## Langues
L’interface prend en charge le chinois simplifié, l’anglais, le japonais, le coréen et le français. Elle peut également suivre automatiquement la langue de Zotero. Consultez docs/I18N-STATUS.md pour connaître la couverture et l’état de révision des traductions.

## Compatibilité
Cible validée : Windows 11, Zotero 10.0.8 et PDF.js 5.7.0. L’adaptateur natif de matériau de fenêtre utilise Windows DWM. Cette version est donc réservée à Windows ; macOS et Linux ne sont pas pris en charge.

## Installation
Téléchargez le XPI depuis GitHub Releases. Dans Zotero, ouvrez Outils → Extensions → menu engrenage → Installer depuis un fichier. En cas de problème, utilisez Récupération et diagnostics dans TAIS Appearance pour restaurer l’apparence native de Zotero.

## Compilation
Installez les dépendances de requirements-build.txt puis exécutez python build.py. La compilation vérifie JavaScript, CSS, XML et les tests de régression.

## Confidentialité et licence
Les images d’arrière-plan sont traitées localement. Le rendu du texte PDF, la sélection, les annotations et les données bibliographiques restent gérés par Zotero/PDF.js. Le code dérivé est distribué selon les conditions AGPL. Consultez LICENSE, NOTICE et docs/THIRD_PARTY_NOTICES.md.

## Soutenir le projet
Les contributions volontaires via GitHub Sponsors soutiennent la maintenance et la documentation. Elles ne limitent pas les droits accordés par l’AGPL. Les 12 thèmes restent accessibles à tous.

## User guides / 使用手册
- [简体中文](docs/USER_GUIDE.zh-CN.md)
- [English](docs/USER_GUIDE.en-US.md)
- [日本語](docs/USER_GUIDE.ja-JP.md)
- [한국어](docs/USER_GUIDE.ko-KR.md)
- [Français](docs/USER_GUIDE.fr-FR.md)

Product tour / 产品展示: https://lipo1024.github.io/tais-appearance/

