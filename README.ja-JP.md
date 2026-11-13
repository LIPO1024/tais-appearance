# TAIS Appearance

**Zotero のための Glass 外観・読書環境拡張。** Theatre AI Studio（TAIS）が開発しています。

12種類のGlassテーマ、ライト／ダーク表示、Zotero画面と注釈の文字設定、読書ページ周辺の透明度、ローカル背景、可逆プレビュー、設定プロファイル、診断、安全モードを提供します。

## 言語
簡体字中国語、英語、日本語、韓国語、フランス語に対応します。Zoteroの言語に従う自動選択もあります。翻訳の範囲とレビュー状況は docs/I18N-STATUS.md を参照してください。

## 対応環境
検証対象は Windows 11、Zotero 10.0.8、PDF.js 5.7.0 です。ネイティブなウィンドウ材質に Windows DWM を使用するため、現在のリリースは Windows 専用です。macOS と Linux は未対応です。

## インストール
GitHub Releases から XPI をダウンロードし、Zotero の「ツール → プラグイン → 歯車 → ファイルからプラグインをインストール」で選択します。問題が起きた場合は、TAIS Appearance の「復元と診断」から Zotero 標準の外観に戻せます。

## ビルド
requirements-build.txt の依存関係をインストールし、python build.py を実行します。ビルドでは JavaScript、CSS、XML、回帰テストを検証します。

## プライバシーとライセンス
背景画像はローカルで処理されます。PDFの文字描画、選択、注釈、文献データは Zotero/PDF.js が管理します。派生コードは AGPL の条件に従って配布されます。LICENSE、NOTICE、docs/THIRD_PARTY_NOTICES.md を確認してください。

## 支援
GitHub Sponsors などの任意の支援は保守とドキュメント整備に使われます。AGPLで認められた権利を制限しません。12種類のテーマはすべてのユーザーが利用できます。
