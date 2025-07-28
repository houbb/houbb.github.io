---
layout: post
title: leetcode sort 排序-08-countingSort 计数排序 299. 猜数字游戏
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

# 299. 猜数字游戏

你在和朋友一起玩 猜数字（Bulls and Cows）游戏，该游戏规则如下：

写出一个秘密数字，并请朋友猜这个数字是多少。

朋友每猜测一次，你就会给他一个包含下述信息的提示：

猜测数字中有多少位属于数字和确切位置都猜对了（称为 "Bulls"，公牛），
有多少位属于数字猜对了但是位置不对（称为 "Cows"，奶牛）。

也就是说，这次猜测中有多少位非公牛数字可以通过重新排列转换成公牛数字。

给你一个秘密数字 secret 和朋友猜测的数字 guess ，请你返回对朋友这次猜测的提示。

提示的格式为 "xAyB" ，x 是公牛个数， y 是奶牛个数，A 表示公牛，B 表示奶牛。

请注意秘密数字和朋友猜测的数字都可能含有重复数字。

示例 1：

输入：secret = "1807", guess = "7810"
输出："1A3B"

解释：数字和位置都对（公牛）用 '|' 连接，数字猜对位置不对（奶牛）的采用斜体加粗标识。

```
"1807"
  |
"7810"
```

示例 2：

输入：secret = "1123", guess = "0111"
输出："1A1B"
解释：数字和位置都对（公牛）用 '|' 连接，数字猜对位置不对（奶牛）的采用斜体加粗标识。

```
"1123"        "1123"
  |      or     |
"0111"        "0111"
```

注意，两个不匹配的 1 中，只有一个会算作奶牛（数字猜对位置不对）。

通过重新排列非公牛数字，其中仅有一个 1 可以成为公牛数字。

提示：

1 <= secret.length, guess.length <= 1000
secret.length == guess.length
secret 和 guess 仅由数字组成

# v1-计数排序

## 思路

这个本质其实就是对应的字符，计数相同就行。

唯一用到的技巧就是 c-'a' 对应下标。

这个其实 cow 的计算有很大迷惑性。

1）位置+数字都对，记录为 bull++

2) 否则，同时记录 guessCount[i]++ secrectCount[i]++

然后 cow=min(guessCount[i], secrectCount[i])

## 实现

```java
    public String getHint(String secret, String guess) {
        int len = secret.length();

        int bullCount = 0;

        // 数字的统计
        int[] secretCount = new int[10];
        int[] guessCount = new int[10];

        for(int i = 0; i < len; i++) {
            if(secret.charAt(i) == guess.charAt(i)) {
                bullCount++;
            } else {
                secretCount[secret.charAt(i)-'0']++;
                guessCount[guess.charAt(i)-'0']++;
            }
        }

        // 数字对，但是位置不对？
        int cows = 0;
        for (int i = 0; i < 10; i++) {
            cows += Math.min(secretCount[i], guessCount[i]);
        }

        return bullCount+"A"+cows+"B";
    }
```

## 效果

5ms 击败 81.3%

嗯？竟然不是第一解法。

还有高手？

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}