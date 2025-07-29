---
layout: post
title: leetcode sort 排序-08-countingSort 计数排序 383. 赎金信
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

# 383. 赎金信

给你两个字符串：ransomNote 和 magazine ，判断 ransomNote 能不能由 magazine 里面的字符构成。

如果可以，返回 true ；否则返回 false 。

magazine 中的每个字符只能在 ransomNote 中使用一次。

 

示例 1：

输入：ransomNote = "a", magazine = "b"
输出：false
示例 2：

输入：ransomNote = "aa", magazine = "ab"
输出：false
示例 3：

输入：ransomNote = "aa", magazine = "aab"
输出：true
 

提示：

1 <= ransomNote.length, magazine.length <= 10^5
ransomNote 和 magazine 由小写英文字母组成

# v1-计数排序

## 思路

类似的，我们用 26 的数组保存个数。

因为每个数字都只能用一次，所以需要 magazine 的数字比较多一些。

我们甚至可以直接在 T389 的基础上修改。

## 解法

```java
    public boolean canConstruct(String ransomNote, String magazine) {
        int[] counts = new int[26];

        for(int i = 0; i < magazine.length(); i++) {
            counts[magazine.charAt(i)-'a']++;
        }

        for(int i = 0; i < ransomNote.length(); i++) {
            counts[ransomNote.charAt(i)-'a']--;
        }

        for(int i = 0; i < 26; i++) {
            if(counts[i] < 0) {
                return false;
            }
        }
        return true;
    }
```

## 效果

1ms 击败 99.78%

# v2-优化思路

## 思路

看了下 TOP1 用 indexOf 来替代计数。

只能说测试用例不够严谨，如果字符串足够长，性能肯定差。

这个 JIT 没效果。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}