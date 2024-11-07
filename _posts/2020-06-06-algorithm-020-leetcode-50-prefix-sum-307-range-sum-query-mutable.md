---
layout: post
title:  【leetcode】50-307. range-sum-query-mutable  力扣 307. 区域和检索 - 数组可变
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 题目

给你一个数组 nums ，请你完成两类查询。

其中一类查询要求 更新 数组 nums 下标对应的值

另一类查询要求返回数组 nums 中索引 left 和索引 right 之间（ 包含 ）的nums元素的 和 ，其中 left <= right

实现 NumArray 类：

NumArray(int[] nums) 用整数数组 nums 初始化对象

void update(int index, int val) 将 nums[index] 的值 更新 为 val

int sumRange(int left, int right) 返回数组 nums 中索引 left 和索引 right 之间（ 包含 ）的nums元素的 和 （即，nums[left] + nums[left + 1], ..., nums[right]）
 

示例 1：

输入：

```
["NumArray", "sumRange", "update", "sumRange"]
[[[1, 3, 5]], [0, 2], [1, 2], [0, 2]]
```

输出：

```
[null, 9, null, 8]
```

解释：
NumArray numArray = new NumArray([1, 3, 5]);
numArray.sumRange(0, 2); // 返回 1 + 3 + 5 = 9
numArray.update(1, 2);   // nums = [1,2,5]
numArray.sumRange(0, 2); // 返回 1 + 2 + 5 = 8

提示：

1 <= nums.length <= 3 * 10^4

-100 <= nums[i] <= 100

0 <= index < nums.length

-100 <= val <= 100

0 <= left <= right < nums.length

调用 update 和 sumRange 方法次数不大于 3 * 10^4 

# v1-前缀和

## 思路

前缀和 提前构架好整个数组。

我们用类似于 303 的解法，唯一的区别就是更新的时候更新一下后续的数据。

## 实现

```java
package com.github.houbb.leetcode.F300T400;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class NumArray {

    private int[] sum;

    private int[] nums;

    public NumArray(int[] nums) {
        sum = new int[nums.length];

        // 初始化
        sum[0] = nums[0];
        for(int i = 1; i < nums.length; i++) {
            sum[i] = sum[i-1] + nums[i];
        }

        this.nums = nums;
    }

    public void update(int index, int val) {
        // 更新对应的数据？
        int oldNum = this.nums[index];
        if(oldNum == val) {
            return;
        }
        this.nums[index] = val;

        // 如果不一样
        int differ = val - oldNum;
        // 更新原始的数组
        for(int i = index; i < nums.length; i++) {
            this.sum[i] += differ;
        }
    }

    public int sumRange(int left, int right) {
        return sum[right] - sum[left] + nums[left];
    }

}
```

## 效果

超出时间限制 15 / 16 个通过的测试用例

## 小结

这道题开始以为非常简单。

结果发现好像不是那么回事。


# v1.1-蒙圈阶段

## 他山之石

看完超时直接蒙圈。

看了三叶的文章思路很好：

这是一道很经典的题目，通常还能拓展出一大类问题。

针对不同的题目，我们有不同的方案可以选择（假设我们有一个数组）：


数组不变，求区间和：「前缀和」、「树状数组」、「线段树」
多次修改某个数（单点），求区间和：「树状数组」、「线段树」
多次修改某个区间，输出最终结果：「差分」
多次修改某个区间，求区间和：「线段树」、「树状数组」（看修改区间范围大小）
多次将某个区间变成同一个数，求区间和：「线段树」、「树状数组」（看修改区间范围大小）
这样看来，「线段树」能解决的问题是最多的，那我们是不是无论什么情况都写「线段树」呢？

答案并不是，而且恰好相反，只有在我们遇到第 4 类问题，不得不写「线段树」的时候，我们才考虑线段树。

因为「线段树」代码很长，而且常数很大，实际表现不算很好。我们只有在不得不用的时候才考虑「线段树」。

总结一下，我们应该按这样的优先级进行考虑：

- 简单求区间和，用「前缀和」

- 多次将某个区间变成同一个数，用「线段树」

- 其他情况，用「树状数组」

# 树状数组

本题显然属于第 2 类问题：多次修改某个数，求区间和。

我们使用「树状数组」进行求解。

「树状数组」本身是一个很简单的数据结构，但是要搞懂其为什么可以这样「查询」&「更新」还是比较困难的（特别是为什么可以这样更新），往往需要从「二进制分解」进行出发理解。

因此我这里直接提供「树状数组」的代码，大家可以直接当做模板背过即可。







# 参考资料

https://leetcode.cn/problems/range-sum-query-mutable/

* any list
{:toc}