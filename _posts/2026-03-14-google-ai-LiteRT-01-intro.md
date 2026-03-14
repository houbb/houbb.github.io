---
layout: post
title: LiteRT 是 Google 的设备端（on-device）机器学习框架
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, agent, sh]
published: true
---

# LiteRT

**LiteRT 是 Google 的设备端（on-device）机器学习框架**，用于在 **边缘设备（Edge Platform）** 上部署高性能 ML 与生成式 AI。

它提供：

* 高效的模型转换（conversion）
* 推理运行时（runtime）
* 模型优化（optimization）

LiteRT 是 **TensorFlow Lite 的继任者（successor）**。 ([GitHub][1])

---

# 项目说明

LiteRT 延续了 TensorFlow Lite 的传统，作为 **可信且高性能的设备端 AI 推理运行时**。

LiteRT 提供：

* 先进的 **GPU / NPU 加速**
* 更强的 ML 与生成式 AI 推理性能

使 **在设备端运行机器学习模型**变得更加容易。 ([GitHub][1])

---

# 新特性

## 新的 Compiled Model API

新的 API 用于简化开发流程：

* 自动选择硬件加速器
* 真正的异步执行
* 高效的 I/O buffer 管理

主要能力：

* 自动选择 accelerator（无需手动 delegate）
* 异步执行提高整体运行速度
* 更简单的 NPU 运行时管理
* 更高效的 I/O buffer 处理

---

## 统一的 NPU 加速

LiteRT 提供统一接口访问多个芯片厂商的 NPU：

开发者可以获得 **一致的开发体验**。

LiteRT NPU 已从 **Early Access** 转为 **正式可用**。

---

## GPU 高性能推理

LiteRT 提供先进的 GPU 加速能力。

新的 **buffer 互操作机制**可以：

* 实现 zero-copy
* 减少不同 GPU buffer 类型之间的延迟

---

## 更强的生成式 AI 推理能力

LiteRT 提供更简单的方式来集成：

* LLM
* Diffusion
* 其他 GenAI 模型

并提供优化后的推理性能。

---

# 支持的平台

LiteRT 设计为 **跨平台部署**，支持多种硬件环境。

| 平台      | CPU | GPU             | NPU                          |
| ------- | --- | --------------- | ---------------------------- |
| Android | ✅   | OpenCL / WebGPU | Tensor / Qualcomm / MediaTek |
| iOS     | ✅   | Metal           | ANE                          |
| Linux   | ✅   | WebGPU          | N/A                          |
| macOS   | ✅   | WebGPU / Metal  | ANE                          |
| Windows | ✅   | WebGPU          | Intel                        |
| Web     | ✅   | WebGPU          | 即将支持                         |
| IoT     | ✅   | WebGPU          | Broadcom / Raspberry Pi      |

---

# 模型支持与性能

（该部分内容将在未来发布）

---

# 安装

完整安装指南请查看 **Get Started 文档**。

---

## 从源码构建

LiteRT 可以通过 Docker 构建：

步骤：

1. 启动 Docker daemon
2. 在 `docker_build/` 目录运行脚本

```bash
build_with_docker.sh
```

该脚本会：

* 创建 Linux Docker 镜像
* 构建 Linux 与 Android 版本的 LiteRT

更多构建方式可以参考：

* CMake 构建
* Bazel 构建

---

# 开发路径指南

LiteRT 提供不同开发路径，适用于不同需求。

---

## 1️⃣ 已经有 PyTorch 模型

目标：将 PyTorch 模型部署到 LiteRT。

方法：

**经典模型**

1. 使用 **AI Edge Torch Converter**
2. 将模型转换为 `.tflite` 格式
3. 使用 **AI Edge Quantizer** 进行优化
4. 使用 LiteRT runtime 部署

---

**LLM 模型**

使用 **Torch Generative API**

将 PyTorch LLM 转换为 **Apache 格式**，然后通过 LiteRT 部署。

---

## 2️⃣ 初次尝试设备端 ML

目标：在移动应用中运行预训练模型。

方法：

### 初学者

通过 Android Studio 示例构建：

**实时图像分割应用**

支持：

* CPU
* GPU
* NPU 推理

---

### 经验开发者

1. 阅读 Get Started 文档
2. 在 Kaggle 下载 `.tflite` 模型
3. 集成到 Android 或 iOS 应用

---

## 3️⃣ 最大化性能

目标：让模型在设备端运行得更快。

建议：

* 使用 LiteRT API
* 启用硬件加速

对于生成式 AI：

* 使用 **LiteRT-LM**

---

## 4️⃣ 生成式 AI

目标：

在移动设备运行：

* LLM
* Diffusion 模型

推荐：

使用 **LiteRT-LM**。

重点包括：

* 模型量化（quantization）
* 大模型优化

---

# Roadmap

LiteRT 的目标是成为 **最佳设备端 ML 推理运行时**。

未来发展方向包括：

### 硬件加速

扩大对以下硬件支持：

* NPU
* GPU
* 其他 AI accelerator

---

### 生成式 AI 优化

为下一代 **GenAI 模型**提供更强优化能力。

---

### 开发者工具

改进：

* 调试工具
* 性能分析工具
* 模型优化工具

---

### 平台支持

增强对主流平台的支持，并探索新的平台。

---

# 贡献

欢迎社区贡献。

请查看：

```
CONTRIBUTING.md
```

了解如何参与项目开发。

---

# 获取帮助

可以通过以下方式获取支持：

**GitHub Issues**

* 报告 Bug
* 提交功能请求

**GitHub Discussions**

* 提问
* 社区讨论

---

# 相关项目

LiteRT 属于 **Google AI Edge 生态系统**的一部分。

相关项目包括：

* LiteRT Samples
  LiteRT 示例应用

* AI Edge Torch Converter
  将 PyTorch 模型转换为 LiteRT 格式

* Torch Generative API
  将 LLM 转换为 LiteRT 可运行格式

* LiteRT-LM
  在边缘设备运行 LLM 的框架

* XNNPACK
  为 ARM / x86 / WebAssembly 提供高性能 CPU 推理

* MediaPipe
  构建跨平台 ML 应用的框架

---

# 行为准则

该项目致力于营造开放、友好的社区环境。

请阅读 **Code of Conduct** 了解社区行为规范。

---

# 许可证

LiteRT 使用：

**Apache License 2.0**。 ([GitHub][1])

---

✅ **一句话总结**

**LiteRT = Google 新一代设备端 AI 推理运行时（TensorFlow Lite 的继任者）**

目标是让 **LLM / ML / 多模态模型能够高性能运行在手机、PC、IoT 等边缘设备上**。 ([GitHub][1])

# 参考资料

* any list
{:toc}