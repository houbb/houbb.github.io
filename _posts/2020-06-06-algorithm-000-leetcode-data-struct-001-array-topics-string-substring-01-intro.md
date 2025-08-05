---
layout: post
title: leetcode 数组专题之子串 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, string, sliding-window, substring, sf]
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

#  chat



## 介绍一下力扣中的子串

在力扣（LeetCode）中，“**子串（Substring）**”是一个非常常见的概念，几乎在字符串相关的题目中都会出现。理解清楚子串的定义、分类和常用技巧，对于刷题非常关键。

---

## 一、子串的定义

> 子串是一个字符串中 **连续的一段字符**。

比如：

```text
字符串 s = "abcde"
它的子串包括：
- "a"
- "ab"
- "abc"
- "bcd"
- "de"
- "abcde"
```

注意：像 `"ace"` 这种 **跳着选的不是子串**，它叫子序列（Subsequence）。

---

## 二、常见子串相关问题类型

| 问题类型      | 举例题目                                                                                                                                       | 简要说明                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| 枚举所有子串    | 暴力枚举、回溯等                                                                                                                                   | 主要考察循环结构，时间复杂度 O(n²)  |
| 最长子串      | [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)                                              | 多用滑动窗口优化              |
| 最小子串      | [76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)                                                                       | 滑动窗口 + 计数数组或 HashMap  |
| 固定/变动长度子串 | [567. 字符串的排列](https://leetcode.cn/problems/permutation-in-string/)                                                                         | 通常配合滑动窗口技巧            |
| 回文子串      | [5. 最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/)、[647. 回文子串](https://leetcode.cn/problems/palindromic-substrings/) | 动态规划或中心扩展法            |
| 字符串匹配     | [28. 找出字符串中第一个匹配项的下标](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/)                                    | KMP、Rabin-Karp 等字符串算法 |

---

## 三、子串枚举方法

### 1. 暴力法（双层循环）

```java
String s = "abc";
for (int i = 0; i < s.length(); i++) {
    for (int j = i + 1; j <= s.length(); j++) {
        String sub = s.substring(i, j);
        // sub 是 [i,j) 的子串
    }
}
```

* 时间复杂度：O(n²)
* 空间复杂度：O(1)（不算子串存储）

### 2. 滑动窗口法（常用于子串匹配、计数类问题）

```java
int left = 0, right = 0;
while (right < s.length()) {
    // 扩展右边界
    char c = s.charAt(right);
    right++;

    // 满足某种条件后移动左边界
    while (满足某条件) {
        left++;
    }

    // 统计答案
}
```

滑动窗口适合求“最长”、“最短”、“包含哪些字符”的子串问题。

---

## 四、常用技巧总结

| 技巧         | 说明           |
| ---------- | ------------ |
| 滑动窗口       | 高效处理动态长度子串问题 |
| 哈希表 / 计数数组 | 跟踪窗口内的字符频率   |
| 前缀和 / 差分数组 | 适用于子串数值计算类问题 |
| 动态规划       | 回文、最长公共子串等   |
| 双指针        | 与滑动窗口配合使用    |
| 字符映射       | 快速判断两个子串是否匹配 |

---

## 五、面试/刷题中容易混淆的概念

| 概念              | 是否连续     | 示例（s="abcde"）                     |
| --------------- | -------- | --------------------------------- |
| 子串 substring    | ✅ 是连续的   | "bcd"、"a"                         |
| 子序列 subsequence | ❌ 可不连续   | "ace"、"bd"                        |
| 子数组 subarray    | ✅ 数组的子串  | \[1,2,3] 中的 \[2,3]                |
| 子集 subset       | ❌ 任何组合都行 | 集合 {1,2} 的子集有 {}, {1}, {2}, {1,2} |

---

## 六、经典子串类力扣题推荐

| 难度        | 题目                                                                                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🌟 简单     | [14. 最长公共前缀](https://leetcode.cn/problems/longest-common-prefix/)、[58. 最后一个单词的长度](https://leetcode.cn/problems/length-of-last-word/)                                            |
| 🌟🌟 中等   | [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)、[438. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/) |
| 🌟🌟🌟 困难 | [76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)、[30. 串联所有单词的子串](https://leetcode.cn/problems/substring-with-concatenation-of-all-words/)                   |

## 子串属于什么？

**子串**确实是**字符串这个数据结构的一部分**或一种“派生结构”。

## ✅ 子串属于字符串的一部分结构

可以这样理解：

- **字符串** 是一种**线性数据结构**，由一系列字符按顺序排列组成。
- **子串（Substring）** 是字符串中**连续的一段字符**，所以它**依附于字符串存在**，是字符串上的一个操作对象或者子结构。

---

## 🧱 类比理解：

| 概念 | 结构 | 类比说明 |
|------|------|-----------|
| 字符串 | 数据结构 | 就像一条有序的珠子项链 |
| 子串 | 字符串的部分 | 就像从这条项链上剪出一小段珠子 |

---

## ✅ 编程/算法角度：

- 子串是基于字符串的**一种操作目标**，不是独立数据结构。
- 所有子串问题（匹配、查找、比较、回文判断等）都属于字符串处理问题的范畴。

---

## 🔁 总结一句话：

> **子串隶属于字符串，它不是一种独立数据结构，而是字符串上的连续片段，是对字符串的子结构操作。**

---

如果你想知道在算法分类中子串相关的题属于哪个方向，也可以归类为：

- 字符串处理（String Manipulation）
- 滑动窗口算法
- 动态规划（部分子串问题）
- 字符串匹配算法

需要我详细整理一下“子串类题目的算法知识图谱”也可以说一声。


* any list
{:toc}