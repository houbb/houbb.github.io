---
layout: post 
title: Voicebox 开源语音合成工作室
date: 2026-04-15 21:01:55 +0800
categories: [AI]
tags: [ai, llm, voice]
published: true
---


# Voicebox

## 什么是 Voicebox？

Voicebox 是一个 **本地优先的声音克隆工作室** —— 免费开源的 ElevenLabs 替代品。只需几秒钟的音频即可克隆声音，在 5 种 TTS 引擎上生成 23 种语言的语音，应用后期处理效果，并通过时间轴编辑器创作多声部项目。

- **完全隐私** —— 模型和声音数据保留在您的机器上
- **5 种 TTS 引擎** —— Qwen3-TTS、LuxTTS、Chatterbox Multilingual、Chatterbox Turbo 和 HumeAI TADA
- **23 种语言** —— 从英语到阿拉伯语、日语、印地语、斯瓦希里语等
- **后期处理效果** —— 变调、混响、延迟、合唱、压缩和滤波器
- **富有表现力的语音** —— 通过 Chatterbox Turbo 支持 `[笑]`、`[叹息]`、`[倒吸一口气]` 等副语言标签
- **不限长度** —— 自动分块 + 交叉淡变，适用于脚本、文章和章节
- **故事编辑器** —— 多轨时间轴，用于对话、播客和叙事
- **API 优先** —— 提供 REST API，可将语音合成集成到您自己的项目中
- **原生性能** —— 基于 Tauri（Rust）构建，而非 Electron
- **全平台运行** —— macOS（MLX/Metal）、Windows（CUDA）、Linux、AMD ROCm、Intel Arc、Docker

---

## 下载

