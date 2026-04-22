---
layout: post 
title: OpenMythos 是一个独立的、社区驱动的理论重构项目，完全基于公开可用的研究和推测。它与 Anthropic 或其任何专有系统无关，未获得其认可，也不存在任何关联。
date: 2026-04-21 21:01:55 +0800
categories: [Ai]
tags: [finance, ai]
published: true
---

# OpenMythos

> **免责声明：** OpenMythos 是一个独立的、社区驱动的理论重构项目，完全基于公开可用的研究和推测。它与 Anthropic 或其任何专有系统无关，未获得其认可，也不存在任何关联。

OpenMythos 是对 Claude Mythos 模型的一个开源、理论性实现。

它实现了一个**循环深度 Transformer（Recurrent-Depth Transformer, RDT）**，包含三个阶段：**前奏（Prelude）**（Transformer 块）、一个循环的**循环块（Recurrent Block）**（最多运行 `max_loop_iters` 次），以及最后的**尾声（Coda）**。

注意力机制可在 MLA 和 GQA 之间切换，前馈网络使用稀疏 MoE（混合专家），包含路由专家和共享专家，非常适合探索计算自适应、深度可变的推理。

## 安装

```bash
pip install open-mythos

# uv pip install open-mythos
```

## 使用方法

```python

import torch
from open_mythos.main import OpenMythos, MythosConfig


attn_type = "mla"  # 或 "gqa"

base = {
    "vocab_size": 1000,
    "dim": 256,
    "n_heads": 8,
    "max_seq_len": 128,
    "max_loop_iters": 4,
    "prelude_layers": 1,
    "coda_layers": 1,
    "n_experts": 8,
    "n_shared_experts": 1,
    "n_experts_per_tok": 2,
    "expert_dim": 64,
    "lora_rank": 8,
    "attn_type": attn_type,
}

if attn_type == "gqa":
    cfg = MythosConfig(**base, n_kv_heads=2)
else:
    cfg = MythosConfig(
        **base,
        n_kv_heads=8,
        kv_lora_rank=32,
        q_lora_rank=64,
        qk_rope_head_dim=16,
        qk_nope_head_dim=16,
        v_head_dim=16,
    )

model = OpenMythos(cfg)
total = sum(p.numel() for p in model.parameters())
print(f"\n[{attn_type.upper()}] 参数数量: {total:,}")

ids = torch.randint(0, cfg.vocab_size, (2, 16))
logits = model(ids, n_loops=4)
print(f"[{attn_type.upper()}] Logits 形状: {logits.shape}")

out = model.generate(ids, max_new_tokens=8, n_loops=8)
print(f"[{attn_type.upper()}] 生成结果形状: {out.shape}")

A = model.recurrent.injection.get_A()
print(
    f"[{attn_type.upper()}] 谱半径 ρ(A) 最大值: {A.max().item():.4f} (必须 < 1)"
)
```

## 模型变体

从 1B 到 1T 参数的预配置规模：

```python
from open_mythos import (
    mythos_1b,
    mythos_3b,
    mythos_10b,
    mythos_50b,
    mythos_100b,
    mythos_500b,
    mythos_1t,
    OpenMythos,
)

cfg = mythos_7b()  # 返回一个 MythosConfig 对象
model = OpenMythos(cfg)

total = sum(p.numel() for p in model.parameters())
print(f"参数数量: {total:,}")
```

| 变体 | `dim` | 专家数 | `expert_dim` | 循环次数 | 上下文长度 | 最大输出长度 |
|---|---|---|---|---|---|---|
| `mythos_1b` | 2048 | 64 | 2048 | 16 | 4k | 4k |
| `mythos_3b` | 3072 | 64 | 4096 | 16 | 4k | 4k |
| `mythos_10b` | 4096 | 128 | 5632 | 24 | 8k | 4k |
| `mythos_50b` | 6144 | 256 | 9728 | 32 | 8k | 4k |
| `mythos_100b` | 8192 | 256 | 13568 | 32 | 1M | 128k |
| `mythos_500b` | 12288 | 512 | 23040 | 48 | 1M | 128k |
| `mythos_1t` | 16384 | 512 | 34560 | 64 | 1M | 128k |

