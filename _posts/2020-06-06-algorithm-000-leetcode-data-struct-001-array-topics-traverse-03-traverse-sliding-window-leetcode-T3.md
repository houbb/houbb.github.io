---
layout: post
title: leetcode 数组专题之数组遍历-03-遍历滑动窗口 T3. 无重复字符的最长子串
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, array, traverse, sliding-window, prefix-sum, sf]
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


# 3. 无重复字符的最长子串

给定一个字符串 s ，请你找出其中不含有重复字符的 最长 子串 的长度。

示例 1:

输入: s = "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。

示例 2:

输入: s = "bbbbb"
输出: 1
解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。

示例 3:

输入: s = "pwwkew"
输出: 3
解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
     请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。
 

提示：

0 <= s.length <= 5 * 10^4
s 由英文字母、数字、符号和空格组成


# v1-暴力解法

## 思路

我们用最朴素的暴力先尝试解答。

核心思路：

1）用 set 判断元素是否存在重复。

2）包含重复时，则直接中断。不断更新 max 的最大长度。

## 解法

```java
    public static int lengthOfLongestSubstring(String s) {
        int max = 0;

        char[] chars = s.toCharArray();
        for(int i = 0; i < chars.length; i++) {
            // 判重
            Set<Character> set = new HashSet<>();
            for(int j = i; j < chars.length; j++) {
                char c = chars[j];
                if(set.contains(c)) {
                    break;
                }
                set.add(c);
            }

            // 更新
            max = Math.max(max, set.size());
        }
        return max;
    }
```

## 效果

96ms 击败 5.35%

# v2-滑动窗口

## 思路

我们可以用一个定长的 queue 来处理

这里唯一麻烦的点，就在于如果 char 重复，需要把重复的 char 以及之前的信息全部移除。

## 实现

```java
    public static int lengthOfLongestSubstring(String s) {
        int max = 0;

        char[] chars = s.toCharArray();
        Queue<Character> queue = new LinkedList<>();

        for(int i = 0; i < chars.length; i++) {
            char c = chars[i];

            // 是否满足条件
            if(!queue.contains(c)) {
                //add 入
                queue.add(c);
                continue;
            }

            // 已满
            max = Math.max(max, queue.size());

            // 包含这个字符，及前面的元素全部出队列
            while (!queue.isEmpty() && queue.peek() != c) {
                queue.poll();
            }
            queue.poll();

            // 加入新元素
            queue.add(c);
        }
        return max;
    }
```


## 效果


8ms 击败 20.13%



# 给出滑动窗口的经典题目，一简单，2中等，1困难

| 难度 | 题目编号 & 名称          | 链接                                                                                   | 类型          |
| -- | ------------------ | ------------------------------------------------------------------------------------ | ----------- |
| 简单 | 643. 子数组最大平均数 I    | [力扣链接](https://leetcode.cn/problems/maximum-average-subarray-i/)                     | 固定长度滑窗      |
| 中等 | 3. 无重复字符的最长子串      | [力扣链接](https://leetcode.cn/problems/longest-substring-without-repeating-characters/) | 动态窗口 + 去重   |
| 中等 | 438. 找到字符串中所有字母异位词 | [力扣链接](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)                  | 动态窗口 + 频率统计 |
| 困难 | 76. 最小覆盖子串         | [力扣链接](https://leetcode.cn/problems/minimum-window-substring/)                       | 动态窗口 + 最小长度 |

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


* any list
{:toc}