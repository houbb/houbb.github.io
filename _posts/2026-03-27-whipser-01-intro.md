---
layout: post 
title: Insanely Fast Whisper 用于在本地设备上使用 Whisper 转录音频文件
date: 2026-03-27 21:01:55 +0800
categories: [AI]
tags: [ai, memory]
published: true
---

# Insanely Fast Whisper

一个“强主观配置（opinionated）”的 CLI 工具，用于在本地设备上使用 Whisper 转录音频文件！

基于 🤗 Transformers、Optimum 和 flash-attn 驱动。

**简而言之（TL;DR）** —— 使用 [OpenAI 的 Whisper Large v3]，在不到 **98 秒** 内即可转录 **150 分钟（2.5 小时）** 的音频。

极速转录已经成为现实！⚡️

```bash
pipx install insanely-fast-whisper==0.0.15 --force
```

---

如果你还不相信，以下是在 Nvidia A100 - 80GB 上进行的一些基准测试 👇

| 优化类型                                                                              | 转录时间（150 分钟音频）      |
| --------------------------------------------------------------------------------- | ------------------- |
| large-v3 (Transformers) (`fp32`)                                                  | ~31 分钟（31 分 1 秒）    |
| large-v3 (Transformers) (`fp16` + `batching [24]` + `bettertransformer`)          | ~5 分钟（5 分 2 秒）      |
| **large-v3 (Transformers) (`fp16` + `batching [24]` + Flash Attention 2)**        | **~2 分钟（1 分 38 秒）** |
| distil-large-v2 (Transformers) (`fp16` + `batching [24]` + `bettertransformer`)   | ~3 分钟（3 分 16 秒）     |
| **distil-large-v2 (Transformers) (`fp16` + `batching [24]` + Flash Attention 2)** | **~1 分钟（1 分 18 秒）** |
| large-v2 (Faster Whisper) (`fp16` + `beam_size [1]`)                              | ~9 分 23 秒           |
| large-v2 (Faster Whisper) (`8-bit` + `beam_size [1]`)                             | ~8 分 15 秒           |

附注（P.S.）：我们也在 Google Colab 的 T4 GPU 实例上运行了这些基准测试。

附注（P.P.S.）：该项目最初是为了展示 Transformers 的性能基准而创建的，但后来逐渐演变为一个轻量级 CLI 工具供用户使用。该项目完全由社区驱动，我们会优先添加社区需求强烈的功能。

---

## 🆕 通过终端实现极速转录 ⚡️

我们新增了 CLI 工具来支持快速转录，使用方式如下：

使用 `pipx` 安装（先安装 pipx：`pip install pipx` 或 `brew install pipx`）：

```bash
pipx install insanely-fast-whisper
```

⚠️ 如果你使用的是 Python 3.11.xx，`pipx` 可能会错误解析版本号，并安装一个非常旧的版本（0.0.8），该版本已无法兼容当前的 BetterTransformers。此时可以通过以下方式安装最新版本：

```bash
pipx install insanely-fast-whisper --force --pip-args="--ignore-requires-python"
```

如果使用 `pip` 安装，则可以直接添加参数：

```bash
pip install insanely-fast-whisper --ignore-requires-python
```

---

在任意路径运行推理：

```bash
insanely-fast-whisper --file-name <文件路径或URL>
```

*注意：在 macOS 上运行时，还需要添加 `--device-id mps` 参数*

---

🔥 使用 CLI 运行 Whisper Large v3 + Flash Attention 2：

```bash
insanely-fast-whisper --file-name <文件路径或URL> --flash True
```

---

🌟 使用 distil-whisper：

```bash
insanely-fast-whisper --model-name distil-whisper/large-v2 --file-name <文件路径或URL>
```

---

如果不想安装，也可以直接运行：

```bash
pipx run insanely-fast-whisper --file-name <文件路径或URL>
```

---

> 注意
> 该 CLI 具有强主观设计，仅支持 NVIDIA GPU 和 Mac。建议查看默认配置和可选参数，以最大化转录吞吐量。
> 使用 `insanely-fast-whisper --help` 查看全部参数。

---

## CLI 参数说明

该项目支持在多种环境下运行 Whisper，目前支持 CUDA 和 macOS 的 mps：

```
-h, --help
    显示帮助信息

--file-name
    待转录音频文件路径或 URL

--device-id
    GPU 设备 ID（CUDA 传设备编号，Mac 使用 "mps"，默认 "0"）

--transcript-path
    输出文件路径（默认 output.json）

--model-name
    使用的模型名称（默认 openai/whisper-large-v3）

--task {transcribe, translate}
    执行任务：转录或翻译（默认 transcribe）

--language
    输入音频语言（默认自动检测）

--batch-size
    批处理大小（默认 24，OOM 时可调小）

--flash
    是否启用 Flash Attention 2（默认 False）

--timestamp {chunk, word}
    时间戳粒度（chunk 或 word，默认 chunk）

--hf-token
    Hugging Face token，用于 Pyannote 说话人分离

--diarization_model
    说话人分离模型（默认 pyannote/speaker-diarization）

--num-speakers
    指定说话人数（不能与 min/max 同时使用）

--min-speakers
    最小说话人数

--max-speakers
    最大说话人数
```

---

## 常见问题（FAQ）

### 如何正确安装 flash-attn？

```bash
pipx runpip insanely-fast-whisper install flash-attn --no-build-isolation
```

---

### Windows 出现 CUDA 错误如何解决？

错误：

```
AssertionError: Torch not compiled with CUDA enabled
```

解决方法：

```bash
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

---

### Mac 上如何避免 OOM（内存溢出）？

* mps 后端优化不如 CUDA，占用显存更高
* 推荐参数：

```bash
--batch-size 4 --device-id mps
```

（大约占用 12GB 显存）

---

## 不使用 CLI，如何直接使用 Whisper？

安装依赖：

```bash
pip install --upgrade transformers optimum accelerate
```

示例代码：

```python
import torch
from transformers import pipeline
from transformers.utils import is_flash_attn_2_available

pipe = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-large-v3",
    torch_dtype=torch.float16,
    device="cuda:0",
    model_kwargs={
        "attn_implementation": "flash_attention_2"
    } if is_flash_attn_2_available() else {
        "attn_implementation": "sdpa"
    },
)

outputs = pipe(
    "<FILE_NAME>",
    chunk_length_s=30,
    batch_size=24,
    return_timestamps=True,
)

outputs
```

---

## 致谢

1. OpenAI Whisper 团队开源了优秀模型
2. Hugging Face Transformers 团队持续维护 Whisper
3. Hugging Face Optimum 团队提供 BetterTransformer API
4. Patrick Arminio 在 CLI 构建中提供了巨大帮助

---

## 社区展示

1. @ochen1 构建了 CLI MVP
   [https://github.com/ochen1/insanely-fast-whisper-cli](https://github.com/ochen1/insanely-fast-whisper-cli)

2. @arihanv 构建了应用（NextJS + Modal）
   [https://github.com/arihanv/Shush](https://github.com/arihanv/Shush)

3. @kadirnar 构建了优化版 Python 包
   [https://github.com/kadirnar/whisper-plus](https://github.com/kadirnar/whisper-plus)


# 参考资料

* any list
{:toc}