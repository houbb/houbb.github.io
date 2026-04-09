---
layout: post 
title:  Kronos：金融市场语言的基础模型
date: 2026-04-09 21:01:55 +0800
categories: [AI]
tags: [ai, llm, fund]
published: true
---


# Kronos

金融市场语言的基础模型

> Kronos 是**首个面向金融K线（K-line）的开源基础模型**，
> 基于**超过45家全球交易所**的数据训练而成。

</div>

## 📰 新闻
*   🚩 **[2025.11.10]** Kronos 被 AAAI 2026 接收。
*   🚩 **[2025.08.17]** 我们发布了微调脚本！请查看它们以使 Kronos 适配您自己的任务。
*   🚩 **[2025.08.02]** 我们的论文现已在 [arXiv](https://arxiv.org/abs/2508.02739) 上提供。

<p align="center">

## 📜 引言

**Kronos** 是一个仅解码器的基础模型系列，专门针对金融市场的“语言”——K线序列进行预训练。与通用时间序列基础模型（TSFM）不同，Kronos 旨在处理金融数据独特的高噪声特性。它采用了一种新颖的两阶段框架：
1. 首先，一个专门的标记器将连续的多维K线数据（OHLCV）量化为**层次化的离散标记**。
2. 然后，一个大型自回归Transformer在这些标记上进行预训练，使其能够作为统一模型服务于多种量化任务。

<p align="center">
    <img src="figures/overview.png" alt="" align="center" width="700px" />
</p>

## ✨ 在线演示
我们搭建了一个在线演示来可视化 Kronos 的预测结果。该网页展示了**BTC/USDT**交易对未来24小时的预测。

**👉 [在此访问在线演示](https://shiyu-coder.github.io/Kronos-demo/)** 

## 📦 模型仓库
我们发布了一系列不同容量的预训练模型，以满足不同的计算和应用需求。所有模型均可从 Hugging Face Hub 直接获取。

| 模型           | 标记器                                                                            | 上下文长度 | 参数量  | 开源状态                                                                   |
|--------------|---------------------------------------------------------------------------------| -------------- | ------ |---------------------------------------------------------------------------|
| Kronos-mini  | [Kronos-Tokenizer-2k](https://huggingface.co/NeoQuasar/Kronos-Tokenizer-2k)     | 2048           | 4.1M   | ✅ [NeoQuasar/Kronos-mini](https://huggingface.co/NeoQuasar/Kronos-mini)  |
| Kronos-small | [Kronos-Tokenizer-base](https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base) | 512            | 24.7M  | ✅ [NeoQuasar/Kronos-small](https://huggingface.co/NeoQuasar/Kronos-small) |
| Kronos-base  | [Kronos-Tokenizer-base](https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base) | 512            | 102.3M | ✅ [NeoQuasar/Kronos-base](https://huggingface.co/NeoQuasar/Kronos-base)   |
| Kronos-large | [Kronos-Tokenizer-base](https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base) | 512            | 499.2M | ❌                                                                         |

## 🚀 快速开始

### 安装

1. 安装 Python 3.10+，然后安装依赖：

```shell
pip install -r requirements.txt
```

### 📈 进行预测

使用 `KronosPredictor` 类可以轻松进行 Kronos 预测。它处理数据预处理、归一化、预测和逆归一化，让您只需几行代码即可从原始数据得到预测结果。

**重要提示**：`Kronos-small` 和 `Kronos-base` 的 `max_context` 为 **512**。这是模型能处理的最大序列长度。为获得最佳性能，建议您的输入数据长度（即 `lookback`）不超过此限制。`KronosPredictor` 会自动处理较长上下文的截断。

以下是进行首次预测的分步指南。

#### 1. 加载标记器和模型

首先，从 Hugging Face Hub 加载预训练的 Kronos 模型及其对应的标记器。

```python
from model import Kronos, KronosTokenizer, KronosPredictor

# 从 Hugging Face Hub 加载
tokenizer = KronosTokenizer.from_pretrained("NeoQuasar/Kronos-Tokenizer-base")
model = Kronos.from_pretrained("NeoQuasar/Kronos-small")
```

#### 2. 实例化预测器

创建 `KronosPredictor` 实例，传入模型、标记器和目标设备。

```python
# 初始化预测器
predictor = KronosPredictor(model, tokenizer, max_context=512)
```

#### 3. 准备输入数据

`predict` 方法需要三个主要输入：
-   `df`：包含历史K线数据的 pandas DataFrame。必须包含 `['open', 'high', 'low', 'close']` 列。`volume` 和 `amount` 是可选的。
-   `x_timestamp`：与 `df` 中历史数据对应的时间戳的 pandas Series。
-   `y_timestamp`：您想要预测的未来时段的时间戳的 pandas Series。

```python
import pandas as pd

# 加载您的数据
df = pd.read_csv("./data/XSHG_5min_600977.csv")
df['timestamps'] = pd.to_datetime(df['timestamps'])

# 定义上下文窗口和预测长度
lookback = 400
pred_len = 120

# 为预测器准备输入
x_df = df.loc[:lookback-1, ['open', 'high', 'low', 'close', 'volume', 'amount']]
x_timestamp = df.loc[:lookback-1, 'timestamps']
y_timestamp = df.loc[lookback:lookback+pred_len-1, 'timestamps']
```

#### 4. 生成预测

调用 `predict` 方法生成预测。您可以使用 `T`、`top_p` 和 `sample_count` 等参数控制采样过程，以实现概率预测。

```python
# 生成预测
pred_df = predictor.predict(
    df=x_df,
    x_timestamp=x_timestamp,
    y_timestamp=y_timestamp,
    pred_len=pred_len,
    T=1.0,          # 采样温度
    top_p=0.9,      # 核采样概率
    sample_count=1  # 生成并平均的预测路径数量
)

print("预测数据头：")
print(pred_df.head())
```

`predict` 方法返回一个 pandas DataFrame，其中包含 `open`、`high`、`low`、`close`、`volume` 和 `amount` 的预测值，索引为您提供的 `y_timestamp`。

为了高效处理多个时间序列，Kronos 提供了 `predict_batch` 方法，支持同时对多个数据集进行并行预测。当您需要一次性预测多个资产或时间段时，此方法特别有用。

```python
# 准备用于批量预测的多个数据集
df_list = [df1, df2, df3]  # DataFrame 列表
x_timestamp_list = [x_ts1, x_ts2, x_ts3]  # 历史时间戳列表
y_timestamp_list = [y_ts1, y_ts2, y_ts3]  # 未来时间戳列表

# 生成批量预测
pred_df_list = predictor.predict_batch(
    df_list=df_list,
    x_timestamp_list=x_timestamp_list,
    y_timestamp_list=y_timestamp_list,
    pred_len=pred_len,
    T=1.0,
    top_p=0.9,
    sample_count=1,
    verbose=True
)

# pred_df_list 包含与输入顺序相同的预测结果
for i, pred_df in enumerate(pred_df_list):
    print(f"序列 {i} 的预测：")
    print(pred_df.head())
```

**批量预测的重要要求：**
- 所有序列必须具有相同的历史长度（回看窗口）
- 所有序列必须具有相同的预测长度（`pred_len`）
- 每个 DataFrame 必须包含所需的列：`['open', 'high', 'low', 'close']`
- `volume` 和 `amount` 列是可选的，如果缺失将用零填充

`predict_batch` 方法利用 GPU 并行性实现高效处理，并自动为每个序列独立处理归一化和逆归一化。

#### 5. 示例和可视化

有关包含数据加载、预测和绘图的完整可运行脚本，请参阅 [`examples/prediction_example.py`](examples/prediction_example.py)。

运行此脚本将生成一个比较真实数据与模型预测的图表，类似于下图所示：

<p align="center">
    <img src="figures/prediction_example.png" alt="预测示例" align="center" width="600px" />
</p>

此外，我们提供了一个在没有成交量和成交额数据的情况下进行预测的脚本，可以在 [`examples/prediction_wo_vol_example.py`](examples/prediction_wo_vol_example.py) 中找到。

## 🔧 在自有数据上微调（以A股市场为例）

我们提供了一个完整的流程，用于在您自己的数据集上微调 Kronos。作为示例，我们演示如何使用 [Qlib](https://github.com/microsoft/qlib) 准备中国A股市场的数据并进行简单的回测。

> **免责声明：** 此流程旨在作为演示来说明微调过程。它是一个简化示例，并非生产就绪的量化交易系统。稳健的量化策略需要更复杂的技术，例如投资组合优化和风险因子中性化，以实现稳定的Alpha。

微调过程分为四个主要步骤：

1.  **配置**：设置路径和超参数。
2.  **数据准备**：使用 Qlib 处理和拆分数据。
3.  **模型微调**：微调标记器和预测器模型。
4.  **回测**：评估微调后模型的性能。

### 前提条件

1.  首先，确保您已安装 `requirements.txt` 中的所有依赖。
2.  此流程依赖于 `qlib`。请安装它：
    ```shell
      pip install pyqlib
    ```
3.  您需要准备您的 Qlib 数据。按照 [官方 Qlib 指南](https://github.com/microsoft/qlib) 在本地下载和设置数据。示例脚本假设您使用的是日频数据。

### 步骤 1：配置您的实验

所有关于数据、训练和模型路径的设置都集中在 `finetune/config.py` 中。在运行任何脚本之前，请**根据您的环境修改以下路径**：

*   `qlib_data_path`：本地 Qlib 数据目录的路径。
*   `dataset_path`：保存处理后的训练/验证/测试 pickle 文件的目录。
*   `save_path`：保存模型检查点的基本目录。
*   `backtest_result_path`：保存回测结果的目录。
*   `pretrained_tokenizer_path` 和 `pretrained_predictor_path`：您要开始使用的预训练模型的路径（可以是本地路径或 Hugging Face 模型名称）。

您还可以调整其他参数，如 `instrument`、`train_time_range`、`epochs` 和 `batch_size` 以适应您的特定任务。如果您不使用 [Comet.ml](https://www.comet.com/)，请设置 `use_comet = False`。

### 步骤 2：准备数据集

运行数据预处理脚本。此脚本将从您的 Qlib 目录加载原始市场数据，进行处理，拆分为训练集、验证集和测试集，并将它们保存为 pickle 文件。

```shell
python finetune/qlib_data_preprocess.py
```

运行后，您将在配置中 `dataset_path` 指定的目录中找到 `train_data.pkl`、`val_data.pkl` 和 `test_data.pkl`。

### 步骤 3：运行微调

微调过程包括两个阶段：微调标记器，然后微调预测器。两个训练脚本都设计用于使用 `torchrun` 进行多GPU训练。

#### 3.1 微调标记器

此步骤使标记器适应您特定领域的数据分布。

```shell
# 将 NUM_GPUS 替换为您要使用的 GPU 数量（例如 2）
torchrun --standalone --nproc_per_node=NUM_GPUS finetune/train_tokenizer.py
```

最佳标记器检查点将保存到 `config.py` 中配置的路径（由 `save_path` 和 `tokenizer_save_folder_name` 派生）。

#### 3.2 微调预测器

此步骤微调用于预测任务的主要 Kronos 模型。

```shell
# 将 NUM_GPUS 替换为您要使用的 GPU 数量（例如 2）
torchrun --standalone --nproc_per_node=NUM_GPUS finetune/train_predictor.py
```

最佳预测器检查点将保存到 `config.py` 中配置的路径。

### 步骤 4：通过回测进行评估

最后，运行回测脚本以评估您微调后的模型。此脚本加载模型，在测试集上进行推理，生成预测信号（例如预测的价格变化），并运行一个简单的 top-K 策略回测。

```shell
# 指定用于推理的 GPU
python finetune/qlib_test.py --device cuda:0
```

该脚本将在控制台中输出详细的性能分析，并生成一个显示您的策略与基准的累积收益率曲线的图表，类似于下图所示：

<p align="center">
    <img src="figures/backtest_result_example.png" alt="回测示例" align="center" width="700px" />
</p>

### 💡 从演示到生产：重要考量

*   **原始信号 vs. 纯Alpha**：本演示中模型生成的信号是原始预测。在实际量化工作流中，这些信号通常会输入到投资组合优化模型中。该模型会施加约束以中性化常见风险因子（例如市场贝塔、规模和价值等风格因子）的暴露，从而分离出**“纯Alpha”**并提高策略的稳健性。
*   **数据处理**：提供的 `QlibDataset` 是一个示例。对于不同的数据源或格式，您需要调整数据加载和预处理逻辑。
*   **策略与回测复杂性**：此处使用的简单 top-K 策略是一个基本起点。生产级策略通常包含更复杂的逻辑，用于投资组合构建、动态头寸调整和风险管理（例如止损/止盈规则）。此外，高保真回测应细致地建模交易成本、滑点和市场冲击，以更准确地估计真实世界表现。

> **📝 AI生成的注释**：请注意，`finetune/` 目录中的许多代码注释是由 AI 助手（Gemini 2.5 Pro）为解释目的生成的。虽然它们旨在提供帮助，但可能包含不准确之处。我们建议将代码本身视为逻辑的权威来源。

## 📖 引用

如果您在研究中使用 Kronos，我们希望您引用我们的[论文](https://arxiv.org/abs/2508.02739)：

```
@misc{shi2025kronos,
      title={Kronos: A Foundation Model for the Language of Financial Markets}, 
      author={Yu Shi and Zongliang Fu and Shuo Chen and Bohan Zhao and Wei Xu and Changshui Zhang and Jian Li},
      year={2025},
      eprint={2508.02739},
      archivePrefix={arXiv},
      primaryClass={q-fin.ST},
      url={https://arxiv.org/abs/2508.02739}, 
}
```



# 参考资料

* any list
{:toc}