| 平台                      | 下载                                                       |
| ------------------------- | ---------------------------------------------------------- |
| macOS（Apple Silicon）    | [下载 DMG](https://voicebox.sh/download/mac-arm)           |
| macOS（Intel）            | [下载 DMG](https://voicebox.sh/download/mac-intel)         |
| Windows                   | [下载 MSI](https://voicebox.sh/download/windows)           |
| Docker                    | `docker compose up`                                        |

> **[查看所有二进制文件 →](https://github.com/jamiepine/voicebox/releases/latest)**

> **Linux** —— 暂未提供预编译二进制文件。请访问 [voicebox.sh/linux-install](https://voicebox.sh/linux-install) 查看从源码构建的说明。

---

## 功能

### 多引擎声音克隆

五种 TTS 引擎，各有优势，可按次切换：

| 引擎                           | 语言   | 优势                                                                                             |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------ |
| **Qwen3-TTS**（0.6B / 1.7B）   | 10     | 高质量多语言克隆，支持交付指令（如“说慢点”、“低语”）                                               |
| **LuxTTS**                     | 英语   | 轻量（约 1GB 显存），48kHz 输出，CPU 上 150 倍实时                                                |
| **Chatterbox Multilingual**    | 23     | 最广泛的语言覆盖 —— 阿拉伯语、丹麦语、芬兰语、希腊语、希伯来语、印地语、马来语、挪威语、波兰语、斯瓦希里语、瑞典语、土耳其语等 |
| **Chatterbox Turbo**           | 英语   | 快速 3.5 亿参数模型，支持副语言情感/声音标签                                                        |
| **TADA**（1B / 3B）            | 10     | HumeAI 语音语言模型 —— 700 秒以上连贯音频，文本-声学双重对齐                                         |

### 情感与副语言标签

在文本输入框中键入 `/` 可插入表达性标签，模型会将这些标签在语音中合成出来（Chatterbox Turbo）：

`[笑]` `[轻笑]` `[倒吸一口气]` `[咳嗽]` `[叹息]` `[呻吟]` `[抽鼻子]` `[嘘声]` `[清嗓子]`

### 后期处理效果

由 Spotify 的 `pedalboard` 库支持的 8 种音频效果。生成后应用，实时预览，可构建可复用的预设。

| 效果             | 描述                                   |
| ---------------- | -------------------------------------- |
| 变调             | 向上或向下最多 12 个半音                |
| 混响             | 可配置的房间大小、阻尼、干/湿比           |
| 延迟             | 可调时间、反馈和混合比例的回声           |
| 合唱 / 镶边      | 调制延迟，产生金属感或丰满的质感          |
| 压缩器           | 动态范围压缩                           |
| 增益             | 音量调节（-40 至 +40 dB）               |
| 高通滤波器       | 去除低频                               |
| 低通滤波器       | 去除高频                               |

内置 4 种预设（机器人、电台、回声室、低沉嗓音），并支持自定义预设。效果可设为每个配置文件的默认值。

### 不限长度的生成

文本会在句子边界处自动分割，每个块独立生成，然后交叉淡变合并。所有引擎均适用。

- 可配置的自动分块限制（100–5,000 字符）
- 交叉淡变滑块（0–200ms），实现平滑过渡
- 最大文本长度：50,000 字符
- 智能分割，尊重缩写、CJK 标点和 `[标签]`

### 生成版本

每次生成支持多个版本，并记录来源：

- **原始** —— 干净的 TTS 输出，始终保留
- **效果版本** —— 基于任意源版本应用不同效果链
- **录制（Takes）** —— 使用新的随机种子重新生成，获得变化
- **来源追踪** —— 每个版本记录其派生路径
- **收藏** —— 给生成结果加星，便于快速访问

### 异步生成队列

生成不阻塞。提交后可以立即开始输入下一条。

- 串行执行队列，避免 GPU 争用
- 实时 SSE 状态推送
- 失败的生成可以重试
- 因崩溃导致的陈旧生成在启动时自动恢复

### 声音配置文件管理

- 从音频文件创建配置文件，或直接在应用内录制
- 导入/导出配置文件，便于共享或备份
- 支持多样本，提高克隆质量
- 每个配置文件的默认效果链
- 使用描述和语言标签进行分类整理

### 故事编辑器

多声部时间轴编辑器，用于对话、播客和叙事。

- 多轨编排，支持拖放
- 内联音频裁剪和拆分
- 自动播放，播放头同步
- 每个轨道片段可固定版本

### 录制与转录

- 应用内录制，带波形可视化
- 系统音频捕获（macOS 和 Windows）
- 由 Whisper（包括 Whisper Turbo）驱动的自动转录
- 导出多种格式的录音

### 模型管理

- 支持卸载单个模型以释放 GPU 内存，无需删除下载
- 通过 `VOICEBOX_MODELS_DIR` 自定义模型目录
- 模型文件夹迁移，带进度跟踪
- 下载取消/清除界面

### GPU 支持

| 平台                       | 后端               | 说明                                                       |
| -------------------------- | ------------------ | ---------------------------------------------------------- |
| macOS（Apple Silicon）     | MLX（Metal）       | 通过神经网络引擎加速 4-5 倍                                |
| Windows / Linux（NVIDIA）  | PyTorch（CUDA）    | 应用内自动下载 CUDA 二进制文件                             |
| Linux（AMD）               | PyTorch（ROCm）    | 自动配置 `HSA_OVERRIDE_GFX_VERSION`                        |
| Windows（任意 GPU）        | DirectML           | 通用的 Windows GPU 支持                                    |
| Intel Arc                  | IPEX/XPU           | Intel 独立显卡加速                                         |
| 任意平台                   | CPU                | 随处可用，速度较慢                                         |

---

## API

Voicebox 提供完整的 REST API，可将语音合成集成到您自己的应用中。

```bash
# 生成语音
curl -X POST http://localhost:17493/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "你好，世界", "profile_id": "abc123", "language": "zh"}'

# 列出声音配置文件
curl http://localhost:17493/profiles

# 创建配置文件
curl -X POST http://localhost:17493/profiles \
  -H "Content-Type: application/json" \
  -d '{"name": "我的声音", "language": "zh"}'
```

**应用场景：** 游戏对话、播客制作、无障碍工具、语音助手、内容自动化。

完整 API 文档请访问 `http://localhost:17493/docs`。

---

## 技术栈

| 层级         | 技术栈                                            |
| ------------ | ------------------------------------------------- |
| 桌面应用     | Tauri（Rust）                                     |
| 前端         | React、TypeScript、Tailwind CSS                   |
| 状态管理     | Zustand、React Query                              |
| 后端         | FastAPI（Python）                                 |
| TTS 引擎     | Qwen3-TTS、LuxTTS、Chatterbox、Chatterbox Turbo、TADA |
| 效果         | Pedalboard（Spotify）                             |
| 转录         | Whisper / Whisper Turbo（PyTorch 或 MLX）          |
| 推理         | MLX（Apple Silicon）/ PyTorch（CUDA/ROCm/XPU/CPU） |
| 数据库       | SQLite                                            |
| 音频         | WaveSurfer.js、librosa                            |

---

## 路线图

| 特性                   | 描述                                   |
| ---------------------- | -------------------------------------- |
| **实时流式传输**       | 逐词生成并流式传输音频                 |
| **声音设计**           | 通过文本描述创建新的声音               |
| **更多模型**           | XTTS、Bark 及其他开源声音模型          |
| **插件架构**           | 通过自定义模型和效果进行扩展           |
| **移动伴侣应用**       | 从手机控制 Voicebox                    |

---

## 开发

详细设置和贡献指南请参见 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 快速开始

```bash
git clone https://github.com/jamiepine/voicebox.git
cd voicebox

just setup   # 创建 Python 虚拟环境，安装所有依赖
just dev     # 启动后端 + 桌面应用
```

安装 [just](https://github.com/casey/just)：`brew install just` 或 `cargo install just`。运行 `just --list` 查看所有命令。

**前置条件：** [Bun](https://bun.sh)、[Rust](https://rustup.rs)、[Python 3.11+](https://python.org)、[Tauri 前置条件](https://v2.tauri.app/start/prerequisites/)，以及 macOS 上的 [Xcode](https://developer.apple.com/xcode/)。

### 本地构建

```bash
just build          # 构建 CPU 服务器二进制 + Tauri 应用
just build-local    # （Windows）构建 CPU + CUDA 服务器二进制 + Tauri 应用
```

### 添加新的声音模型

多引擎架构使得添加新 TTS 引擎变得简单。[分步指南](docs/content/docs/developer/tts-engines.mdx)涵盖了完整流程：依赖调研、后端协议实现、前端连接以及 PyInstaller 打包。

该指南针对 AI 编程助手进行了优化。[Agent 技能](.agents/skills/add-tts-engine/SKILL.md)可以接收模型名称并自动完成整个集成 —— 您只需在本地测试构建即可。

### 项目结构

```
voicebox/
├── app/              # 共享 React 前端
├── tauri/            # 桌面应用（Tauri + Rust）
├── web/              # Web 部署
├── backend/          # Python FastAPI 服务器
├── landing/          # 营销网站
└── scripts/          # 构建和发布脚本
```

---

## 贡献

欢迎贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

1. Fork 仓库
2. 创建特性分支
3. 进行更改
4. 提交 PR

## 安全

发现安全漏洞？请负责任地报告。详情见 [SECURITY.md](SECURITY.md)。

---

## 许可证

MIT 许可证 —— 详见 [LICENSE](LICENSE)。

# 参考资料

* any list
{:toc}