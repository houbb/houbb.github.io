---
layout: post
title: MoneyPrinter V2
date: 2026-03-23 21:01:55 +0800
categories: [AI]
tags: [ai]
published: true
---

# MoneyPrinter V2

> **有想法？** 让我们来实现它 — [联系我们](https://forms.gle/bFGvhbYpDJZeoVDRA)
>
> ♥︎ **赞助商**：最佳 AI 聊天应用：[shiori.ai](https://www.shiori.ai)

---

> 𝕏 另外，在 X 上关注我：[@DevBySami](https://x.com/DevBySami)。

[![madewithlove](https://img.shields.io/badge/made_with-%E2%9D%A4-red?style=for-the-badge&labelColor=orange)](https://github.com/FujiwaraChoki/MoneyPrinterV2)

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Donate-brightgreen?logo=buymeacoffee)](https://www.buymeacoffee.com/fujicodes)
[![GitHub license](https://img.shields.io/github/license/FujiwaraChoki/MoneyPrinterV2?style=for-the-badge)](https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/FujiwaraChoki/MoneyPrinterV2?style=for-the-badge)](https://github.com/FujiwaraChoki/MoneyPrinterV2/issues)
[![GitHub stars](https://img.shields.io/github/stars/FujiwaraChoki/MoneyPrinterV2?style=for-the-badge)](https://github.com/FujiwaraChoki/MoneyPrinterV2/stargazers)
[![Discord](https://img.shields.io/discord/1134848537704804432?style=for-the-badge)](https://dsc.gg/fuji-community)

一个自动化在线赚钱流程的应用程序。
MPV2（MoneyPrinter 第二版），顾名思义，是 MoneyPrinter 项目的第二个版本。它是对原始项目的完全重写，重点在于提供更广泛的功能和更模块化的架构。

> **注意：** MPV2 需要 Python 3.12 才能有效运行。
> 在此观看 YouTube 视频：[链接](https://youtu.be/wAZ_ZSuIqfk)

## 功能特性

- [x] Twitter 机器人（支持 CRON 任务 => `调度器`）
- [x] YouTube Shorts 自动化工具（支持 CRON 任务 => `调度器`）
- [x] 联盟营销（亚马逊 + Twitter）
- [x] 寻找本地商家并进行冷 outreach

## 版本

MoneyPrinter 拥有社区为社区开发的多种语言版本。以下是一些已知版本：

- 中文版：[MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo)

如果您想提交您自己的 MoneyPrinter 版本或分支，请提交一个 issue，描述您对该分支所做的更改。

## 安装

> ⚠️ 如果您计划通过电子邮件联系爬取到的商家，请先安装 [Go 编程语言](https://golang.org/)。

```bash
git clone https://github.com/FujiwaraChoki/MoneyPrinterV2.git

cd MoneyPrinterV2
# 复制示例配置文件，并在 config.json 中填写相应值
cp config.example.json config.json

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境 - Windows
.\venv\Scripts\activate

# 激活虚拟环境 - Unix
source venv/bin/activate

# 安装依赖项
pip install -r requirements.txt
```

## 使用方法

```bash
# 运行应用程序
python src/main.py
```

## 文档

所有相关文档可在此处找到：[链接](docs/)。

## 脚本

为方便使用，`scripts` 目录中提供了一些脚本，可用于直接访问 MPV2 的核心功能，无需用户交互。

所有脚本都需要从项目的根目录运行，例如：`bash scripts/upload_video.sh`。

## 贡献指南

请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解我们的行为准则以及提交拉取请求的流程。查看 [docs/Roadmap.md](docs/Roadmap.md) 了解需要实现的功能列表。

## 行为准则

请阅读 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) 了解我们的行为准则详情以及提交拉取请求的流程。

## 许可证

MoneyPrinterV2 采用 `Affero 通用公共许可证 v3.0` 进行许可。有关更多信息，请参阅 [LICENSE](LICENSE)。

## 致谢

- [KittenTTS](https://github.com/KittenML/KittenTTS)
- [gpt4free](https://github.com/xtekky/gpt4free)

## 免责声明

本项目仅用于教育目的。作者不对所提供信息的任何滥用行为负责。本网站上的所有信息均基于善意发布，仅供参考。

作者不对信息的完整性、可靠性和准确性做出任何保证。

您根据本网站（FujiwaraChoki/MoneyPrinterV2）上的信息采取的任何行动，风险自负。作者不对与使用我们网站相关的任何损失和/或损害承担责任。

# 参考资料

* any list
{:toc}