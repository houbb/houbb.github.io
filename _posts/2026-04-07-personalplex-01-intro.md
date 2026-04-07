---
layout: post 
title: PersonaPlex：全双工会话语音模型的语音与角色控制
date: 2026-04-07 21:01:55 +0800
categories: [AI]
tags: [ai, llm, voice]
published: true
---

# PersonaPlex：全双工会话语音模型的语音与角色控制

[![Weights](https://img.shields.io/badge/🤗-Weights-yellow)](https://huggingface.co/nvidia/personaplex-7b-v1)
[![Paper](https://img.shields.io/badge/📄-Paper-blue)](https://arxiv.org/abs/2602.06053)
[![Demo](https://img.shields.io/badge/🎮-Demo-green)](https://research.nvidia.com/labs/adlr/personaplex/)
[![Discord](https://img.shields.io/badge/Discord-Join-purple?logo=discord)](https://discord.gg/5jAXrrbwRb)

PersonaPlex 是一个实时的、全双工的语音到语音对话模型，它能够通过基于文本的角色提示和基于音频的语音条件来实现角色控制。

该模型在合成对话和真实对话的混合数据上进行训练，能够产生自然、低延迟且具有一致人设的口语交互。

PersonaPlex 基于 [Moshi](https://arxiv.org/abs/2410.00037) 架构和权重。

<p align="center">
  <img src="assets/architecture_diagram.png" alt="PersonaPlex 模型架构">
  <br>
  <em>PersonaPlex 架构</em>
</p>

## 使用方法

### 前提条件

安装 [Opus 音频编解码器](https://github.com/xiph/opus) 开发库：
```bash
# Ubuntu/Debian
sudo apt install libopus-dev

# Fedora/RHEL
sudo dnf install opus-devel
```

### 安装

下载本仓库并使用以下命令安装：
```bash
pip install moshi/.
```

针对基于 Blackwell 架构的 GPU 的额外步骤（参见 https://github.com/NVIDIA/personaplex/issues/2）：
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu130
```

### 接受模型许可

登录您的 Huggingface 账号，并在[此处](https://huggingface.co/nvidia/personaplex-7b-v1)接受 PersonaPlex 模型许可。<br>
然后设置 Huggingface 认证：
```bash
export HF_TOKEN=<您的_HUGGINGFACE_TOKEN>
```

### 启动服务器

启动服务器进行实时交互（使用临时 SSL 证书启用 https）：
```bash
SSL_DIR=$(mktemp -d); python -m moshi.server --ssl "$SSL_DIR"
```

**CPU 卸载：** 如果您的 GPU 显存不足，请使用 `--cpu-offload` 标志将模型层卸载到 CPU。这需要安装 `accelerate` 包（`pip install accelerate`）：
```bash
SSL_DIR=$(mktemp -d); python -m moshi.server --ssl "$SSL_DIR" --cpu-offload
```

在浏览器中访问 Web UI：如果在本地运行，地址为 `localhost:8998`；否则请查看脚本打印的访问链接：
```
Access the Web UI directly at https://11.54.401.33:8998
```

### 离线评估

对于离线评估，请使用离线脚本，该脚本流式读入一个输入 wav 文件，并从捕获的输出流生成一个输出 wav 文件。输出文件的时长与输入文件相同。

如果您的 GPU 显存不足，可以在以下任何命令中添加 `--cpu-offload`（需要 `accelerate` 包）。或者，在纯 CPU 上进行离线评估时，安装仅 CPU 版本的 PyTorch。

**助手示例：**
```bash
HF_TOKEN=<TOKEN> \
python -m moshi.offline \
  --voice-prompt "NATF2.pt" \
  --input-wav "assets/test/input_assistant.wav" \
  --seed 42424242 \
  --output-wav "output.wav" \
  --output-text "output.json"
```

**服务示例：**
```bash
HF_TOKEN=<TOKEN> \
python -m moshi.offline \
  --voice-prompt "NATM1.pt" \
  --text-prompt "$(cat assets/test/prompt_service.txt)" \
  --input-wav "assets/test/input_service.wav" \
  --seed 42424242 \
  --output-wav "output.wav" \
  --output-text "output.json"
```

## 语音

PersonaPlex 支持多种语音；我们预先打包了听起来更自然、更具对话性的语音（NAT）的嵌入，以及其他更多样化的语音（VAR）。固定的语音集标记如下：
```
自然（女声）： NATF0, NATF1, NATF2, NATF3
自然（男声）：   NATM0, NATM1, NATM2, NATM3
多样（女声）： VARF0, VARF1, VARF2, VARF3, VARF4
多样（男声）：   VARM0, VARM1, VARM2, VARM3, VARM4
```

## 提示指南

该模型在针对固定助手角色和多种客服角色的合成对话上进行了训练。

### 助手角色

助手角色的提示为：
```
You are a wise and friendly teacher. Answer questions or provide advice in a clear and engaging way.
```

在 [FullDuplexBench](https://arxiv.org/abs/2503.04721) 的“用户打断”评估类别中，将此提示用于以问答为中心的助手。

### 客服角色

客服角色支持多种提示。以下是一些提示风格参考示例：
```
You work for CitySan Services which is a waste management and your name is Ayelen Lucero. Information: Verify customer name Omar Torres. Current schedule: every other week. Upcoming pickup: April 12th. Compost bin service available for $8/month add-on.
```
```
You work for Jerusalem Shakshuka which is a restaurant and your name is Owen Foster. Information: There are two shakshuka options: Classic (poached eggs, $9.50) and Spicy (scrambled eggs with jalapenos, $10.25). Sides include warm pita ($2.50) and Israeli salad ($3). No combo offers. Available for drive-through until 9 PM.
```
```
You work for AeroRentals Pro which is a drone rental company and your name is Tomaz Novak. Information: AeroRentals Pro has the following availability: PhoenixDrone X ($65/4 hours, $110/8 hours), and the premium SpectraDrone 9 ($95/4 hours, $160/8 hours). Deposit required: $150 for standard models, $300 for premium.
```

### 日常对话

该模型还在 [Fisher English Corpus](https://catalog.ldc.upenn.edu/LDC2004T19) 的真实对话上进行了训练，并使用 LLM 标记的提示进行开放式对话。以下是一些日常对话的提示示例：
```
You enjoy having a good conversation.
```
```
You enjoy having a good conversation. Have a casual discussion about eating at home versus dining out.
```
```
You enjoy having a good conversation. Have an empathetic discussion about the meaning of family amid uncertainty.
```
```
You enjoy having a good conversation. Have a reflective conversation about career changes and feeling of home. You have lived in California for 21 years and consider San Francisco your home. You work as a teacher and have traveled a lot. You dislike meetings.
```
```
You enjoy having a good conversation. Have a casual conversation about favorite foods and cooking experiences. You are David Green, a former baker now living in Boston. You enjoy cooking diverse international dishes and appreciate many ethnic restaurants.
```

在 FullDuplexBench 的“暂停处理”、“回馈信号”和“平滑轮替”评估类别中，使用提示 `You enjoy having a good conversation.`。

## 泛化能力

PersonaPlex 对 Moshi 进行了微调，并受益于底层 [Helium](https://kyutai.org/blog/2025-04-30-helium) LLM 的泛化能力。得益于主干模型的广泛训练语料，我们发现模型能够对分布外提示做出合理的响应，并引出意想不到或有趣的对话。我们鼓励使用不同的提示进行实验，以测试模型处理其训练分布之外场景的涌现能力。作为启发，我们在 WebUI 中提供了以下宇航员提示：
```
You enjoy having a good conversation. Have a technical discussion about fixing a reactor core on a spaceship to Mars. You are an astronaut on a Mars mission. Your name is Alex. You are already dealing with a reactor core meltdown on a Mars mission. Several ship systems are failing, and continued instability will lead to catastrophic failure. You explain what is happening and you urgently ask for help thinking through how to stabilize the reactor.
```

## 许可证

本代码采用 MIT 许可证提供。模型的权重依据 NVIDIA 开放模型许可证发布。

## 引用

如果您在研究中使用了 PersonaPlex，请引用我们的论文：
```bibtex
@misc{roy2026personaplexvoicerolecontrol,
      title={PersonaPlex: Voice and Role Control for Full Duplex Conversational Speech Models}, 
      author={Rajarshi Roy and Jonathan Raiman and Sang-gil Lee and Teodor-Dumitru Ene and Robert Kirby and Sungwon Kim and Jaehyeon Kim and Bryan Catanzaro},
      year={2026},
      eprint={2602.06053},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2602.06053}, 
}
```

# 参考资料

* any list
{:toc}