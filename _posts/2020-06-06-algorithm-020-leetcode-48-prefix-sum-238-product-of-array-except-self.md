---
layout: post
title:  【leetcode】48-product-of-array-except-self 力扣 238. 除自身以外的数组的乘积
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 题目

给你一个整数数组 nums，返回 数组 answer ，其中 answer[i] 等于 nums 中除 nums[i] 之外其余各元素的乘积 。

题目数据 保证 数组 nums之中任意元素的全部前缀元素和后缀的乘积都在  32 位 整数范围内。

请 不要使用除法，且在 O(n) 时间复杂度内完成此题。

示例 1:

输入: nums = [1,2,3,4]
输出: [24,12,8,6]
示例 2:

输入: nums = [-1,1,0,-3,3]
输出: [0,0,9,0,0]
 

提示：

2 <= nums.length <= 10^5

-30 <= nums[i] <= 30

保证 数组 nums之中任意元素的全部前缀元素和后缀的乘积都在  32 位 整数范围内
 
进阶：你可以在 O(1) 的额外空间复杂度内完成这个题目吗？（ 出于对空间复杂度分析的目的，输出数组 不被视为 额外空间。）

# v1-基础的解法

## 思路

最基本的就是直接计算出数组全部的积，然后直接除以自己。

不过要考虑一下 0 的场景。

但是这里不让用除法，也不是本题要考虑的点，直接 PASS

# V2-不让用除法怎么解决？

## 其他思路

除去自身，其实也可以换一个角度：

{0,...,i-1} * nums[i] * {i+1, ...., n}

也就是 i 位置的结果，就是前面的所有积乘以后面的所有积。

专业点就叫做前缀积*后缀积

```
原数组：       [1       2       3       4]
左部分的乘积：   1       1      1*2    1*2*3
右部分的乘积： 2*3*4    3*4      4      1
结果：        1*2*3*4  1*3*4   1*2*4  1*2*3*1
```

## 如何计算前缀积和后缀积？

我们采用和前缀和类似的思想。

前缀乘积： 我们首先遍历数组，从左到右，计算每个位置的前缀乘积。prefix[i] 表示 nums[0] * nums[1] * ... * nums[i-1]。

后缀乘积： 然后，我们从右到左，计算每个位置的后缀乘积，suffix[i] 表示 nums[i+1] * nums[i+2] * ... * nums[n-1]。

最后，结果 answer[i] 就是 prefix[i] * suffix[i]。

## 边界值考虑

最左、最右边的默认值为 1

## 代码实现

```java
class Solution {
    
     /**
     * 计算 i 前后的乘积
     *
     * 前缀乘积：prefix[i] 表示 nums[0] * nums[1] * ... * nums[i-1]
     * 后缀乘积：suffix[i] 表示 nums[i+1] * nums[i+2] * ... * nums[n-1]
     * @param nums
     * @return
     */
    public int[] productExceptSelf(int[] nums) {
        final int len = nums.length;
        int[] prefix = new int[len];
        int[] suffix = new int[len];

        //前缀积
        prefix[0] = 1; // 第一个元素前没有其他元素，前缀积为1
        for (int i = 1; i < len; i++) {
            prefix[i] = prefix[i - 1] * nums[i - 1]; // 前缀积：当前元素是前一个元素的乘积
        }

        // 后缀积
        suffix[len-1] = 1; // 最后一个元素后没有其他元素，后缀积为1
        for(int i = len-2; i >= 0; i--) {
            suffix[i] = suffix[i+1] * nums[i+1];
        }


        // 结果
        // 结果直接相乘即可
        int[] result = new int[len];
        for(int i = 0; i < len; i++) {
            result[i] = prefix[i] * suffix[i];
        }

        return result;
    }

}
```

## 小结

不让用除法，其实是一个很奇葩的设定。

不太具有现实意义。不过这里主要考察的是数学。

# V3-如何优化内存呢？

## 思路

题目要求优化一下内存。

那么应该如何优化内存呢？

其实我们没有必要创建出前后的乘积数组，一个变量存储一下就行。

直接通过 ans 结果数组，先存储前缀乘积的结果，然后直接乘以对应位置后缀乘积的结果。

## 结果

```java
class Solution {
    
        /**
     * 计算 i 前后的乘积
     *
     * 前缀乘积：prefix[i] 表示 nums[0] * nums[1] * ... * nums[i-1]
     * 后缀乘积：suffix[i] 表示 nums[i+1] * nums[i+2] * ... * nums[n-1]
     * @param nums
     * @return
     */
    public int[] productExceptSelf(int[] nums) {
        final int len = nums.length;
        int[] answer = new int[len];

        //前缀积
        // 计算前缀乘积并存储在answer数组中
        int prefix = 1;
        for (int i = 0; i < len; i++) {
            answer[i] = prefix;
            prefix *= nums[i];
        }

        // 后缀积
        int suffix = 1; // 最后一个元素后没有其他元素，后缀积为1
        for(int i = len-1; i >= 0; i--) {
            answer[i] = answer[i] * suffix;
            suffix *= nums[i];
        }

        return answer;
    }

}
```

## 效果

1ms 100%

# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/

* any list
{:toc}