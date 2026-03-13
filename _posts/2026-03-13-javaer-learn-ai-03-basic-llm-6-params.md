---
layout: post
title: javaer 转型 ai 学习之路-03-基础知识 LLM（Large Language Model）
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---


# 如果继续往下学，**下一步最重要的知识其实不是 Transformer**，而是：

**LLM 的 6 个关键运行参数**（几乎决定模型行为）：

```
temperature
top_p
top_k
max_tokens
stop
seed
```


这 6 个参数本质上都在控制 **LLM 的采样（sampling）行为**。

因为模型每一步都会产生 **一组 token 概率分布**，而这些参数决定：

```text
从概率分布中如何选择下一个 token
```

理解它们，你基本就掌握了 **LLM 推理行为调控的核心**。

我们一个一个讲，并结合 **工程实践建议**。

---

# 一、temperature（最重要）

**temperature 控制随机性（creativity）。**

直觉理解：

```text
temperature 越高 → 越随机
temperature 越低 → 越确定
```

数学上它会调整概率分布：

[
P_i = \frac{e^{z_i/T}}{\sum_j e^{z_j/T}}
]

P_i = \frac{e^{z_i/T}}{\sum_j e^{z_j/T}}

其中：

```
T = temperature
```

---

## 示例

模型预测：

```
北京 0.40
上海 0.30
广州 0.20
深圳 0.10
```

### temperature = 0

```
永远选最大概率 token
```

输出：

```
北京
```

---

### temperature = 1

保持原概率：

```
北京 40%
上海 30%
广州 20%
深圳 10%
```

---

### temperature = 1.5

概率会变平：

```
北京 30%
上海 28%
广州 22%
深圳 20%
```

随机性增加。

---

## 工程建议

不同任务的推荐值：

| 场景   | temperature |
| ---- | ----------- |
| 知识问答 | 0.1 – 0.3   |
| RAG  | 0.1 – 0.3   |
| 代码生成 | 0.1 – 0.2   |
| 总结   | 0.2 – 0.4   |
| 聊天   | 0.6 – 0.9   |
| 创作   | 0.8 – 1.2   |

企业 AI **基本都用 0.1~0.3**。

---

# 二、top_p（Nucleus Sampling）

top_p 控制：

```text
只在累计概率达到 p 的 token 中采样
```

例如 token 概率：

```
A 0.40
B 0.30
C 0.20
D 0.05
E 0.05
```

---

### top_p = 0.9

累加：

```
A 0.40
A+B 0.70
A+B+C 0.90
```

只保留：

```
A B C
```

然后再随机选。

---

### top_p = 0.6

```
A 0.40
A+B 0.70
```

只保留：

```
A B
```

---

## 作用

避免低概率垃圾 token。

---

## 推荐值

```
top_p = 0.8 – 0.95
```

很多 API 默认：

```
top_p = 1
```

---

# 三、top_k

top_k 是更简单的版本：

```text
只在概率最高的 k 个 token 中选择
```

例如：

```
A 0.40
B 0.30
C 0.20
D 0.05
E 0.05
```

---

### top_k = 3

保留：

```
A
B
C
```

删除：

```
D
E
```

---

## 与 top_p 的区别

| 方法    | 逻辑   |
| ----- | ---- |
| top_k | 固定数量 |
| top_p | 动态概率 |

工程实践：

```
top_p 更常用
```

---

# 四、max_tokens

控制：

```text
模型最多生成多少 token
```

例如：

```
max_tokens = 200
```

模型最多输出：

```
200 tokens
```

注意：

```
input tokens + output tokens ≤ context window
```

例如：

context window：

```
128k tokens
```

输入：

```
2000 tokens
```

输出最多：

```
126k tokens
```

---

## 工程建议

不同场景：

| 任务    | max_tokens |
| ----- | ---------- |
| 短回答   | 100        |
| RAG回答 | 300        |
| 总结    | 500        |
| 长文    | 1000+      |

---

# 五、stop

stop 是：

```text
停止生成的字符串
```

例如：

```json
stop: ["END"]
```

模型生成：

```
这是回答
END
```

会自动截断。

---

## 常见用法

### JSON 输出

```
stop = ["}"]
```

### Markdown

````
stop = ["```"]
````

### 多轮 agent

```
stop = ["Observation:"]
```

---

# 六、seed

seed 用来：

```text
控制随机数
```

当：

```
seed 固定
```

模型输出就：

```
可复现
```

例如：

```
seed = 42
```

每次生成一样结果。

---

## 为什么重要

在工程中需要：

```
A/B测试
prompt调试
结果复现
```

---

# 七、参数之间的关系

实际推理流程：

```
模型输出概率
↓
temperature 调整
↓
top_k / top_p 过滤
↓
随机采样
↓
生成 token
```

简化流程：

```
logits
↓
temperature
↓
top_p / top_k
↓
sampling
```

---

# 八、企业 AI 的推荐配置

RAG / AI系统：

```
temperature = 0.2
top_p = 0.9
max_tokens = 512
```

代码生成：

```
temperature = 0.1
top_p = 0.95
```

聊天：

```
temperature = 0.7
top_p = 0.9
```

---

# 九、很多人不知道的一个事实

**temperature = 0 其实不完全 deterministic。**

因为：

```
GPU并行
浮点误差
实现差异
```

所以真正完全复现：

需要：

```
temperature
seed
model version
```

全部固定。

---

# 十、AI 工程师必须理解的一点

这些参数本质上都在解决一个问题：

```text
如何在“确定性”和“创造性”之间平衡
```

这也是为什么：

* 搜索 → 低 temperature
* 写作 → 高 temperature

---

如果继续深入 LLM，**下一步最关键的知识其实不是参数**，而是：

**Token / Embedding / Attention 的完整计算流程**。

理解这个之后，你会彻底明白：

```
为什么 Prompt 有作用
为什么 RAG 能工作
为什么 Agent 可以调用工具
```

如果你愿意，我们可以继续下一节：

**LLM 内部完整计算流程（Token → Embedding → Attention → 输出）**。





# 参考资料

* any list
{:toc}