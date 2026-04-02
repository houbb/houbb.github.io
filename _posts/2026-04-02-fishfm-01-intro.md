---
layout: post 
title: TimesFM（Time Series Foundation Model，时间序列基础模型）是一个由 Google Research 开发的预训练时间序列基础模型，用于时间序列预测。
date: 2026-04-02 21:01:55 +0800
categories: [AI]
tags: [ai, LLM]
published: true
---

# TimesFM

TimesFM（Time Series Foundation Model，时间序列基础模型）是一个由 Google Research 开发的**预训练时间序列基础模型**，用于时间序列预测。 ([GitHub][1])

* 论文：A decoder-only foundation model for time-series forecasting（ICML 2024）
* 所有模型权重：TimesFM Hugging Face Collection
* Google Research 博客
* TimesFM in BigQuery：Google 官方产品

该开源版本**不是 Google 官方支持的产品**。

最新模型版本：**TimesFM 2.5**

历史版本：

* 1.0 和 2.0：相关代码存放在 `v1` 子目录中
  你可以通过 `pip install timesfm==1.3.0` 安装旧版本

---

## 更新（Update - 2025-10-29）

为 TimesFM 2.5 重新加入了通过 XReg 的协变量（covariate）支持。

---

## 更新（Update - 2025-09-15）

发布 **TimesFM 2.5**

相比 TimesFM 2.0，新版本：

* 使用 **2 亿参数**（从 5 亿下降）
* 支持 **最长 16k 上下文长度**（从 2048 提升）
* 支持通过可选的 **3000 万参数 quantile head** 进行最长 1k horizon 的连续分位数预测
* 移除了 `frequency` 指示器
* 引入了一些新的预测参数（forecasting flags）

同时，推理 API 也进行了升级。该仓库将在接下来几周持续更新以：

1. 支持即将发布的 Flax 版本（更快推理）
2. 重新加入协变量支持
3. 补充更多文档字符串（docstrings）、文档和 notebook

---

## 安装（Install）

1. 克隆仓库：

```bash
git clone https://github.com/google-research/timesfm.git
cd timesfm
```

2. 创建虚拟环境并使用 `uv` 安装依赖：

```bash
# 创建虚拟环境
uv venv

# 激活环境
source .venv/bin/activate

# 安装（PyTorch）
uv pip install -e .[torch]

# 或（Flax）
uv pip install -e .[flax]

# 或（需要 XReg）
uv pip install -e .[xreg]
```

3. （可选）根据你的系统和硬件（CPU / GPU / TPU / Apple Silicon）安装对应后端：

* 安装 PyTorch
* 安装 JAX（用于 Flax）

---

## 代码示例（Code Example）

```python
import torch
import numpy as np
import timesfm

torch.set_float32_matmul_precision("high")

model = timesfm.TimesFM_2p5_200M_torch.from_pretrained(
    "google/timesfm-2.5-200m-pytorch"
)

model.compile(
    timesfm.ForecastConfig(
        max_context=1024,
        max_horizon=256,
        normalize_inputs=True,
        use_continuous_quantile_head=True,
        force_flip_invariance=True,
        infer_is_positive=True,
        fix_quantile_crossing=True,
    )
)

point_forecast, quantile_forecast = model.forecast(
    horizon=12,
    inputs=[
        np.linspace(0, 1, 100),
        np.sin(np.linspace(0, 20, 67)),
    ],  # 两个示例输入
)

point_forecast.shape      # (2, 12)
quantile_forecast.shape   # (2, 12, 10)：均值 + 10% 到 90% 分位数
```

---

## 额外说明（非 README 直译补充，帮助理解）

* TimesFM 是一种 **decoder-only Transformer 架构的时间序列基础模型** ([DeepWiki][2])
* 支持 **zero-shot forecasting（零样本预测）**，无需针对特定数据集训练 ([DeepWiki][2])
* 重点解决：

  * 长时间上下文预测
  * 跨领域泛化
  * 替代传统 ARIMA / LSTM 等模型


# 参考资料

* any list
{:toc}