---
layout: post
title: dive-into-llms-06-Transformers pipeline 介绍
date: 2025-11-03 20:40:12 +0800
categories: [AI]
tags: [ai, learn-note]
published: true
---



# Transformers pipeline 

## 支持的任务

| 任务 | 描述 | 模态 | Pipeline 示例 |
|------|------|------|----------------|
| 文本分类 | 为给定的文本序列分配一个标签 | NLP | `pipeline(task="sentiment-analysis")` |
| 文本生成 | 根据给定的提示生成文本 | NLP | `pipeline(task="text-generation")` |
| 命名实体识别 | 为序列里的每个 token 分配一个标签（人、组织、地址等等） | NLP | `pipeline(task="ner")` |
| 问答系统 | 通过给定的上下文和问题，在文本中提取答案 | NLP | `pipeline(task="question-answering")` |
| 掩盖填充 | 预测出在序列中被掩盖的 token | NLP | `pipeline(task="fill-mask")` |
| 文本摘要 | 为文本序列或文档生成总结 | NLP | `pipeline(task="summarization")` |
| 文本翻译 | 将文本从一种语言翻译为另一种语言 | NLP | `pipeline(task="translation")` |
| 图像分类 | 为图像分配一个标签 | 计算机视觉 | `pipeline(task="image-classification")` |
| 图像分割 | 为图像中每个像素分配标签（语义、全景、实例分割） | 计算机视觉 | `pipeline(task="image-segmentation")` |
| 目标检测 | 预测图像中目标对象的边界框和类别 | 计算机视觉 | `pipeline(task="object-detection")` |
| 音频分类 | 给音频文件分配一个标签 | 音频 | `pipeline(task="audio-classification")` |
| 自动语音识别 | 将音频文件中的语音转录为文本 | 音频 | `pipeline(task="automatic-speech-recognition")` |
| 视觉问答 | 给定图像和问题，回答与图像相关的问题 | 多模态 | `pipeline(task="vqa")` |


# 多行输入

如果你有不止一个输入，可以把所有输入放入一个列表然后传给pipeline()，它将会返回一个字典列表：

```python
from transformers import pipeline
classifier = pipeline("sentiment-analysis")

results = classifier(["We are very happy to show you the Transformers library.", "We hope you don't hate it."])
for result in results:
    print(f"label: {result['label']}, with score: {round(result['score'], 4)}")
```

输出

```
label: POSITIVE, with score: 0.9998
label: NEGATIVE, with score: 0.5309
```

# 在 pipeline 中使用另一个模型和分词器

pipeline() 可以容纳 Hub 中的任何模型，这让 pipeline() 更容易适用于其他用例。

比如，你想要一个能够处理法语文本的模型，就可以使用 Hub 上的标记来筛选出合适的模型。

靠前的筛选结果会返回一个为情感分析微调的多语言的 BERT 模型，你可以将它用于法语文本：

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification

model_name = "nlptown/bert-base-multilingual-uncased-sentiment"
model = AutoModelForSequenceClassification.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)
classifier = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)
classifier("Nous sommes très heureux de vous présenter la bibliothèque 🤗 Transformers.")
```

输出

```
[{'label': '5 stars', 'score': 0.7272651791572571}]
```

如果你没有找到适合你的模型，就需要在你的数据上微调一个预训练模型了。

查看 微调教程 来学习怎样进行微调。

最后，微调完模型后，考虑一下在 Hub 上与社区 分享 这个模型，把机器学习普及到每一个人! 


## 中文

类似的，我们写一个中文的分词+情感分类

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

# 选择一个中文情感分析的预训练模型
# 这里用的是“uer/roberta-base-finetuned-jd-binary-chinese”，在中文评论分类任务上表现不错
model_name = "uer/roberta-base-finetuned-jd-binary-chinese"

# 加载模型和分词器
model = AutoModelForSequenceClassification.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# 创建情感分析 pipeline
classifier = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)

# 测试文本
text = "我对这款产品非常满意，客服态度也很好！"
result = classifier(text)

print(result)
```

输出

```
[{'label': 'positive (stars 4 and 5)', 'score': 0.9585865139961243}]
```


# chat

## 详细介绍一下 BERT 模型

