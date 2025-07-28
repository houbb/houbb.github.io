---
layout: post
title: leetcode sort 排序-08-countingSort 计数排序 389. 找不同
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, sort, sf]
published: true
---

# 排序系列

[sort-00-排序算法汇总](https://houbb.github.io/2016/07/14/sort-00-overview-sort)

[sort-01-bubble sort 冒泡排序算法详解](https://houbb.github.io/2016/07/14/sort-01-bubble-sort)

[sort-02-QuickSort 快速排序到底快在哪里？](https://houbb.github.io/2016/07/14/sort-02-quick-sort)

[sort-03-SelectSort 选择排序算法详解](https://houbb.github.io/2016/07/14/sort-03-select-sort)

[sort-04-heap sort 堆排序算法详解](https://houbb.github.io/2016/07/14/sort-04-heap-sort)

[sort-05-insert sort 插入排序算法详解](https://houbb.github.io/2016/07/14/sort-05-insert-sort)

[sort-06-shell sort 希尔排序算法详解](https://houbb.github.io/2016/07/14/sort-06-shell-sort)

[sort-07-merge sort 归并排序](https://houbb.github.io/2016/07/14/sort-07-merge-sort)

[sort-08-counting sort 计数排序](https://houbb.github.io/2016/07/14/sort-08-counting-sort)

[sort-09-bucket sort 桶排序](https://houbb.github.io/2016/07/14/sort-09-bucket-sort)

[sort-10-bigfile 大文件外部排序](https://houbb.github.io/2016/07/14/sort-10-bigfile-sort)

# 前言

大家好，我是老马。

以前从工程的角度，已经梳理过一次排序算法。

这里从力扣算法的角度，重新梳理一遍。

核心内容包含：

1）常见排序算法介绍

2）背后的核心思想

3）leetcode 经典题目练习+讲解

4）应用场景、优缺点等对比总结

5）工程 sdk 包，这个已经完成。

6) 可视化

# 389. 找不同

给定两个字符串 s 和 t ，它们只包含小写字母。

字符串 t 由字符串 s 随机重排，然后在随机位置添加一个字母。

请找出在 t 中被添加的字母。

示例 1：

输入：s = "abcd", t = "abcde"
输出："e"
解释：'e' 是那个被添加的字母。

示例 2：

输入：s = "", t = "y"
输出："y"
 

提示：

0 <= s.length <= 1000
t.length == s.length + 1
s 和 t 只包含小写字母

# v1-计数排序

## 思路

类似的，我们用 26 的数组保存个数。

找到有差异的即可。

## 解法

```java
public char findTheDifference(String s, String t) {
        int[] counts = new int[26];

        for(int i = 0; i < t.length(); i++) {
            counts[t.charAt(i)-'a']++;
        }

        for(int i = 0; i < s.length(); i++) {
            counts[s.charAt(i)-'a']--;
        }

        // 找到不为0的
        for(int i = 0; i < 26; i++) {
            if(counts[i] > 0) {
                return (char)('a' + i);
            }
        }
        return 'a';
    }
```

## 效果

2ms 击败 70.58%


# v2-优化思路

## 思路

当然可以用位运算来优化，这个我一直记不住。

## JIT

```java
static {
        for(int i = 0; i < 500; i++) {
            findTheDifference("", "");
        }
    }
    public static char findTheDifference(String s, String t) {
        int[] counts = new int[26];

        for(int i = 0; i < t.length(); i++) {
            counts[t.charAt(i)-'a']++;
        }

        for(int i = 0; i < s.length(); i++) {
            counts[s.charAt(i)-'a']--;
        }

        // 找到不为0的
        for(int i = 0; i < 26; i++) {
            if(counts[i] > 0) {
                return (char)('a' + i);
            }
        }
        return 'a';
    }
```

## 效果

100%

诚然，这个方法实际上是不如位运算的

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}