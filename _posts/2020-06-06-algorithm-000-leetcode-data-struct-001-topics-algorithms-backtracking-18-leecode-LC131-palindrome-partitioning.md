---
layout: post
title: leetcode 算法篇专题之回溯 Backtracking 02-LC131 分割回文串 palindrome-partitioning
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, backtracking, sf]
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

# LC131 分割回文串 palindrome-partitioning

给你一个字符串 s，请你将 s 分割成一些 子串，使每个子串都是 回文串 。

返回 s 所有可能的分割方案。

示例 1：

输入：s = "aab"
输出：[["a","a","b"],["aa","b"]]
示例 2：

输入：s = "a"
输出：[["a"]]
 

提示：

1 <= s.length <= 16
s 仅由小写英文字母组成

# v1-回溯

## 思路

先不考虑剪枝优化。

1) i 可能开始的位置从 0...n-1

从字符串起点开始，尝试所有可能的切分位置

对每个切分，判断当前子串是否是回文

如果是回文，就继续递归处理剩余子串

如果到达字符串末尾，把当前 path 加入结果

2) 维护回溯路径

用一个 `List<String> path` 存储当前分割方案

遇到末尾就把 path 拷贝到结果列表

3) 回文判断

每次切分子串前都判断是否是回文

可以用双指针 i、j 从两端向中间判断

或者提前用 DP 预处理回文状态，提高性能


## 实现

```java
    public List<List<String>> partition(String s) {
        List<List<String>> res = new ArrayList<>();
        List<String> path = new ArrayList<>();

        backtrack(s, res, path, 0);
        return res;
    }

    private void backtrack(String s, List<List<String>> res, List<String> path, int start) {
        // 达到结尾
        if(start == s.length()) {
            res.add(new ArrayList<>(path));
            return;
        }


        // 遍历处理
        for(int i = start; i < s.length(); i++) {
            // 只有在满足是回文，子节点才能继续处理
            if(isPalindrome(s, start, i)) {
                path.add(s.substring(start, i+1));

                backtrack(s, res, path, i+1);

                path.remove(path.size()-1);
            }
        }
    }

    private boolean isPalindrome(String text, int left, int right) {
        while(left < right) {
            if(text.charAt(left) != text.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }

        return true;
    }
```

## 效果

8ms 击败 94.65%


* any list
{:toc}