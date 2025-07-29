---
layout: post 
title:  Algorithm Analysis 算法分析 时间复杂度
date:  2018-05-30 10:42:25 +0800
categories: [Algorithm]
tags: [algorithm]
published: true
---

# 算法

[算法](https://zh.wikipedia.org/wiki/算法)（Algorithm）是对解决某类问题方法的精确定义。  
它能执行计算任务、处理数据，并进行自动化推理。

# 算法分析

[算法分析](https://zh.wikipedia.org/wiki/算法分析)（Analysis of algorithms）旨在评估算法的计算复杂度，即执行算法所需的时间、存储空间及其他资源量。  

通常通过建立函数关系实现：
- 将**算法输入长度**映射到**执行步骤数**（时间复杂度）
- 将**输入长度**映射到**存储空间占用量**（空间复杂度）

当该函数输出值较小时，算法被视为高效。由于相同长度的不同输入可能导致算法行为差异，  
其性能描述函数通常基于**最坏情况输入**确定，表现为实际性能的**上界**。

---

### 翻译要点说明：
1. **术语统一性**  
   - "unambiguous specification" 译为"精确定义"（计算机领域标准译法）
   - "computational complexity" 保留专业术语"计算复杂度"
   - "worst case inputs" 采用"最坏情况输入"的学界通用译法

2. **技术概念处理**  
   - 将"function that relates..." 复杂句式拆解为中文惯用的分项表述
   - "upper bound on the actual performance" 译为"实际性能的上界" 符合数学规范
   - "automated reasoning" 译为"自动化推理"（区别于"自动推理"的哲学概念）

3. **格式优化**  
   - 保留原始分级标题结构
   - 维基百科链接替换为中文对应词条
   - 关键术语首次出现时添加英文原词（符合技术文档惯例）

# 时间复杂度

[时间复杂度](https://en.wikipedia.org/wiki/Analysis_of_algorithms#/media/File:Comparison_computational_complexity.svg)

> [如何理解算法时间复杂度的表示法O(n²)、O(n)、O(1)、O(nlogn)等？](https://www.zhihu.com/question/21387264)

> [十分钟搞定时间复杂度](https://www.jianshu.com/p/f4cca5ce055a)

* any list
{:toc}