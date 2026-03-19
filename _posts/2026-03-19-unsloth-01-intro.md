---
layout: post
title: Unsloth Studio（BETA）通过统一的本地界面运行和训练 AI 模型
date: 2026-03-19 21:01:55 +0800
categories: [AI]
tags: [ai]
published: true
---

# Unsloth

通过统一的本地界面运行和训练 AI 模型。

Unsloth Studio（BETA）允许你在 Windows、Linux 和 macOS 上运行和训练文本、[音频](https://unsloth.ai/docs/basics/text-to-speech-tts-fine-tuning)、[向量嵌入](https://unsloth.ai/docs/new/embedding-finetuning)、[视觉](https://unsloth.ai/docs/basics/vision-fine-tuning)模型。

---

## ⭐ 功能特性

Unsloth 为推理和训练提供了多个核心能力：

### 推理（Inference）

* **搜索 + 下载 + 运行模型**，支持 GGUF、LoRA 适配器、safetensors
* **导出模型**：[保存或导出](https://unsloth.ai/docs/new/studio/export)为 GGUF、16-bit safetensors 等格式
* **工具调用**：支持[自愈式工具调用](https://unsloth.ai/docs/new/studio/chat#auto-healing-tool-calling)以及网页搜索
* **[代码执行](https://unsloth.ai/docs/new/studio/chat#code-execution)**：允许 LLM 执行代码、处理数据并验证结果，从而提高回答准确性
* [自动调优推理参数](https://unsloth.ai/docs/new/studio/chat#auto-parameter-tuning)，并支持自定义聊天模板
* 支持上传图片、音频、PDF、代码、DOCX 等多种文件进行对话

### 训练（Training）

* 支持训练 **500+ 模型**，最高可达 **2 倍速度提升**，并减少 **最高 70% 显存占用**，且不损失精度
* 支持完整微调（full fine-tuning）、预训练、4-bit、16-bit、FP8 训练
* **可观测性（Observability）**：实时监控训练过程，跟踪 loss、GPU 使用情况，并支持自定义图表
* **数据配方（Data Recipes）**：[自动构建数据集](https://unsloth.ai/docs/new/studio/data-recipe)，支持 **PDF、CSV、DOCX** 等，并可通过可视化节点流程编辑数据
* **强化学习（RL）**：高效的[强化学习库](https://unsloth.ai/docs/get-started/reinforcement-learning-rl-guide)，在 GRPO、[FP8](https://unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/fp8-reinforcement-learning) 等场景下可减少 **80% 显存**
* 支持[多 GPU](https://unsloth.ai/docs/basics/multi-gpu-training-with-unsloth)训练，并将在未来持续优化

---

## ⚡ 快速开始

Unsloth 有两种使用方式：

* **Unsloth Studio（Web UI）**
* **Unsloth Core（代码方式）**

两者依赖环境不同。

---

### Unsloth Studio（Web UI）

Unsloth Studio（BETA）支持 **Windows、Linux、WSL 和 macOS**

* **CPU：**仅支持**聊天推理**
* **NVIDIA：**支持 RTX 30/40/50、Blackwell、DGX Spark、Station 等训练
* **macOS：**目前仅支持聊天；**MLX 训练即将推出**
* **AMD：**支持聊天；训练需使用 Unsloth Core（Studio 即将支持）
* **即将支持：**Apple MLX、AMD、Intel 训练
* **多 GPU：**已支持，未来将有重大升级

---

#### MacOS、Linux 或 WSL 安装（一次性）：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv unsloth_studio --python 3.13
source unsloth_studio/bin/activate
uv pip install unsloth --torch-backend=auto
unsloth studio setup
unsloth studio -H 0.0.0.0 -p 8888
```

之后每次启动：

```bash
source unsloth_studio/bin/activate
unsloth studio -H 0.0.0.0 -p 8888
```

---

#### Windows PowerShell（一次性）：

```bash
winget install -e --id Python.Python.3.13
winget install --id=astral-sh.uv  -e
uv venv unsloth_studio --python 3.13
.\unsloth_studio\Scripts\activate
uv pip install unsloth --torch-backend=auto
unsloth studio setup
unsloth studio -H 0.0.0.0 -p 8888
```

之后每次启动：

```bash
.\unsloth_studio\Scripts\activate
unsloth studio -H 0.0.0.0 -p 8888
```

---

使用官方 Docker 镜像 `unsloth/unsloth`。参考 [Docker 指南](https://unsloth.ai/docs/get-started/install/docker)。

---

#### Nightly 安装 - MacOS、Linux 或 WSL（一次性）：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
git clone --filter=blob:none https://github.com/unslothai/unsloth.git unsloth_studio
cd unsloth_studio
uv venv --python 3.13
source .venv/bin/activate
uv pip install -e . --torch-backend=auto
unsloth studio setup
unsloth studio -H 0.0.0.0 -p 8888
```

之后每次启动：

```bash
cd unsloth_studio
source .venv/bin/activate
unsloth studio -H 0.0.0.0 -p 8888
```

---

#### Nightly 安装 - Windows PowerShell（一次性）：

```bash
winget install -e --id Python.Python.3.13
winget install --id=astral-sh.uv  -e
git clone --filter=blob:none https://github.com/unslothai/unsloth.git unsloth_studio
cd unsloth_studio
uv venv --python 3.13
.\.venv\Scripts\activate
uv pip install -e . --torch-backend=auto
unsloth studio setup
unsloth studio -H 0.0.0.0 -p 8888
```

之后每次启动：

```bash
cd unsloth_studio
.\.venv\Scripts\activate
unsloth studio -H 0.0.0.0 -p 8888
```

---

### Unsloth Core（代码方式）

#### Linux、WSL

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv venv unsloth_env --python 3.13
source unsloth_env/bin/activate
uv pip install unsloth --torch-backend=auto
```

#### Windows PowerShell

```bash
winget install -e --id Python.Python.3.13
winget install --id=astral-sh.uv  -e
uv venv unsloth_env --python 3.13
.\unsloth_env\Scripts\activate
uv pip install unsloth --torch-backend=auto
```

对于 Windows，`pip install unsloth` 仅在已安装 PyTorch 时可用。参考 [Windows 安装指南](https://unsloth.ai/docs/get-started/install/windows-installation)。

可以与 Unsloth Studio 使用相同的 Docker 镜像。

---

#### AMD、Intel

对于 RTX 50x、B200、6000 系列 GPU：

```bash
uv pip install unsloth --torch-backend=auto
```

参考：

* [Blackwell 指南](https://unsloth.ai/docs/blog/fine-tuning-llms-with-blackwell-rtx-50-series-and-unsloth)
* [DGX Spark 指南](https://unsloth.ai/docs/blog/fine-tuning-llms-with-nvidia-dgx-spark-and-unsloth)

在 **AMD** 和 **Intel** GPU 上安装，请参考：

* [AMD 指南](https://unsloth.ai/docs/get-started/install/amd)
* [Intel 指南](https://unsloth.ai/docs/get-started/install/intel)

---

## ✨ 免费 Notebook

使用我们的 Notebook 免费训练模型。参考 [指南](https://unsloth.ai/docs/get-started/fine-tuning-llms-guide)。添加数据集、运行，然后部署模型。

| 模型                           | 免费 Notebook | 性能      | 内存使用   |
| ---------------------------- | ----------- | ------- | ------ |
| **Qwen3.5 (4B)**             | ▶️ 免费开始     | 1.5 倍更快 | 减少 60% |
| **gpt-oss (20B)**            | ▶️ 免费开始     | 2 倍更快   | 减少 70% |
| **gpt-oss (20B): GRPO**      | ▶️ 免费开始     | 2 倍更快   | 减少 80% |
| **Qwen3: Advanced GRPO**     | ▶️ 免费开始     | 2 倍更快   | 减少 50% |
| **Gemma 3 (4B) Vision**      | ▶️ 免费开始     | 1.7 倍更快 | 减少 60% |
| **embeddinggemma (300M)**    | ▶️ 免费开始     | 2 倍更快   | 减少 20% |
| **Mistral Ministral 3 (3B)** | ▶️ 免费开始     | 1.5 倍更快 | 减少 60% |
| **Llama 3.1 (8B) Alpaca**    | ▶️ 免费开始     | 2 倍更快   | 减少 70% |
| **Llama 3.2 Conversational** | ▶️ 免费开始     | 2 倍更快   | 减少 70% |
| **Orpheus-TTS (3B)**         | ▶️ 免费开始     | 1.5 倍更快 | 减少 50% |

* 查看全部 Notebook：

  * Kaggle
  * GRPO
  * TTS
  * embedding
  * Vision
* 查看全部模型与 Notebook
* 查看完整文档

---

## 🦥 Unsloth 最新动态

* **Unsloth Studio 发布**：用于运行和训练 LLM 的 Web UI
* **Qwen3.5 支持**
* **MoE 模型训练提速 12 倍**
* **Embedding 微调提速 1.8–3.3 倍**
* **长上下文 RL（7 倍）**
* **Triton Kernel 优化**
* **500K 上下文训练**
* **FP8 与视觉 RL**
* **gpt-oss 支持**

---

## 🔗 链接与资源

| 类型          | 链接           |
| ----------- | ------------ |
| Reddit 社区   | 加入社区         |
| 文档          | 官方文档         |
| Twitter (X) | 关注我们         |
| 安装          | Pip & Docker |
| 模型          | 模型目录         |
| 博客          | 官方博客         |

---

## 📌 引用

你可以这样引用 Unsloth：

```bibtex
@software{unsloth,
  author = {Daniel Han, Michael Han and Unsloth team},
  title = {Unsloth},
  url = {https://github.com/unslothai/unsloth},
  year = {2023}
}
```

如果你使用 🦥Unsloth 训练了模型，可以使用这个贴纸！

---

## 📄 许可证

Unsloth 使用双许可证模式：Apache 2.0 + AGPL-3.0。

* 核心包：**Apache 2.0**
* 可选组件（如 Studio UI）：**AGPL-3.0**

该结构既支持持续开发，也保持开源生态发展。

---

## 🙏 致谢

* llama.cpp 库（用于运行和保存模型）
* Hugging Face 及其 transformers、TRL
* PyTorch 和 Torch AO 团队
* 所有贡献者和用户



# 参考资料

* any list
{:toc}