---
layout: post 
title: Maigret 仅通过用户名就能收集一个人的详细档案，它会在海量网站上检查账户，并从网页中搜集所有可用信息。无需任何 API 密钥。
date: 2026-04-30 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---

# Maigret

**Maigret** 仅通过用户名就能收集一个人的详细档案，它会在海量网站上检查账户，并从网页中搜集所有可用信息。无需任何 API 密钥。

## 目录

## 一分钟上手

请确保您已安装 Python 3.10 或更高版本。

```bash
pip install maigret
maigret 你的用户名
```

不想安装？试试 [Telegram 机器人](https://t.me/maigret_search_bot) 或者 [云 Shell](#云shells)。

想要 Web 界面？请参阅 [如何启动它](#web-界面)。

另请参阅：[快速入门](https://maigret.readthedocs.io/en/latest/quick-start.html)。

## 主要功能

- 支持 3000 多个站点（[查看完整列表](https://github.com/soxoj/maigret/blob/main/sites.md)）。默认运行会检查流量排名最高的 500 个站点；使用 `-a` 参数可扫描全部站点，或使用 `--tags` 按类别/国家筛选。
- 可嵌入 Python 项目 — 导入 `maigret` 并以编程方式运行搜索（请参阅 [库用法](https://maigret.readthedocs.io/en/latest/library-usage.html)）。
- [提取](https://github.com/soxoj/socid_extractor) 个人资料页面和站点 API 中所有关于账户所有者的可用信息，包括指向其他账户的链接。
- 利用发现的用户名和其他 ID 进行递归搜索。
- 支持按标签（站点类别、国家）筛选。
- 检测并部分绕过封禁、审查和验证码。
- 每次运行时从 GitHub 获取[自动更新的站点数据库](https://maigret.readthedocs.io/en/latest/settings.html#database-auto-update)（每 24 小时一次），离线时则回退到内置数据库。
- 支持 Tor 和 I2P 网站；能够检查域名。
- 配备 [Web 界面](#web-界面)，可用于以图谱形式浏览结果，并通过单一页面下载各种格式的报告。

完整功能列表请参阅 [功能文档](https://maigret.readthedocs.io/en/latest/features.html)。

### 谁在使用

基于 Maigret 构建的专业 OSINT 和社交媒体分析工具：

<a href="https://github.com/SocialLinks-IO/sociallinks-api"><img height="60" alt="Social Links API" src="https://github.com/user-attachments/assets/789747b2-d7a0-4d4e-8868-ffc4427df660"></a>
<a href="https://sociallinks.io/products/sl-crimewall"><img height="60" alt="Social Links Crimewall" src="https://github.com/user-attachments/assets/0b18f06c-2f38-477b-b946-1be1a632a9d1"></a>
<a href="https://usersearch.ai/"><img height="60" alt="UserSearch" src="https://github.com/user-attachments/assets/66daa213-cf7d-40cf-9267-42f97cf77580"></a>

## 演示

### 视频

<a href="https://asciinema.org/a/Ao0y7N0TTxpS0pisoprQJdylZ">
  <img src="https://asciinema.org/a/Ao0y7N0TTxpS0pisoprQJdylZ.svg" alt="asciicast" width="600">
</a>

### 报告

[PDF 报告](https://raw.githubusercontent.com/soxoj/maigret/main/static/report_alexaimephotographycars.pdf), [HTML 报告](https://htmlpreview.github.io/?https://raw.githubusercontent.com/soxoj/maigret/main/static/report_alexaimephotographycars.html)

![HTML 报告截图](https://raw.githubusercontent.com/soxoj/maigret/main/static/report_alexaimephotography_html_screenshot.png)

![XMind 8 报告截图](https://raw.githubusercontent.com/soxoj/maigret/main/static/report_alexaimephotography_xmind_screenshot.png)

[完整的控制台输出](https://raw.githubusercontent.com/soxoj/maigret/main/static/recursive_search.md)

## 安装

已完成[一分钟上手](#一分钟上手)中的步骤？那就已经准备就绪。下面是其他安装方式。

不想安装任何东西？请使用 [Telegram 机器人](https://t.me/maigret_search_bot)。

### Windows

从 [发布页面](https://github.com/soxoj/maigret/releases) 下载独立的 EXE 文件。视频教程：https://youtu.be/qIgwTZOmMmM。

<a id="云shells"></a>
### 云 Shell

通过云 Shell 或 Jupyter notebooks 在浏览器中运行 Maigret：

<a href="https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/soxoj/maigret&tutorial=cloudshell-tutorial.md"><img src="https://user-images.githubusercontent.com/27065646/92304704-8d146d80-ef80-11ea-8c29-0deaabb1c702.png" alt="在 Cloud Shell 中打开" height="50"></a>
<a href="https://repl.it/github/soxoj/maigret"><img src="https://replit.com/badge/github/soxoj/maigret" alt="在 Replit 上运行" height="50"></a>

<a href="https://colab.research.google.com/gist/soxoj/879b51bc3b2f8b695abb054090645000/maigret-collab.ipynb"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="在 Colab 中打开" height="45"></a>
<a href="https://mybinder.org/v2/gist/soxoj/9d65c2f4d3bec5dd25949197ea73cf3a/HEAD"><img src="https://mybinder.org/badge_logo.svg" alt="在 Binder 中打开" height="45"></a>

### 本地安装（pip）

```bash
# 从 pypi 安装
pip3 install maigret

# 使用
maigret 用户名
```

### 从源码安装

```bash
# 或者克隆并手动安装
git clone https://github.com/soxoj/maigret && cd maigret

# 构建并安装
pip3 install .

# 使用
maigret 用户名
```

### Docker

我们发布了两种镜像版本：

- `soxoj/maigret:latest` — CLI 模式（默认）
- `soxoj/maigret:web` — 自动启动 [Web 界面](#web-界面)

```bash
# 官方镜像（命令行界面）
docker pull soxoj/maigret

# CLI 用法
docker run -v /mydir:/app/reports soxoj/maigret:latest 用户名 --html

# Web 界面（打开 http://localhost:5000）
docker run -p 5000:5000 soxoj/maigret:web

# 在自定义端口上启动 Web 界面
docker run -e PORT=8080 -p 8080:8080 soxoj/maigret:web

# 手动构建
docker build -t maigret .                  # CLI 镜像（默认目标）
docker build --target web -t maigret-web . # Web 界面镜像
```

### 故障排除

构建出错？请参阅 [故障排除指南](https://maigret.readthedocs.io/en/latest/installation.html#troubleshooting)。

## 使用方法

### 示例

```bash
# 生成 HTML、PDF 和 Xmind8 报告
maigret user --html
maigret user --pdf
maigret user --xmind # 输出与 xmind 2022+ 不兼容

# 机器可读导出格式
maigret user --json ndjson   # 换行分隔 JSON（也支持：--json simple）
maigret user --csv
maigret user --txt
maigret user --graph         # 交互式 D3 图谱 (HTML)

# 在带有 photo 和 dating 标签的站点上搜索
maigret user --tags photo,dating

# 在带有 us 标签的站点上搜索
maigret user --tags us

# 在所有可用站点上搜索三个用户名
maigret user1 user2 user3 -a
```

运行 `maigret --help` 查看所有选项。文档：[命令行选项](https://maigret.readthedocs.io/en/latest/command-line-options.html), [更多示例](https://maigret.readthedocs.io/en/latest/usage-examples.html)。遇到 403 或超时？请参阅 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)。

<a id="web-界面"></a>
### Web 界面

Maigret 内置了一个 Web 用户界面，其中包含结果图谱和可下载的报告。

<details>
<summary>Web 界面截图</summary>

![Web 界面：启动方式](https://raw.githubusercontent.com/soxoj/maigret/main/static/web_interface_screenshot_start.png)

![Web 界面：结果展示](https://raw.githubusercontent.com/soxoj/maigret/main/static/web_interface_screenshot.png)

</details>

```console
maigret --web 5000
```

打开 http://127.0.0.1:5000 ，输入用户名，即可查看结果。

### Python 库

**Maigret 可以嵌入到您自己的 Python 项目中。** 命令行界面只是一个薄薄的封装，底层是一个可以直接调用的异步函数——您可以构建自定义流程，将结果输入到自己的工具中，或者在更大的 OSINT 工作流中运行它。

请参阅完整的 [库用法指南](https://maigret.readthedocs.io/en/latest/library-usage.html)，其中包含一个完整的示例、异步模式以及如何按标签筛选站点。

### 有用的 CLI 标志

- `--parse URL` — 解析个人资料页面，提取 ID/用户名，并利用它们启动递归搜索。
- `--permute` — 根据两个或多个输入生成可能的用户名变体（例如 `john doe` → `johndoe`, `j.doe`, …），然后对所有变体进行搜索。
- `--self-check [--auto-disable]` — 对照活跃站点验证 `usernameClaimed` / `usernameUnclaimed` 对，供维护者审计数据库时使用。

### Tor / I2P / 代理

Maigret 可以通过代理、Tor 或 I2P 路由检查——对于 `.onion` / `.i2p` 站点以及绕过屏蔽数据中心 IP 的 Web 应用防火墙（WAF）非常有用。

```bash
# 任何 HTTP/SOCKS 代理
maigret user --proxy socks5://127.0.0.1:1080

# Tor（默认网关 socks5://127.0.0.1:9050）
maigret user --tor-proxy socks5://127.0.0.1:9050

# I2P（默认网关 http://127.0.0.1:4444）
maigret user --i2p-proxy http://127.0.0.1:4444
```

在运行命令之前，请先启动您的 Tor / I2P 守护进程——Maigret 不管理这些网关。

## 贡献

请手动在 `data.json` 中精确添加或修正新站点（不要使用 `json.load`/`json.dump`），然后运行 `./utils/update_site_data.py` 重新生成 `sites.md` 和数据库元数据，并提交拉取请求。有关更多详情，请参阅 [贡献指南](https://github.com/soxoj/maigret/blob/main/CONTRIBUTING.md) 和 [开发文档](https://maigret.readthedocs.io/en/latest/development.html)。发布历史：[CHANGELOG.md](CHANGELOG.md)。

## 商业使用

开源的 Maigret 采用 MIT 许可证，可免费用于商业用途而不受限制——但站点检查会随时间失效，需要持续维护。

对于严肃的商业用途——需要**每日更新的站点数据库**或**用户名检查 API**——请联系：📧 [maigret@soxoj.com](mailto:maigret@soxoj.com)

- 私有站点数据库 — 5000+ 个站点，每日更新（与公共开源数据库分开维护）
- 用户名检查 API — 将 Maigret 集成到您的产品中

## 关于

### 免责声明

**仅用于教育和合法目的。** 您有责任遵守您所在司法管辖区的所有适用法律（GDPR、CCPA 等）。作者对任何滥用行为不承担任何责任。

### 反馈

[提交 issue](https://github.com/soxoj/maigret/issues) · [GitHub 讨论](https://github.com/soxoj/maigret/discussions) · [Telegram](https://t.me/soxoj)

### SOWEL 分类

所使用的 OSINT 技术：
- [SOTL-2.2. 在其他平台搜索账户](https://sowel.soxoj.com/other-platform-accounts)
- [SOTL-6.1. 检查登录信息重用以寻找其他账户](https://sowel.soxoj.com/logins-reuse)
- [SOTL-6.2. 检查昵称重用以寻找其他账户](https://sowel.soxoj.com/nicknames-reuse)

### 许可证

MIT © [Maigret](https://github.com/soxoj/maigret)

# 参考资料

* any list
{:toc}