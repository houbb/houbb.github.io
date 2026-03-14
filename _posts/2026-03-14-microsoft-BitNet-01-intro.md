---
layout: post
title: microsoft/BitNet-01-入门介绍
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# BitNet

**1-bit 大语言模型的官方推理框架**

---

## bitnet.cpp

`bitnet.cpp` 是用于 **1-bit 大语言模型（例如 BitNet b1.58）** 的官方推理框架。

它提供了一组**高度优化的计算内核（kernels）**，支持在 **CPU 和 GPU 上对 1.58-bit 模型进行高速且无损的推理**。（未来将支持 NPU）。 ([GitHub][1])

`bitnet.cpp` 的第一个版本主要支持 **CPU 推理**。

性能表现：

* **ARM CPU**

  * 推理速度提升：**1.37x – 5.07x**
  * 能耗降低：**55.4% – 70.0%**

* **x86 CPU**

  * 推理速度提升：**2.37x – 6.17x**
  * 能耗降低：**71.9% – 82.2%**

此外：

* 可以在 **单个 CPU 上运行 100B 参数的 BitNet b1.58 模型**
* 推理速度约 **5–7 tokens/s（接近人类阅读速度）**

这显著增强了在 **本地设备上运行 LLM** 的可能性。 ([GitHub][1])

最新优化：

* 引入 **并行 kernel 实现**
* 支持 **可配置 tiling**
* 支持 **embedding quantization**

在不同硬件和负载下，相比最初实现可获得 **额外 1.15x – 2.1x 的加速**。 ([GitHub][1])

---

# Demo

在 **Apple M2** 上运行 **BitNet b1.58 3B 模型** 的演示。

---

# 最新更新（What's New）

* **2026-01-15**
  BitNet CPU 推理优化

* **2025-05-20**
  BitNet 官方 GPU 推理 kernel

* **2025-04-14**
  BitNet 官方 **2B 参数模型** 发布（Hugging Face）

* **2025-02-18**
  发布论文
  **bitnet.cpp: Efficient Edge Inference for Ternary LLMs**

* **2024-11-08**
  BitNet a4.8：为 1-bit LLM 引入 **4-bit activation**

* **2024-10-21**
  论文：
  **1-bit AI Infra: Fast and Lossless BitNet b1.58 Inference on CPUs**

* **2024-10-17**
  发布 **bitnet.cpp 1.0**

* **2024-03-21**
  文章：
  **The Era of 1-bit LLMs: Training Tips / Code / FAQ**

* **2024-02-27**
  论文：
  **The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits**

* **2023-10-17**
  论文：
  **BitNet: Scaling 1-bit Transformers for Large Language Models**

---

# 致谢（Acknowledgements）

本项目基于 **llama.cpp** 框架构建。

感谢所有作者对开源社区的贡献。

此外：

* `bitnet.cpp` 的 kernel 构建在 **T-MAC 的 Lookup Table 方法**之上。
* 如果需要推理 **除三值模型之外的低比特 LLM**，建议使用 **T-MAC**。

---

# 官方模型（Official Models）

| 模型                 | 参数规模 | CPU | Kernel |
| ------------------ | ---- | --- | ------ |
| BitNet-b1.58-2B-4T | 2.4B | x86 | ✅      |
|                    |      | ARM | ✅      |

---

# 支持的模型（Supported Models）

为了演示 `bitnet.cpp` 的推理能力，项目使用 **HuggingFace 上现有的 1-bit LLM**。

希望 `bitnet.cpp` 的发布可以推动：

* 更大规模模型
* 更多训练 token
* 更大规模 1-bit LLM 研究

支持的模型包括：

| 模型                         | 参数规模 | CPU |
| -------------------------- | ---- | --- |
| bitnet_b1_58-large         | 0.7B |     |
| bitnet_b1_58-3B            | 3.3B |     |
| Llama3-8B-1.58-100B-tokens | 8B   |     |

---

# 安装（Installation）

## 环境要求

* Python ≥ 3.9
* CMake ≥ 3.22
* Clang ≥ 18
* Conda（强烈推荐）

Windows 用户需要安装：

* Visual Studio 2022
* Desktop development with C++
* CMake Tools
* Git for Windows
* Clang Compiler
* LLVM Toolset 支持

Ubuntu / Debian 用户：

```
bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
```

---

# 从源码构建（Build from source）

### 1 克隆仓库

```
git clone --recursive https://github.com/microsoft/BitNet.git
cd BitNet
```

---

### 2 安装依赖

推荐创建 conda 环境：

```
conda create -n bitnet-cpp python=3.9
conda activate bitnet-cpp
pip install -r requirements.txt
```

---

### 3 构建项目

下载模型：

```
huggingface-cli download microsoft/BitNet-b1.58-2B-4T-gguf \
--local-dir models/BitNet-b1.58-2B-4T
```

运行环境初始化：

```
python setup_env.py -md models/BitNet-b1.58-2B-4T -q i2_s
```

参数说明：

| 参数             | 说明                  |
| -------------- | ------------------- |
| --hf-repo      | 使用的 HuggingFace 模型  |
| --model-dir    | 模型存储路径              |
| --log-dir      | 日志路径                |
| --quant-type   | 量化类型                |
| --quant-embd   | embedding 使用 f16 量化 |
| --use-pretuned | 使用预调优 kernel        |

---

### 运行 benchmark

```
python utils/e2e_benchmark.py \
-m models/dummy-bitnet-125m.tl1.gguf \
-p 512 \
-n 128
```

参数说明：

* `-m` 模型路径
* `-p` prompt token 数
* `-n` 生成 token 数

---

# 从 `.safetensors` 转换模型

下载原始模型：

```
huggingface-cli download microsoft/bitnet-b1.58-2B-4T-bf16 \
--local-dir ./models/bitnet-b1.58-2B-4T-bf16
```

转换为 `gguf`：

```
python ./utils/convert-helper-bitnet.py \
./models/bitnet-b1.58-2B-4T-bf16
```

---

# FAQ（常见问题）

### Q1

构建 `llama.cpp` 时出现 `std::chrono` 错误？

原因：

* 最近版本的 `llama.cpp` 引入的 bug

解决：

* 参考 GitHub issue 中对应 commit 修复。

---

### Q2

如何在 Windows 的 conda 环境中使用 clang 构建？

运行：

```
clang -v
```

如果出现：

```
'clang' is not recognized
```

说明 Visual Studio 环境未初始化。

Command Prompt：

```
"C:\Program Files\Microsoft Visual Studio\2022\Professional\Common7\Tools\VsDevCmd.bat"
```

PowerShell：

```
Import-Module "...VisualStudio.DevShell.dll"
Enter-VsDevShell ...
```

---

# 一句话总结 BitNet

**BitNet 是微软提出的一种 1-bit LLM 推理框架，使得大型语言模型可以在 CPU 上高效运行，从而大幅降低算力和能耗成本。** ([BitNet][2])

# 参考资料

* any list
{:toc}