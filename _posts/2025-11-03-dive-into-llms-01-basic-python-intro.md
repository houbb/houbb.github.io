---
layout: post
title: dive-into-llms-01-python 基础知识入门
date: 2025-11-03 20:40:12 +0800
categories: [AI]
tags: [ai, learn-note]
published: true
---


# 背景

学习 [dive-into-llms](https://github.com/Lordog/dive-into-llms)

# chat

## python 基础

要想真正“入门大模型”，**Python 编程基础是必不可少的地基**。

因为几乎所有的大模型框架（Transformers、PyTorch、TensorFlow、LangChain、OpenAI API 等）都基于 Python 实现。

我给你讲得系统一点👇

（不废话、实用导向，专门为“想入门大模型”的人定制）

---

## 🧱 一、Python 在大模型里的作用

在大模型领域，Python 就像是：

> “操纵大模型的遥控器”。

它让你能做这些事：

| 目标    | 举例                   | Python 的作用                           |
| ----- | -------------------- | ------------------------------------ |
| 加载模型  | 加载 BERT、GPT、LLama    | `from transformers import AutoModel` |
| 微调模型  | 用你自己的数据训练            | `model.train()`                      |
| 数据预处理 | 清洗日志、文本、指标           | `pandas`, `numpy`                    |
| 模型推理  | 输入一句话，让模型回答          | `model("今天天气怎么样？")`                  |
| 部署    | 用 Flask/FastAPI 包成服务 | `app = FastAPI()`                    |

👉 所以入门大模型，不是学 Python 为了“写代码”，
而是为了“能理解和调用这些工具”。

---

## 🪜 二、入门 Python 必学的核心知识（按学习顺序）

### 1️⃣ 基础语法

理解 Python 最基本的写法、规则。

| 主题    | 你要能做到的事     | 举例                            |
| ----- | ----------- | ----------------------------- |
| 变量与类型 | 存储数字、字符串、列表 | `a = 10`, `name = "Echo"`     |
| 运算符   | 加减乘除、逻辑运算   | `a + b`, `a > b`, `and / or`  |
| 条件语句  | 让代码“会判断”    | `if score > 60:`              |
| 循环    | 批量处理数据      | `for item in list:`           |
| 函数    | 代码复用        | `def add(a, b): return a + b` |

💡 小练习：

```python
for i in range(5):
    print(f"第 {i} 次循环")
```

---

### 2️⃣ 数据结构

Python 的强大之处在于数据结构灵活，非常适合处理模型数据。

| 类型        | 用途           | 举例                            |
| --------- | ------------ | ----------------------------- |
| list（列表）  | 存多条样本        | `[1, 2, 3]`                   |
| dict（字典）  | 存键值对，比如配置或数据 | `{"name": "Echo", "age": 30}` |
| tuple（元组） | 不可变的组合       | `(1, 2)`                      |
| set（集合）   | 去重           | `{1, 2, 3}`                   |

💡 在机器学习里，数据通常是一堆字典：

```python
sample = {"text": "系统异常：磁盘满了", "label": "磁盘问题"}
```

---

### 3️⃣ 模块与库

大模型几乎完全依赖 Python 库生态。

| 库              | 用途            | 示例                                  |
| -------------- | ------------- | ----------------------------------- |
| `numpy`        | 数学运算（矩阵）      | `np.array([[1,2],[3,4]])`           |
| `pandas`       | 表格 / CSV 数据处理 | `pd.read_csv("data.csv")`           |
| `matplotlib`   | 数据可视化         | `plt.plot(x, y)`                    |
| `torch`        | 深度学习框架        | `import torch`                      |
| `transformers` | 大模型接口库        | `from transformers import pipeline` |

💡 想运行这些库前，要先安装：

```bash
pip install numpy pandas matplotlib torch transformers
```

---

### 4️⃣ 文件与路径操作

大模型常要读写数据、保存模型。

| 操作   | 示例                                              |
| ---- | ----------------------------------------------- |
| 读文件  | `open('data.txt', 'r')`                         |
| 写文件  | `with open('out.txt', 'w') as f: f.write("结果")` |
| 操作路径 | `os.path.join("data", "file.txt")`              |

---

### 5️⃣ 类与对象（面向对象思想）

这对理解 Transformer 源码、模型结构非常有用。
你要理解“类是什么”“对象是什么”。

简单说：

```python
class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        print(self.name, "在叫")

dog = Dog("旺财")
dog.bark()
```

> 以后当你看到 `AutoModel.from_pretrained(...)` 这样的写法，
> 就能明白它其实是在“创建一个模型对象”。

---

### 6️⃣ 异常处理与调试

模型代码经常会报错，学会“优雅报错”很重要。

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("除数不能为 0！")
```

---

### 7️⃣ 虚拟环境（venv / conda）

不同项目需要不同版本的包。
入门阶段建议学会：

```bash
# 创建虚拟环境
python -m venv venv

# 进入环境
source venv/bin/activate   # mac/linux
venv\Scripts\activate      # windows
```

---

## 🧩 三、结合“大模型”学习 Python 的方式

不要死记硬背语法，推荐这样学：

| 阶段    | 做什么                     | 工具                              |
| ----- | ----------------------- | ------------------------------- |
| 第 1 周 | 跟视频 / 教程写基础语法           | B站：莫烦Python / 菜鸟教程              |
| 第 2 周 | 用 `pandas` 处理简单文本数据     | 实践：读取日志文件统计错误                   |
| 第 3 周 | 用 `transformers` 跑第一个模型 | 任务：加载 `bert-base-chinese` 做文本分类 |
| 第 4 周 | 写个小项目                   | 比如“AI报警原因总结器”                   |

---

## 💡 四、示例：用 Python 玩转第一个大模型

当你掌握上面这些 Python 基础后，你就能跑如下代码👇

```python
from transformers import pipeline

# 创建一个中文情感分析模型
classifier = pipeline("sentiment-analysis", model="uer/roberta-base-finetuned-jd-binary-chinese")

# 输入一句话
result = classifier("这次系统升级非常成功！")
print(result)
```

输出：

```python
[{'label': 'positive', 'score': 0.997}]
```

这就是“大模型入门”的第一个可运行结果🎉

---

## 📚 五、推荐学习资源

| 类型     | 资源                                                                                       | 推荐理由        |
| ------ | ---------------------------------------------------------------------------------------- | ----------- |
| 教程网站   | [菜鸟教程 Python](https://www.runoob.com/python3/python3-tutorial.html)                      | 简单实用、配例子    |
| 视频课程   | B站 “莫烦Python”                                                                            | 讲得生动、节奏适中   |
| 深度学习入门 | [Dive into Deep Learning (d2l.ai)](https://zh.d2l.ai/)                                   | 理论 + 代码实践结合 |
| 大模型实战  | [Hugging Face Transformers 中文文档](https://huggingface.co/docs/transformers/main/zh/index) | 学以致用        |

* any list
{:toc}