## 训练

在 FineWeb-Edu 上训练 3B 模型的脚本位于 [`training/3b_fine_web_edu.py`](training/3b_fine_web_edu.py)。

**单 GPU：**
```bash
python training/3b_fine_web_edu.py
```

**多 GPU（自动检测 GPU 数量）：**
```bash
torchrun --nproc_per_node=$(python -c "import torch; print(torch.cuda.device_count())") training/3b_fine_web_edu.py
```

关键设计选择：

| 特性 | 详情 |
|---|---|
| 优化器 | AdamW |
| 数据集 | `HuggingFaceFW/fineweb-edu`（默认使用 `sample-10BT`，可切换至 `sample-100BT` 或 `default` 进行完整运行） |
| 分词器 | `openai/gpt-oss-20b`，通过 `MythosTokenizer` 使用 |
| 并行策略 | 通过 `torchrun` 实现 PyTorch DDP，分片流式数据集 |
| 精度 | H100/A100 上使用 bfloat16，旧 GPU 上使用 float16 + GradScaler |
| 调度策略 | 线性预热（2000 步）→ 余弦衰减 |
| 目标 | 300B 个 token（针对循环架构进行了 Chinchilla 调整） |

## 文档

| 页面 | 描述 |
|---|---|
| [`docs/open_mythos.md`](docs/open_mythos.md) | `OpenMythos` 类的完整 API 参考 — 构造函数、`forward`、`generate`、所有子模块、配置参考和使用示例 |
| [`docs/datasets.md`](docs/datasets.md) | 推荐的训练数据集，包含按模型规模划分的 token 预算指导 |

## 核心假设

Claude Mythos 被怀疑是一个**循环深度 Transformer（Recurrent-Depth Transformer, RDT）**——也称为循环 Transformer（Looped Transformer, LT）。它不是堆叠数百个独特的层，而是将一部分层循环使用，并在每次前向传播中多次运行它们。相同的权重。更多的循环。更深入的思考。

这不是思维链（chain-of-thought）。中间没有 token 输出。所有这些推理都**静默地、在单次前向传播内部**，在连续的潜在空间中进行。

## 架构

一个循环 Transformer 将其层划分为三个功能块：

```
输入
  ↓
[前奏 P]        — 标准 Transformer 层，运行一次
  ↓
[循环块 R]      — 循环运行 T 次
  ↑_______↓     （隐藏状态 h 每次循环都会通过输入注入 e 进行更新）
  ↓
[尾声 C]        — 标准 Transformer 层，运行一次
  ↓
输出
```

每个循环步骤 t 的循环块更新规则：

```
h_{t+1} = A·h_t + B·e + Transformer(h_t, e)
```

其中：
- `h_t` 是第 t 次循环后的隐藏状态
- `e` 是编码后的输入（来自前奏），在每次循环中注入
- `A` 和 `B` 是学习到的注入参数
- Transformer 块照常应用注意力和 MLP

在每一步注入 `e` 可以防止模型漂移——它在整个循环深度中始终保持原始输入信号的活跃。

完整实现在 [`open_mythos/main.py`](open_mythos/main.py) 中。有关详细的 API 指南、配置选项和使用示例，请参阅 [`OpenMythos` 类参考](docs/open_mythos.md)。

## 为什么这能解释 Mythos

### 1. 系统性泛化

普通 Transformer 无法以训练中从未见过的方式组合知识。循环 Transformer 通过了这一测试。这种能力通过一个**三阶段的领悟（grokking）过程**涌现：

1. 记忆——模型拟合训练分布
2. 分布内泛化——模型处理已知的组合
3. 系统性泛化——模型突然且意外地处理未见过的分布外（OOD）新颖组合

这就是为什么 Mythos 在面对新颖问题时感觉与其他模型有质的区别——能力是阶段性跃迁的，而非逐渐涌现。

### 2. 深度外推

