---
layout: post 
title: supertone-inc/supertonic：极速、端侧、多语种 TTS —— 基于 ONNX 原生运行
date: 2026-05-17 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---

# GitHub - supertone-inc/supertonic：极速、端侧、多语种 TTS —— 基于 ONNX 原生运行

## Supertonic —— 极速、端侧、精准 TTS

**Supertonic** 是一个极速的端侧多语种文语转换（TTS）系统，专为低开销的本地推理而设计。

它由 ONNX Runtime 驱动，完全运行在你的设备上——无需云端、无需 API 调用、无隐私顾虑。

### ✨ 亮点

* ⚡ **极速如飞** —— 低延迟、实时合成，覆盖桌面、浏览器、移动和边缘设备——速度快到能在不到一秒内将整个网页转为音频
* 🌐 **31 语种支持** —— 支持 31 种语言的直接文本合成，也可通过 `lang="na"` 让 Supertonic 以语言无关方式处理输入文本，无需单独的语言适配器
* 🧠 **9900 万参数开放权重模型** —— 紧凑的全开放权重模型，大小仅为 0.7B–2B 级开放 TTS 系统的几分之一，下载更小、冷启动更快、内存占用更低
* 📱 **边缘设备就绪** —— 在桌面、移动、浏览器以及 Raspberry Pi 或电子阅读器等资源受限硬件上本地运行，零网络依赖、完全隐私、无需 GPU
* 🎵 **44.1kHz 高品质音频** —— 直接输出工作室级 44.1kHz 16 位 WAV 格式，无需任何外部上采样器即可用于生产回放
* 🎭 **表达标签** —— 10 种内联标签（如 `[laugh]`、`[whisper]`、`[sigh]`）为合成语音带来自然的人类细微差别，无需提示工程或参考音频
* 🔧 **多运行时 SDK** —— 通过 ONNX Runtime 提供覆盖 Python、Node.js、浏览器（WebGPU）、Java、C++、C#、Go、Swift、iOS、Rust 和 Flutter 的即用示例

### 支持的语言（31 种）

阿拉伯语 (`ar`)、保加利亚语 (`bg`)、克罗地亚语 (`hr`)、捷克语 (`cs`)、丹麦语 (`da`)、荷兰语 (`nl`)、英语 (`en`)、爱沙尼亚语 (`et`)、芬兰语 (`fi`)、法语 (`fr`)、德语 (`de`)、希腊语 (`el`)、印地语 (`hi`)、匈牙利语 (`hu`)、印度尼西亚语 (`id`)、意大利语 (`it`)、日语 (`ja`)、韩语 (`ko`)、拉脱维亚语 (`lv`)、立陶宛语 (`lt`)、波兰语 (`pl`)、葡萄牙语 (`pt`)、罗马尼亚语 (`ro`)、俄语 (`ru`)、斯洛伐克语 (`sk`)、斯洛文尼亚语 (`sl`)、西班牙语 (`es`)、瑞典语 (`sv`)、土耳其语 (`tr`)、乌克兰语 (`uk`)、越南语 (`vi`)

> **不确定你的文本是什么语言？** 传入 `lang="na"`，Supertonic 将以语言无关的方式处理输入，无需显式语言标签。

### 更新动态

