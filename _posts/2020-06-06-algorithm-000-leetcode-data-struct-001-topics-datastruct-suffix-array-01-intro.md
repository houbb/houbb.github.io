---
layout: post
title: leetcode 进阶数据结构篇专题之后缀数组 suffix-array 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, suffix-array, sf]
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

# 数据结构篇

## 通用基础

链表 

树

哈希表

stack 栈

queue 队列

ordered set 有序集合

heap  堆

graph 图


## 进阶

并查集

字典树

线段树

树状数组

后缀数组

# chat

https://leetcode.cn/studyplan/top-100-liked/

## 详细介绍一下力扣数据结构之后缀数组


好的！下面给你详细介绍一下**后缀数组（Suffix Array）**，这是字符串算法中非常重要且高级的一个数据结构，常用于解决**字符串匹配、重复子串、最长公共前缀**等问题。

---

## 一、什么是后缀数组？

后缀数组是一个关于字符串后缀的排序数组。

给定字符串 `S`，它的所有后缀是：
`S[0..n-1], S[1..n-1], S[2..n-1], ... S[n-1..n-1]`

后缀数组 `SA` 是将这些后缀**按字典序排序后**，对应后缀起始下标的数组。

### 例如：

字符串 `S = "banana"`

后缀列表（起始下标 + 后缀）：

```
0: banana
1: anana
2: nana
3: ana
4: na
5: a
```

按字典序排序后：

```
5: a
3: ana
1: anana
0: banana
4: na
2: nana
```

对应的后缀数组：`SA = [5, 3, 1, 0, 4, 2]`

---

## 二、后缀数组的作用

后缀数组可以用于快速解决以下问题：

* 判断一个字符串是否为另一个字符串的子串（字符串匹配）
* 求最长重复子串（LRS）
* 求两个字符串的最长公共子串（LCS）
* 计算字符串的不同子串数量
* 结合最长公共前缀数组（LCP）解决更多复杂问题

---

## 三、后缀数组的构建方法

后缀数组构造是一个难点，常用的方法有：

### 1. 暴力排序（适合小数据）

直接将所有后缀放入数组，排序，时间复杂度 O(n² log n)。

### 2. 基于倍增算法（O(n log² n)）

* 用排名数组维护后缀排序的中间结果
* 每次按长度 `k` 倍增排序
* 实现复杂但较常用

### 3. DC3算法（线性时间构建，复杂）

多用于竞赛和研究，较复杂。

---

## 四、后缀数组构建示例（倍增算法Java简版）

```java
int[] buildSuffixArray(String s) {
    int n = s.length();
    int[] sa = new int[n];
    int[] ranks = new int[n];
    int[] tmp = new int[n];
    for (int i = 0; i < n; i++) {
        sa[i] = i;
        ranks[i] = s.charAt(i);
    }
    for (int k = 1; k < n; k <<= 1) {
        final int K = k;
        Arrays.sort(sa, (a, b) -> {
            if (ranks[a] != ranks[b]) return ranks[a] - ranks[b];
            int ra = a + K < n ? ranks[a + K] : -1;
            int rb = b + K < n ? ranks[b + K] : -1;
            return ra - rb;
        });
        tmp[sa[0]] = 0;
        for (int i = 1; i < n; i++) {
            tmp[sa[i]] = tmp[sa[i - 1]] + ((ranks[sa[i]] != ranks[sa[i - 1]] || 
                          ((sa[i] + K < n ? ranks[sa[i] + K] : -1) != (sa[i-1] + K < n ? ranks[sa[i-1] + K] : -1))) ? 1 : 0);
        }
        System.arraycopy(tmp, 0, ranks, 0, n);
        if (ranks[sa[n - 1]] == n - 1) break;
    }
    return sa;
}
```

---

## 五、最长公共前缀数组（LCP）

LCP 数组 `lcp[i]` 表示后缀数组中 `sa[i]` 和 `sa[i-1]` 这两个后缀的最长公共前缀长度。

LCP 能帮助快速解决最长重复子串和字符串匹配问题。

---

## 六、后缀数组的典型应用题（LeetCode）

| 题目                                                                                                            | 说明                   |
| ------------------------------------------------------------------------------------------------------------- | -------------------- |
| [214. 最短回文串](https://leetcode.cn/problems/shortest-palindrome/)                                               | 利用后缀数组和 LCP 找最短回文    |
| [1044. 最长重复子串](https://leetcode.cn/problems/longest-duplicate-substring/)                                     | 利用后缀数组 + LCP 找最长重复子串 |
| [828. 统计唯一子字符串的个数](https://leetcode.cn/problems/count-unique-characters-of-all-substrings-of-a-given-string/) | 与后缀数组相关的高级题          |

---

## 七、后缀数组优缺点

| 优点             | 缺点            |
| -------------- | ------------- |
| 可快速解决大量字符串匹配问题 | 构造实现复杂，代码量大   |
| 构造好后查询快        | 对初学者理解难度大     |
| 比后缀树结构简单，空间更节省 | 常见问题有限，需配合LCP |

---

## 八、总结

| 关键点 | 说明                       |
| --- | ------------------------ |
| 定义  | 后缀数组是所有后缀的字典序排序数组        |
| 构造  | 倍增算法和 DC3 是主流构造方法        |
| 作用  | 主要用于字符串匹配、最长重复子串、最长公共子串等 |
| LCP | 结合后缀数组使用，增强功能            |


* any list
{:toc}