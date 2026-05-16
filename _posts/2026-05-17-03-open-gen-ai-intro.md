---
layout: post 
title: Anil-matcha/Open-Generative-AI AI 视频平台的开源替代方案 —— 免费的 AI 图像与视频生成工作室，搭载 200+ 模型（Flux、Midjourney、Kling、Sora、Veo）。无内容过滤
date: 2026-05-17 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---


# GitHub - Anil-matcha/Open-Generative-AI: AI 视频平台的开源替代方案 —— 免费的 AI 图像与视频生成工作室，搭载 200+ 模型（Flux、Midjourney、Kling、Sora、Veo）。无内容过滤。可自托管，MIT 许可证。

## Open Generative AI —— AI 视频平台的开源替代方案

> **免费、开源的 AI 视频平台替代方案。** 使用 200+ 最先进的模型生成 AI 图像和视频 —— 无内容过滤、无封闭生态、无订阅费用。

**社区：** 加入 [Reddit](https://github.com/Anil-matcha/Open-Generative-AI/blob/main/reddit.com/r/muapi) 和 [Discord](https://discord.gg/s7KW4fsqXK) 进行讨论和支持。

> **使用 AI 编程代理自动化媒体生成：** [Generative-Media-Skills](https://github.com/SamurAIGPT/Generative-Media-Skills) —— 一套技能库，让 **Claude Code**、**Codex** 和其他编程助手能够直接在终端驱动 200+ 图像/视频模型（提示 → 生成 → 编辑 → 拼接）。非常适合构建无需接触 UI 的自动化媒体流水线。

### 相关项目

> **开源基于 Node 的工作流构建器** → [https://github.com/SamurAIGPT/Vibe-Workflow](https://github.com/SamurAIGPT/Vibe-Workflow)

> **开源 AI 剪辑 —— 将任意长视频 YouTube 视频转换为 Viral Ready 的竖屏短视频** → [https://github.com/SamurAIGPT/AI-Youtube-Shorts-Generator](https://github.com/SamurAIGPT/AI-Youtube-Shorts-Generator)

> **开源 AI 设计代理** → [https://github.com/Anil-matcha/Open-AI-Design-Agent](https://github.com/Anil-matcha/Open-AI-Design-Agent)

## 在线试用 —— 无需安装

**托管版本：** [https://dev.muapi.ai/open-generative-ai](https://dev.muapi.ai/open-generative-ai)

直接在浏览器中使用全部四个工作室（图像、视频、口型同步、电影）—— 无需 Node.js，无需配置。注册免费账号即可开始生成。托管版本始终与最新模型保持同步。

**关注** [创作者](https://x.com/matchaman11) 获取更新。

---

## ⬇️ 下载桌面应用

一键安装程序 —— 无需 Node.js 或终端。

| 平台 | 下载 |
|---|---|
| macOS Apple Silicon（M1/M2/M3/M4） | [Open Generative AI-1.0.9-arm64.dmg](https://github.com/Anil-matcha/Open-Generative-AI/releases/download/v1.0.9/Open.Generative.AI-1.0.9-arm64.dmg) |
| macOS Intel（x64） | [Open Generative AI-1.0.9.dmg](https://github.com/Anil-matcha/Open-Generative-AI/releases/download/v1.0.9/Open.Generative.AI-1.0.9.dmg) |
| Windows（x64） | [Open Generative AI Setup 1.0.9.exe](https://github.com/Anil-matcha/Open-Generative-AI/releases/download/v1.0.9/Open.Generative.AI.Setup.1.0.9.exe) |
| Linux（Ubuntu x64） | [v1.0.9 release](https://github.com/Anil-matcha/Open-Generative-AI/releases/tag/v1.0.9)（`.AppImage` / `.deb`），或通过 `npm run electron:build:linux` 本地构建 |

所有发行版：[github.com/Anil-matcha/Open-Generative-AI/releases](https://github.com/Anil-matcha/Open-Generative-AI/releases)

### macOS 安装指南

由于应用未经过 Apple 公证，macOS Gatekeeper 会在首次启动时阻止它。请按照以下步骤操作：

**第 1 步** —— 挂载 DMG 并将应用拖入 `/Applications`

**第 2 步** —— 打开终端并运行：
```bash
xattr -cr "/Applications/Open Generative AI.app"
```

**第 3 步** —— 在 `/Applications` 中右键点击应用 → 点击 **打开** → 在对话框中再次点击 **打开**

> 只需执行一次此操作。之后应用即可正常打开。

**替代方案（无需终端）：**
1. 尝试打开应用 —— macOS 会阻止它
2. 前往 **系统设置 → 隐私与安全性**
3. 向下滚动找到 _"Open Generative AI was blocked"_
4. 点击 **仍然打开** → **打开**

### Windows 安装 —— SmartScreen 警告修复

Windows SmartScreen 可能会显示警告，因为安装程序未进行代码签名：
1. 在 SmartScreen 对话框中点击 **更多信息**
2. 点击 **仍要运行**

应用将静默安装到 `%LocalAppData%`，并在开始菜单中创建快捷方式。

### Ubuntu / Linux 安装

使用 Electron Builder 构建时可获得 Linux 构建产物：

```bash
# 构建 Linux 安装程序（AppImage + .deb）
npm run electron:build:linux
```

生成的文件写入 `release/` 文件夹：

* **AppImage** —— 便携版，设置可执行权限后直接运行：
  ```bash
  chmod +x "release/Open Generative AI-*.AppImage"
  ./release/Open\ Generative\ AI-*.AppImage
  ```
* **.deb** —— 在 Debian/Ubuntu 上安装：
  ```bash
  sudo apt install ./release/open-generative-ai_*_amd64.deb
  ```

如果 AppImage 在旧系统上无法启动，安装 `libfuse2`：`sudo apt install libfuse2`

#### Ubuntu 24.04+ / AppArmor 沙箱限制

Ubuntu 24.04 及更高版本启用了内核安全策略（`apparmor_restrict_unprivileged_userns`），会阻止 Chromium 的用户命名空间沙箱。如果应用无法启动（无声退出或立即崩溃），您有两个选择：

**方案 A —— 推荐：安装 `.deb` 包。** `.deb` 包附带一个 AppArmor 配置文件，安装时会自动授予所需权限，无需修改系统全局设置。

**方案 B —— 临时系统修复（适用于 AppImage 用户）：**
```bash
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```
此操作持续到下次重启。若要永久生效：
```bash
echo 'kernel.apparmor_restrict_unprivileged_userns=0' | sudo tee /etc/sysctl.d/99-userns.conf
```

---

Open Generative AI 是一个免费、开源的 AI 图像、视频、电影和口型同步工作室，将创意工作流带给每一个人。无内容过滤、无提示拒绝、无护栏 —— 完全自由的创意。由 [Muapi.ai](https://muapi.ai) 提供支持，支持文生图、图生图、文生视频、图生视频以及音频驱动的口型同步生成，涵盖 Flux、Nano Banana、Midjourney、Kling、Sora、Veo、Seedream、Infinite Talk、LTX Lipsync、Wan 2.2 等模型 —— 一切尽在可自托管和定制的现代界面中。

**为什么选择 Open Generative AI 而不是其他 AI 视频平台？**

* **无过滤** —— 无内容过滤、无保姆式护栏、无提示拒绝
* **免费且开源** —— 无订阅、无供应商锁定
* **自托管** —— 数据留在您的机器上，完全创意掌控
* **200+ 模型** —— 文生图、图生图、文生视频、图生视频、口型同步
* **多图输入** —— 支持向兼容模型提供多达 14 张参考图像
* **口型同步工作室** —— 使用 9 个专用模型为肖像动画或同步任何音频的口型
* **可扩展** —— 添加您自己的模型、修改 UI、在此基础上构建

有关技术架构和“无限预算”电影工作流背后的理念的深入探讨，请参阅我们的[综合指南和路线图](https://medium.com/@anilmatcha/)。

## ⚡ 本地模型推理（仅限桌面应用）

桌面应用支持**两个独立的本地引擎**。您可以根据实际运行的机器选择合适的引擎：

| 引擎 | 是什么 | 最适合 |
|---|---|---|
| **sd.cpp**（捆绑） | 来自 [stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp) 的 C++ 引擎，与应用在同一台机器上运行。Apple Silicon 上使用 Metal GPU，Linux/Windows 上支持 CUDA/Vulkan/ROCm。 | 纯图像模型。可在 Mac M 系列上运行。 |
| **Wan2GP**（自备服务器） | 指向用户运行的 [Wan2GP](https://github.com/deepbeepmeep/Wan2GP) 服务器的 HTTP 客户端。服务器在 CUDA/ROCm GPU 上运行 Python + PyTorch；桌面应用仅发送提示并接收结果。 | 视频模型（Wan 2.2、Hunyuan、LTX）和大型图像模型（Flux、Qwen-Image）。需要 NVIDIA/AMD GPU 在 _服务器_ 端；桌面应用本身可在 Mac 上运行。 |

两个引擎共享相同的 UI：打开 **设置 → 本地模型** 来配置每个引擎。

### 引擎 1 —— sd.cpp（捆绑）

| 模型 | 类型 | 大小 | 说明 |
|---|---|---|---|
| **Z-Image Turbo** ⚡ | Diffusion Transformer | 2.5 GB + 2.7 GB 辅助 | 8 步极速版。内存占用较大。 |
| **Z-Image Base** ⚡ | Diffusion Transformer | 3.5 GB + 2.7 GB 辅助 | 50 步高质量版。内存占用较大。 |
| **Dreamshaper 8** | SD 1.5 | 2.1 GB | 20 步多功能版。Mac 上测试过的最轻量选项。 |
| **Realistic Vision v5.1** | SD 1.5 | 2.1 GB | 25 步写实版 |
| **Anything v5** | SD 1.5 | 2.1 GB | 20 步动漫/插画版 |
| **SDXL Base 1.0** | SDXL | 6.9 GB | 30 步高分辨率 |

> **Z-Image 模型**需要两个共享辅助文件（下载一次，两个模型共用）：
> * **Qwen3-4B 文本编码器** — 2.4 GB
> * **FLUX VAE** — 335 MB

**如何使用：**
1. 在桌面应用中打开 **设置 → 本地模型**
2. 安装 **sd.cpp 推理引擎**（一键下载）
3. 下载您选择的模型（以及 Z-Image 所需的辅助文件）
4. 在 **图像工作室** 中，点击模型选择器旁边的 **⚡ 本地** 开关
5. 选择您的本地模型并生成 —— 无需 API 密钥

所有下载均在应用内完成，无需全局安装。

### 引擎 2 —— Wan2GP（远程 Gradio 服务器）

应用**不**捆绑 Wan2GP 的 Python 或模型权重。您需要在装有 CUDA 或 ROCm GPU 的机器上自行运行 Wan2GP，然后将桌面应用指向其 URL。

```bash
# 在您的 GPU 机器上
git clone https://github.com/deepbeepmeep/Wan2GP
cd Wan2GP
./install.sh  # Windows 上为 install.bat
python wgp.py --listen --server-name 0.0.0.0  # 绑定到所有接口
```

然后在桌面应用中：**设置 → 本地模型 → Wan2GP server**，粘贴 URL（例如 `http://192.168.1.42:7860`），点击 **测试**，然后 **保存**。Wan2GP 模型即可用 —— 图像模型在 **图像工作室** 中使用，视频模型可通过相同的生成 API 访问（图像工作室明确拒绝视频输出；完整的视频工作室集成已在路线图中）。

| 模型 | 类型 | 说明 |
|---|---|---|
| **Flux.1 Dev** | 图像 | 1024px，28 步 |
| **Qwen Image** | 图像 | 1024px，30 步 |
| **Wan 2.2（T2V / I2V）** | 视频 | 在消费级 GPU 上较慢 |
| **Hunyuan Video** | 视频 | 高质量的 T2V |
| **LTX Video** | 视频 | 最快的视频选项 |

> **为什么需要单独的服务器？** Wan2GP 的运行环境（Sage attention、flash-attn、AWQ/GGUF 内核）仅支持 CUDA —— 没有 MPS / Apple Silicon 路径。将其视为远程服务器，可以让仅使用 Mac 的用户保留桌面应用，同时将推理卸载到 LAN 上的 Linux/Windows GPU 设备、游戏 PC 或租用的 RunPod/vast.ai 实例。

> **本地推理仅在桌面应用中可用。** 托管 Web 版本始终使用云 API。

### 硬件说明

* **sd.cpp** 在 CPU（所有平台）和 Apple Silicon（M1/M2/M3/M4）上的 **Metal GPU** 上运行；在 Linux/Windows 上支持 CUDA/Vulkan/ROCm。
* Metal GPU 加速内置于 macOS 桌面二进制文件中 —— 比纯 CPU 快得多。
* sd.cpp Z-Image 推荐配置：16 GB RAM（7.4 GB 权重 + 2.4 GB 计算缓冲区）。在基础款 8 GB M 系列 Mac 上，**已知 Z-Image 会导致系统挂起** —— 请使用 SD 1.5。
* 在 M2 上运行 SD 1.5：启用 Metal dylib 时预计约 1~2 秒/步。如果看到约 10 秒/步，说明二进制可能已回退到 CPU —— 请参见下面的验证步骤。

### 验证 SD 1.5 路径（Mac 上最快的快速测试）

如果您想在不通过 UI 的情况下确认 sd.cpp 是否安装正确，可以直接使用 `sd-cli`。这是应用使用的同一个二进制文件。

```bash
# 1. 应用数据布局（首次启动应用时创建）
APP_DATA="$HOME/Library/Application Support/open-generative-ai/local-ai"
ls "$APP_DATA/bin"   # sd-cli, libstable-diffusion.dylib
ls "$APP_DATA/models" # 您下载的内容

# 2. 直接下载一个小型 SD 1.5 模型（Dreamshaper 8，约 2 GB）
curl -L --fail --progress-bar \
  -o "$APP_DATA/models/DreamShaper_8_pruned.safetensors" \
  "https://huggingface.co/Lykon/DreamShaper/resolve/main/DreamShaper_8_pruned.safetensors"

# 3. 运行单次 512x512 / 12 步推理
DYLD_LIBRARY_PATH="$APP_DATA/bin" "$APP_DATA/bin/sd-cli" \
  -m "$APP_DATA/models/DreamShaper_8_pruned.safetensors" \
  -p "a serene mountain lake at sunrise, oil painting" \
  -o /tmp/sd15-test.png \
  --steps 12 -H 512 -W 512 --cfg-scale 7.5 --seed 42 \
  --sampling-method euler_a
```

在 Apple Silicon 上成功运行时，会打印 `total params memory size = 1969.78MB (VRAM 1969.78MB, RAM 0.00MB)`（Metal 加速），并生成一张连贯的 512×512 PNG 图像。如果 `VRAM` 显示为 `0.00MB`，说明 dylib 为仅 CPU 模式 —— 运行 `otool -L "$APP_DATA/bin/libstable-diffusion.dylib" | grep -i metal` 检查，如果缺少 Metal 支持，请从 **设置 → 本地模型** 重新安装引擎。

---

## ✨ 功能特性

* **图像工作室** —— 从文本提示生成图像（50+ 文生图模型）或转换现有图像（55+ 图生图模型）。根据是否提供参考图像自动切换模型集。支持模型的画质和分辨率控件可见。
* **本地推理** —— 两个引擎：**sd.cpp**（捆绑，在 Mac/Win/Linux 上运行，支持 Metal/CUDA/Vulkan/ROCm），适用于 SD 1.5、SDXL 和 Z-Image；以及 **Wan2GP**（自备 Gradio 服务器），适用于 Flux、Qwen-Image 和视频模型（Wan 2.2、Hunyuan、LTX）。在设置 → 本地模型中配置两者。
* **多图输入** —— 为兼容的编辑模型（Nano Banana 2 Edit、Flux Kontext Dev、GPT-4o Edit 等）上传多达 14 张参考图像。多选选择器带有顺序徽章、批量上传和“使用所选”确认流程。
* **视频工作室** —— 从文本提示生成视频（40+ 文生视频模型）或通过起始帧图像生成动画（60+ 图生视频模型）。与图像工作室相同的智能模式切换。
* **口型同步工作室** —— 使用音频为肖像图像制作动画或为现有视频同步口型。9 个专用模型，涵盖两种模式：肖像图像 + 音频 → 说话视频，以及视频 + 音频 → 口型同步视频。
* **电影工作室** —— 具有专业相机控制（镜头、焦距、光圈）的照片级电影镜头界面。
* **工作流工作室** —— 可视化构建和运行多步 AI 流水线。将图像、视频和音频模型链入自动化流程。浏览社区模板，使用基于节点的编辑器创建自己的模板，并通过交互式 playground 运行它们。
* **上传历史** —— 参考图像只上传一次，存储在本地。选择器面板让您可以跨会话复用之前上传的任何图像 —— 无需重新上传。
* **智能控件** —— 动态宽高比、分辨率/质量和时长选择器，适配每个模型的能力（包括带有分辨率或质量选项的 t2i 模型）。
* **生成历史** —— 浏览、回顾和下载所有过往生成内容（持久化在浏览器存储中）。
* **图像和视频下载** —— 一键下载全分辨率生成内容。
* **API 密钥管理** —— 安全的 API 密钥存储在浏览器 localStorage 中（除 Muapi 外不会发送到任何服务器）。
* **响应式设计** —— 在桌面和移动端无缝运行，暗色玻璃态 UI。

### 🖼️ 图像工作室 —— 双模式

图像工作室自动在两套模型集之间切换：

| 模式 | 触发条件 | 模型 | 提示 |
|---|---|---|---|
| **文生图** | 默认（无图像） | 50+ t2i 模型（Flux、Nano Banana 2、Seedream 5.0、Ideogram、GPT-4o、Midjourney…） | 必需 |
| **图生图** | 上传参考图像 | 55+ i2i 模型（Kontext、Nano Banana 2 Edit、Seedream 5.0 Edit、Seededit、Upscaler…） | 可选 |

#### 新增模型

| 模型 | 类型 | 主要特性 |
|---|---|---|
| **Nano Banana 2** | 文生图 | Google Gemini 3.1 Flash Image · 分辨率 1K/2K/4K · Google 搜索增强 · 宽高比 `auto` |
| **Nano Banana 2 Edit** | 图生图 | 最多 **14 张参考图像** · 分辨率 1K/2K/4K · Google 搜索增强 |
| **Seedream 5.0** | 文生图 | ByteDance · 画质 basic/high · 8 种宽高比 · 最高 4K |
| **Seedream 5.0 Edit** | 图生图 | ByteDance · 自然语言风格迁移 · 画质 basic/high |
| **MiniMax Image 01** | 文生图 | MiniMax · 8 种宽高比 · 单次最多 4 张图 · 1500 字符提示 |

#### 多图输入

接受多张参考图像的模型在激活时会显示多选选择器：

| 模型 | 最大图像数 |
|---|---|
| Nano Banana 2 Edit | 14 |
| Nano Banana Edit | 10 |
| Flux Kontext Dev I2I | 10 |
| Kling O1 Edit Image | 10 |
| GPT-4o Edit / GPT Image 1.5 Edit | 10 |
| Bytedance Seedream Edit v4 / v4.5 | 10 |
| Vidu Q2 Reference to Image | 7 |
| Flux 2 Flex/Pro Edit | 8 |
| Nano Banana Pro Edit | 8 |
| Flux Kontext Pro/Max I2I | 2 |
| Wan 2.5/2.6 Image Edit | 2–3 |
| Qwen Image Edit Plus / 2511 | 3 |
| GPT-4o Image to Image | 5 |
| Flux 2 Klein 4b/9b Edit | 4 |

当选择多图模型时，上传触发器切换到多选模式：
* **带顺序编号的复选框** —— 图像按您选择的顺序发送给模型
* **批量上传** —— 一次从文件对话框中选取多个文件
* **触发器上的计数徽章** 显示当前已选图像数量；有空余槽位时显示 `+` 徽章
* **"使用所选"按钮** 确认并关闭选择器

### 🎬 视频工作室 —— 双模式

视频工作室遵循相同的模式：

| 模式 | 触发条件 | 模型 | 提示 |
|---|---|---|---|
| **文生视频** | 默认（无图像） | 40+ t2v 模型（Kling、Sora、Veo、Wan、Seedance 2.0、Hailuo、Runway…） | 必需 |
| **图生视频** | 上传起始帧 | 60+ i2v 模型（Kling I2V、Veo3 I2V、Runway I2V、Wan I2V、Seedance 2.0 I2V、Midjourney I2V…） | 可选 |

#### 新增模型

| 模型 | 类型 | 主要特性 |
|---|---|---|
| **Seedance 2.0** | 文生视频 | ByteDance · 宽高比 16:9 / 9:16 / 4:3 / 3:4 · 时长 5 / 10 / 15s · 画质 basic/high |
| **Seedance 2.0 I2V** | 图生视频 | ByteDance · 将图像动画化为视频 · 最多 9 张参考图像 · 宽高比 16:9 / 9:16 / 4:3 / 3:4 · 时长 5 / 10 / 15s · 画质 basic/high |
| **Seedance 2.0 Extend** | 视频扩展 | ByteDance · 无缝延续任意 Seedance 2.0 生成 · 保留风格、运动和音频 · 可选延续提示 · 时长 5 / 10 / 15s · 画质 basic/high |
| **Grok Imagine T2V** | 文生视频 | xAI · 时长 6 / 10 / **15s** · 模式：fun / normal / spicy · 宽高比 9:16 / 16:9 / 2:3 / 3:2 / 1:1 |
| **Grok Imagine I2V** | 图生视频 | xAI · 时长 6 / 10 / **15s** · 模式：fun / normal / spicy · 从静态图像生成电影级运动 |
| **MiniMax Hailuo 02 / 2.3 Standard & Pro** | 文生视频 / 图生视频 | MiniMax · 全高清视频 · 多种宽高比 · 包含快速版 |

### 🎤 口型同步工作室

**口型同步工作室**使用 9 个模型，支持两种输入模式生成音频驱动的说话视频：

| 模式 | 触发条件 | 说明 |
|---|---|---|
| **肖像图像** | 默认 | 上传肖像图像 + 音频文件 → 动画说话视频 |
| **视频** | 切换到视频模式 | 上传现有视频 + 音频文件 → 口型同步视频 |

#### 基于图像的模式（肖像图像 + 音频 → 视频）

| 模型 | 端点 | 分辨率 | 提示 |
|---|---|---|---|
| **Infinite Talk** | `infinitetalk-image-to-video` | 480p, 720p | 可选 |
| **Wan 2.2 Speech to Video** | `wan2.2-speech-to-video` | 480p, 720p | 可选 |
| **LTX 2.3 Lipsync** | `ltx-2.3-lipsync` | 480p, 720p, 1080p | 可选 |
| **LTX 2 19B Lipsync** | `ltx-2-19b-lipsync` | 480p, 720p, 1080p | 可选 |

#### 基于视频的模式（视频 + 音频 → 口型同步视频）

| 模型 | 端点 | 分辨率 | 提示 |
|---|---|---|---|
| **Sync Lipsync** | `sync-lipsync` | — | — |
| **LatentSync** | `latentsync-video` | — | — |
| **Creatify Lipsync** | `creatify-lipsync` | — | — |
| **Veed Lipsync** | `veed-lipsync` | — | — |
| **Infinite Talk V2V** | `infinitetalk-video-to-video` | 480p, 720p | 可选 |

**工作原理：**
1. 使用开关选择**肖像图像**或**视频**模式
2. 使用图像/视频上传按钮上传您的肖像图像（或视频）
3. 使用音频上传按钮上传您的音频文件
4. 可选：输入提示以引导运动风格
5. 选择模型和分辨率（若支持），然后点击**生成**

生成历史单独保存在 `lipsync_history` 中，待处理任务会在页面重新加载时自动恢复。

### 🔧 工作流工作室

**工作流工作室**让您无需编写代码即可构建和运行多步 AI 流水线。

**核心能力：**
* **模板** —— 从预构建的工作流开始（图像链、视频流水线等）
* **我的工作流** —— 保存和管理您自己的自定义流水线
* **社区** —— 浏览并运行其他用户发布的工作流
* **基于节点的构建器** —— 拖放可视化编辑器，连接模型并路由步骤间的输出
* **Playground** —— 通过表单 UI 交互式运行任何工作流；结果内联渲染
* **API 执行** —— 每个工作流也可通过 Muapi API 调用

> **想将工作流添加到您自己的应用中？** 查看 **[Vibe Workflow](https://github.com/SamurAIGPT/Vibe-Workflow)** —— 驱动此功能的开源工作流引擎。可将其放入任何项目中。

### 🎥 电影工作室控件

**电影工作室**提供对虚拟相机的精确控制，将您的选择转化为优化的提示修饰符：

| 类别 | 可用选项 |
|---|---|
| **相机** | Modular 8K Digital、Full-Frame Cine Digital、Grand Format 70mm Film、Studio Digital S35、Classic 16mm Film、Premium Large Format Digital |
| **镜头** | Creative Tilt、Compact Anamorphic、Extreme Macro、70s Cinema Prime、Classic Anamorphic、Premium Modern Prime、Warm Cinema Prime、Swirl Bokeh Portrait、Vintage Prime、Halation Diffusion、Clinical Sharp Prime |
| **焦距** | 8mm（超广角）、14mm、24mm、35mm（人眼视角）、50mm（人像）、85mm（紧致人像） |
| **光圈** | f/1.4（浅景深）、f/4（均衡）、f/11（深景深） |

### 📤 上传历史与选择器

您上传的每张图像都会保存在本地（URL + 缩略图），这样您就不会重复上传同一个文件：
* 点击上传按钮打开**参考图像选择器**
* 先前上传的图像以三列网格形式显示，带有缩略图
* **单图模型** —— 点击缩略图即可即时选择并关闭
* **多图模型** —— 切换多个缩略图（显示顺序编号），然后点击**使用所选**
* 使用**上传文件**按钮上传新图像（多图模式下支持多文件选择）
* 使用 ✕ 按钮从历史中移除单张图像
* 历史记录跨浏览器会话持久化（存储在 `localStorage` 中）

## 快速开始

### 前置要求

* [Node.js](https://nodejs.org/)（v18+）
* [Muapi.ai](https://muapi.ai) API 密钥

### 设置

> **大多数用户想要的是桌面应用，而不是这个开发路径。** 如果您只想在自己的机器上运行 Open Generative AI，请改用[下载预构建安装程序](https://github.com#-download-desktop-app) —— 无需 Node.js。以下说明适用于从源码构建的贡献者。

选择与您的目标匹配的入口点：
* **桌面应用（Electron）** → `npm run electron:dev`
* **托管 Web 版本（Next.js）** → `npm run dev`

```bash
# 克隆仓库（包含子模块 —— workflow + agent 包必需）
git clone --recurse-submodules https://github.com/Anil-matcha/Open-Generative-AI.git
cd Open-Generative-AI

# 如果您在克隆时没有使用 --recurse-submodules，请运行以下命令：
# git submodule update --init --recursive

# 安装依赖 + 构建工作区包（studio、workflow、agents）
# 此步骤是必需的 —— 仅运行 `npm install` 是不够的；工作区需要在 dev 脚本运行之前构建
npm run setup

# 然后启动以下之一：
npm run electron:dev   # 桌面应用（Electron + Vite）—— 推荐
npm run dev            # 托管 Web 版本（Next.js）→ http://localhost:3000
```

首次使用时，系统会提示您输入 Muapi API 密钥（如果您只打算使用本地模型，可以跳过密钥）。

> **故障排除 ——`Couldn't find a 'pages' directory`**：这意味着 Next.js 无法看到 `app/` 文件夹。请确认您是在仓库根目录（包含 `app/`、`package.json` 和 `next.config.mjs` 的目录）运行 `npm run dev`，并且您已使用子模块克隆。如果 `packages/Vibe-Workflow` 或 `packages/Open-Poe-AI` 为空，请重新运行 `npm run setup`。

### 生产环境构建

```bash
npm run build
npm run start
```

### 桌面应用构建

使用 Electron 构建原生桌面应用：

```bash
# macOS（DMG —— Intel + Apple Silicon）
npm run electron:build

# Windows（NSIS 安装程序 —— x64 + ARM64）
npm run electron:build:win

# Linux（AppImage + DEB —— x64）
npm run electron:build:linux

# 一步构建所有平台
npm run electron:build:all
```

安装程序输出到 `release/` 文件夹。预构建的二进制文件也可在 [Releases 页面](https://github.com/Anil-matcha/Open-Generative-AI/releases)获取。

## 🏗️ 架构

该应用是一个 **Next.js monorepo**，带有共享的 `packages/studio` 组件库。

```
Open-Generative-AI/
├── app/                          # Next.js App Router
│   ├── layout.js                 # 根布局（Tailwind、字体）
│   ├── page.js                   # 重定向 → /studio
│   └── studio/
│       └── page.js               # Studio 页面 —— 渲染 StandaloneShell
├── components/
│   ├── StandaloneShell.js        # 标签页导航 + BYOK（来自 localStorage 的 API 密钥）
│   └── ApiKeyModal.js            # API 密钥输入模态框
├── packages/
│   └── studio/                   # 共享 React 组件库
│       └── src/
│           ├── index.js          # 导出：ImageStudio、VideoStudio、LipSyncStudio、CinemaStudio、WorkflowStudio
│           ├── models.js         # 200+ 模型定义（单一事实来源）
│           ├── muapi.js          # API 客户端（命名导出，apiKey 作为第一个参数）
│           └── components/
│               ├── ImageStudio.jsx      # 双模式 t2i/i2i 工作室
│               ├── VideoStudio.jsx      # 双模式 t2v/i2v 工作室
│               ├── LipSyncStudio.jsx    # 肖像/视频 + 音频 → 说话视频
│               ├── CinemaStudio.jsx     # 带相机控件的专业工作室
│               └── WorkflowStudio.jsx   # 多步流水线构建器和 playground
├── next.config.mjs               # transpilePackages: ['studio']
├── tailwind.config.js
└── package.json                  # workspaces: ["packages/studio"]
```

`packages/studio` 库也被 [muapi.ai](https://muapi.ai) 上的托管版本所使用 —— 在 `packages/studio/src/models.js` 中对模型所做的更新会自动应用于自托管应用和托管版本。

## API 集成

该应用通过两步模式与 [Muapi.ai](https://muapi.ai) 通信：

1. **提交** —— `POST /api/v1/{model-endpoint}`，包含提示和参数
2. **轮询** —— `GET /api/v1/predictions/{request_id}/result`，直到状态变为 `completed`

认证使用 `x-api-key` 头。开发过程中，Vite 代理通过将 `/api` 请求路由到 `https://api.muapi.ai` 来处理 CORS。

文件上传使用 `POST /api/v1/upload_file`（multipart/form-data）并返回一个托管 URL，该 URL 传递给以图像为条件的模型。对于多图模型，`images_list` 数组在一次请求中完整转发给 API。

口型同步任务使用相同的两步模式：专用的 `processLipSync()` 方法接受 `image_url` 或 `video_url` 以及 `audio_url`，分发到模型端点，并轮询直到输出视频 URL 可用。

## 支持的模型类别

| 类别 | 数量 | 示例 |
|---|---|---|
| **文生图** | 50+ | Flux Dev、Nano Banana 2、Seedream 5.0、Ideogram v3、Midjourney v7、GPT-4o、SDXL |
| **图生图** | 55+ | Nano Banana 2 Edit（×14）、Flux Kontext Pro、GPT-4o Edit、Seededit v3、Upscaler、Background Remover |
| **文生视频** | 40+ | Kling v3、Sora 2、Veo 3、Wan 2.6、Seedance 2.0、Seedance 2.0 Extend、Seedance Pro、Hailuo 2.3、Runway Gen-3 |
| **图生视频** | 60+ | Kling v2.1 I2V、Veo3 I2V、Runway I2V、Seedance 2.0 I2V、Midjourney v7 I2V、Hunyuan I2V、Wan2.2 I2V |
| **口型同步** | 9 | Infinite Talk I2V、Wan 2.2 Speech to Video、LTX 2.3 Lipsync、LTX 2 19B Lipsync、Sync、LatentSync、Creatify、Veed、Infinite Talk V2V |

## 🛠️ 技术栈

* **Next.js 14** —— App Router、服务端组件、快速开发服务器
* **React 18** —— Studio UI 组件
* **Tailwind CSS v3** —— 实用优先的样式
* **npm workspaces** —— 带有共享 `packages/studio` 库的 monorepo
* **Muapi.ai** —— AI 模型 API 网关

## 这与其他 AI 视频平台有何不同？

**Open Generative AI** 是一个社区驱动的开源替代方案，在提供类似创意能力的同时，摆脱了封闭生态的限制：

| 其他提供商 | Open Generative AI |
|---|---|
| **成本** | 订阅制 | 免费（开源） |
| **内容过滤** | 是 —— 提示被阻止或修改 | 无 |
| **限制** | 平台护栏强制实施 | 完全创意自由 |
| **模型** | 专有 | 200+ 开放与商业模型 |
| **多图输入** | 有限 | 单次最多 14 张图像 |
| **口型同步** | 无 | 9 个模型，图像和视频模式 |
| **托管版本** | 订阅制 | 免费 at [muapi.ai/open-generative-ai](https://muapi.ai/open-generative-ai) |
| **自托管** | 否 | 是 |
| **可定制** | 否 | 完全可修改 |
| **数据隐私** | 基于云端 | 您的数据保留在本地 |
| **源代码** | 封闭 | MIT 许可证 |

## 许可证

MIT

## 鸣谢

使用 [Muapi.ai](https://muapi.ai) 构建 —— 统一 AI 图像和视频生成模型的 API。

---

**深入阅读：** 有关“AI Influencer”引擎、即将推出的“Popcorn”分镜功能以及此项目的未来计划的更多详情，请阅读[完整技术概览](https://medium.com/@anilmatcha/)。

---

*寻找免费、开源的 AI 视频平台？Open Generative AI 是一个开源的 AI 图像和视频生成工作室 —— 无内容过滤，可自托管、定制和扩展。*

## 关于

AI 视频平台的开源替代方案 —— 免费的 AI 图像与视频生成工作室，搭载 200+ 模型（Flux、Midjourney、Kling、Sora、Veo）。无内容过滤。可自托管，MIT 许可证。

[dev.muapi.ai/open-generative-ai](https://dev.muapi.ai/open-generative-ai)

# 参考资料

* any list
{:toc}