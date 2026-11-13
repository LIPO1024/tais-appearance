# TAIS Appearance

<p align="center">
  <img src="docs/images/01-cover.png" alt="TAIS Appearance — Zotero Glass 阅读工作空间" width="900">
</p>

<p align="center">
  <strong>让 Zotero 拥有更安静、清晰、统一的阅读工作空间。</strong><br>
  面向长时间阅读、文献研究与批注整理的 Glass 外观系统，由 Theatre AI Studio 开发。
</p>

<p align="center">
  <a href="https://lipo1024.github.io/tais-appearance/"><strong>在线体验</strong></a> ·
  <a href="https://github.com/LIPO1024/tais-appearance/releases/latest"><strong>免费下载</strong></a> ·
  <a href="docs/USER_GUIDE.zh-CN.md"><strong>阅读使用手册</strong></a>
</p>

![12套 Glass 主题与 Zotero 阅读环境](docs/images/01-cover.png)

## 它解决什么问题？

TAIS Appearance 为 Zotero 提供统一的视觉系统：半透明界面材质、浅色与深色外观、清晰的批注排版，以及可调节的阅读环境。它处理的是 Zotero 周围的界面，不接管 PDF 正文的绘制。

**核心原则：界面可以改变，文献内容必须保持清晰、可靠。** PDF 文字、嵌入字体、原生选择和批注仍由 Zotero/PDF.js 管理。

## 主要功能

- **12 套 Glass 主题**：六套浅色、六套深色，分为四个视觉系列。
- **独立文字控制**：分别调整 Zotero 界面文字与批注卡片排版。
- **阅读表面控制**：页面外围与纸面分别调节，并提供对比度保护。
- **可逆主题预览**：比较、预览、应用、取消、撤销和恢复。
- **本地背景图片**：内置 Stage Mist，支持自定义图片，本地处理。
- **个人方案与恢复**：保存外观配置、分区导入导出、检查冲突及安全模式。
- **五种界面语言**：简体中文、英语、日语、韩语、法语，并支持跟随 Zotero 语言。

## 先看实际效果

| 浅色外观 | 深色外观 |
|---|---|
| ![浅色模式](docs/images/02-light.png) | ![深色模式](docs/images/03-dark.png) |

| 主题预览 | 快捷命令面板 |
|---|---|
| ![主题预览](docs/images/04-preview.png) | ![命令面板](docs/images/05-command.png) |

| 字体与批注 | 阅读背景 |
|---|---|
| ![字体控制](docs/images/06-type.png) | ![阅读背景](docs/images/07-background.png) |

*以上为功能展示素材。真实兼容范围与已验证环境见下文。*

## 永久免费与开源

TAIS Appearance 是一个**免费开源项目**，维护者不向用户收费。

- 所有主题、外观控制和核心功能均免费开放。
- 不设付费版、会员、激活码、主题锁或功能锁。
- 不收取订阅费、授权费或捐赠款。
- 插件不包含支付 SDK、付款入口或商业激活服务。
- 不因是否付费而区别对待用户。

项目包含基于 Mica for Zotero 修改的代码，依照适用的 GNU AGPL 条款分发。用户可以在许可证允许的范围内使用、研究、修改和再分发。请同时保留上游版权声明及对应源代码。

## 在线体验与五语手册

**[打开交互式产品展示网站](https://lipo1024.github.io/tais-appearance/)**

| 语言 | 使用手册 | 项目说明 |
|---|---|---|
| 简体中文 | [使用手册](docs/USER_GUIDE.zh-CN.md) | [中文 README](README.zh-CN.md) |
| English | [User guide](docs/USER_GUIDE.en-US.md) | [English README](README.en-US.md) |
| 日本語 | [ユーザーガイド](docs/USER_GUIDE.ja-JP.md) | [日本語 README](README.ja-JP.md) |
| 한국어 | [사용자 가이드](docs/USER_GUIDE.ko-KR.md) | [한국어 README](README.ko-KR.md) |
| Français | [Guide utilisateur](docs/USER_GUIDE.fr-FR.md) | [README français](README.fr-FR.md) |

翻译词条已完成自动化覆盖检查，但仍需母语使用者审校。详见 [国际化状态](docs/I18N-STATUS.md)。

## 安装

**当前公开版本：** [TAIS Appearance 2.3.2 Beta（XPI）](https://github.com/LIPO1024/tais-appearance/releases/download/v2.3.2/TAIS_Appearance-2.3.2.xpi) · [版本说明与校验值](https://github.com/LIPO1024/tais-appearance/releases/tag/v2.3.2)

1. 下载 XPI 安装包。
2. 在 Zotero 中打开“工具 → 插件”。
3. 点击齿轮菜单，选择“从文件安装插件”。
4. 选择下载的 XPI。

当前为 Beta 版本。建议先在独立 Zotero 配置中测试，并在升级主配置前导出设置、保留旧版安装包。

## 兼容性

| 环境 | 状态 |
|---|---|
| Windows 11 | 主要测试平台 |
| Zotero 10.0.8 | 已验证目标 |
| PDF.js 5.7.0 | 已验证目标 |
| macOS / Linux | 当前 Windows DWM 材质适配器不支持 |
| 其他 Zotero 版本 | 尚未验证 |

五种界面语言不代表五种操作系统均受支持。请以此兼容性表和具体 Release 说明为准。

## 隐私与安全

- 自定义背景图片在本地处理。
- 插件不需要 Zotero 云账户凭据。
- 不主动读取或上传文献正文。
- PDF 渲染、选择和批注由 Zotero/PDF.js 管理。
- 不包含分析追踪、广告、支付 SDK 或商业激活服务。

Zotero 插件具有较高的本地访问权限，请只安装可信来源的版本。提交诊断信息前请遮盖本地路径、个人方案名称及其他隐私内容。

[查看开源项目政策](docs/OPEN-SOURCE-POLICY.md) · [查看贡献指南](CONTRIBUTING.md)

## 参与项目

欢迎通过以下方式参与：

- [提交 Bug 或功能建议](https://github.com/LIPO1024/tais-appearance/issues)
- [阅读贡献指南](CONTRIBUTING.md)
- [查看安全问题报告方式](SECURITY.md)
- [查看版本更新记录](CHANGELOG.md)

请勿提交 Zotero 数据库、私人 PDF、访问令牌或未脱敏的个人资料。

## 从源码构建

需要的依赖见 `requirements-build.txt`。

```powershell
python -m pip install -r requirements-build.txt
python build.py
```

构建过程会检查 JavaScript、CSS、XML 和回归测试，并生成 XPI。公开发行还需经过版本、兼容性和许可审查。

## 许可与第三方声明

本项目依照适用的 **GNU Affero General Public License v3.0（AGPL-3.0）** 条款分发，包含基于 [Mica for Zotero](https://github.com/northword/zotero-mica) 修改的代码。

- [LICENSE](LICENSE)
- [NOTICE](NOTICE)
- [第三方声明与对应源代码](docs/THIRD_PARTY_NOTICES.md)

---

**Theatre AI Studio · TAIS Appearance**
[产品网站](https://lipo1024.github.io/tais-appearance/) · [GitHub 源码](https://github.com/LIPO1024/tais-appearance) · [问题反馈](https://github.com/LIPO1024/tais-appearance/issues)