下面我会系统、详细、又通俗地给你介绍 **BERT（Bidirectional Encoder Representations from Transformers）** 模型，从背景、原理、结构、训练方式到应用都讲清楚。

---

## 🧠 一、BERT 是什么？

**BERT** 是 Google 在 2018 年发布的一个里程碑式的自然语言处理（NLP）模型，全称是：

> **B**idirectional **E**ncoder **R**epresentations from **T**ransformers

简单来说：

> BERT 是一个 **基于 Transformer 编码器的双向语言模型**，能够理解句子的上下文含义。

在 BERT 出现之前，大多数 NLP 模型只能从“左到右”或者“右到左”地理解句子（比如 RNN、LSTM、GPT 等），而 BERT 首次让模型能够同时从两个方向理解文本，因此表现出了**更强的语义理解能力**。

---

## 🏗️ 二、模型结构

BERT 基于 **Transformer Encoder** 堆叠而成。

Transformer 是由 **自注意力（Self-Attention）机制** 驱动的架构。

BERT 的主干结构如下：

| 模型         | 层数 (Transformer Blocks) | 隐藏层维度 | 自注意力头数 | 参数量  |
| ---------- | ----------------------- | ----- | ------ | ---- |
| BERT Base  | 12                      | 768   | 12     | 110M |
| BERT Large | 24                      | 1024  | 16     | 340M |

核心结构如下图所示：

```
输入（token + segment + position）→ 多层 Transformer Encoder → 输出上下文向量
```

### ✳️ 输入嵌入（Input Embedding）

BERT 的输入由三部分组成：

1. **Token Embedding**：词向量（WordPiece 分词）
2. **Segment Embedding**：句子片段标记（区分句子 A 和句子 B）
3. **Position Embedding**：位置编码（保持序列顺序信息）

最终输入：

```
Input Embedding = Token + Segment + Position
```

---

## 🔄 三、BERT 的训练目标（Pretraining Tasks）

BERT 的强大来自于它的预训练任务，主要有两个：

### 1️⃣ Masked Language Modeling（MLM）

随机遮盖输入句子中 15% 的词，让模型去预测这些被遮盖的词。

例子：

> 输入：`The [MASK] sat on the mat.`
> 目标：预测 `[MASK]` 是 `"cat"`

✅ 好处：
这种方式让模型能够从**双向**上下文中学习词语含义。

---

### 2️⃣ Next Sentence Prediction（NSP）

让模型学习句子间的关系。
输入两个句子：

* 50% 情况下：第二个句子是第一个的真实后续；
* 50% 情况下：第二个句子是随机的。

模型学习输出：

```
IsNext 或 NotNext
```

例子：

| 句子 A                       | 句子 B                           | 标签      |
| -------------------------- | ------------------------------ | ------- |
| The man went to the store. | He bought a gallon of milk.    | IsNext  |
| The man went to the store. | Penguins are flightless birds. | NotNext |

✅ 好处：
NSP 让模型能够理解句子间的逻辑关系，为下游任务（如 QA、自然语言推理）打基础。

---

## ⚙️ 四、BERT 的训练过程

1. **无监督预训练阶段**

   * 在大规模语料（BookCorpus + Wikipedia）上使用 MLM + NSP 训练。
   * 得到通用的语言理解能力。

2. **有监督微调阶段（Fine-tuning）**

   * 将预训练模型加载后，针对具体任务添加少量任务特定层（如分类层），在少量标注数据上微调。

例如：

* 文本分类 → 加一个 softmax 分类头；
* 问答系统 → 加两个线性层标记起止位置；
* NER → 加一个 token 分类层。

---

## 🧩 五、BERT 的典型应用（下游任务）

| 任务类型     | 示例任务        | 微调方式              |
| -------- | ----------- | ----------------- |
| 句子级任务    | 文本分类（情感分析）  | `[CLS]` 向量接全连接层   |
| 句对任务     | 自然语言推理、语义匹配 | `[CLS]` 向量接全连接层   |
| Token级任务 | 命名实体识别、词性标注 | 每个 token 输出接分类层   |
| QA任务     | 问答系统        | 输出 start/end 位置概率 |

---

## 📈 六、BERT 的变体与后续发展