* **2026.04.29** —— **Supertonic 3** 发布，支持 **31 种语言**，改进了朗读准确率，减少了重复/跳跃错误，并提供了与 v2 兼容的公共 ONNX 资源。[演示](https://huggingface.co/spaces/Supertone/supertonic-3) | [模型](https://huggingface.co/Supertone/supertonic-3)
* **2026.01.22** —— **[语音构建器](https://supertonic.supertone.ai/voice_builder)现已上线！** 将你的声音转化为可部署的端侧 TTS 并永久拥有。
* **2026.01.06** —— **Supertonic 2** 发布，支持 5 种语言。v2 代码路径保留在 [`release/supertonic-2`](https://github.com/supertone-inc/supertonic/tree/release/supertonic-2) 分支。
* **2025.12.10** —— 新增 `supertonic` PyPI 包！通过 `pip install supertonic` 安装。详情访问 [supertonic-py 文档](https://supertone-inc.github.io/supertonic-py)。
* **2025.12.10** —— 新增 [6 种语音风格](https://huggingface.co/Supertone/supertonic/tree/b10dbaf18b316159be75b34d24f740008fddd381)（M3, M4, M5, F3, F4, F5）。详见[语音](https://supertone-inc.github.io/supertonic-py/voices/)。
* **2025.12.08** —— 通过 [OnnxSlim](https://github.com/inisis/OnnxSlim) 优化的 ONNX 模型现已在 [Hugging Face Models](https://huggingface.co/Supertone/supertonic) 上可用。
* **2025.11.24** —— 新增 Flutter SDK 支持，兼容 macOS。

---

## 快速开始

安装 Python SDK 并立即生成语音。首次运行时，Supertonic 会自动从 Hugging Face 下载模型资源。

```bash
pip install supertonic
```

### Python

```python
from supertonic import TTS

# 首次运行会自动从 Hugging Face 下载模型
tts = TTS(auto_download=True)

style = tts.get_voice_style(voice_name="M1")
text = "Supertonic is a lightning fast, on-device TTS system."
wav, duration = tts.synthesize(
    text=text,
    lang="en",          # 语言代码（例如 "en", "ko", 或语言无关的 "na"）
    voice_style=style,  # 语音风格对象
    total_steps=8,      # 质量：5（低）到 12（高），默认 8（中）
    speed=1.05,         # 速度：0.7（慢）到 2.0（快）
)

# wav: numpy 数组，形状为 (1, num_samples)，数据类型为 np.float32，采样率 44100 Hz
# duration: numpy 数组，形状为 (1,)，包含生成音频的时长（秒）

tts.save_audio(wav, "output.wav")
# import soundfile as sf
# sf.write("output.wav", wav.squeeze(), 44100)

print(f"Generated {duration[0]:.2f}s of audio")
```

## 入门指南

首先，克隆仓库：

```bash
git clone https://github.com/supertone-inc/supertonic.git
cd supertonic
```

### 前置条件

在运行示例之前，请下载 ONNX 模型和预设语音，并将其放入 `assets` 目录：

> **注意：** Hugging Face 仓库使用 Git LFS。请在克隆或拉取大型模型文件前确保 Git LFS 已安装并初始化。
>
> * macOS: `brew install git-lfs && git lfs install`
> * 通用: 访问 `https://git-lfs.com` 获取安装程序

```bash
git lfs install
git clone https://huggingface.co/Supertone/supertonic-3 assets
```

某些语言示例需要原生运行时：
* **Go**：安装 ONNX Runtime C 库。在 macOS 上，`brew install onnxruntime` 即可；Go 示例会自动检测 Homebrew 路径。
* **Java**：使用 JDK，而不仅仅是 JRE。在 macOS 上，`brew install openjdk@17` 即可。
* **C#**：面向 .NET 9，并允许主版本转发，因此 .NET 9 或更新版本均可运行。

然后运行 Python 示例：

```bash
cd py
uv sync
uv run example_onnx.py
```

这将使用默认预设语音生成 `outputs/output.wav`。

### 其他运行时示例

**在其他语言和平台上运行 Supertonic**

| 语言/平台 | 路径 | 描述 |
|---|---|---|
| **Node.js** | `nodejs/` | 服务端 JavaScript |
| **浏览器** | `web/` | WebGPU/WASM 推理 |
| **Java** | `java/` | 跨平台 JVM |
| **C++** | `cpp/` | 高性能 C++ |
| **C#** | `csharp/` | .NET 生态 |
| **Go** | `go/` | Go 实现 |
| **Swift** | `swift/` | macOS 应用 |
| **iOS** | `ios/` | 原生 iOS 应用 |
| **Rust** | `rust/` | 内存安全的系统级实现 |
| **Flutter** | `flutter/` | 跨平台应用 |

> 详细使用说明请参考各语言目录中的 README.md。

**Node.js 示例**
```bash
cd nodejs
npm install
npm start
```

**浏览器示例**
```bash
cd web
npm install
npm run dev
```

**Java 示例**
```bash
cd java
mvn clean install
mvn exec:java
```

**C++ 示例**
```bash
cd cpp
mkdir build && cd build
cmake .. && cmake --build . --config Release
./example_onnx
```

**C# 示例**
```bash
cd csharp
dotnet restore
dotnet run
```

**Go 示例**
```bash
cd go
go mod download
go run example_onnx.go helper.go
```

**Swift 示例**
```bash
cd swift
swift build -c release
.build/release/example_onnx
```

**Rust 示例**
```bash
cd rust
cargo build --release
./target/release/example_onnx
```

**iOS 示例**
```bash
cd ios/ExampleiOSApp
xcodegen generate
open ExampleiOSApp.xcodeproj
```
在 Xcode 中：Targets → ExampleiOSApp → Signing：选择你的 Team，然后选择你的 iPhone 作为运行目标并构建。

---

### 技术细节

* **运行时**：ONNX Runtime 用于跨平台推理
* **浏览器支持**：onnxruntime-web 用于客户端推理
* **批处理**：支持批处理推理以提高吞吐量
* **音频输出**：输出 44.1kHz 16 位 WAV 文件

## 性能亮点

Supertonic 3 专为实用的端侧推理而设计：足够紧凑以在本地运行，同时与更大的开放 TTS 系统保持竞争力。

### 朗读准确率

在 **[Minimax-MLS-test](https://huggingface.co/datasets/MiniMaxAI/TTS-MLS-Test) 基准**上评估，Supertonic 3 在与 VoxCPM2 等更大的开放 TTS 模型相比时，保持了有竞争力的 WER/CER 范围，同时保持了轻量级的端侧部署路径。带星号（*）的语言使用 CER，其余使用 WER。

| 语言 | VoxCPM2 | OmniVoice | Qwen3-TTS | Supertonic 2 | **Supertonic 3** |
|---|---|---|---|---|---|
| 阿拉伯语* | 4.14 | 1.74 | — | — | **2.14** |
| 捷克语 | 23.73 | 2.40 | — | — | **3.02** |
| 荷兰语 | 0.84 | 0.77 | — | — | **1.47** |
| 英语 | 2.11 | 2.02 | 2.25 | 2.52 | **2.06** |
| 芬兰语 | 2.29 | 3.94 | — | — | **5.40** |
| 法语 | 4.41 | 4.74 | 3.82 | 5.09 | **4.89** |
| 德语 | 0.85 | 0.96 | 0.52 | — | **0.86** |
| 希腊语 | 3.22 | 2.96 | — | — | **3.54** |
| 印地语* | 5.85 | 5.14 | — | — | **5.34** |
| 印度尼西亚语 | 1.25 | 1.67 | — | — | **1.34** |
| 意大利语 | 1.74 | 1.29 | 1.40 | — | **1.75** |
| 日语* | 3.35 | 3.81 | 3.67 | — | **4.61** |
| 韩语* | 4.70 | 3.22 | 4.07 | 3.65 | **3.26** |
| 波兰语 | 1.30 | 0.64 | — | — | **1.63** |
| 葡萄牙语 | 1.74 | 1.40 | 1.21 | 1.52 | **2.48** |
| 罗马尼亚语 | 22.39 | 2.29 | — | — | **2.19** |
| 俄语 | 3.31 | 4.53 | 4.48 | — | **3.99** |
| 西班牙语 | 1.34 | 0.99 | 0.75 | 1.81 | **1.13** |
| 土耳其语 | 0.88 | 2.18 | — | — | **1.00** |
| 乌克兰语 | 5.85 | 0.71 | — | — | **1.23** |
| 越南语 | 1.48 | 0.79 | — | — | **4.49** |

> 数值越低越好。`*` 表示 CER（字符错误率），其他行使用 WER（词错误率）。破折号（`—`）表示该模型不支持该语言或无可用结果。

### Supertonic 2 与 Supertonic 3 对比

与 Supertonic 2 相比，Supertonic 3 减少了重复和跳跃错误，提高了共享语言集中的说话人相似度，并将语言覆盖从 5 种扩展到 31 种。它保持了与 v2 兼容的公共 ONNX 接口，因此现有集成可以以相同的推理契约迁移到 v3。

### 运行时占用

Supertonic 3 在 CPU 上运行速度很快，即使与在 A100 GPU 上测量的更大基线相比也是如此，并且使用的内存大大减少。开放权重的固定语音设置不需要 GPU，这使得本地、浏览器和边缘部署更加容易。

### 模型大小

在公共 ONNX 资源中约有 9900 万参数，Supertonic 3 比 0.7B 到 2B 级的开放 TTS 系统小得多。较小的模型大小在下载大小、启动时间和端侧推理方面具有实际优势。

## 演示

> **立即试用**：通过我们的**[交互式演示](https://huggingface.co/spaces/Supertone/supertonic-3)**在浏览器中体验 Supertonic，或从 **[Hugging Face Hub](https://huggingface.co/Supertone/supertonic-3)** 开始使用预训练模型。

### Raspberry Pi

观看 Supertonic 在 **Raspberry Pi** 上运行，展示端侧、实时 TTS 合成：`supertonic_raspberry-pi_480.mov`

### 电子阅读器

在 **Onyx Boox Go 6** 电子阅读器上体验飞行模式下的 Supertonic，平均 RTF 达到 0.3 倍，零网络依赖：`supertonic_ebook.mp4`

### Chrome 扩展

在不到一秒内将任何网页转为音频，提供极速、端侧、零网络依赖的 TTS——免费、私密、轻松：`TLDRL_video_1_1_4_short_low.mp4`

## 自然文本处理

Supertonic 设计用于处理包含自然散文、标点、缩写和专有名词的复杂真实世界文本输入。

> **更轻松地查看音频样本**：查看我们的**[交互式演示](https://huggingface.co/spaces/Supertone/supertonic-3)**以获得更好的音频示例体验。

**测试用例概览：**

| 类别 | 关键挑战 | Supertonic | ElevenLabs | OpenAI | Gemini | Microsoft |
|---|---|---|---|---|---|---|
| 金融表达 | 十进制货币、缩写量级（M、K）、货币符号、货币代码 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 电话号码 | 区号、连字符、分机（ext.） | ✅ | ❌ | ❌ | ❌ | ❌ |
| 技术单位 | 带单位的十进制数、缩写技术标记 | ✅ | ❌ | ❌ | ❌ | ❌ |

**示例 1：金融表达**

> **文本：** "The startup secured **$5.2M** in venture capital, a huge leap from their initial **$450K** seed round."

**挑战：** 金额中的小数点（$5.2M 应读作 "five point two million"）、缩写量级单位（M 表示百万，K 表示千）、需要正确读作 "dollars" 的货币符号（$）。

**Supertonic：** ✅ | **ElevenLabs Flash v2.5：** ❌ | **OpenAI TTS-1：** ❌ | **Gemini 2.5 Flash TTS：** ❌ | **VibeVoice Realtime 0.5B：** ❌

**示例 2：电话号码**

> **文本：** "You can reach the hotel front desk at **(212) 555-0142 ext. 402** anytime."

**挑战：** 括号中的区号（应读作单独数字）、带连字符分隔符的电话号码（555-0142）、缩写分机标记（ext.）、分机号码（402）。

**Supertonic：** ✅ | **ElevenLabs Flash v2.5：** ❌ | **OpenAI TTS-1：** ❌ | **Gemini 2.5 Flash TTS：** ❌ | **VibeVoice Realtime 0.5B：** ❌

**示例 3：技术单位**

> **文本：** "Our drone battery lasts **2.3h** when flying at **30kph** with full camera payload."

**挑战：** 带缩写的小数时间持续时间（2.3h = two point three hours）、带缩写的速度单位（30kph = thirty kilometers per hour）、技术缩写（h 表示小时，kph 表示公里/小时）、需要正确发音的技术/工程上下文。

**Supertonic：** ✅ | **ElevenLabs Flash v2.5：** ❌ | **OpenAI TTS-1：** ❌ | **Gemini 2.5 Flash TTS：** ❌ | **VibeVoice Realtime 0.5B：** ❌

> **注意：** 这些样本演示了每个系统如何处理文本规范化和复杂表达的发音，**而无需预处理或注音标注**。

## 基于 Supertonic 构建的项目

| 项目 | 描述 | 链接 |
|---|---|---|
| **TLDRL** | 用于阅读任何网页的免费端侧 TTS 扩展 | [Chrome](https://chromewebstore.google.com/detail/tldrl-lightning-tts-power/mdbiaajonlkomihpcaffhkagodbcgbme) |
| **Read Aloud** | 开源 TTS 浏览器扩展 | [Chrome](https://chromewebstore.google.com/detail/read-aloud-a-text-to-spee/hdhinadidafjejdhmfkjgnolgimiaplp) · [Edge](https://microsoftedge.microsoft.com/addons/detail/read-aloud-a-text-to-spe/pnfonnnmfjnpfgagnklfaccicnnjcdkm) · [GitHub](https://github.com/ken107/read-aloud) |
| **PageEcho** | iOS 电子书阅读器应用 | [App Store](https://apps.apple.com/us/app/pageecho/id6755965837) |
| **VoiceChat** | 浏览器中的端侧语音到语音 LLM 聊天机器人 | [Demo](https://huggingface.co/spaces/RickRossTN/ai-voice-chat) · [GitHub](https://github.com/irelate-ai/voice-chat) |
| **OmniAvatar** | 从照片 + 语音生成说话头像视频 | [Demo](https://huggingface.co/spaces/alexnasa/OmniAvatar) |
| **CopiloTTS** | 基于 ONNX Runtime 的 Kotlin 多平台 TTS SDK | [GitHub](https://github.com/sigmadeltasoftware/CopiloTTS) |
| **Voice Mixer** | 用于混合和修改语音风格的 PyQt5 工具 | [GitHub](https://github.com/Topping1/Supertonic-Voice-Mixer) |
| **Supertonic MNN** | 基于 MNN 的轻量级库（fp32/fp16/int8） | [GitHub](https://github.com/vra/supertonic-mnn) · [PyPI](https://pypi.org/project/supertonic-mnn/) |
| **Transformers.js** | Hugging Face 的 JS 库，支持 Supertonic | [GitHub PR](https://github.com/huggingface/transformers.js/pull/1459) · [Demo](https://huggingface.co/spaces/webml-community/Supertonic-TTS-WebGPU) |
| **Pinokio** | 适用于 Mac、Windows 和 Linux 的一键本地云 | [Pinokio](https://pinokio.co/) · [GitHub](https://github.com/SUP3RMASS1VE/SuperTonic-TTS) |

## 模型与版本

| | **Supertonic 3** | **Supertonic 2** | **Supertonic 1** |
|---|---|---|---|
| **状态** | 最新 | 稳定 | 遗留 |
| **参数量** | ~99M | ~66M | ~66M |
| **语言** | 31 | 5 | 1 (en) |
| **表达标签** | ✅ 10 种 | — | — |
| **代码** | [main](https://github.com/supertone-inc/supertonic) | [release/supertonic-2](https://github.com/supertone-inc/supertonic/tree/release/supertonic-2) | — |
| **权重** | [HF](https://huggingface.co/Supertone/supertonic-3) | [HF](https://huggingface.co/Supertone/supertonic-2) | [HF](https://huggingface.co/Supertone/supertonic) |
| **交互式演示** | [Space](https://huggingface.co/spaces/Supertone/supertonic-3) | [Space](https://huggingface.co/spaces/Supertone/supertonic-2) | [Space](https://huggingface.co/spaces/Supertone/supertonic#interactive-demo) |
| **音频样本** | [DemoPage](https://supertonic3.github.io/) | — | [DemoPage](https://supertonictts.github.io/) |

## 引用

以下论文描述了 Supertonic 中使用的核心技术。如果你在研究中使用此系统或发现这些技术有用，请考虑引用相关论文。

### SupertonicTTS：主要架构

本文介绍了 SupertonicTTS 的整体架构，包括语音自编码器、基于流匹配的文本到潜在模块以及高效的设计选择。

```bibtex
@article{kim2025supertonic,
  title={SupertonicTTS: Towards Highly Efficient and Streamlined Text-to-Speech System},
  author={Kim, Hyeongju and Yang, Jinhyeok and Yu, Yechan and Ji, Seunghun and Morton, Jacob and Bous, Frederik and Byun, Joon and Lee, Juheon},
  journal={arXiv preprint arXiv:2503.23108},
  year={2025},
  url={https://arxiv.org/abs/2503.23108}
}
```

### Length-Aware RoPE：文本-语音对齐

本文提出了长度感知旋转位置嵌入（LARoPE），改进了交叉注意力机制中的文本-语音对齐。

```bibtex
@article{kim2025larope,
  title={Length-Aware Rotary Position Embedding for Text-Speech Alignment},
  author={Kim, Hyeongju and Lee, Juheon and Yang, Jinhyeok and Morton, Jacob},
  journal={arXiv preprint arXiv:2509.11084},
  year={2025},
  url={https://arxiv.org/abs/2509.11084}
}
```

### Self-Purifying Flow Matching：带噪声标签的训练

本文描述了用于训练流匹配模型的自净化技术，使其能够稳健地处理噪声或不可靠的标签。

```bibtex
@article{kim2025spfm,
  title={Training Flow Matching Models with Reliable Labels via Self-Purification},
  author={Kim, Hyeongju and Yu, Yechan and Yi, June Young and Lee, Juheon},
  journal={arXiv preprint arXiv:2509.19091},
  year={2025},
  url={https://arxiv.org/abs/2509.19091}
}
```

# 参考资料

* any list
{:toc}