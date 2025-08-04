---
layout: post
title: leetcode 基础篇专题之字符串 string 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, string, sf]
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

## 详细介绍一下力扣基础之字符串

我们来系统讲解力扣（LeetCode）中关于**基础算法技巧之字符串（String）**，包括：

---

## 一、字符串是什么？

在编程中，**字符串 = 字符的序列**，例如 `"abc"`、`"leetcode"`，你可以把它看作一个字符数组。

* Java：`String`, `StringBuilder`, `char[]`
* Python：`str`, 可用切片操作
* C++：`string`, `char[]`

---

## 二、力扣中字符串题的常见考点分类

我们可以把字符串题大致分为以下几类：

---

### 1. ✅ **字符串基础操作类**

主要考察字符串遍历、拼接、反转、查找等基本操作。

#### 📌 常见操作：

* 遍历字符：`for(char c : s.toCharArray())`
* 拼接字符串：用 `StringBuilder`
* 截取子串：`s.substring(i, j)`
* 比较字符串：`equals()` 而不是 `==`

#### 🎯 典型题目：

* [344. 反转字符串](https://leetcode.cn/problems/reverse-string/)
* [541. 反转字符串 II](https://leetcode.cn/problems/reverse-string-ii/)
* [58. 最后一个单词的长度](https://leetcode.cn/problems/length-of-last-word/)

---

### 2. ✅ **双指针技巧类**

用两个指针在字符串上滑动、查找子串、压缩等。

#### 📌 常见问题：

* 找最长无重复子串
* 判断是否是回文
* 最小覆盖子串

#### 🎯 典型题目：

* [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)
* [5. 最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/)
* [76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)

---

### 3. ✅ **模拟类（字符串变换）**

根据题目描述“手搓”实现字符串变化过程。

#### 📌 常见场景：

* 加密解密（如 Zigzag）
* 自定义解析（如表达式、路径）
* 移除/插入字符、编辑操作

#### 🎯 典型题目：

* [6. Z 字形变换](https://leetcode.cn/problems/zigzag-conversion/)
* [151. 反转字符串中的单词](https://leetcode.cn/problems/reverse-words-in-a-string/)
* [394. 字符串解码](https://leetcode.cn/problems/decode-string/)

---

### 4. ✅ **哈希 / 频次数组类**

利用字符的频率、映射表等快速判断两个字符串之间的关系。

#### 📌 常见应用：

* 判断两个字符串是否是变位词（异位词）
* 字母统计、字符比较
* 滑动窗口配合哈希表

#### 🎯 典型题目：

* [242. 有效的字母异位词](https://leetcode.cn/problems/valid-anagram/)
* [49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/)
* [438. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)

---

### 5. ✅ **KMP / Rabin-Karp 等高级匹配算法**

用于高效查找子串，面试中常用于“字符串匹配引擎”的底层实现。

#### 🎯 典型题目：

* [28. 找出字符串中第一个匹配项的下标](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/)
* [686. 重复叠加字符串匹配](https://leetcode.cn/problems/repeated-string-match/)

> 初学者建议掌握 KMP 理解原理、但不强求记住背板。

---

### 6. ✅ **动态规划类**

通常出现在回文子串、编辑距离等需要“重复子问题”的场景。

#### 🎯 典型题目：

* [5. 最长回文子串（DP解法）](https://leetcode.cn/problems/longest-palindromic-substring/)
* [72. 编辑距离](https://leetcode.cn/problems/edit-distance/)
* [115. 不同的子序列](https://leetcode.cn/problems/distinct-subsequences/)

---

## 三、字符串常用操作总结（Java 示例）

| 操作     | 示例                            |
| ------ | ----------------------------- |
| 获取长度   | `s.length()`                  |
| 获取字符   | `s.charAt(i)`                 |
| 截取子串   | `s.substring(i, j)`           |
| 转为数组   | `char[] cs = s.toCharArray()` |
| 替换字符   | `s.replace("a", "b")`         |
| 去除前后空格 | `s.trim()`                    |
| 分割字符串  | `s.split(" ")`                |

---

## 四、字符串题常见技巧总结

| 技巧       | 用法            |
| -------- | ------------- |
| 双指针      | 左右移动处理子串、回文   |
| 滑动窗口     | 固定窗口 / 动态窗口统计 |
| 字符哈希表    | 判断是否匹配、记录频率   |
| 前缀和 / 差分 | 处理频率类题目       |
| 栈        | 处理嵌套字符串（如解码）  |

---

## 五、刷题推荐路线（基础 → 提升）

### ✅ 入门（操作类）：

* [344. 反转字符串](https://leetcode.cn/problems/reverse-string/)
* [58. 最后一个单词的长度](https://leetcode.cn/problems/length-of-last-word/)
* [14. 最长公共前缀](https://leetcode.cn/problems/longest-common-prefix/)

### ✅ 进阶（滑动/哈希）：

* [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)
* [242. 有效的字母异位词](https://leetcode.cn/problems/valid-anagram/)
* [438. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)

### ✅ 高阶（模拟 / 动态规划）：

* [5. 最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/)
* [394. 字符串解码](https://leetcode.cn/problems/decode-string/)
* [72. 编辑距离](https://leetcode.cn/problems/edit-distance/)

---

## 六、常见面试问题

| 问题            | 技巧      |
| ------------- | ------- |
| 判断回文字符串       | 双指针     |
| 判断两个字符串是否是变位词 | 频次数组或排序 |
| 字符串中第一个不重复的字符 | 哈希表     |
| 字符串压缩或解码      | 栈 / 模拟  |

---

## 七、小结

| 字符串考点 | 说明         |
| ----- | ---------- |
| 字符操作  | 字符遍历、拼接、截取 |
| 子串分析  | 子串枚举、匹配、滑窗 |
| 高频统计  | 哈希映射、频次数组  |
| 模拟执行  | 解码、编辑、压缩   |
| 回文分析  | 双指针、动态规划   |

---

如果你想，我可以：

* 给你推荐一套刷题计划（含每道题思路）
* 对某一道字符串题详细讲解 + 代码演示
* 讲某一类技巧（如回文、KMP、哈希）专项训练


* any list
{:toc}