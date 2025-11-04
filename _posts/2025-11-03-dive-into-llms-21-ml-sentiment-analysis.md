---
layout: post
title: dive-into-llms-21-通过机器学习模式实现 sentiment-analysis
date: 2025-11-03 20:40:12 +0800
categories: [AI]
tags: [ai, learn-note]
published: true
---


# 背景

使用机器学习的思路实现 sentiment-analysis

# 预训练语言模型微调与部署


# chat

## 用传统机器学习做文本分类的完整实现思路

我帮你梳理一下 **用传统机器学习做文本分类的完整实现思路**，从数据处理到模型训练、预测、评估，每一步都清楚说明。

---

# 一、整体流程

传统机器学习做文本分类，一般遵循以下步骤：

```
文本数据 → 文本预处理 → 特征提取 → 训练模型 → 预测 & 评估
```

---

# 二、详细步骤

### 1️⃣ 数据准备

* **收集文本数据**，每条文本有对应标签（分类类别）。
* 示例：

| 文本       | 标签 |
| -------- | -- |
| 我很喜欢这部电影 | 正面 |
| 这本书太无聊了  | 负面 |

---

### 2️⃣ 文本预处理

传统 ML 无法直接处理原始文本，需要先做特征化：

常见步骤：

1. **分词**：把句子拆成单词或词组（中文可用结巴分词 `jieba`）。
2. **去停用词**：去掉“的、了、是”等无意义词。
3. **清理文本**：去掉标点符号、数字、特殊字符。
4. **小写化**（英文文本可选）。

示例（Python + jieba）：

```python
import jieba

text = "我很喜欢这部电影"
tokens = jieba.lcut(text)
# 输出: ['我', '很', '喜欢', '这', '部', '电影']
```

---

### 3️⃣ 特征提取（向量化）

传统 ML 需要将文本转成数值向量才能输入模型：

#### 常用方法：

1. **Bag of Words（词袋模型）**

   * 统计每个词在文本中出现次数
2. **TF-IDF**

   * 对词频加权，减少高频低价值词的影响
3. **特征维度选择**

   * 可使用 `CountVectorizer` 或 `TfidfVectorizer`，并可限制最大特征数

示例：

```python
from sklearn.feature_extraction.text import TfidfVectorizer

corpus = ["我很喜欢这部电影", "这本书太无聊了"]
vectorizer = TfidfVectorizer(tokenizer=jieba.lcut)
X = vectorizer.fit_transform(corpus)
print(X.toarray())  # 转换成数值向量
```

---

### 4️⃣ 选择模型

常用传统机器学习分类模型：

| 模型                            | 特点                      |
| ----------------------------- | ----------------------- |
| **朴素贝叶斯（Naive Bayes）**        | 简单高效，适合文本分类             |
| **逻辑回归（Logistic Regression）** | 对大规模稀疏向量效果好             |
| **支持向量机（SVM）**                | 高维稀疏数据表现稳定              |
| **随机森林 / 决策树**                | 可以处理非线性关系，但文本稀疏向量可能效果一般 |

示例：

```python
from sklearn.naive_bayes import MultinomialNB

y = ["正面", "负面"]  # 标签
model = MultinomialNB()
model.fit(X, y)
```

---

### 5️⃣ 预测

对新文本进行处理、向量化，再用模型预测：

```python
new_text = "电影剧情很精彩"
X_new = vectorizer.transform([new_text])
pred = model.predict(X_new)
print(pred)  # ['正面']
```

---

### 6️⃣ 模型评估

常用指标：

* 准确率（Accuracy）
* 精确率（Precision）
* 召回率（Recall）
* F1-score
* 混淆矩阵

示例：

```python
from sklearn.metrics import classification_report

y_true = ["正面", "负面"]
y_pred = ["正面", "正面"]
print(classification_report(y_true, y_pred))
```

---

# 三、总结

1. **特征工程是关键**：传统 ML 依赖人工设计和文本向量化。
2. **模型简单高效**：朴素贝叶斯、逻辑回归、SVM 就够用了。
3. **适合小数据集**：1000~10万条文本效果还可以。
4. **缺点**：无法捕捉词序和上下文信息，对长文本、复杂语义理解有限。

---

💡 **一句话概括**

> 传统文本分类 = **分词 → 特征向量 → 传统分类器 → 预测 & 评估**




* any list
{:toc}