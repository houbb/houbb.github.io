---
layout: post
title: dive-into-llms-05-PyTorch 入门介绍
date: 2025-11-03 20:40:12 +0800
categories: [AI]
tags: [ai, learn-note]
published: true
---


# 背景

https://pytorch.org/

# chat

## 是什么？

我来系统、易懂地帮你介绍一下 **PyTorch** —— 它是几乎所有大模型（LLM）开发者都要掌握的核心框架。

---

## 💡 一、PyTorch 是什么？

> PyTorch 是一个 **基于 Python 的深度学习框架**，由 Facebook（现在的 Meta）AI 研究院在 2016 年发布。
> 它主要用于：
>
> * **构建神经网络模型**
> * **进行 GPU 加速训练**
> * **实现灵活的科学计算和自动微分**

一句话概括：

> **PyTorch = 数学计算（像 NumPy） + 自动求导（Autograd） + 神经网络模块（nn） + GPU 加速**

---

## 🧱 二、PyTorch 的核心组成模块

PyTorch 其实可以拆成几个关键部分：

### 1️⃣ **Tensor 张量**

* 类似于 NumPy 的多维数组，但可以在 GPU 上运行。
* 是整个 PyTorch 的「数据基石」。

```python
import torch

x = torch.tensor([[1, 2], [3, 4]], dtype=torch.float32)
print(x)
print(x.device)  # 默认是 CPU
```

你也可以直接把它放在 GPU 上：

```python
x = x.to('cuda')
```

---

### 2️⃣ **Autograd（自动求导）**

* 自动计算梯度（用于训练神经网络时的反向传播）。
* 不需要手动写微分公式。

```python
x = torch.tensor(2.0, requires_grad=True)
y = x ** 2 + 3 * x + 1
y.backward()  # 自动计算 dy/dx
print(x.grad)  # 输出：7.0
```

---

### 3️⃣ **nn（神经网络模块）**

* 提供各种神经网络的基本组件，比如：

  * `nn.Linear`（全连接层）
  * `nn.Conv2d`（卷积层）
  * `nn.LSTM`（循环神经网络）
  * `nn.Transformer`（大模型核心架构）
* 你可以像拼积木一样搭建模型：

```python
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(10, 2)

    def forward(self, x):
        return self.linear(x)

model = SimpleNet()
print(model)
```

---

### 4️⃣ **优化器（torch.optim）**

* 用来更新模型参数，让损失函数变小。
* 常见优化器有：

  * `SGD`
  * `Adam`
  * `RMSProp`

```python
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
```

---

### 5️⃣ **损失函数（torch.nn.functional 或 nn 模块）**

* 衡量预测与真实结果的差距，比如：

  * `nn.MSELoss`（回归）
  * `nn.CrossEntropyLoss`（分类）
  * `nn.BCELoss`（二分类）

```python
criterion = nn.CrossEntropyLoss()
```

---

### 6️⃣ **DataLoader / Dataset**

* 负责加载和批量处理训练数据。
* 可以自定义 `Dataset` 继承类，实现数据读取逻辑。

```python
from torch.utils.data import DataLoader, Dataset

class MyDataset(Dataset):
    def __init__(self, data):
        self.data = data

    def __getitem__(self, idx):
        return self.data[idx]

    def __len__(self):
        return len(self.data)

loader = DataLoader(MyDataset([1,2,3,4]), batch_size=2)
```

---

## 🚀 三、PyTorch 的训练流程

完整的训练流程基本如下：

```python
for epoch in range(num_epochs):
    for batch in dataloader:
        optimizer.zero_grad()     # 清空梯度
        outputs = model(batch)    # 前向传播
        loss = criterion(outputs, labels)  # 计算损失
        loss.backward()           # 反向传播计算梯度
        optimizer.step()          # 更新参数
```

这是所有神经网络训练的通用套路。

---

## ⚡ 四、PyTorch 的优势

✅ **动态图机制（Dynamic Graph）**

* 计算图是即时构建的，写起来更像普通 Python 代码。
* 比 TensorFlow（旧版本）灵活，非常适合研究和实验。

✅ **GPU 加速简单**

* 只需一行 `.to('cuda')`，计算全加速。

✅ **生态丰富**

* 大量预训练模型可直接加载：

  * 来自 Hugging Face Transformers
  * torchvision（图像）
  * torchaudio（语音）
  * torchtext（NLP）

✅ **社区强大**

* 几乎所有深度学习论文的开源实现都支持 PyTorch。

---

## 📘 五、入门学习建议

如果你想系统学 PyTorch，可以按这个路径走：

1. **官方教程**（强烈推荐）
   👉 [https://pytorch.org/tutorials/](https://pytorch.org/tutorials/)

2. **中文教学书籍**

   * 《动手学深度学习 PyTorch 版》（李沐等）
   * 《深度学习入门：基于 PyTorch》

3. **实践项目建议**

   * 实现一个手写数字识别（MNIST）
   * 搭一个情感分类（NLP）
   * 训练一个 Transformer 文本生成小模型

---

## 🧠 总结一句话：

> PyTorch 是深度学习和大模型的“通用语言”，掌握它 = 打开 LLM 世界的第一道门。
> 从简单的张量运算，到构建 Transformer，只要理解 PyTorch 的计算逻辑，后续学 Hugging Face、微调 LLM、部署模型都会非常顺畅。


* any list
{:toc}