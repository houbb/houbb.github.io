---
layout: post 
title:  SimpleMem 高效的 LLM 智能体终身记忆系统 — Text & Multimodal
date: 2026-04-09 21:01:55 +0800
categories: [AI]
tags: [ai, llm, memory]
published: true
---

# Memos

<img align="right" height="96px" src="https://raw.githubusercontent.com/usememos/.github/refs/heads/main/assets/logo-rounded.png" alt="Memos" />

开源、自托管的笔记工具，专为快速记录而生。原生支持 Markdown，轻量级，完全由你掌控。

[![官网](https://img.shields.io/badge/🏠-usememos.com-blue?style=flat-square)](https://usememos.com)
[![在线演示](https://img.shields.io/badge/✨-试用Demo-orange?style=flat-square)](https://demo.usememos.com/)
[![文档](https://img.shields.io/badge/📚-文档-green?style=flat-square)](https://usememos.com/docs)
[![Discord](https://img.shields.io/badge/💬-Discord-5865f2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/tfPJa4UmAv)
[![Docker 拉取量](https://img.shields.io/docker/pulls/neosmemo/memos?style=flat-square&logo=docker)](https://hub.docker.com/r/neosmemo/memos)

<img src="https://raw.githubusercontent.com/usememos/.github/refs/heads/main/assets/demo.png" alt="Memos 演示截图" height="512" />

### 💎 特别赞助

[**Warp** —— 为速度和协作而生的 AI 驱动终端](https://go.warp.dev/memos)

<a href="https://go.warp.dev/memos" target="_blank" rel="noopener">
  <img src="https://raw.githubusercontent.com/warpdotdev/brand-assets/refs/heads/main/Logos/Warp-Wordmark-Black.png" alt="Warp - 为速度和协作而生的 AI 驱动终端" height="44" />
</a>

<p></p>

[**TestMu AI** - 全球首个全栈 Agentic AI 质量工程平台](https://www.testmuai.com/?utm_medium=sponsor&utm_source=memos)

<a href="https://www.testmuai.com/?utm_medium=sponsor&utm_source=memos" target="_blank" rel="noopener">
  <img src="https://usememos.com/sponsors/testmu.svg" alt="TestMu AI" height="36" />
</a>

<p></p>

[**SSD Nodes** - 为自托管用户提供经济实惠的 VPS 托管服务](https://ssdnodes.com/?utm_source=memos&utm_medium=sponsor)

<a href="https://ssdnodes.com/?utm_source=memos&utm_medium=sponsor" target="_blank" rel="noopener">
  <img src="https://usememos.com/sponsors/ssd-nodes.svg" alt="SSD Nodes" height="72" />
</a>

## 功能特性

- **即时记录** — 以时间线为核心的 UI。打开、书写、完成 —— 无需浏览文件夹。
- **完全数据归属** — 在你的基础设施上自托管。笔记以 Markdown 格式存储，始终可迁移。零遥测。
- **极致简单** — 单个 Go 二进制文件，约 20MB 的 Docker 镜像。一条命令即可部署，支持 SQLite、MySQL 或 PostgreSQL。
- **开放且可扩展** — MIT 许可，提供完整的 REST 和 gRPC API 用于集成。

## 快速开始

### Docker（推荐）

```bash
docker run -d \
  --name memos \
  -p 5230:5230 \
  -v ~/.memos:/var/opt/memos \
  neosmemo/memos:stable
```

打开 `http://localhost:5230` 即可开始记录！

### 原生二进制

```bash
curl -fsSL https://raw.githubusercontent.com/usememos/memos/main/scripts/install.sh | sh
```

### 试用在线演示

还不打算安装？先试试我们的[在线演示](https://demo.usememos.com/)吧！

### 其他安装方式

- **Docker Compose** - 推荐用于生产环境部署
- **预编译二进制文件** - 支持 Linux、macOS 和 Windows
- **Kubernetes** - 提供 Helm charts 和清单文件
- **从源码构建** - 用于开发和定制

详细说明请参阅我们的[安装指南](https://usememos.com/docs/deploy)。

## 贡献

欢迎各类贡献 —— 错误报告、功能建议、拉取请求、文档和翻译。

- [报告 Bug](https://github.com/usememos/memos/issues/new?template=bug_report.md)
- [建议新功能](https://github.com/usememos/memos/issues/new?template=feature_request.md)
- [提交拉取请求](https://github.com/usememos/memos/pulls)
- [改进文档](https://github.com/usememos/dotcom)
- [帮助翻译](https://github.com/usememos/memos/tree/main/web/src/locales)

## 赞助商

喜欢 Memos？[在 GitHub 上赞助我们](https://github.com/sponsors/usememos)，帮助项目持续成长！

## Star 历史

[![Star 历史图表](https://api.star-history.com/svg?repos=usememos/memos&type=Date)](https://star-history.com/#usememos/memos&Date)

## 许可证

Memos 是开源软件，基于 [MIT 许可证](LICENSE) 发布。有关数据处理的详细信息，请参阅我们的[隐私政策](https://usememos.com/privacy)。

---

**[网站](https://usememos.com)** • **[文档](https://usememos.com/docs)** • **[演示](https://demo.usememos.com/)** • **[Discord](https://discord.gg/tfPJa4UmAv)** • **[X/Twitter](https://x.com/usememos)**


# 参考资料

* any list
{:toc}