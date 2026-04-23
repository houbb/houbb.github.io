---
layout: post 
title: World Monitor 实时全球情报仪表盘—— 一个由 AI 驱动的新闻聚合、地缘政治监测与基础设施跟踪系统，统一在一个态势感知界面中呈现。
date: 2026-04-23 21:01:55 +0800
categories: [Ai]
tags: [monitor, ai]
published: true
---

# World Monitor

**实时全球情报仪表盘** —— 一个由 AI 驱动的新闻聚合、地缘政治监测与基础设施跟踪系统，统一在一个态势感知界面中呈现。

## 功能说明

* **500+ 精选新闻源**，覆盖 15 个类别，通过 AI 聚合生成简报
* **双地图引擎** —— 3D 地球（globe.gl）与 WebGL 平面地图（deck.gl），提供 45 个数据图层
* **跨流关联分析** —— 军事、经济、灾害与冲突升级信号的融合分析
* **国家情报指数（Country Intelligence Index）** —— 基于 12 类信号的综合风险评分
* **金融雷达** —— 覆盖 92 个证券交易所、商品、加密资产，以及 7 维市场综合信号
* **本地 AI** —— 基于 Ollama 运行，无需 API Key
* **5 个站点变体** —— 单一代码库支持（world / tech / finance / commodity / happy）
* **原生桌面应用** —— 基于 Tauri 2，支持 macOS、Windows、Linux
* **21 种语言支持** —— 包含本地语言新闻源与 RTL（从右到左）支持

完整功能列表、架构、数据源及算法详见 **[文档](https://www.worldmonitor.app/docs/documentation)**。

---

## 快速开始

```bash
git clone https://github.com/koala73/worldmonitor.git
cd worldmonitor
npm install
npm run dev
```

打开 [localhost:5173](http://localhost:5173)。基础运行无需环境变量。

针对不同变体开发：

```bash
npm run dev:tech       # tech.worldmonitor.app
npm run dev:finance    # finance.worldmonitor.app
npm run dev:commodity  # commodity.worldmonitor.app
npm run dev:happy      # happy.worldmonitor.app
```

部署方式（Vercel、Docker、静态部署）请参考 **[自托管指南](https://www.worldmonitor.app/docs/getting-started)**。

---

## 技术栈

| 分类            | 技术                                                           |
| ------------- | ------------------------------------------------------------ |
| **前端**        | 原生 TypeScript、Vite、globe.gl + Three.js、deck.gl + MapLibre GL |
| **桌面端**       | Tauri 2（Rust）+ Node.js sidecar                               |
| **AI / 机器学习** | Ollama / Groq / OpenRouter、Transformers.js（浏览器侧）             |
| **API 协议**    | Protocol Buffers（92 个 proto，22 个服务）、sebuf HTTP 注解            |
| **部署**        | Vercel Edge Functions（60+）、Railway relay、Tauri、PWA           |
| **缓存**        | Redis（Upstash）、三级缓存、CDN、Service Worker                       |

完整技术细节见 **[架构文档](https://www.worldmonitor.app/docs/architecture)**。

---

## 航班数据

航班数据由 [Wingbits](https://wingbits.com?utm_source=worldmonitor&utm_medium=referral&utm_campaign=worldmonitor) 提供，这是一个先进的 ADS-B 航班数据解决方案。

---

## 数据来源

WorldMonitor 聚合了 65+ 外部数据源，涵盖地缘政治、金融、能源、气候、航空、网络安全、军事、基础设施与新闻情报。

完整数据源列表请查看：[数据源目录](https://www.worldmonitor.app/docs/data-sources)。

---

## 参与贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 获取指南。

```bash
npm run typecheck        # 类型检查
npm run build:full       # 生产构建
```

---

## 许可证

**AGPL-3.0** 适用于非商业用途。**商业用途需获取商业许可证**。

| 使用场景               | 是否允许                 |
| ------------------ | -------------------- |
| 个人 / 研究 / 教育       | ✔ 允许                 |
| 自托管（非商业）           | ✔ 允许（需署名）            |
| Fork 并修改（非商业）      | ✔ 允许（需按 AGPL-3.0 开源） |
| 商业使用 / SaaS / 品牌重用 | ✘ 需商业授权              |

完整条款见 [LICENSE](LICENSE)。商业授权请联系维护者。

Copyright (C) 2024-2026 Elie Habib. 保留所有权利。

---

## 作者

**Elie Habib** — [GitHub](https://github.com/koala73)

## 贡献者

<a href="https://github.com/koala73/worldmonitor/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=koala73/worldmonitor" />
</a>

---

## 安全致谢

感谢以下研究人员负责任地披露安全问题：

* **Cody Richard** —— 披露了三项安全问题，包括 IPC 命令暴露、渲染进程与 sidecar 信任边界分析，以及 fetch 补丁中的凭证注入架构（2026）

请参考 [安全策略](./SECURITY.md) 获取漏洞披露规范。

---

<p align="center">
  <a href="https://worldmonitor.app">worldmonitor.app</a> &nbsp;·&nbsp;
  <a href="https://www.worldmonitor.app/docs/documentation">docs.worldmonitor.app</a> &nbsp;·&nbsp;
  <a href="https://finance.worldmonitor.app">finance.worldmonitor.app</a> &nbsp;·&nbsp;
  <a href="https://commodity.worldmonitor.app">commodity.worldmonitor.app</a>
</p>

# 参考资料

* any list
{:toc}