---
layout: post
title: AFFiNE 下一代知识库与协作平台 将规划、整理和创作统一到一个系统中。
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---


# AFFiNE

> **世界上不止有 Notion 和 Miro。**

AFFiNE（读音：/əˈfaɪn/）是一个 **下一代知识库与协作平台**，将 **规划、整理和创作**统一到一个系统中。

特点：

* 隐私优先
* 开源
* 可自定义
* 开箱即用

它被设计为 **Notion 与 Miro 的替代方案**。 ([GitHub][1])

---

# AFFiNE.Pro

## 写作、绘图和规划一次完成

AFFiNE 是一个 **融合型知识工作平台（Hyper-fused workspace）**。

在同一个空间中，你可以：

* 写文档
* 画白板
* 做任务规划
* 管理知识库

Docs、Canvas、Table 等能力被 **深度融合在一起**。 ([GitHub][1])

---

# 什么是 AFFiNE

AFFiNE 是一个 **开源的一体化工作空间（All-in-one workspace）**，同时也是一种用于构建知识系统的 **操作系统级平台**。

它可以用于：

* Wiki
* 知识管理
* 项目规划
* 演示文稿
* 数字资产管理

目标是：

> 构建一个比 Notion 和 Miro 更强大的生产力平台。 ([GitHub][1])

---

# 核心特性

## 1 无限画布（Edgeless Canvas）

AFFiNE 提供一个 **无限画布**，可以在上面放置各种内容块：

* 富文本
* 便签
* Web 嵌入
* 数据表
* 关联页面
* 图形
* 幻灯片

不同类型的内容可以在同一个画布上自由组合。 ([GitHub][1])

---

## 2 AI 助手

AFFiNE 提供 **多模态 AI 助手**，可用于：

* 撰写报告
* 将大纲生成演示文稿
* 文章总结
* 生成思维导图
* 整理任务计划
* 设计原型

AI 可以在 Canvas 中直接参与创作流程。 ([GitHub][1])

---

## 3 Local-First（本地优先）

AFFiNE 强调 **本地优先架构**：

* 数据存储在本地
* 用户完全掌控数据

同时支持：

* 云同步
* 实时协作

适用于团队协作场景。 ([GitHub][1])

---

## 4 实时协作

支持多人实时协作：

* 多设备同步
* 实时编辑
* 团队知识库

基于 CRDT 等技术实现协同编辑。 ([GitHub][2])

---

## 5 自托管（Self-host）

AFFiNE 支持 **自托管部署**：

用户可以：

* 自己运行服务器
* Fork 项目
* 构建自己的版本

未来还将支持：

* 插件系统
* 第三方扩展。 ([GitHub][1])

---

# 设计理念

AFFiNE 的设计受到多个生产力工具启发：

* Notion —— Block 编辑器
* Trello —— 看板系统
* Airtable —— 数据表
* Miro —— 白板协作

这些工具都基于类似的 **原子化内容块（atomic building blocks）**。

AFFiNE 希望把这些能力 **统一到一个平台中**。 ([GitHub][1])

---

# 技术架构

AFFiNE 的核心技术栈包括：

### BlockSuite

协同编辑框架。

### OctoBase

基于 Rust 的本地优先数据库。

### Yjs

CRDT 实时同步框架。

### Electron

桌面应用框架。

### React

前端 UI。

### Rust

用于高性能数据引擎。 ([GitHub][1])

---

# 模板系统

AFFiNE 提供多种模板，例如：

* Vision board
* Lesson plan
* Digital planner
* Reading log
* Cornell Notes

用户也可以贡献自己的模板。 ([GitHub][1])

---

# 开源许可

AFFiNE 提供两个版本：

### Community Edition

* MIT License
* 免费
* 支持自托管

### Enterprise Edition

未来版本，包含：

* SSO
* 企业管理
* 审计功能。 ([GitHub][1])

---

# 项目总结

**AFFiNE 本质是：**

一个 **开源一体化知识工作平台**。

核心特点：

* 文档 + 白板 + 数据表融合
* 无限画布
* Local-first 架构
* AI 助手
* 实时协作
* 支持自托管

定位：

```
Notion + Miro + Obsidian
            ↓
         AFFiNE
```

适合：

* 个人知识管理（PKM）
* 团队协作
* 项目规划
* 创意设计

---

如果你愿意，我可以再给你补充一个 **非常有价值的技术分析**：

我可以帮你拆解 **AFFiNE 的底层架构（很多人没看懂）**：

```
BlockSuite (协同编辑引擎)
        ↓
OctoBase (local-first 数据库)
        ↓
CRDT Sync (Yjs)
        ↓
Workspace Engine
        ↓
Docs / Canvas / Database
```

以及和这些项目的 **架构对比**：

* Notion
* AppFlowy
* Outline
* Logseq
* Obsidian

你会更清楚 **为什么 AFFiNE 最近在 GitHub 很火（6万+ stars）**。

[1]: https://github.com/toeverything/AFFiNE?utm_source=chatgpt.com "GitHub - toeverything/AFFiNE: There can be more than Notion and Miro. AFFiNE(pronounced [ə‘fain]) is a next-gen knowledge base that brings planning, sorting and creating all together. Privacy first, open-source, customizable and ready to use."
[2]: https://github.com/JhinBoard/affine?utm_source=chatgpt.com "GitHub - JhinBoard/affine: There can be more than Notion and Miro. Affine is a next-gen knowledge base that brings planning, sorting and creating all together. Privacy first, open-source, customizable and ready to use."

# 参考资料

* any list
{:toc}