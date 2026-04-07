---
layout: post 
title: llama.cpp 的主要目标是在广泛多样的硬件上（本地和云端）以最少的设置和最先进的性能实现 LLM 推理。
date: 2026-04-07 21:01:55 +0800
categories: [AI]
tags: [ai, llm]
published: true
---

# llama.cpp

![llama](https://user-images.githubusercontent.com/1991296/230134379-7181e485-c521-4d23-a0d6-f7b3b61ba524.png)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Release](https://img.shields.io/github/v/release/ggml-org/llama.cpp)](https://github.com/ggml-org/llama.cpp/releases)
[![Server](https://github.com/ggml-org/llama.cpp/actions/workflows/server.yml/badge.svg)](https://github.com/ggml-org/llama.cpp/actions/workflows/server.yml)

[宣言](https://github.com/ggml-org/llama.cpp/discussions/205) / [ggml](https://github.com/ggml-org/ggml) / [操作](https://github.com/ggml-org/llama.cpp/blob/master/docs/ops.md)

C/C++ 中的 LLM 推理

## 近期 API 变更

- [`libllama` API 变更日志](https://github.com/ggml-org/llama.cpp/issues/9289)
- [`llama-server` REST API 变更日志](https://github.com/ggml-org/llama.cpp/issues/9291)

## 热门话题

- **Hugging Face 缓存迁移：使用 `-hf` 下载的模型现在存储在标准 Hugging Face 缓存目录中，从而能够与其他 HF 工具共享。**
- **[指南：使用 llama.cpp 的新 WebUI](https://github.com/ggml-org/llama.cpp/discussions/16938)**
- [指南：使用 llama.cpp 运行 gpt-oss](https://github.com/ggml-org/llama.cpp/discussions/15396)
- [[反馈] 为 llama.cpp 提供更好的打包以支持下游消费者 🤗](https://github.com/ggml-org/llama.cpp/discussions/15313)
- 已添加对原生 MXFP4 格式的 `gpt-oss` 模型的支持 | [PR](https://github.com/ggml-org/llama.cpp/pull/15091) | [与 NVIDIA 的合作](https://blogs.nvidia.com/blog/rtx-ai-garage-openai-oss) | [评论](https://github.com/ggml-org/llama.cpp/discussions/15095)
- `llama-server` 中已添加多模态支持：[#12898](https://github.com/ggml-org/llama.cpp/pull/12898) | [文档](./docs/multimodal.md)
- 用于 FIM 补全的 VS Code 扩展：https://github.com/ggml-org/llama.vscode
- 用于 FIM 补全的 Vim/Neovim 插件：https://github.com/ggml-org/llama.vim
- Hugging Face Inference Endpoints 现在开箱即用地支持 GGUF！https://github.com/ggml-org/llama.cpp/discussions/9669
- Hugging Face GGUF 编辑器：[讨论](https://github.com/ggml-org/llama.cpp/discussions/9268) | [工具](https://huggingface.co/spaces/CISCai/gguf-editor)

----

## 快速开始

开始使用 llama.cpp 非常简单。以下是几种在您的机器上安装它的方法：

- 使用 [brew、nix 或 winget](docs/install.md) 安装 `llama.cpp`
- 使用 Docker 运行——请参阅我们的 [Docker 文档](docs/docker.md)
- 从[发布页面](https://github.com/ggml-org/llama.cpp/releases)下载预编译二进制文件
- 通过克隆本仓库从源码构建——请查看我们的[构建指南](docs/build.md)

安装完成后，您需要一个模型来使用。请前往[获取和量化模型](#obtaining-and-quantizing-models)部分了解更多信息。

示例命令：

```sh
# 使用本地模型文件
llama-cli -m my_model.gguf

# 或者直接从 Hugging Face 下载并运行模型
llama-cli -hf ggml-org/gemma-3-1b-it-GGUF

# 启动兼容 OpenAI 的 API 服务器
llama-server -hf ggml-org/gemma-3-1b-it-GGUF
```

## 描述

`llama.cpp` 的主要目标是在广泛多样的硬件上（本地和云端）以最少的设置和最先进的性能实现 LLM 推理。

- 纯 C/C++ 实现，无任何依赖
- Apple Silicon 是一等公民——通过 ARM NEON、Accelerate 和 Metal 框架进行优化
- 对 x86 架构提供 AVX、AVX2、AVX512 和 AMX 支持
- 对 RISC-V 架构提供 RVV、ZVFH、ZFH、ZICBOP 和 ZIHINTPAUSE 支持
- 1.5-bit、2-bit、3-bit、4-bit、5-bit、6-bit 和 8-bit 整数量化，以实现更快的推理和减少内存使用
- 用于在 NVIDIA GPU 上运行 LLM 的自定义 CUDA 内核（通过 HIP 支持 AMD GPU，通过 MUSA 支持 Moore Threads GPU）
- 支持 Vulkan 和 SYCL 后端
- CPU+GPU 混合推理，以部分加速超过总显存容量的大模型

`llama.cpp` 项目是为 [ggml](https://github.com/ggml-org/ggml) 库开发新功能的主要试验场。

<details>
<summary>模型</summary>

通常，以下基础模型的微调版本也得到支持。

添加新模型支持的说明：[HOWTO-add-model.md](docs/development/HOWTO-add-model.md)

#### 纯文本

- [X] LLaMA 🦙
- [x] LLaMA 2 🦙🦙
- [x] LLaMA 3 🦙🦙🦙
- [X] [Mistral 7B](https://huggingface.co/mistralai/Mistral-7B-v0.1)
- [x] [Mixtral MoE](https://huggingface.co/models?search=mistral-ai/Mixtral)
- [x] [DBRX](https://huggingface.co/databricks/dbrx-instruct)
- [x] [Jamba](https://huggingface.co/ai21labs)
- [X] [Falcon](https://huggingface.co/models?search=tiiuae/falcon)
- [X] [Chinese LLaMA / Alpaca](https://github.com/ymcui/Chinese-LLaMA-Alpaca) 和 [Chinese LLaMA-2 / Alpaca-2](https://github.com/ymcui/Chinese-LLaMA-Alpaca-2)
- [X] [Vigogne（法语）](https://github.com/bofenghuang/vigogne)
- [X] [BERT](https://github.com/ggml-org/llama.cpp/pull/5423)
- [X] [Koala](https://bair.berkeley.edu/blog/2023/04/03/koala/)
- [X] [Baichuan 1 & 2](https://huggingface.co/models?search=baichuan-inc/Baichuan) + [衍生模型](https://huggingface.co/hiyouga/baichuan-7b-sft)
- [X] [Aquila 1 & 2](https://huggingface.co/models?search=BAAI/Aquila)
- [X] [Starcoder 模型](https://github.com/ggml-org/llama.cpp/pull/3187)
- [X] [Refact](https://huggingface.co/smallcloudai/Refact-1_6B-fim)
- [X] [MPT](https://github.com/ggml-org/llama.cpp/pull/3417)
- [X] [Bloom](https://github.com/ggml-org/llama.cpp/pull/3553)
- [x] [Yi 模型](https://huggingface.co/models?search=01-ai/Yi)
- [X] [StableLM 模型](https://huggingface.co/stabilityai)
- [x] [Deepseek 模型](https://huggingface.co/models?search=deepseek-ai/deepseek)
- [x] [Qwen 模型](https://huggingface.co/models?search=Qwen/Qwen)
- [x] [PLaMo-13B](https://github.com/ggml-org/llama.cpp/pull/3557)
- [x] [Phi 模型](https://huggingface.co/models?search=microsoft/phi)
- [x] [PhiMoE](https://github.com/ggml-org/llama.cpp/pull/11003)
- [x] [GPT-2](https://huggingface.co/gpt2)
- [x] [Orion 14B](https://github.com/ggml-org/llama.cpp/pull/5118)
- [x] [InternLM2](https://huggingface.co/models?search=internlm2)
- [x] [CodeShell](https://github.com/WisdomShell/codeshell)
- [x] [Gemma](https://ai.google.dev/gemma)
- [x] [Mamba](https://github.com/state-spaces/mamba)
- [x] [Grok-1](https://huggingface.co/keyfan/grok-1-hf)
- [x] [Xverse](https://huggingface.co/models?search=xverse)
- [x] [Command-R 模型](https://huggingface.co/models?search=CohereForAI/c4ai-command-r)
- [x] [SEA-LION](https://huggingface.co/models?search=sea-lion)
- [x] [GritLM-7B](https://huggingface.co/GritLM/GritLM-7B) + [GritLM-8x7B](https://huggingface.co/GritLM/GritLM-8x7B)
- [x] [OLMo](https://allenai.org/olmo)
- [x] [OLMo 2](https://allenai.org/olmo)
- [x] [OLMoE](https://huggingface.co/allenai/OLMoE-1B-7B-0924)
- [x] [Granite 模型](https://huggingface.co/collections/ibm-granite/granite-code-models-6624c5cec322e4c148c8b330)
- [x] [GPT-NeoX](https://github.com/EleutherAI/gpt-neox) + [Pythia](https://github.com/EleutherAI/pythia)
- [x] [Snowflake-Arctic MoE](https://huggingface.co/collections/Snowflake/arctic-66290090abe542894a5ac520)
- [x] [Smaug](https://huggingface.co/models?search=Smaug)
- [x] [Poro 34B](https://huggingface.co/LumiOpen/Poro-34B)
- [x] [Bitnet b1.58 模型](https://huggingface.co/1bitLLM)
- [x] [Flan T5](https://huggingface.co/models?search=flan-t5)
- [x] [Open Elm 模型](https://huggingface.co/collections/apple/openelm-instruct-models-6619ad295d7ae9f868b759ca)
- [x] [ChatGLM3-6b](https://huggingface.co/THUDM/chatglm3-6b) + [ChatGLM4-9b](https://huggingface.co/THUDM/glm-4-9b) + [GLMEdge-1.5b](https://huggingface.co/THUDM/glm-edge-1.5b-chat) + [GLMEdge-4b](https://huggingface.co/THUDM/glm-edge-4b-chat)
- [x] [GLM-4-0414](https://huggingface.co/collections/THUDM/glm-4-0414-67f3cbcb34dd9d252707cb2e)
- [x] [SmolLM](https://huggingface.co/collections/HuggingFaceTB/smollm-6695016cad7167254ce15966)
- [x] [EXAONE-3.0-7.8B-Instruct](https://huggingface.co/LGAI-EXAONE/EXAONE-3.0-7.8B-Instruct)
- [x] [FalconMamba 模型](https://huggingface.co/collections/tiiuae/falconmamba-7b-66b9a580324dd1598b0f6d4a)
- [x] [Jais](https://huggingface.co/inceptionai/jais-13b-chat)
- [x] [Bielik-11B-v2.3](https://huggingface.co/collections/speakleash/bielik-11b-v23-66ee813238d9b526a072408a)
- [x] [RWKV-7](https://huggingface.co/collections/shoumenchougou/rwkv7-gxx-gguf)
- [x] [RWKV-6](https://github.com/BlinkDL/RWKV-LM)
- [x] [QRWKV-6](https://huggingface.co/recursal/QRWKV6-32B-Instruct-Preview-v0.1)
- [x] [GigaChat-20B-A3B](https://huggingface.co/ai-sage/GigaChat-20B-A3B-instruct)
- [X] [Trillion-7B-preview](https://huggingface.co/trillionlabs/Trillion-7B-preview)
- [x] [Ling 模型](https://huggingface.co/collections/inclusionAI/ling-67c51c85b34a7ea0aba94c32)
- [x] [LFM2 模型](https://huggingface.co/collections/LiquidAI/lfm2-686d721927015b2ad73eaa38)
- [x] [Hunyuan 模型](https://huggingface.co/collections/tencent/hunyuan-dense-model-6890632cda26b19119c9c5e7)
- [x] [BailingMoeV2（Ring/Ling 2.0）模型](https://huggingface.co/collections/inclusionAI/ling-v2-68bf1dd2fc34c306c1fa6f86)

#### 多模态

- [x] [LLaVA 1.5 模型](https://huggingface.co/collections/liuhaotian/llava-15-653aac15d994e992e2677a7e)，[LLaVA 1.6 模型](https://huggingface.co/collections/liuhaotian/llava-16-65b9e40155f60fd046a5ccf2)
- [x] [BakLLaVA](https://huggingface.co/models?search=SkunkworksAI/Bakllava)
- [x] [Obsidian](https://huggingface.co/NousResearch/Obsidian-3B-V0.5)
- [x] [ShareGPT4V](https://huggingface.co/models?search=Lin-Chen/ShareGPT4V)
- [x] [MobileVLM 1.7B/3B 模型](https://huggingface.co/models?search=mobileVLM)
- [x] [Yi-VL](https://huggingface.co/models?search=Yi-VL)
- [x] [Mini CPM](https://huggingface.co/models?search=MiniCPM)
- [x] [Moondream](https://huggingface.co/vikhyatk/moondream2)
- [x] [Bunny](https://github.com/BAAI-DCAI/Bunny)
- [x] [GLM-EDGE](https://huggingface.co/models?search=glm-edge)
- [x] [Qwen2-VL](https://huggingface.co/collections/Qwen/qwen2-vl-66cee7455501d7126940800d)
- [x] [LFM2-VL](https://huggingface.co/collections/LiquidAI/lfm2-vl-68963bbc84a610f7638d5ffa)

</details>

<details>
<summary>绑定</summary>

- Python: [ddh0/easy-llama](https://github.com/ddh0/easy-llama)
- Python: [abetlen/llama-cpp-python](https://github.com/abetlen/llama-cpp-python)
- Go: [go-skynet/go-llama.cpp](https://github.com/go-skynet/go-llama.cpp)
- Node.js: [withcatai/node-llama-cpp](https://github.com/withcatai/node-llama-cpp)
- JS/TS（llama.cpp 服务器客户端）: [lgrammel/modelfusion](https://modelfusion.dev/integration/model-provider/llamacpp)
- JS/TS（可编程提示引擎 CLI）: [offline-ai/cli](https://github.com/offline-ai/cli)
- JavaScript/Wasm（可在浏览器中运行）: [tangledgroup/llama-cpp-wasm](https://github.com/tangledgroup/llama-cpp-wasm)
- Typescript/Wasm（更友好的 API，在 npm 上可用）: [ngxson/wllama](https://github.com/ngxson/wllama)
- Ruby: [yoshoku/llama_cpp.rb](https://github.com/yoshoku/llama_cpp.rb)
- Rust（更多功能）: [edgenai/llama_cpp-rs](https://github.com/edgenai/llama_cpp-rs)
- Rust（更友好的 API）: [mdrokz/rust-llama.cpp](https://github.com/mdrokz/rust-llama.cpp)
- Rust（更直接的绑定）: [utilityai/llama-cpp-rs](https://github.com/utilityai/llama-cpp-rs)
- Rust（来自 crates.io 的自动构建）: [ShelbyJenkins/llm_client](https://github.com/ShelbyJenkins/llm_client)
- C#/.NET: [SciSharp/LLamaSharp](https://github.com/SciSharp/LLamaSharp)
- C#/VB.NET（更多功能 - 社区许可证）: [LM-Kit.NET](https://docs.lm-kit.com/lm-kit-net/index.html)
- Scala 3: [donderom/llm4s](https://github.com/donderom/llm4s)
- Clojure: [phronmophobic/llama.clj](https://github.com/phronmophobic/llama.clj)
- React Native: [mybigday/llama.rn](https://github.com/mybigday/llama.rn)
- Java: [kherud/java-llama.cpp](https://github.com/kherud/java-llama.cpp)
- Java: [QuasarByte/llama-cpp-jna](https://github.com/QuasarByte/llama-cpp-jna)
- Zig: [deins/llama.cpp.zig](https://github.com/Deins/llama.cpp.zig)
- Flutter/Dart: [netdur/llama_cpp_dart](https://github.com/netdur/llama_cpp_dart)
- Flutter: [xuegao-tzx/Fllama](https://github.com/xuegao-tzx/Fllama)
- PHP（基于 llama.cpp 的 API 绑定和功能）: [distantmagic/resonance](https://github.com/distantmagic/resonance) [（更多信息）](https://github.com/ggml-org/llama.cpp/pull/6326)
- Guile Scheme: [guile_llama_cpp](https://savannah.nongnu.org/projects/guile-llama-cpp)
- Swift: [srgtuszy/llama-cpp-swift](https://github.com/srgtuszy/llama-cpp-swift)
- Swift: [ShenghaiWang/SwiftLlama](https://github.com/ShenghaiWang/SwiftLlama)
- Delphi: [Embarcadero/llama-cpp-delphi](https://github.com/Embarcadero/llama-cpp-delphi)
- Go（无需 CGo）: [hybridgroup/yzma](https://github.com/hybridgroup/yzma)
- Android: [llama.android](/examples/llama.android)

</details>

<details>
<summary>UI 界面</summary>

*（要使项目在此列出，应明确声明其依赖于 `llama.cpp`）*

- [AI Sublime Text 插件](https://github.com/yaroslavyaroslav/OpenAI-sublime-text)（MIT）
- [BonzAI App](https://apps.apple.com/us/app/bonzai-your-local-ai-agent/id6752847988)（专有）
- [cztomsik/ava](https://github.com/cztomsik/ava)（MIT）
- [Dot](https://github.com/alexpinel/Dot)（GPL）
- [eva](https://github.com/ylsdamxssjxxdd/eva)（MIT）
- [iohub/collama](https://github.com/iohub/coLLaMA)（Apache-2.0）
- [janhq/jan](https://github.com/janhq/jan)（AGPL）
- [johnbean393/Sidekick](https://github.com/johnbean393/Sidekick)（MIT）
- [KanTV](https://github.com/zhouwg/kantv?tab=readme-ov-file)（Apache-2.0）
- [KodiBot](https://github.com/firatkiral/kodibot)（GPL）
- [llama.vim](https://github.com/ggml-org/llama.vim)（MIT）
- [LARS](https://github.com/abgulati/LARS)（AGPL）
- [Llama Assistant](https://github.com/vietanhdev/llama-assistant)（GPL）
- [LlamaLib](https://github.com/undreamai/LlamaLib)（Apache-2.0）
- [LLMFarm](https://github.com/guinmoon/LLMFarm?tab=readme-ov-file)（MIT）
- [LLMUnity](https://github.com/undreamai/LLMUnity)（MIT）
- [LMStudio](https://lmstudio.ai/)（专有）
- [LocalAI](https://github.com/mudler/LocalAI)（MIT）
- [LostRuins/koboldcpp](https://github.com/LostRuins/koboldcpp)（AGPL）
- [MindMac](https://mindmac.app)（专有）
- [MindWorkAI/AI-Studio](https://github.com/MindWorkAI/AI-Studio)（FSL-1.1-MIT）
- [Mobile-Artificial-Intelligence/maid](https://github.com/Mobile-Artificial-Intelligence/maid)（MIT）
- [Mozilla-Ocho/llamafile](https://github.com/Mozilla-Ocho/llamafile)（Apache-2.0）
- [nat/openplayground](https://github.com/nat/openplayground)（MIT）
- [nomic-ai/gpt4all](https://github.com/nomic-ai/gpt4all)（MIT）
- [ollama/ollama](https://github.com/ollama/ollama)（MIT）
- [oobabooga/text-generation-webui](https://github.com/oobabooga/text-generation-webui)（AGPL）
- [PocketPal AI](https://github.com/a-ghorbani/pocketpal-ai)（MIT）
- [psugihara/FreeChat](https://github.com/psugihara/FreeChat)（MIT）
- [ptsochantaris/emeltal](https://github.com/ptsochantaris/emeltal)（MIT）
- [pythops/tenere](https://github.com/pythops/tenere)（AGPL）
- [ramalama](https://github.com/containers/ramalama)（MIT）
- [semperai/amica](https://github.com/semperai/amica)（MIT）
- [withcatai/catai](https://github.com/withcatai/catai)（MIT）
- [Autopen](https://github.com/blackhole89/autopen)（GPL）

</details>

<details>
<summary>工具</summary>

- [akx/ggify](https://github.com/akx/ggify) – 从 Hugging Face Hub 下载 PyTorch 模型并转换为 GGML
- [akx/ollama-dl](https://github.com/akx/ollama-dl) – 从 Ollama 库下载模型，直接与 llama.cpp 一起使用
- [crashr/gppm](https://github.com/crashr/gppm) – 启动利用 NVIDIA Tesla P40 或 P100 GPU 的 llama.cpp 实例，降低空闲功耗
- [gpustack/gguf-parser](https://github.com/gpustack/gguf-parser-go/tree/main/cmd/gguf-parser) - 查看/检查 GGUF 文件并估算内存使用量
- [Styled Lines](https://marketplace.unity.com/packages/tools/generative-ai/styled-lines-llama-cpp-model-292902)（专有许可，用于 Unity3d 游戏开发的推理部分异步包装器，提供预构建的移动端和 Web 平台包装器以及模型示例）
- [unslothai/unsloth](https://github.com/unslothai/unsloth) – 🦥 将微调和训练好的模型导出/保存为 GGUF（Apache-2.0）

</details>

<details>
<summary>基础设施</summary>

- [Paddler](https://github.com/intentee/paddler) - 开源 LLMOps 平台，用于在您自己的基础设施中托管和扩展 AI
- [GPUStack](https://github.com/gpustack/gpustack) - 管理 GPU 集群以运行 LLM
- [llama_cpp_canister](https://github.com/onicai/llama_cpp_canister) - llama.cpp 作为互联网计算机上的智能合约，使用 WebAssembly
- [llama-swap](https://github.com/mostlygeek/llama-swap) - 透明代理，为 llama-server 添加自动模型切换功能
- [Kalavai](https://github.com/kalavai-net/kalavai-client) - 众包端到端 LLM 部署，任意规模
- [llmaz](https://github.com/InftyAI/llmaz) - ☸️ 在 Kubernetes 上为大型语言模型提供简单、高级的推理平台。
- [LLMKube](https://github.com/defilantech/llmkube) - 支持多 GPU 和 Apple Silicon Metal 的 llama.cpp Kubernetes 操作器

</details>

<details>
<summary>游戏</summary>

- [Lucy's Labyrinth](https://github.com/MorganRO8/Lucys_Labyrinth) - 一个简单的迷宫游戏，由 AI 模型控制的智能体将试图欺骗您。

</details>

## 支持的后端

| 后端 | 目标设备 |
| --- | --- |
| [Metal](docs/build.md#metal-build) | Apple Silicon |
| [BLAS](docs/build.md#blas-build) | 所有 |
| [BLIS](docs/backend/BLIS.md) | 所有 |
| [SYCL](docs/backend/SYCL.md) | Intel 和 Nvidia GPU |
| [OpenVINO [进行中]](docs/backend/OPENVINO.md) | Intel CPU、GPU 和 NPU |
| [MUSA](docs/build.md#musa) | Moore Threads GPU |
| [CUDA](docs/build.md#cuda) | Nvidia GPU |
| [HIP](docs/build.md#hip) | AMD GPU |
| [ZenDNN](docs/build.md#zendnn) | AMD CPU |
| [Vulkan](docs/build.md#vulkan) | GPU |
| [CANN](docs/build.md#cann) | Ascend NPU |
| [OpenCL](docs/backend/OPENCL.md) | Adreno GPU |
| [IBM zDNN](docs/backend/zDNN.md) | IBM Z 和 LinuxONE |
| [WebGPU [进行中]](docs/build.md#webgpu) | 所有 |
| [RPC](https://github.com/ggml-org/llama.cpp/tree/master/tools/rpc) | 所有 |
| [Hexagon [进行中]](docs/backend/snapdragon/README.md) | Snapdragon |
| [VirtGPU](docs/backend/VirtGPU.md) | VirtGPU APIR |

## 获取和量化模型

[Hugging Face](https://huggingface.co) 平台托管了许多与 `llama.cpp` 兼容的 LLM：

- [趋势](https://huggingface.co/models?library=gguf&sort=trending)
- [LLaMA](https://huggingface.co/models?sort=trending&search=llama+gguf)

您可以手动下载 GGUF 文件，或者直接使用来自 [Hugging Face](https://huggingface.co/) 或其他模型托管站点的任何与 `llama.cpp` 兼容的模型，通过使用此 CLI 参数：`-hf <用户>/<模型>[:量化]`。例如：

```sh
llama-cli -hf ggml-org/gemma-3-1b-it-GGUF
```

默认情况下，CLI 会从 Hugging Face 下载，您可以使用环境变量 `MODEL_ENDPOINT` 切换到其他选项。`MODEL_ENDPOINT` 必须指向与 Hugging Face 兼容的 API 端点。

下载模型后，使用 CLI 工具在本地运行它——请参见下文。

`llama.cpp` 要求模型以 [GGUF](https://github.com/ggml-org/ggml/blob/master/docs/gguf.md) 文件格式存储。其他数据格式的模型可以使用本仓库中的 `convert_*.py` Python 脚本转换为 GGUF。

Hugging Face 平台提供了多种在线工具，用于使用 `llama.cpp` 转换、量化和托管模型：

- 使用 [GGUF-my-repo space](https://huggingface.co/spaces/ggml-org/gguf-my-repo) 转换为 GGUF 格式并将模型权重量化为更小的大小
- 使用 [GGUF-my-LoRA space](https://huggingface.co/spaces/ggml-org/gguf-my-lora) 将 LoRA 适配器转换为 GGUF 格式（更多信息：https://github.com/ggml-org/llama.cpp/discussions/10123）
- 使用 [GGUF-editor space](https://huggingface.co/spaces/CISCai/gguf-editor) 在浏览器中编辑 GGUF 元数据（更多信息：https://github.com/ggml-org/llama.cpp/discussions/9268）
- 使用 [Inference Endpoints](https://ui.endpoints.huggingface.co/) 在云端直接托管 `llama.cpp`（更多信息：https://github.com/ggml-org/llama.cpp/discussions/9669）

要了解有关模型量化的更多信息，请[阅读此文档](tools/quantize/README.md)

## [`llama-cli`](tools/cli)

#### 用于访问和试验 `llama.cpp` 大部分功能的 CLI 工具。

- <details open>
    <summary>以对话模式运行</summary>

    具有内置聊天模板的模型将自动激活对话模式。如果未发生这种情况，您可以通过添加 `-cnv` 并使用 `--chat-template NAME` 指定合适的聊天模板来手动启用它。

    ```bash
    llama-cli -m model.gguf

    # > 嗨，你是谁？
    # 您好！我是您的有用助手！我是一个由 AI 驱动的聊天机器人，旨在为像您这样的用户提供帮助和信息。我在这里帮助回答您的问题、提供指导并在一系列广泛的主题上提供支持。我是一个友好且知识渊博的 AI，随时乐意为您提供任何需要的帮助。您在想什么，我今天能如何帮助您？
    #
    # > 1+1 等于多少？
    # 简单！1+1 的答案是……2！
    ```

    </details>

- <details>
    <summary>使用自定义聊天模板以对话模式运行</summary>

    ```bash
    # 使用 "chatml" 模板（使用 -h 查看支持的模板列表）
    llama-cli -m model.gguf -cnv --chat-template chatml

    # 使用自定义模板
    llama-cli -m model.gguf -cnv --in-prefix 'User: ' --reverse-prompt 'User:'
    ```

    </details>

- <details>
    <summary>使用自定义语法约束输出</summary>

    ```bash
    llama-cli -m model.gguf -n 256 --grammar-file grammars/json.gbnf -p 'Request: schedule a call at 8pm; Command:'

    # {"appointmentTime": "8pm", "appointmentDetails": "schedule a a call"}
    ```

    [grammars/](grammars/) 文件夹包含一些示例语法。要编写您自己的语法，请查看 [GBNF 指南](grammars/README.md)。

    要编写更复杂的 JSON 语法，请查看 https://grammar.intrinsiclabs.ai/

    </details>

## [`llama-server`](tools/server)

#### 一个轻量级、兼容 [OpenAI API](https://github.com/openai/openai-openapi) 的 HTTP 服务器，用于服务 LLM。

- <details open>
    <summary>在端口 8080 上使用默认配置启动本地 HTTP 服务器</summary>

    ```bash
    llama-server -m model.gguf --port 8080

    # 可通过浏览器访问基本 Web UI：http://localhost:8080
    # 聊天补全端点：http://localhost:8080/v1/chat/completions
    ```

    </details>

- <details>
    <summary>支持多用户和并行解码</summary>

    ```bash
    # 最多 4 个并发请求，每个请求最大上下文为 4096
    llama-server -m model.gguf -c 16384 -np 4
    ```

    </details>

- <details>
    <summary>启用推测解码</summary>

    ```bash
    # draft.gguf 模型应是目标 model.gguf 的一个小型变体
    llama-server -m model.gguf -md draft.gguf
    ```

    </details>

- <details>
    <summary>服务嵌入模型</summary>

    ```bash
    # 使用 /embedding 端点
    llama-server -m model.gguf --embedding --pooling cls -ub 8192
    ```

    </details>

- <details>
    <summary>服务重排序模型</summary>

    ```bash
    # 使用 /reranking 端点
    llama-server -m model.gguf --reranking
    ```

    </details>

- <details>
    <summary>使用语法约束所有输出</summary>

    ```bash
    # 自定义语法
    llama-server -m model.gguf --grammar-file grammar.gbnf

    # JSON
    llama-server -m model.gguf --grammar-file grammars/json.gbnf
    ```

    </details>

## [`llama-perplexity`](tools/perplexity)

#### 用于测量模型在给定文本上的[困惑度](tools/perplexity/README.md) [^1]（和其他质量指标）的工具。

- <details open>
    <summary>测量文本文件的困惑度</summary>

    ```bash
    llama-perplexity -m model.gguf -f file.txt

    # [1]15.2701,[2]5.4007,[3]5.3073,[4]6.2965,[5]5.8940,[6]5.6096,[7]5.7942,[8]4.9297, ...
    # 最终估计：PPL = 5.4007 +/- 0.67339
    ```

    </details>

- <details>
    <summary>测量 KL 散度</summary>

    ```bash
    # TODO
    ```

    </details>

[^1]: [https://huggingface.co/docs/transformers/perplexity](https://huggingface.co/docs/transformers/perplexity)

## [`llama-bench`](tools/llama-bench)

#### 对各种参数的推理性能进行基准测试。

- <details open>
    <summary>运行默认基准测试</summary>

    ```bash
    llama-bench -m model.gguf

    # 输出：
    # | model               |       size |     params | backend    | threads |          test |                  t/s |
    # | ------------------- | ---------: | ---------: | ---------- | ------: | ------------: | -------------------: |
    # | qwen2 1.5B Q4_0     | 885.97 MiB |     1.54 B | Metal,BLAS |      16 |         pp512 |      5765.41 ± 20.55 |
    # | qwen2 1.5B Q4_0     | 885.97 MiB |     1.54 B | Metal,BLAS |      16 |         tg128 |        197.71 ± 0.81 |
    #
    # build: 3e0ba0e60 (4229)
    ```

    </details>

## [`llama-simple`](examples/simple)

#### 使用 `llama.cpp` 实现应用程序的最小示例。对开发者有用。

- <details>
    <summary>基本文本补全</summary>

    ```bash
    llama-simple -m model.gguf

    # 你好，我叫 Kaitlyn，我是一个 16 岁的女孩。我现在高中三年级，目前正在上一门叫“艺术”的课
    ```

    </details>

## 贡献

- 贡献者可以开启 PR
- 合作者将根据贡献情况被邀请
- 维护者可以推送到 `llama.cpp` 仓库的分支，并将 PR 合并到 `master` 分支
- 任何帮助管理 issue、PR 和项目的帮助都深表感谢！
- 查看[适合初学者的 issue](https://github.com/ggml-org/llama.cpp/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) 以获取适合首次贡献的任务
- 阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解更多信息
- 请务必阅读：[边缘推理](https://github.com/ggml-org/llama.cpp/discussions/205)
- 为有兴趣的人提供一些背景故事：[Changelog 播客](https://changelog.com/podcast/532)

## 其他文档

- [cli](tools/cli/README.md)
- [completion](tools/completion/README.md)
- [server](tools/server/README.md)
- [GBNF 语法](grammars/README.md)

#### 开发文档

- [如何构建](docs/build.md)
- [在 Docker 上运行](docs/docker.md)
- [在 Android 上构建](docs/android.md)
- [性能故障排除](docs/development/token_generation_performance_tips.md)
- [GGML 技巧与诀窍](https://github.com/ggml-org/llama.cpp/wiki/GGML-Tips-&-Tricks)

#### 开创性论文和模型背景

如果您的问题与模型生成质量有关，请至少浏览以下链接和论文，以了解 LLaMA 模型的局限性。这对于选择合适的模型大小以及理解 LLaMA 模型与 ChatGPT 之间的显著和细微差别尤为重要：
- LLaMA：
    - [Introducing LLaMA: A foundational, 65-billion-parameter large language model](https://ai.facebook.com/blog/large-language-model-llama-meta-ai/)
    - [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971)
- GPT-3
    - [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)
- GPT-3.5 / InstructGPT / ChatGPT：
    - [Aligning language models to follow instructions](https://openai.com/research/instruction-following)
    - [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155)

## XCFramework

XCFramework 是适用于 iOS、visionOS、tvOS 和 macOS 的库的预编译版本。它可以在 Swift 项目中使用，无需从源代码编译库。例如：

```swift
// swift-tools-version: 5.10
// swift-tools-version 声明构建此包所需的最低 Swift 版本。

import PackageDescription

let package = Package(
    name: "MyLlamaPackage",
    targets: [
        .executableTarget(
            name: "MyLlamaPackage",
            dependencies: [
                "LlamaFramework"
            ]),
        .binaryTarget(
            name: "LlamaFramework",
            url: "https://github.com/ggml-org/llama.cpp/releases/download/b5046/llama-b5046-xcframework.zip",
            checksum: "c19be78b5f00d8d29a25da41042cb7afa094cbf6280a225abe614b03b20029ab"
        )
    ]
)
```

上面的示例使用的是库的中间版本 `b5046`。通过更改 URL 和校验和，可以修改为使用不同的版本。

## 补全

某些环境支持命令行补全。

#### Bash 补全

```bash
$ build/bin/llama-cli --completion-bash > ~/.llama-completion.bash
$ source ~/.llama-completion.bash
```

可以选择将其添加到 `.bashrc` 或 `.bash_profile` 中以自动加载。例如：

```console
$ echo "source ~/.llama-completion.bash" >> ~/.bashrc
```

## 依赖项

- [yhirose/cpp-httplib](https://github.com/yhirose/cpp-httplib) - 单头文件 HTTP 服务器，被 `llama-server` 使用 - MIT 许可证
- [stb-image](https://github.com/nothings/stb) - 单头文件图像格式解码器，被多模态子系统使用 - 公共领域
- [nlohmann/json](https://github.com/nlohmann/json) - 单头文件 JSON 库，被各种工具/示例使用 - MIT 许可证
- [miniaudio.h](https://github.com/mackron/miniaudio) - 单头文件音频格式解码器，被多模态子系统使用 - 公共领域
- [subprocess.h](https://github.com/sheredom/subprocess.h) - 用于 C 和 C++ 的单头文件进程启动解决方案 - 公共领域

# 参考资料

* any list
{:toc}