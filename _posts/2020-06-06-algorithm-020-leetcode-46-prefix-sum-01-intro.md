---
layout: post
title:  【leetcode】46-Prefix Sum 力扣前缀和介绍 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, leetcode]
published: true
---

# 前缀和专题

[【leetcode】46-Prefix Sum 力扣前缀和介绍](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-46-prefix-sum-01-intro)

[【leetcode】47-minimum-size-subarray-sum 力扣 209. 长度最小的子数组](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-47-prefix-sum-209-minimum-size-subarray-sum)

[【leetcode】48-product-of-array-except-self 力扣 238. 除自身以外的数组的乘积](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-48-prefix-sum-238-product-of-array-except-self)

[【leetcode】49-303. range-sum-query-immutable 力扣 303. 区域和检索 - 数组不可变](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-49-prefix-sum-303-range-sum-query-immutable)

[【leetcode】50-307. range-sum-query-mutable 力扣 307. 区域和检索 - 数组可变](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-50-prefix-sum-307-range-sum-query-mutable)

[【leetcode】50-树状数组 Binary Indexed Tree，简称 BIT FenwickTree](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-50-prefix-sum-tree-array)

[【leetcode】51-1124. longest-well-performing-interval 力扣 1124. 表现良好的最长时间段 前缀和+HashMap](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-51-prefix-sum-1124-longest-well-performing-interval)

[【leetcode】52-410. split-array-largest-sum 力扣 410. 分割数组的最大值](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-52-prefix-sum-410-split-array-largest-sum)

[【leetcode】53-523. continuous-subarray-sum 力扣 523. 连续的子数组和 同余定理 前缀和+HashMap](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-53-prefix-sum-523-continuous-subarray-sum)

[【leetcode】54-325. max-size-subarray-sum-equals-k 力扣 325：和等于 k 的最长子数组长度](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-54-prefix-sum-325-longest-array-sum-equal-k)

[【leetcode】53-525. continuous-subarray-sum 力扣 525. 连续的子数组和 同余定理 前缀和+HashMap](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-55-prefix-sum-525-contiguous-array)

[【leetcode】56-560. subarray-sum-equals-k 力扣 560. 和为 k 的子数组 前缀和+HashMap](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-56-prefix-sum-560-subarray-sum-equals-k)

[【leetcode】57-1371. find-the-longest-substring-containing-vowels-in-even-counts 力扣 1371. 每个元音包含偶数次的最长子字符串](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-57-prefix-sum-1371-find-the-longest-substring-containing-vowels-in-even-counts)

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 前缀和 

前缀和（Prefix Sum）是一种常见的数组预处理技巧，主要用于 **快速计算区间的累加和**，大幅度优化原本需要 `O(n)` 时间的区间求和操作，将其降为 `O(1)`。

它是竞赛、面试和工程中常见的优化手段之一。

---

## 一、什么是前缀和？

对一个数组 `nums = [a₀, a₁, a₂, ..., aₙ₋₁]`，它的前缀和数组 `prefixSum` 定义为：

```
prefixSum[0] = 0 （有时也会直接等于 a₀，视实现方式而定）
prefixSum[1] = a₀
prefixSum[2] = a₀ + a₁
prefixSum[3] = a₀ + a₁ + a₂
...
prefixSum[i] = a₀ + a₁ + ... + a₍ᵢ₋₁₎
```

有了这个数组之后，就可以在 **常数时间** 内计算任意区间 `[l, r]` 的和：

```
sum(l, r) = prefixSum[r + 1] - prefixSum[l]
```

> 注意：这里的 `prefixSum[i]` 是前 `i` 个数的和，因此需要 **从索引 1 开始存储原数组的前缀和**，`prefixSum[0] = 0`。

---

## 二、代码实现（以 Java 为例）

```java
// 构建前缀和
int[] prefixSum = new int[nums.length + 1]; // 多开一位，prefixSum[0] = 0
for (int i = 0; i < nums.length; i++) {
    prefixSum[i + 1] = prefixSum[i] + nums[i];
}

// 查询区间和 [l, r]
int sum = prefixSum[r + 1] - prefixSum[l];
```

## 四、复杂度分析

* 构建：O(n)
* 区间查询：O(1)

相比直接遍历区间求和（O(n)），前缀和大大加快了查询速度。

---

## 五、注意事项

1. **前缀和数组要多开一位**，避免边界问题。
2. 适合 **频繁查询**、但不修改数组的情况。
3. 如果原数组频繁修改（如变动某个元素），需要重新计算前缀和。

   * 这种场景建议用更强的数据结构：如树状数组、线段树。

---

## 六、例题推荐

好的，下面是补充了**力扣题目难度**的表格，每题都是前缀和或差分相关的经典题：

| 题目编号   | 名称               | 类型            | 难度    |
| ------ | ---------------- | ------------- | ----- |
| LC 303 | 区域和检索 - 数组不可变    | 基础前缀和         | 🟢 简单 |
| LC 724 | 寻找数组的中心索引        | 前缀和判等         | 🟢 简单 |
| LC 304 | 二维区域和检索 - 矩阵不可变  | 二维前缀和         | 🟡 中等 |
| LC 560 | 和为 K 的子数组        | 前缀和 + HashMap | 🔴 中等 |
| LC 525 | 连续数组（0 和 1 数量相等） | 差分 + 前缀和      | 🔴 中等 |




# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/

* any list
{:toc}