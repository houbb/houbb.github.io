---
layout: post
title: leetcode 基础篇专题之字符串匹配 string-matching 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, string-matching, sf]
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

## 详细介绍一下力扣基础之字符串匹配


好的！我们来系统讲解 LeetCode（力扣）中的一个重要基础技巧：**字符串匹配（String Matching）**。这个技巧在很多面试题、底层算法（比如搜索、编译器、数据库查询）中都非常关键。

---

## 🧩 一、什么是字符串匹配？

字符串匹配问题是指：

> 在一个字符串（称为“文本串”`text`）中，**查找是否存在某个“模式串”`pattern`**，如果存在，返回其位置或是否存在。

举例：

* `text = "abcdefg"`，`pattern = "cde"`，返回 `2`
* `text = "abcabc"`，`pattern = "cab"`，返回 `false`

---

## 🧠 二、常见字符串匹配相关问题（力扣题型）

### 1. ✅ **匹配一个子串**

> 判断 `pattern` 是否是 `text` 的子串，并返回起始下标。

📌 典型题：

* [28. 找出字符串中第一个匹配项的下标](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/)
* [686. 重复叠加字符串匹配](https://leetcode.cn/problems/repeated-string-match/)

---

### 2. ✅ **通配符 / 正则匹配**

> `?` 表示任意单字符，`*` 表示任意多个字符

📌 典型题：

* [44. 通配符匹配](https://leetcode.cn/problems/wildcard-matching/)
* [10. 正则表达式匹配（含 `.` 和 `*`）](https://leetcode.cn/problems/regular-expression-matching/)

---

### 3. ✅ **多个字符串匹配**

> 查找一组字符串中哪些是 `text` 的子串

📌 典型题：

* [140. 单词拆分 II](https://leetcode.cn/problems/word-break-ii/)
* [472. 连接词](https://leetcode.cn/problems/concatenated-words/)

---

## 🛠 三、常见字符串匹配算法

### ✅ 1. 暴力匹配法（Brute Force）

思路：枚举每一个起点 `i`，从 `i` 开始判断是否与 `pattern` 完全匹配。

```java
public int strStr(String haystack, String needle) {
    int m = haystack.length(), n = needle.length();
    for (int i = 0; i <= m - n; i++) {
        if (haystack.substring(i, i + n).equals(needle)) {
            return i;
        }
    }
    return -1;
}
```

* 时间复杂度：`O(m * n)`，效率低，但思路简单。
* 适用于短文本匹配。

---

### ✅ 2. KMP 算法（Knuth–Morris–Pratt）

* 用一个“部分匹配表”（`next` 数组）加速匹配过程，避免重复比较。
* 时间复杂度：**O(m + n)**，`m` 为主串长度，`n` 为模式串长度。

📌 核心思想：

* 匹配失败时，**不回退主串指针**，而是跳转模式串到前缀位置。

```java
// 生成 KMP 的 next 数组（部分匹配表）
int[] buildNext(String pattern) {
    int[] next = new int[pattern.length()];
    int j = 0;
    for (int i = 1; i < pattern.length(); i++) {
        while (j > 0 && pattern.charAt(i) != pattern.charAt(j)) {
            j = next[j - 1];
        }
        if (pattern.charAt(i) == pattern.charAt(j)) j++;
        next[i] = j;
    }
    return next;
}
```

📌 推荐题：

* [28. 找出字符串中第一个匹配项的下标](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/)（KMP 应用）
* [459. 重复的子字符串](https://leetcode.cn/problems/repeated-substring-pattern/)（KMP 的 next 数组特性）

---

### ✅ 3. Rabin-Karp 算法（滚动哈希）

* 使用 **哈希值** 判断子串是否匹配，避免每次都逐字符比较。
* 时间复杂度接近 O(n)，但可能会有哈希冲突。

📌 原理：

* 计算模式串的哈希值
* 滑动窗口移动，每次计算窗口哈希值并比较

> LeetCode 上并不常直接考 Rabin-Karp，但用于优化“查找重复子串”等问题非常强。

📌 例题：

* [187. 重复的DNA序列](https://leetcode.cn/problems/repeated-dna-sequences/)
* [1044. 最长重复子串（hard）](https://leetcode.cn/problems/longest-duplicate-substring/)

---

### ✅ 4. 字典树 + Aho-Corasick（多模式匹配）

* 用于多个单词同时匹配主串，构建 Trie 树 + 失配指针。
* 类似 KMP 多词版本。

📌 例题：

* [139. 单词拆分](https://leetcode.cn/problems/word-break/)
* [1023. 驼峰式匹配](https://leetcode.cn/problems/camelcase-matching/)
* [1032. 字符流](https://leetcode.cn/problems/stream-of-characters/)

---

## 🔍 四、字符串匹配的应用技巧

| 技巧   | 说明                       |
| ---- | ------------------------ |
| 滑动窗口 | 处理子串固定长度的匹配，如 Rabin-Karp |
| 前缀表  | KMP 的关键，用于失配时快速跳转        |
| 哈希   | 快速比较字符串内容是否相同            |
| Trie | 处理多个单词一起匹配主串             |
| 动态规划 | 处理通配符 / 正则表达式匹配          |

---

## 📌 五、面试高频题精选

| 题号  | 题目           | 技巧           |
| --- | ------------ | ------------ |
| 28  | 找出字符串中第一个匹配项 | 暴力 / KMP     |
| 10  | 正则表达式匹配      | DP           |
| 44  | 通配符匹配        | DP           |
| 187 | 重复的 DNA 序列   | 滚动哈希         |
| 139 | 单词拆分         | DP + HashSet |
| 686 | 重复叠加字符串匹配    | 枚举 + KMP     |

---

## 🚀 六、刷题顺序推荐

### ✅ 入门

* [28. 找出字符串中第一个匹配项的下标](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/)
* [14. 最长公共前缀](https://leetcode.cn/problems/longest-common-prefix/)
* [242. 有效的字母异位词](https://leetcode.cn/problems/valid-anagram/)

### ✅ 进阶匹配

* [686. 重复叠加字符串匹配](https://leetcode.cn/problems/repeated-string-match/)
* [459. 重复的子字符串](https://leetcode.cn/problems/repeated-substring-pattern/)
* [187. 重复的 DNA 序列](https://leetcode.cn/problems/repeated-dna-sequences/)

### ✅ 高阶技巧

* [44. 通配符匹配](https://leetcode.cn/problems/wildcard-matching/)
* [10. 正则表达式匹配](https://leetcode.cn/problems/regular-expression-matching/)
* [1032. 字符流](https://leetcode.cn/problems/stream-of-characters/)

---

## ✅ 七、总结回顾

| 匹配方式                | 适用情况    | 是否推荐      |
| ------------------- | ------- | --------- |
| 暴力法                 | 简单题，短串  | ✅ 入门好理解   |
| KMP                 | 单模式高效匹配 | ✅ 高效实用    |
| Rabin-Karp          | 查找重复子串等 | ⚠️ 注意哈希冲突 |
| Trie / Aho-Corasick | 多词匹配    | ✅ 复杂题利器   |
| 动态规划                | 通配符匹配问题 | ✅ 经典考点    |

---

如果你想，我可以帮你：

* 手把手讲解 KMP（含动画/代码）
* 针对某一道匹配题写出详细分析 + 注释代码
* 制定匹配类题目的专项刷题计划



* any list
{:toc}