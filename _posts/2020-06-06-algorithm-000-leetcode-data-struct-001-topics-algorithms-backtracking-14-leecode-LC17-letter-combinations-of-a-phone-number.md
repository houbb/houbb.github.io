---
layout: post
title: leetcode 算法篇专题之回溯 Backtracking 02-LC17 电话号码的字母组合 letter-combinations-of-a-phone-number
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

# 17 电话号码的字母组合 letter-combinations-of-a-phone-number

给定一个仅包含数字 2-9 的字符串，返回所有它能表示的字母组合。答案可以按 任意顺序 返回。

给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。

示例 1：

输入：digits = "23"
输出：["ad","ae","af","bd","be","bf","cd","ce","cf"]
示例 2：

输入：digits = ""
输出：[]
示例 3：

输入：digits = "2"
输出：["a","b","c"]
 

提示：

0 <= digits.length <= 4
digits[i] 是范围 ['2', '9'] 的一个数字。

# v1-回溯

## 思路

用回溯来实现组合。

## 核心流程

记录下映射关系

0)  n==0 返回空列表

1）数字的映射信息

```java
string[] mappings = {
    "abc",
    "def",
    "ghi",
    "jkl",
    "mno",
    "pqrs",
    "tuv",
    "wxyz",
};
```

数字和下标的关系： ix = num-2;   

2）digitIx 从位置0开始，`c = digits[digitIx];`

ix = c - '0'，找到映射的 mapping 字符串。

首先遍历 i 0开始遍历 mapping 字符串

a. path.append(mapping[i])

b. backtrack(res, path, digitIx +1)

c. 撤销 path

3) 终止条件

如果 digitIx 达到末尾，或者 path 长度满了，加入结果集合。

## 实现

```java
    String[] mappings = {
        "abc","def","ghi","jkl","mno","pqrs","tuv","wxyz"
    };

    public List<String> letterCombinations(String digits) {
        List<String> res = new ArrayList<>();
        if (digits == null || digits.isEmpty()) return res;

        StringBuilder path = new StringBuilder();
        backtrack(res, digits, path, 0);
        return res;
    }

    private void backtrack(List<String> res, String digits, StringBuilder path, int ix) {
        if (ix == digits.length()) { // 到达末尾
            res.add(path.toString());
            return;
        }

        int digit = digits.charAt(ix) - '0';      // 当前 digit
        String mapping = mappings[digit - 2];     // 映射

        // 循环当前的字符
        for (int i = 0; i < mapping.length(); i++) { // 注意从 0 开始
            path.append(mapping.charAt(i));

            // 回溯的时候，需要到下一个数字
            backtrack(res, digits, path, ix + 1);    // 递进到下一个 digit
            path.deleteCharAt(path.length() - 1);    // 回溯
        }
    }
```

## 效果

0ms 击败 100.00%

* any list
{:toc}