---
layout: post
title: 第12章　模型评估与调优
date: 2025-11-03 20:40:12 +0800
categories: [AI]
tags: [ai, learn-note]
published: true
---



# 第12章　模型评估与调优

再好的算法，也需要科学的评估与精细的调优。

机器学习模型不是一劳永逸的“公式”，而是一个需要不断验证、优化、取舍的系统。

本章将系统介绍：如何评价模型好坏、如何合理分配数据、如何找到最优参数组合，以及如何理解模型的“可靠性”。

## **12.1 交叉验证与数据划分策略**

### 🎯 1. 为什么要划分数据？

机器学习的核心是“**从已知数据学习规律，以预测未知数据**”。
如果用同一批数据训练又评估，就会出现“自我欣赏式高分”，无法反映真实能力。

因此要划分为不同集：

* **训练集（Train）**：用于学习模型参数。
* **验证集（Validation）**：用于调参与模型选择。
* **测试集（Test）**：仅在最后评估模型泛化能力。

常见比例：6:2:2 或 7:1.5:1.5。

---

### 🔁 2. 交叉验证（Cross-Validation）

当数据量有限时，简单划分可能不稳定，这时我们用交叉验证。

**K 折交叉验证（K-Fold CV）**

* 将数据分为 K 份；
* 每次用其中 1 份作验证集，剩下 K-1 份训练；
* 重复 K 次，取平均性能。

示意：

| 轮次 | 训练集     | 验证集 |
| -- | ------- | --- |
| 1  | 折 2~K   | 折 1 |
| 2  | 折 1,3~K | 折 2 |
| …  | …       | …   |
| K  | 折 1~K-1 | 折 K |

**优点：**

* 有效利用全部样本；
* 结果更稳定、泛化性强。

**变体：**

* **Stratified K-Fold**：保持类别比例一致（分类任务推荐）；
* **Leave-One-Out (LOO)**：每次留一个样本验证，适用于极少样本任务；
* **Time Series Split**：时间序列任务中按时间顺序分割，防止“未来信息泄露”。

---

## **12.2 分类指标（准确率、召回率、F1、AUC）**

模型性能不止“一个数字”，尤其在不平衡数据集（如欺诈检测、医疗诊断）中，**选择正确指标比高分更重要。**

---

### 📊 1. 混淆矩阵（Confusion Matrix）

| 实际\预测 | 正类     | 负类     |
| ----- | ------ | ------ |
| 正类    | TP（真正） | FN（假负） |
| 负类    | FP（假正） | TN（真负） |

---

### ✅ 2. 准确率（Accuracy）

[
Accuracy = \frac{TP + TN}{TP + TN + FP + FN}
]
适合类别平衡的数据；不平衡数据时会误导。

---

### 🔍 3. 精确率（Precision）与召回率（Recall）

[
Precision = \frac{TP}{TP + FP} \quad
Recall = \frac{TP}{TP + FN}
]

* **Precision 高** → 模型输出的“正例”更可信；
* **Recall 高** → 模型漏掉的“正例”更少。

两者通常存在权衡。

---

### ⚖️ 4. F1 分数（F1-Score）

综合 Precision 和 Recall：
[
F1 = 2 \times \frac{Precision \times Recall}{Precision + Recall}
]
常用于二分类的综合指标。

---

### 💡 5. ROC 曲线与 AUC（Area Under Curve）

* **ROC 曲线**：以假正率 (FPR) 为横轴、真正率 (TPR) 为纵轴。
* **AUC**：ROC 曲线下的面积，越大代表模型越稳定。

**直观理解：**

* AUC = 0.5 → 完全随机；
* AUC = 1.0 → 完美分类器；
* AUC > 0.9 → 极佳模型。

---

### 📈 6. 其他指标补充

| 场景    | 指标               | 说明             |
| ----- | ---------------- | -------------- |
| 不平衡数据 | PR 曲线、AUC-PR     | 正例稀少时比 ROC 更稳定 |
| 多分类   | Macro / Micro F1 | 平均多个二分类结果      |
| 回归    | MSE、MAE、R²       | 均方误差、绝对误差、拟合度  |

---

## **12.3 超参数调优（Grid Search、Bayesian Optimization）**

模型有两种参数：

* **可学习参数**（weights、bias）：模型通过训练自动学；
* **超参数**（hyperparameters）：人手动设定，如学习率、正则系数、树深度。

调优的目标是：**找到最优超参数组合，让验证集表现最佳。**

---

### 🔢 1. 网格搜索（Grid Search）

遍历所有参数组合，选出最优。

**优点：**

* 简单直接；
* 结果稳定。

**缺点：**

* 计算量爆炸；
* 无法处理连续参数。

**示例：**

```python
from sklearn.model_selection import GridSearchCV

params = {'C': [0.1, 1, 10], 'kernel': ['linear', 'rbf']}
grid = GridSearchCV(SVC(), params, cv=5)
grid.fit(X_train, y_train)
print(grid.best_params_)
```

---

### 🎲 2. 随机搜索（Random Search）

随机抽样参数组合，往往能更快找到好结果。

> 在高维空间中，随机 > 穷举。

---

### 🧠 3. 贝叶斯优化（Bayesian Optimization）

通过**概率模型（如高斯过程）**建模“参数 → 性能”的关系，智能地选择下一个最有潜力的参数。

核心思想：

1. 用已有实验结果建一个 surrogate model；
2. 计算“期望改进”（Expected Improvement）；
3. 选出最可能带来性能提升的参数点；
4. 迭代更新。

代表工具：

* Optuna
* Hyperopt
* SMAC
* Ray Tune

💡 *Grid Search 像蛮力搜索，Bayesian Optimization 像聪明的科学实验。*

---

## **12.4 模型稳定性与可解释性**

### 🧩 1. 模型稳定性（Model Robustness）

模型在不同样本、噪声、时间分布变化下的表现是否一致。

**常见问题：**

* 训练集与生产环境分布漂移（Data Drift）
* 噪声敏感
* 对特征小扰动反应过度

**提升方法：**

* 使用正则化（L2、Dropout）
* 数据增强（Data Augmentation）
* 模型集成（Ensemble）
* 持续监控模型性能（ML Monitoring）

---

### 🔍 2. 模型可解释性（Interpretability）

在现实场景中（尤其是金融、医疗、法律），模型必须“能解释自己”。

**可解释性维度：**

* **全局解释**：模型整体如何决策
  （如特征重要性、决策路径）
* **局部解释**：单个样本为什么被预测为某类
  （如 LIME、SHAP）

**工具：**

* Feature Importance（基于树模型）
* LIME（Local Interpretable Model-Agnostic Explanations）
* SHAP（Shapley Additive Explanations）

💡 *黑盒模型能预测，但白盒模型能赢得信任。*

---

## ✅ 本章小结

| 模块    | 目标     | 常见方法                   | 关键意义   |
| ----- | ------ | ---------------------- | ------ |
| 数据划分  | 防止过拟合  | Train/Val/Test, CV     | 评估真实泛化 |
| 分类指标  | 评价分类性能 | Accuracy, F1, AUC      | 衡量优劣   |
| 超参调优  | 找到最优配置 | Grid, Random, Bayesian | 提升性能   |
| 稳定与解释 | 提高可靠性  | LIME, SHAP, Drift检测    | 工业可用性  |

* any list
{:toc}