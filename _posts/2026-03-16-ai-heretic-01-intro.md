---
layout: post
title: Heretic 用于语言模型的全自动审查移除工具（censorship removal） 
date: 2026-03-16 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# Heretic

**用于语言模型的全自动审查移除工具（censorship removal）。**

---

## 项目简介

Heretic 是一个 **Python 工具**，用于自动移除基于 **Transformer 的语言模型**中的审查机制或“安全对齐（safety alignment）”。
它可以让模型对原本会被拒绝的提示（prompt）进行回答。 ([GitGenius][1])

该工具的特点是：

* **完全自动化**
* 不需要手动微调
* 不需要复杂的后训练流程

用户只需要运行一个命令，即可对模型进行“去审查（decensor）”处理。 ([GitGenius][1])

---

# 核心原理

Heretic 的核心技术是：

**Directional Ablation（方向消融）**
也称为 **Abliteration**。

该方法通过修改模型内部结构，使模型减少对某些提示的拒绝行为。 ([GitGenius][1])

其技术流程包括：

1. 识别模型中导致 **拒绝回答（refusal）** 的向量方向
2. 在 Transformer 层中 **消除这些方向的影响**
3. 调整权重，使模型不再触发拒绝机制

这样可以在 **不重新训练模型** 的情况下：

* 移除安全限制
* 保留模型的推理能力

---

# 自动参数优化

Heretic 使用 **TPE（Tree-structured Parzen Estimator）参数优化算法**，
由 **Optuna** 驱动。

优化目标包括：

* **最小化拒绝率**
* **最小化 KL divergence（与原模型的差异）**

这样可以：

* 最大限度保留原始模型能力
* 同时减少审查行为。 ([GitGenius][1])

---

# 支持的模型

Heretic 支持多种模型类型，例如：

* Dense LLM
* 多模态模型
* Mixture-of-Experts（MoE）模型

该工具可用于许多流行模型的去审查处理。 ([GitGenius][1])

---

# 使用方式

Heretic 提供：

* **命令行接口（CLI）**
* **Python 接口**

用户只需要指定模型名称即可运行去审查流程。 ([SourceForge][2])

---

# 研究功能

Heretic 还提供可选的研究工具，例如：

* 残差向量（residual vectors）可视化
* 模型内部几何结构分析
* 模型行为解释性研究

这些功能可帮助研究人员理解：

* 模型内部表示
* 对齐机制的影响。 ([GitGenius][1])

---

# 项目特点

* 自动移除 LLM 审查
* 无需重新训练
* 支持多种模型
* CLI 使用方式简单
* 包含研究分析工具
* 可重复实验

---

# 许可证

GNU Affero General Public License (AGPL)

---

如果你在研究 **LLM / RAG / Agent 系统**，这个项目其实很关键，因为它揭示了一件重要的事情：

> **RLHF / Safety Alignment 在技术上并不是强安全边界，而更像是一种行为约束。**

很多研究人员使用这类工具来做：

* AI **红队测试（Red Teaming）**
* **安全对抗研究**
* **模型可解释性研究**。 ([LinkedIn][3])

# 参考资料

* any list
{:toc}