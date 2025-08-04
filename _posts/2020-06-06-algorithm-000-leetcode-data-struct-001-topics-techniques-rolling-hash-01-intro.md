---
layout: post
title: leetcode 技巧篇专题之滚动哈希 rolling-hash 01 入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, rolling-hash, sf]
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



# 技巧篇

双指针

滑动窗口

位运算--状态压缩

扫描线

前缀和

哈希哈数--滚动哈希

计数

# chat

## 详细介绍一下力扣技巧之滚动哈希

滚动哈希（Rolling Hash）是一种**优化字符串匹配类问题**的经典技巧，尤其常用于「子串哈希」和「滑动窗口判断重复子串」等场景。

力扣（LeetCode）上多个高频题目都可借助滚动哈希显著提升效率，替代暴力比较字符串的方式。

## 一、什么是滚动哈希？

滚动哈希是一种**可以快速更新子串哈希值**的哈希函数，主要用于处理滑动窗口下的字符串问题。

设你有字符串 `s`，你想快速比较其中长度为 `k` 的多个子串是否相等（或者是否重复出现），如果每次都 `substring` 然后 `equals`，时间是 `O(k)`，而使用滚动哈希可以做到 **O(1)** 时间更新窗口内的哈希值。

## 二、原理

滚动哈希最常用的是 **Rabin-Karp 算法** 的变种。

### 1. 哈希函数构造（以26进制为例）：

字符串 `s = "abcd"`，我们可以将其视为一个数字：

```
hash("abcd") = a * 26^3 + b * 26^2 + c * 26^1 + d * 26^0
```

### 2. 滚动更新公式（窗口右移）：

假设我们已知 `s[i...i+k-1]` 的哈希值为 `hash1`，想快速得到 `s[i+1...i+k]` 的哈希值 `hash2`，只需：

```
hash2 = (hash1 - s[i] * base^(k-1)) * base + s[i+k]
```

为了防止溢出，一般会取模操作：

```
hash = ((hash - s[i] * base^(k-1) % mod + mod) * base + s[i+k]) % mod
```

* `base`：通常选取 26、31、131、1313 等素数。
* `mod`：一个大的质数，例如 `1e9+7`，避免哈希冲突和溢出。

---

## 三、应用场景（LeetCode 中常见）

### ✅ 1. 判断重复的子字符串（力扣 T187）

**题目**：[Repeated DNA Sequences](https://leetcode.com/problems/repeated-dna-sequences/)

输入一个字符串，找出所有长度为 10 的重复子串。

* 暴力：O(n \* 10)
* 滚动哈希：O(n)

```java
public List<String> findRepeatedDnaSequences(String s) {
    int L = 10, n = s.length();
    if (n <= L) return new ArrayList<>();

    int a = 4; // ACGT 映射为 4 进制
    int aL = (int)Math.pow(a, L);
    Map<Character, Integer> map = Map.of('A', 0, 'C', 1, 'G', 2, 'T', 3);

    int h = 0;
    Set<Integer> seen = new HashSet<>();
    Set<String> output = new HashSet<>();
    for (int i = 0; i < n; ++i) {
        h = h * a + map.get(s.charAt(i));
        if (i >= L - 1) {
            if (i >= L) {
                h -= map.get(s.charAt(i - L)) * aL;
            }
            if (!seen.add(h)) {
                output.add(s.substring(i - L + 1, i + 1));
            }
        }
    }
    return new ArrayList<>(output);
}
```

---

### ✅ 2. 最长重复子串（力扣 T1044）

**题目**：[Longest Duplicate Substring](https://leetcode.com/problems/longest-duplicate-substring/)

解法：**二分 + 滚动哈希**
思路：

1. 二分重复子串的长度 `L`
2. 对每一个长度 `L`，用滚动哈希判断是否有重复子串（哈希值是否重复）

```java
public String longestDupSubstring(String s) {
    int n = s.length();
    int a = 26;
    long mod = (long)1e11 + 7;

    int left = 1, right = n;
    int start = -1;

    while (left < right) {
        int L = left + (right - left) / 2;
        int idx = check(s, L, a, mod);
        if (idx != -1) {
            left = L + 1;
            start = idx;
        } else {
            right = L;
        }
    }
    return start == -1 ? "" : s.substring(start, start + left - 1);
}

private int check(String s, int L, int a, long mod) {
    long h = 0;
    for (int i = 0; i < L; ++i) {
        h = (h * a + s.charAt(i) - 'a') % mod;
    }
    Set<Long> seen = new HashSet<>();
    seen.add(h);

    long aL = 1;
    for (int i = 1; i <= L; ++i) aL = (aL * a) % mod;

    for (int i = 1; i < s.length() - L + 1; ++i) {
        h = (h * a - (s.charAt(i - 1) - 'a') * aL % mod + mod) % mod;
        h = (h + s.charAt(i + L - 1) - 'a') % mod;
        if (!seen.add(h)) return i;
    }
    return -1;
}
```

---

## 四、总结

| 优点               | 说明                 |
| ---------------- | ------------------ |
| 快速判断子串是否相等       | 通过哈希值比对，无需字符逐一比较   |
| 适合滑动窗口类问题        | 每次窗口滑动时，哈希值更新 O(1) |
| 可结合二分、set、map 使用 | 检查重复性、最值等          |

## 五、注意事项

* **哈希冲突问题**：不同字符串可能产生相同哈希值。可使用**双哈希**（两个不同的 base 和 mod）来降低冲突概率。
* **取模细节要处理好**，尤其是负数 + mod。
* Java 中可能需使用 `long`，否则容易溢出。




* any list
{:toc}