---
layout: post
title: nanochat 是一个完整的 LLM 全栈实现，类似 ChatGPT，但代码非常简洁、可修改、依赖极少。
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# nanochat

> **“100 美元能买到的最好的 ChatGPT。”**

nanochat 是一个 **完整的 LLM 全栈实现**，类似 ChatGPT，但代码非常简洁、可修改、依赖极少。

整个项目将 **LLM 的完整生命周期**放在一个代码库中，包括：

* Tokenization（分词）
* Pretraining（预训练）
* Finetuning（微调）
* Evaluation（评估）
* Inference（推理）
* Web UI 聊天界面

它的目标是：
让开发者能够 **从零训练并运行自己的 ChatGPT 类模型**。 ([GitHub][1])

项目代码规模大约 **8000 行左右**，主要使用 Python + PyTorch，部分 tokenizer 使用 Rust 实现。 ([GIGAZINE][2])

---

# 项目定位

nanochat 的目标不是打造一个复杂的 LLM 框架，而是提供一个：

* **简洁**
* **完整**
* **可学习**
* **可修改**

的参考实现。

特点：

* 单一代码库
* 结构清晰
* 极易 fork 和修改

它将作为课程 **LLM101n** 的最终项目。 ([GitHub][1])

---

# 示例模型

目前项目提供一个公开运行的模型：

**nanochat d34**

含义：

* Transformer **34 层**
* **2.2B 参数**
* 训练数据 **88B tokens**

训练方式：

运行脚本：

```bash
run1000.sh
```

训练成本：

* 约 **100 小时**
* **8×H100 GPU**
* 总成本约 **2500 美元**

性能：

* 超过 **2019 年 GPT-2**
* 但远弱于现代 LLM。 ([GitHub][1])

作者形容这个模型：

> “有点像小孩一样，会犯很多错误，也会产生幻觉。” ([GitHub][1])

---

# 快速开始

最简单的方式是运行：

```bash
bash speedrun.sh
```

这个脚本会执行完整流程：

1. 下载数据
2. 训练模型
3. 评估模型
4. 启动推理
5. 启动 Web UI

整个流程大约 **4 小时**。 ([GitHub][1])

---

# 运行聊天 UI

训练完成后运行：

```bash
python -m scripts.chat_web
```

然后打开浏览器：

```
http://<服务器IP>:8000
```

就可以像 **ChatGPT 一样聊天**。

---

# 训练规模

nanochat 提供多个训练规模：

### $100 级别模型

* 约 4 小时训练
* 小规模聊天模型
* 用于学习和实验

### $300 级别模型

* 约 12 小时训练
* 接近 GPT-2 级别性能

### $1000 级别模型

* 约 40 小时训练
* 更强能力

---

# CPU / Mac 运行

nanochat 也支持：

* CPU
* Mac MPS

虽然速度较慢，但可以：

* 跑通完整流程
* 训练小模型
* 用于学习。

---

# 自定义模型人格

可以通过 **生成合成数据**改变模型风格。

例如：

* 生成角色数据
* 加入 mid-training
* 加入 SFT 数据

从而塑造模型：

* personality
* identity
* style。

---

# 为模型增加能力

nanochat 支持：

* 添加新训练数据
* 添加新任务
* 修改推理逻辑

示例：

* “数 strawberry 中有几个 r”

用来演示如何加入新能力。

---

# 项目结构

核心代码结构：

```
nanochat/
├── adamw.py                # 分布式 AdamW 优化器
├── checkpoint_manager.py   # 模型 checkpoint
├── common.py               # 工具函数
├── configurator.py         # 参数配置
├── core_eval.py            # CORE 基准评测
├── dataloader.py           # 数据加载器
├── dataset.py              # 预训练数据下载
```

其他目录：

```
dev/        # 实验脚本
scripts/    # 推理 / Web UI
tests/      # 测试
```

---

# 项目目标

nanochat 的设计目标：

1. **极低成本训练 LLM**
2. **完整 LLM pipeline**
3. **代码可读性极高**
4. **方便研究和实验**

作者希望探索：

> 在 **1000 美元以内**训练和研究 LLM 的可能性。 ([GitHub][1])

---

# 项目致谢

nanochat 受到多个项目启发：

* nanoGPT
* modded-nanoGPT
* HuggingFace FineWeb
* SmolTalk

---

# 总结

**nanochat 本质是：**

一个 **极简 LLM 全流程参考实现**。

核心特点：

* 完整 LLM pipeline
* 代码约 **8K 行**
* 从 **tokenizer → 训练 → 推理 → UI**
* 可以 **几小时内训练一个 ChatGPT 类模型**

适合：

* LLM 学习
* 模型实验
* AI 课程
* 研究原型开发。

---

如果你愿意，我可以给你补充一个 **非常关键的技术视角**：

**Karpathy 的 5 个“教学级 LLM 项目”进化路线：**

1️⃣ micrograd
2️⃣ makemore
3️⃣ nanoGPT
4️⃣ nanochat
5️⃣ autoresearch

这其实是一条 **从神经网络 → LLM → Agent 的学习路线图**。

很多 AI 工程师都不知道这个体系，我可以帮你画一张完整图。

[1]: https://github.com/karpathy/nanochat?utm_source=chatgpt.com "GitHub - karpathy/nanochat: The best ChatGPT that $100 can buy."
[2]: https://gigazine.net/news/20251014-nanochat/?utm_source=chatgpt.com "たった1万5000円＆4時間でChatGPTのような対話可能AIをゼロから構築できるオープンソースプラットフォーム「nanochat」が登場 - GIGAZINE"


# 参考资料

* any list
{:toc}