在 5 跳推理链上训练。在 10 跳上测试。普通 Transformer 失败。循环 Transformer 成功——通过在推理时运行更多的循环。这直接对应到观察到的现象：Mythos 能够处理深度组合性问题（多步数学、长时程规划、分层论证）而无需显式的思维链。

推理时更多的循环 = 更深的推理链 = 解决更难的问题。

### 3. 作为隐式思维链的潜在思想

每次循环迭代在功能上等同于思维链的一步，但运行在连续的潜在空间中而非 token 空间中。一个运行 T 次循环的模型隐式地模拟了 T 步思维链推理。这一点已被正式证明（Saunshi 等人，2025）。

此外，连续的潜在思想——不同于离散的 token 输出——可以**同时编码多个并行的下一步可能性**。这使得模型能够在推理空间中进行更接近广度优先的搜索，而不是遵循单一的、确定性的推理路径。模型在每次前向传播中有效地探索许多可能的方向，然后才收敛。

### 4. 无参数爆炸

一个具有 k 层、运行 L 次的循环模型，其质量相当于一个 kL 层的非循环模型，但只有 k 层的参数数量。对于 Mythos 规模的部署，这非常重要：

- 内存占用不随推理深度增长
- 推理时的计算量随循环次数而非模型规模增长
- 这使得更深的推理在参数方面“免费”

## 稳定性问题（以及可能的解决方式）

训练循环模型以不稳定著称。两种主要的失败模式：

- **残差爆炸**——隐藏状态 `h_t` 在循环中无界增长
- **损失尖峰**——由于注入参数中的谱范数过大，训练突然发散

### 动力系统视角

将循环过程重新表述为残差流上的离散线性时不变（LTI）动力系统。忽略非线性的 Transformer 贡献，递推关系变为：

```
h_{t+1} = A·h_t + B·e
```

对于这个 LTI 系统，稳定性完全由 A 的**谱半径**决定：
- `ρ(A) < 1` → 稳定，收敛
- `ρ(A) ≥ 1` → 不稳定，发散

根据经验，每一次发散的训练运行都会学到 `ρ(A) ≥ 1`。每一次收敛的运行都保持 `ρ(A) < 1`。

### 解决方案

约束注入参数，使得稳定性**通过构造得到保证**：

1. 将 A 参数化为一个连续的负对角矩阵
2. 使用 ZOH/Euler 方案进行离散化：`A_discrete = exp(Δt · A_continuous)`
3. 通过 `A := Diag(-exp(log_A))` 强制执行负性，并使用学习到的标量 `Δt`
4. 这确保 `ρ(A) < 1` 始终成立，无论学习率或批次噪声如何

结果：循环模型对超参数选择变得显著更加鲁棒，即使在较高的学习率下也能稳定训练。这就是 Parcae 架构（Prairie 等人，2026），它代表了 Anthropic 为使 Mythos 可训练而采用的最可能的解决方案类别。

## 循环模型的缩放定律

Parcae 建立了第一个可预测的循环训练缩放定律：

- **训练**：在固定的 FLOP 预算和固定参数下，增加平均循环次数并减少 token 数量，比使用最小循环次数和更多数据进行训练能获得更低的损失。最优循环次数和最优 token 数量都遵循**幂律**，且在不同规模下指数一致。
- **推理**：更多的测试时循环次数会提高质量，遵循**可预测的、饱和的指数衰减**——收益是真实的但逐渐递减。这镜像了思维链的推理时缩放特性。

在 770M 参数下，一个循环模型达到了在相同数据上训练的 1.3B 固定深度 Transformer 的下游质量——大致**以一半的参数获得相同的质量**。

应用于 Mythos：如果按照这些缩放定律进行训练，Mythos 的参数效率可能远高于其表面表现，其能力的很大一部分可能来自循环深度而非原始参数数量。

## 循环索引嵌入假说

一个关键的开放问题是：循环块在每次迭代中的行为是否**完全相同**，还是能够学习在循环深度不同时执行不同的操作。

