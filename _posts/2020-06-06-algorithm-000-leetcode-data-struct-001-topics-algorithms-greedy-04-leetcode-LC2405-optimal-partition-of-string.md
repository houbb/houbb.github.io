---
layout: post
title: leetcode 算法篇专题之贪心 Greedy 之合并区间 02-LC2405. 子字符串的最优划分 optimal-partition-of-string
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, greedy, sf]
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

# 相关题目

本质：贪心+合并区间

[【leetcode】力扣 数组 array-02-56. 合并区间](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-topics-array-02-leetcode-LC56)

## 扫描线专题

[扫描线算法（Sweep Line Algorithm）](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-000-sweep-line-intro)

[力扣.218 天际线问题](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-218-sweep-line-skyline)

[力扣.252 会议室](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-252-sweep-line-meeting-room)

[力扣.253 会议室 II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-253-sweep-line-meeting-room-ii)

[力扣.1851 包含每个查询的最小区间](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-1851-sweep-line-minimum-interval-to-include-each-query)

[力扣.223 矩形面积](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-223-sweep-line-rectangle-area)

[力扣.3047 求交集区域的最大正方形面积](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-3047-sweep-line-find-the-largest-area-of-square-inside-two-rectangles)

[力扣.391 完美矩形](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-391-sweep-line-perfect-rectangle)

[力扣.836 矩形重叠](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-836-sweep-line-rectangle-overlap)

[力扣.850 矩形面积 II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-850-sweep-line-rectangle-area-ii)

# 2405. 子字符串的最优划分

给你一个字符串 s ，请你将该字符串划分成一个或多个 子字符串 ，并满足每个子字符串中的字符都是 唯一 的。

也就是说，在单个子字符串中，字母的出现次数都不超过 一次 。

满足题目要求的情况下，返回 最少 需要划分多少个子字符串。

注意，划分后，原字符串中的每个字符都应该恰好属于一个子字符串。
 

示例 1：

输入：s = "abacaba"
输出：4
解释：
两种可行的划分方法分别是 ("a","ba","cab","a") 和 ("ab","a","ca","ba") 。
可以证明最少需要划分 4 个子字符串。
示例 2：

输入：s = "ssssss"
输出：6
解释：
只存在一种可行的划分方法 ("s","s","s","s","s","s") 。
 

提示：

1 <= s.length <= 105
s 仅由小写英文字母组成

# v1-贪心

## 思路

通过 set 记录字符，如果已经存在，则清空。

## 实现

```java
public int partitionString(String s) {
        Set<Character> set = new HashSet<>();

        int count = 0;
        for(int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);

            if(set.contains(c)) {
                set.clear();
                count++;
            } 

            set.add(c);
        }

        // 需要多加一次
        if(!set.isEmpty()) {
            count++;
        }

        return count;
}
```

## 效果

51ms 击败 5.11%

# v2-array 改进

## 思路

用 array 替代 set

## 实现

```java
public int partitionString(String s) {
        int[] set = new int[26];

        int count = 1;
        for(int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);

            if(set[c-'a'] > 0) {
                // 清空
                Arrays.fill(set, 0);
                
                count++;
            }

            set[c-'a']++;
        }

        return count;
    }
```

## 效果

12ms 击败 54.01%



* any list
{:toc}