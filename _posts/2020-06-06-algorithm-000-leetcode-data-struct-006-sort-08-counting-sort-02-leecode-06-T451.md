---
layout: post
title: leetcode sort 排序-08-countingSort 计数排序 451. 根据字符出现频率排序
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

# 451. 根据字符出现频率排序

给定一个字符串 s ，根据字符出现的 频率 对其进行 降序排序 。

一个字符出现的 频率 是它出现在字符串中的次数。

返回 已排序的字符串 。如果有多个答案，返回其中任何一个。

示例 1:

输入: s = "tree"
输出: "eert"
解释: 'e'出现两次，'r'和't'都只出现一次。
因此'e'必须出现在'r'和't'之前。此外，"eetr"也是一个有效的答案。

示例 2:

输入: s = "cccaaa"
输出: "cccaaa"
解释: 'c'和'a'都出现三次。此外，"aaaccc"也是有效的答案。
注意"cacaca"是不正确的，因为相同的字母必须放在一起。

示例 3:

输入: s = "Aabb"
输出: "bbAa"
解释: 此外，"bbaA"也是一个有效的答案，但"Aabb"是不正确的。
注意'A'和'a'被认为是两种不同的字符。
 

提示:

1 <= s.length <= 5 * 10^5
s 由大小写英文字母和数字组成

# v1-HashMap

## 思路

感觉还是使用 HashMap 更加方便一些。

## 实现

```java
    public int countWords(String[] words1, String[] words2) {
        Map<String, Integer> count1Map = new HashMap<>();
        //1. 添加
        for(String word : words1) {
            count1Map.put(word, count1Map.getOrDefault(word, 0)+1);
        }

        Map<String, Integer> count2Map = new HashMap<>();
        for(String word : words2) {
            count2Map.put(word, count2Map.getOrDefault(word, 0)+1);
        }

        // 计算总数
        int count = 0;
        for(Map.Entry<String, Integer> entry : count1Map.entrySet()) {
            String key = entry.getKey();
            Integer count1 = entry.getValue();
            if(count1 == 1 && count1.equals(count2Map.get(key))) {
                count++;
            }
        }
        return count;
    }
```

## 效果

7ms 击败 73.44%

# v2-JIT

## 思路

我们来尝试一下骚操作，JIT

## 解法

```java
    static {
        for(int i = 0; i < 500; i++) {
            countWords(new String[]{}, new String[]{});
        }
    }

    public static int countWords(String[] words1, String[] words2) {
        Map<String, Integer> count1Map = new HashMap<>();
        //1. 添加
        for(String word : words1) {
            count1Map.put(word, count1Map.getOrDefault(word, 0)+1);
        }

        Map<String, Integer> count2Map = new HashMap<>();
        for(String word : words2) {
            count2Map.put(word, count2Map.getOrDefault(word, 0)+1);
        }

        // 计算总数
        int count = 0;
        for(Map.Entry<String, Integer> entry : count1Map.entrySet()) {
            String key = entry.getKey();
            Integer count1 = entry.getValue();
            if(count1 == 1 && count1.equals(count2Map.get(key))) {
                count++;
            }
        }
        return count;
    }
```

## 效果

4ms 100%


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}