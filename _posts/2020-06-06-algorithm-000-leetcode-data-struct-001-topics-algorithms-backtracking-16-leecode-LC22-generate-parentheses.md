---
layout: post
title: leetcode 算法篇专题之回溯 Backtracking 02-LC22 22. 括号生成 generate-parentheses
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

# 22. 括号生成 generate-parentheses

数字 n 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且 有效的 括号组合。

示例 1：

输入：n = 3
输出：["((()))","(()())","(())()","()(())","()()()"]
示例 2：

输入：n = 1
输出：["()"]
 
提示：

1 <= n <= 8

# v1-回溯

## 思路

我们可以用回溯的方式来解决。

最笨的方法是我们不做任何的剪枝。

然后每次取所有的 `()` 的可能性，在满的时候，判断是否合法。



## 实现

```java
    public List<String> generateParenthesis(int n) {
        char[] chars = new char[]{'(', ')'};
        List<String> res = new ArrayList<>();
        StringBuilder path = new StringBuilder();
        backtrack(chars, res, path, n * 2);
        return res;
    }

    private void backtrack(char[] chars, List<String> res, StringBuilder path, int targetLen) {
        if (path.length() == targetLen) {
            if (isValid(path)) res.add(path.toString());
            return;
        }

        for (char c : chars) {
            path.append(c);
            backtrack(chars, res, path, targetLen);
            path.deleteCharAt(path.length() - 1);
        }
    }

    private boolean isValid(StringBuilder path) {
        int balance = 0;
        for (int i = 0; i < path.length(); i++) {
            char c = path.charAt(i);
            if (c == '(') balance++;
            else {
                balance--;
                if (balance < 0) return false; // 右括号多于左括号，非法
            }
        }
        return balance == 0;
    }
```


## 效果

6ms 击败 6.67%

## 反思

当然，实际上我们有时候不需要一直取多余的 `(` 或者 `)`

如果我们知道已经取了多少个了，就可以知道是否需要。从而提升效率。

# v2-回溯-剪枝

## 思路

我们用两个变量：

```java
leftRemain      // ( 剩余
rightRemain     // ) 剩余
```

这样如果 remain 中任何一个不足的时候，就可以直接剪枝跳过了。

## java

```java
    public List<String> generateParenthesis(int n) {
        char[] chars = new char[]{'(', ')'};
        List<String> res = new ArrayList<>();
        StringBuilder path = new StringBuilder();

        backtrack(chars, res, path, n, n);
        return res;
    }

    private void backtrack(char[] chars, List<String> res, StringBuilder path, int leftRemain, int rightRemain) {
        if (leftRemain == 0 && rightRemain == 0) {
            if (isValid(path)) {
                res.add(path.toString());
            } 

            return;
        }

        for (char c : chars) {
            if(leftRemain == 0 && c == '(') {
                continue;
            }
            if(rightRemain == 0 && c == ')') {
                continue;
            }

            path.append(c);

            if(c == '(') {
                leftRemain--;
            }
            if(c == ')') {
                rightRemain--;
            }
            backtrack(chars, res, path, leftRemain, rightRemain);

            // 撤销
            if(c == '(') {
                leftRemain++;
            }
            if(c == ')') {
                rightRemain++;
            }
            path.deleteCharAt(path.length() - 1);
        }
    }

    private boolean isValid(StringBuilder path) {
        int balance = 0;
        for (int i = 0; i < path.length(); i++) {
            char c = path.charAt(i);
            if (c == '(') balance++;
            else {
                balance--;
                if (balance < 0) return false; // 右括号多于左括号，非法
            }
        }
        return balance == 0;
    }
```

## 效果

3ms 击败 10.18%


## 反思

略有进步

我们还能更快吗？

# v3-回溯剪枝改良

## 思路

其实我们可以进一步优化剪枝策略。

1）路径表示

回溯中的 path 就是一条括号序列

每次决策：加 '(' 还是 ')'

2）状态记录

左括号数 open

右括号数 close

核心：只有知道已经用了多少括号，才能判断下一步是否合法

3）剪枝规则

open < n → 可以加 '('
close < open → 可以加 ')'

每一步选择都受约束 → 递归树里不会出现非法组合

4）终止条件

`path.length() == 2*n` → 组合完成

## 实现


```java
public List<String> generateParenthesis(int n) {
        List<String> res = new ArrayList<>();
        StringBuilder path = new StringBuilder();
        backtrack(res, path, 0, 0, n);
        return res;
    }

    private void backtrack(List<String> res, StringBuilder path, int open, int close, int n) {
        if ((open + close) == 2*n) {
            res.add(path.toString());
            return;
        }

        // ( 还能加，那就加
        if(open < n) {
            path.append('(');
            backtrack(res, path, open+1, close, n);
            path.deleteCharAt(path.length()-1);
        }

        // close < open
        if(close < open) {
            path.append(')');
            backtrack(res, path, open, close+1, n);
            path.deleteCharAt(path.length()-1);
        }
    }
```


## 效果

0ms 100%

* any list
{:toc}