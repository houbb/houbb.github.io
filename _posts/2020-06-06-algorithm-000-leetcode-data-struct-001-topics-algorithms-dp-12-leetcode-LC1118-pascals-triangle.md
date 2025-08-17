---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 11-LC118 杨辉三角 pascals-triangle 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
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

# LC118 杨辉三角 pascals-triangle 

给定一个非负整数 numRows，生成「杨辉三角」的前 numRows 行。

在「杨辉三角」中，每个数是它左上方和右上方的数的和。

![2](https://pic.leetcode-cn.com/1626927345-DZmfxB-PascalTriangleAnimated2.gif)
 
示例 1:

输入: numRows = 5
输出: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
示例 2:

输入: numRows = 1
输出: [[1]]
 

提示:

1 <= numRows <= 30

# v0-朴素思路

## 思路

numsRows 对应的有多少行数据。

我们从第一行开始构建。

这一题其实是 dp, 但是实际上我们按照的处理逻辑就可以解决。

1）处理好第一行、第二行。

2）每一行的第一个、最后一个元素都是1

3）剩下的元素，从 i=1 开始，都等于 `pre[i-1] + pre[i]`

4）每一行的元素个数和行数一样

## 实现

```java
    public List<List<Integer>> generate(int numRows) {
        List<List<Integer>> res = new ArrayList<>();

        List<Integer> one = Arrays.asList(1);
        List<Integer> two = Arrays.asList(1, 1);

        if(numRows <= 1) {
            return Arrays.asList(one);
        }
        if(numRows == 2) {
            return Arrays.asList(one, two);
        }

        res.add(one);    
        res.add(two);    

        // 处理
        for(int row = 3; row <= numRows; row++) {
            // 处理每一行
            List<Integer> list = new ArrayList<>(row);
            // 第一个数字是1
            list.add(1);
            List<Integer> preRow = res.get(row-2);
            // 每一列
            for(int i = 1; i < row-1; i++) {
                int temp = preRow.get(i-1) + preRow.get(i);
                list.add(temp);        
            }
            // 最后一个数字也是1
            list.add(1);

            res.add(list);
        }    

        return res;
    }   
```

## 效果

1ms 击败 97.55%


* any list
{:toc}