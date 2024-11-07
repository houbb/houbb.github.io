---
layout: post
title:  【leetcode】49-303. range-sum-query-immutable  力扣 303. 区域和检索 - 数组不可变
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 题目

给定一个整数数组  nums，处理以下类型的多个查询:

计算索引 left 和 right （包含 left 和 right）之间的 nums 元素的 和 ，其中 left <= right

实现 NumArray 类：

NumArray(int[] nums) 使用数组 nums 初始化对象

int sumRange(int i, int j) 返回数组 nums 中索引 left 和 right 之间的元素的 总和 ，

包含 left 和 right 两点（也就是 nums[left] + nums[left + 1] + ... + nums[right] )
 

示例 1：


输入：

```
["NumArray", "sumRange", "sumRange", "sumRange"]
[[[-2, 0, 3, -5, 2, -1]], [0, 2], [2, 5], [0, 5]]
```

输出：

```
[null, 1, -1, -3]
```

解释：

```
NumArray numArray = new NumArray([-2, 0, 3, -5, 2, -1]);
numArray.sumRange(0, 2); // return 1 ((-2) + 0 + 3)
numArray.sumRange(2, 5); // return -1 (3 + (-5) + 2 + (-1)) 
numArray.sumRange(0, 5); // return -3 ((-2) + 0 + 3 + (-5) + 2 + (-1))
```

提示：

1 <= nums.length <= 10^4
-10^5 <= nums[i] <= 10^5
0 <= i <= j < nums.length
最多调用 10^4 次 sumRange 方法




# v1-基础的解法

## 思路

前缀和 提前构架好整个数组。


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

    public int sumRange(int left, int right) {
        return sum[right] - sum[left] + nums[left];
    }
    

}
```

## 效果

7ms 100%


## 小结

这一题非常简单，属于前缀和最基本的使用。

# 参考资料

https://leetcode.cn/problems/range-sum-query-immutable/?envType=problem-list-v2&envId=prefix-sum

* any list
{:toc}