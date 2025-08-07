---
layout: post
title: leetcode 算法篇专题之栈 stack 02-20. 有效的括号 valid-parentheses
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, stack, top100 sf]
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

# 数据结构篇

https://leetcode.cn/studyplan/top-100-liked/

## 


# v1-stack

## 思路

因为 stack 先进后出的特性，很适合模拟这个。

## 实现

```java
public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        char[] chars = s.toCharArray();
        for(char c : chars) {
            // 入
            if('{' == c
                    || '(' == c
                    || '[' == c) {
                stack.push(c);
                continue;
            }
            // 出
            if(stack.isEmpty()) {
                return false;
            }
            char popChar = stack.pop();
            if('}' == c) {
                if('{' != popChar) {
                    return false;
                }
            }
            if(']' == c) {
                if('[' != popChar) {
                    return false;
                }
            }
            if(')' == c) {
                if('(' != popChar) {
                    return false;
                }
            }
        }

        // 出
        // 必须为空
        return stack.isEmpty();
}
```
## 效果

2ms 击败 97.76%

# v2-数组模拟

## 思路

这种数据结构，都可以通过 array 来模拟。

这样性能一般是最好的，而且这个长度固定。

## 解法

```java
public boolean isValid(String s) {
        char[] chars = s.toCharArray();
        char[] stack = new char[chars.length]; // 模拟栈
        int top = -1; // 栈顶指针

        for (char c : chars) {
            // 入栈
            if (c == '{' || c == '(' || c == '[') {
                stack[++top] = c;
                continue;
            }

            // 出栈前判断是否为空
            if (top == -1) {
                return false;
            }

            char popChar = stack[top--]; // 出栈

            // 匹配判断
            if (c == '}' && popChar != '{') return false;
            if (c == ']' && popChar != '[') return false;
            if (c == ')' && popChar != '(') return false;
        }

        // 最终必须栈为空
        return top == -1;
    }
```

## 效果

0ms 100%

* any list
{:toc}