BERT 开启了 Transformer 在 NLP 的新时代，之后出现了很多变体：

| 模型             | 特点               |
| -------------- | ---------------- |
| **RoBERTa**    | 去掉 NSP、增加训练数据与时间 |
| **ALBERT**     | 参数共享、减少内存占用      |
| **DistilBERT** | 蒸馏轻量版 BERT       |
| **ERNIE**      | 融合知识图谱信息         |
| **DeBERTa**    | 增强位置编码与解码器注意力    |
| **SpanBERT**   | 改进 MLM，预测连续片段    |

---

## 🧠 七、BERT 的优点与局限

### ✅ 优点：

* 双向上下文理解；
* 通用预训练，可迁移；
* 在 GLUE、SQuAD 等基准任务中全面刷新 SOTA。

### ❌ 缺点：

* 模型参数巨大，训练代价高；
* 推理速度慢；
* 序列长度受限（512 token）；
* 对生成类任务不友好（BERT 是 Encoder-only 模型）。

---

## 🧩 八、一句话总结

> BERT 是一个**双向 Transformer 编码器模型**，通过掩码预测和句子预测的预训练任务学习语言的深层语义表示，成为 NLP 任务的通用基础模型。

## BERT 现状如何

可以很明确地说：**BERT 仍然非常重要，但现在已经不完全是 NLP 的“最前沿主流”了**。让我帮你梳理一下现状和趋势。

---

## 🧠 一、BERT 的现状

1. **基础地位稳固**

   * BERT 及其衍生模型（RoBERTa、ALBERT、DistilBERT 等）依然是很多 NLP 下游任务的 **基线模型**。
   * 它在文本分类、问答系统、命名实体识别、文本匹配等任务上表现优秀。

2. **工业应用广泛**

   * 企业内部搜索、智能客服、舆情分析、内容审核等系统中，BERT 仍然大量使用。
   * 原因：模型成熟、开源、容易迁移和微调。

---

## ⚡ 二、BERT 的局限

1. **参数大，推理慢**

   * BERT Base ~1.1 亿参数，BERT Large ~3.4 亿参数。
   * 在 CPU 上部署延迟高，GPU 部署成本也大。

2. **生成任务不友好**

   * BERT 是 **Encoder-only 模型**，不适合文本生成类任务。
   * 生成任务（Text Generation、对话、摘要）一般使用 **Decoder 或 Encoder-Decoder 模型**（如 GPT、T5、BART）。

3. **上下文长度有限**

   * 原始 BERT 最大输入 512 token，对于长文本理解有限。

---

## 🚀 三、现在的主流趋势

1. **生成式大模型（LLM）占主流**

   * ChatGPT、GPT-4、LLaMA、Claude 等。
   * 特点：强大的生成能力、长上下文、多模态扩展。
   * 这类模型常用 **Decoder-only** 或 **Encoder-Decoder** 架构。

2. **BERT 衍生优化模型**

   * RoBERTa、DeBERTa、ELECTRA、DistilBERT 等，在特定任务上性能更优、效率更高。
   * 在学术研究中仍有广泛使用。

3. **多模态融合趋势**

   * 现在很多任务涉及文字 + 图像 + 音频等。
   * BERT 系列主要是纯文本，实际应用中往往和 CLIP、BLIP、Flamingo 等多模态模型结合。

---

## 📊 四、总结一句话

| 时间线       | 主流方向                                      |
| --------- | ----------------------------------------- |
| 2018–2020 | BERT 及其衍生模型（RoBERTa、ALBERT）主导 NLP 任务      |
| 2021–2023 | 大规模 Encoder-Decoder 模型（T5、BART）兴起         |
| 2023–现在   | LLM / 生成式模型（GPT、LLaMA、Claude）引领前沿，多模态发展迅速 |
| 现实工业      | BERT 系列仍广泛用于文本理解任务，尤其是分类、搜索、问答系统          |

✅ **结论**：

BERT 在 NLP 基础任务中仍然是 **工业与研究的基线模型**，但如果你的目标是**生成、对话、长文本处理、多模态**，现在的主流是 **大语言模型（LLM）** 或 **Encoder-Decoder 系列**。


# 参考资料

https://huggingface.co/docs/transformers/main/zh/quicktour


* any list
{:toc}