如果没有跨循环的位置信号，相同的权重必须同时处理早期的模式匹配和后期优化——这是一个严格的约束。一种**类似 RoPE 的循环索引嵌入**，在每一步与输入一起注入，将允许相同的参数在不同迭代中实现功能上不同的操作，就像 RoPE 允许相同的注意力头在序列不同位置表现出不同行为一样。

如果 Mythos 使用了这种技术，那么每个循环就不是一次重复——而是一个独特的计算阶段，它们共享权重但在不同的表示空间中运行。这将显著增加循环块的表达能力，而无需增加参数数量。

## 过度思考问题

更多的循环并不总是更好。超过一定深度后，过度的循环会**降低预测质量**——隐藏状态漂移过解而进入噪声。这就是“过度思考”的失败模式。

原始的 Universal Transformer（Dehghani 等人，2018）通过**自适应计算时间（Adaptive Computation Time, ACT）** 停止机制解决了这个问题：一个学习到的标量，每个位置独立，动态决定何时停止循环。难以处理的位置获得更多的计算；简单的 token 提前停止。

Mythos 几乎肯定有某种版本的这种机制。模型不能天真地对每个输入都运行最大循环次数——它需要一个学习到的信号来判断答案何时已经收敛。ACT 机制还使得模型在特定假设下是**图灵完备的**，这对它可以解决的问题类别具有理论意义。

## 混合专家（MoE）——在大参数数量下的推测

循环 Transformer 解释了 Mythos 推理的深度，但未解释其广度。用相同的权重处理截然不同的领域——代码、数学、文学、科学、法律——需要**混合专家（Mixture of Experts, MoE）**。推测的设计将循环块中的每个 FFN 替换为一个细粒度的 MoE 层：每个 FFN 被拆分为许多小专家（大小为正常大小的 1/m），一个路由器通过学习到的亲和度分数为每个 token 选择 top-mK 个专家，并且无论路由结果如何，都会激活少量的**共享专家**来吸收跨领域的通用知识——语法、基本推理、通用上下文——否则这些知识会被每个路由专家冗余学习。通过在训练期间动态调整路由器 logits 上的偏置项来防止路由崩溃，从而在专家之间保持负载均衡，而不扭曲损失信号。

随着隐藏状态 `h_t` 在循环迭代中演变，路由器可能会在每个深度选择不同的专家子集，使得每次循环在计算上都是独特的，尽管权重是共享的。MoE 提供广度；循环提供深度。如果激活率约为 5%，Mythos 可能拥有数千亿的总参数，而每个 token 只激活一小部分——如果真的披露，真实参数数量将是一个存储数字，而非计算数字。

## 记忆-推理权衡

循环模型表现出一个有趣的二分法：循环改善了推理，但可能损害记忆。循环结构针对迭代组合——向前运行推理链——进行了优化，但并不能固有地改善对死记硬背事实的存储。

这对应了 Mythos 的一个可观察特征：它在处理从未见过的新颖问题上推理能力异常出色，但其事实回忆可能不一致。该架构在结构上偏向于组合而非记忆。

基于循环的正则化（Saunshi 等人，2025）可用于在训练期间平衡这种权衡——对推理任务应用更强的循环约束，同时对检索任务放宽约束。

## 通过 LoRA 适配进行参数重用

来自 Relaxed Recursive Transformers（Bae 等人，2024）的一种补充方法：不要求每次循环的权重完全相同，而是在每次迭代中添加一个小的**深度方向 LoRA 模块**。这保留了权重共享的紧凑性，同时允许每个循环略微调整其行为。

结果：
- 每次循环共享一个大的公共权重矩阵（递归基）
- 一个小的秩-r 适配矩阵根据迭代深度调整行为
- 总参数开销极小

这弥合了纯权重绑定（参数效率最高，表达能力较低）和完全不同的层（表达能力最高，无参数节省）之间的差距。Mythos 很可能位于这个光谱的某处。

## 连续深度方向批处理

