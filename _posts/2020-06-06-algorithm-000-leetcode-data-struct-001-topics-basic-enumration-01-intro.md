---
layout: post
title: leetcode 基础篇专题之枚举 enumration 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, enumration, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下数组这种数据结构。

## 主要知识

数组需要拆分下面几个部分：

1. 理论介绍

2. 源码分析

3. 数据结构实现？

4. 题目练习（按照算法思想分类）

5. 梳理对应的 sdk 包

6. 应用实战

因为这个是 leetcode 系列，所以重点是 4、5(对4再一次总结)。

为了照顾没有基础的小伙伴，会简单介绍一下1的基础理论。

简单介绍1，重点为4。其他不是本系列的重点。

# 基础篇

数组-矩阵

字符串-字符串匹配

排序：计数+桶+基数

模拟

枚举

# chat

## 详细介绍一下力扣基础之枚举 enumration

我们这次来系统讲解力扣（LeetCode）中的**基础技巧之一：枚举（Enumeration）**，包括：

---

## 一、什么是枚举？

\*\*枚举（Enumeration）\*\*就是：

> 在所有可能的情况中，**一个不漏地遍历一遍**，判断每种情况是否满足题目条件。

通俗讲就是：“把所有可能性都试一遍”。

---

## 二、什么时候用枚举？

| 情形              | 举例          |
| --------------- | ----------- |
| 选项不多，可以暴力尝试所有组合 | 穷举子集、枚举三元组  |
| 无法直接计算，必须尝试所有方案 | 两数之和、最长公共前缀 |
| 子问题不多，暴力可过      | 最长回文子串、回文对  |

> 💡 **重点：枚举适用于“规模小但组合多”的问题**，适合用作初步解法或暴力对拍。

---

## 三、常见枚举方式分类

### 1. **枚举一个变量**

```java
for (int i = 0; i < n; i++) {
    // 判断 i 是否满足条件
}
```

📌 例题：

* [509. 斐波那契数](https://leetcode.cn/problems/fibonacci-number/)
* [258. 各位相加](https://leetcode.cn/problems/add-digits/)

---

### 2. **枚举两个变量（双层嵌套）**

```java
for (int i = 0; i < n; i++) {
    for (int j = i + 1; j < n; j++) {
        // 枚举所有 i < j 的组合
    }
}
```

📌 例题：

* [1. 两数之和（暴力版）](https://leetcode.cn/problems/two-sum/)
* [15. 三数之和（第一步枚举 i）](https://leetcode.cn/problems/3sum/)
* [344. 反转字符串](https://leetcode.cn/problems/reverse-string/)

---

### 3. **枚举子串 / 子数组**

```java
for (int i = 0; i < n; i++) {
    for (int j = i; j < n; j++) {
        // [i, j] 子串或子数组
    }
}
```

📌 例题：

* [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)
* [5. 最长回文子串（暴力版）](https://leetcode.cn/problems/longest-palindromic-substring/)
* [560. 和为K的子数组（枚举子数组）](https://leetcode.cn/problems/subarray-sum-equals-k/)

---

### 4. **枚举组合（回溯/位运算）**

* 用回溯或二进制掩码枚举所有子集、排列、组合

📌 例题：

* [78. 子集](https://leetcode.cn/problems/subsets/)
* [90. 子集 II（含重复元素）](https://leetcode.cn/problems/subsets-ii/)
* [46. 全排列](https://leetcode.cn/problems/permutations/)

---

### 5. **特殊结构的枚举**

如：

* 枚举矩阵中所有子矩阵
* 枚举图中所有路径
* 枚举两个数的乘积组合

📌 例题：

* [221. 最大正方形（暴力版枚举左上角+边长）](https://leetcode.cn/problems/maximal-square/)
* [73. 矩阵置零（先枚举再标记）](https://leetcode.cn/problems/set-matrix-zeroes/)

---

## 四、优化枚举的方法

> 虽然枚举很暴力，但我们可以优化它的方式，让它变得更高效。

### ✅ 技巧一：剪枝（提前退出）

```java
for (...) {
    if (不满足条件) break;
}
```

📌 例子：

* 三数之和排序后剪枝
* 两数之和先排序，用双指针

---

### ✅ 技巧二：用数据结构辅助

比如：

* 用 `Set`/`Map` 减少查找时间
* 用 `前缀和` 优化子数组求和

📌 例题：

* [1. 两数之和（哈希优化）](https://leetcode.cn/problems/two-sum/)
* [560. 和为K的子数组（前缀和+Map）](https://leetcode.cn/problems/subarray-sum-equals-k/)

---

### ✅ 技巧三：位运算枚举子集

```java
int n = nums.length;
for (int mask = 0; mask < (1 << n); mask++) {
    // mask 表示一个子集
    for (int i = 0; i < n; i++) {
        if ((mask >> i & 1) == 1) {
            // 选了 nums[i]
        }
    }
}
```

📌 例题：

* [78. 子集](https://leetcode.cn/problems/subsets/)
* [1879. 两个数组最小的和（TSP状态压缩）](https://leetcode.cn/problems/minimum-xor-sum-of-two-arrays/)

---

## 五、枚举模板代码总结

### 🔁 枚举两个数：

```java
for (int i = 0; i < n; i++) {
    for (int j = i + 1; j < n; j++) {
        // 判断 nums[i] + nums[j]
    }
}
```

---

### 🔁 枚举所有子数组：

```java
for (int i = 0; i < n; i++) {
    int sum = 0;
    for (int j = i; j < n; j++) {
        sum += nums[j];
        // 判断子数组 [i, j]
    }
}
```

---

### 🔁 枚举所有子集（二进制法）：

```java
int n = nums.length;
for (int mask = 0; mask < (1 << n); mask++) {
    List<Integer> subset = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        if ((mask & (1 << i)) != 0) {
            subset.add(nums[i]);
        }
    }
    // subset 是一个子集
}
```

---

## 六、推荐刷题顺序（入门 → 提升）

### ✅ 入门枚举题

* [1. 两数之和](https://leetcode.cn/problems/two-sum/)
* [66. 加一](https://leetcode.cn/problems/plus-one/)
* [344. 反转字符串](https://leetcode.cn/problems/reverse-string/)

### ✅ 中等枚举题

* [15. 三数之和](https://leetcode.cn/problems/3sum/)
* [78. 子集](https://leetcode.cn/problems/subsets/)
* [560. 和为K的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/)

### ✅ 高阶进阶

* [90. 子集 II](https://leetcode.cn/problems/subsets-ii/)
* [39. 组合总和](https://leetcode.cn/problems/combination-sum/)
* [1879. 最小异或和](https://leetcode.cn/problems/minimum-xor-sum-of-two-arrays/)

---

## 七、小结

| 优点        | 缺点               |
| --------- | ---------------- |
| 简单直接，逻辑清晰 | 时间复杂度可能高，适合数据范围小 |
| 不需要太多技巧   | 有些题暴力法过不了，需要优化   |

---

如果你需要，我可以帮你：

* 讲解某道具体的枚举题目 + 优化
* 帮你设计一套“枚举刷题路径”
* 写出具体代码模板供你套用


* any list
{:toc}