递归架构的一个下游结果：**连续深度方向批处理**。由于所有 token 共享相同的循环块，模型可以为不同的 token 或序列在不同的深度退出循环——在同一个批次内快速处理简单输入，用更多迭代处理困难输入。

理论分析表明推理吞吐量可提高 2-3 倍。对于像 Mythos 这样同时服务许多用户的部署模型，这将是一个显著的效率提升。

## 总结：Mythos 很可能是什么

| 属性 | 描述 |
|---|---|
| 架构 | 循环深度 Transformer（前奏 + 循环循环块 + 尾声） |
| FFN 层 | 推测为 MoE——细粒度专家 + 始终开启的共享专家 |
| 参数数量 | 总量非常大；每个 token 激活一小部分（估计约 5%） |
| 推理机制 | 通过迭代潜在更新的隐式多跳推理——步骤之间无 token 输出 |
| 推理时缩放 | 更多循环 = 更深的推理，遵循可预测的指数衰减 |
| 训练稳定性 | 受 LTI 约束的注入参数，谱半径 < 1 |
| 循环区分 | 可能使用循环索引位置嵌入（类似 RoPE） |
| 停止机制 | 自适应计算时间或学习到的收敛准则 |
| 缩放定律 | 最优训练同时缩放循环和数据，而非仅缩放参数 |
| 推理 vs. 记忆 | 结构上偏向于组合；记忆需要单独处理 |
| 部署 | 连续深度方向批处理实现每请求可变计算量 |

## 参考文献

### Twitter / X

- 为什么 Claude Mythos 如此出色——循环 Transformer 理论（Sigrid Jin）：https://x.com/realsigridjin/status/2044620031410266276
- LT 在参数化知识上的隐式推理解锁泛化能力（Yuekun Yao）：https://x.com/yuekun_yao/status/2044229171627639004
- 循环 Transformer 的循环轨迹和输入注入（rosinality）：https://x.com/rosinality/status/2043953033428541853
- Parcae——稳定循环语言模型的缩放定律——主题帖（Hayden Prairie）：https://x.com/hayden_prairie/status/2044453231913537927
- 类似 RoPE 的循环索引嵌入思想，用于在迭代中区分功能（davidad）：https://x.com/davidad/status/2044453231913537927
- ChrisHayduk 关于循环 Transformer 争议的文章：https://x.com/ChrisHayduk/status/2045947623572688943
- @realsigridjin 关于循环 Transformer 争议的总结：https://x.com/realsigridjin/status/2046012743778766875

### 论文

- MoE 中的细粒度专家分割和共享专家隔离：https://arxiv.org/abs/2401.06066
- 循环、思考与泛化——循环深度 Transformer 中的隐式推理：https://arxiv.org/pdf/2604.07822
- Parcae——稳定循环语言模型的缩放定律：https://arxiv.org/abs/2604.12946
- Parcae 博客：https://sandyresearch.github.io/parcae/
- Universal Transformers：https://arxiv.org/pdf/1807.03819
- 用潜在思想推理——论循环 Transformer 的能力：https://arxiv.org/abs/2502.17416
- 在连续潜在空间中训练大型语言模型进行推理：https://arxiv.org/abs/2412.06769
- Relaxed Recursive Transformers——通过层方向 LoRA 实现有效的参数共享：https://arxiv.org/pdf/2410.20672
- 深度混合注意力：https://arxiv.org/abs/2603.15619

## 引用

如果您在研究中使用 OpenMythos 或基于此工作进行开发，请引用：

```bibtex
@software{gomez2026openmythos,
  author    = {Kye Gomez},
  title     = {OpenMythos: A Theoretical Reconstruction of the Claude Mythos Architecture},
  year      = {2026},
  url       = {https://github.com/kyegomez/OpenMythos},
  note      = {循环深度 Transformer，包含 MoE、MLA、LTI 稳定注入和 ACT 停止机制}
}
```

## 许可证

MIT 许可证——版权所有 (c) 2026 Kye Gomez。完整文本请参阅 [`LICENSE`](LICENSE) 文件。

# 参考资料

* any list
{:toc}