---
layout: post
title: leetcode 43 152. Maximum Product Subarray 动态规划 
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, dp, sh]
published: true
---

# 152. Maximum Product Subarray

Given an integer array nums, find a subarray that has the largest product, and return the product.

The test cases are generated so that the answer will fit in a 32-bit integer.

## EX 

Example 1:

```
Input: nums = [2,3,-2,4]
Output: 6
Explanation: [2,3] has the largest product 6.
```

Example 2:

```
Input: nums = [-2,0,-1]
Output: 0
Explanation: The result cannot be 2, because [-2,-1] is not a subarray.
```

## Constraints:

1 <= nums.length <= 2 * 10^4

-10 <= nums[i] <= 10

The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.

# V1-暴力算法


## 思路

遍历所有的子队列，每次计算结果。

计算出最大的结果。

## 实现

```java
public class T152_MaximumProductSubarray {

    /**
     * 最粗暴的算法：
     *
     * 1. 直接暴力计算。
     *
     * 直接移动 i, j 两个下标志，然后计算结果。
     *
     * @param nums
     * @return
     */
    public int maxProduct(int[] nums) {
        int maxResult = nums[0];

        for(int i = 0; i < nums.length; i++) {
            for(int j = i; j < nums.length; j++) {
                int result = calc(nums, i, j);
                maxResult = Math.max(result, maxResult);
            }
        }

        return maxResult;
    }

    /**
     * 186 / 189 TEL
     *
     * @param nums
     * @param startIndex
     * @param endIndex
     * @return
     */
    private int calc(int[] nums, int startIndex, int endIndex) {
        int result = 1;

        for(int i = startIndex; i <= endIndex; i++) {
            result *= nums[i];
        }

        return result;
    }

}
```

当然，这种 TC 为 O(N^3)，会超时。

# V2-暴力优化

## 思路

我们其实在迭代所有的子队列的时候，也不用把所有的全部计算一遍。

直接用一个变量，计算对比也行。

## 实现

```java
public class T152_MaximumProductSubarrayV2 {

    /**
     * 最粗暴的算法：
     *
     * https://leetcode.com/problems/maximum-product-subarray/solutions/1609493/c-simple-solution-w-explanation-optimization-from-brute-force-to-dp/
     *
     * @param nums
     * @return
     */
    public int maxProduct(int[] nums) {
        int maxResult = nums[0];

        for(int i = 0; i < nums.length; i++) {
            // 大的迭代下初始化
            int temp = 1;

            for(int j = i; j < nums.length; j++) {
                // 计算这个循环中的所有子数组，而不是从头计算
                temp *= nums[j];

                maxResult = Math.max(temp, maxResult);
            }
        }

        return maxResult;
    }

}
```

# V3-dp

## 思路

其实我们没必要两次迭代。

只需要一次循环，然后把最大的乘积和最小的乘积保存下来。

之所以需要最小的，因为存在负数，负数*最小值，反而会变成最大值。

## 实现

```java
public int maxProduct(int[] nums) {
    int max = nums[0], min = nums[0], result = nums[0];

    for (int i = 1; i < nums.length; i++) {
        int maxMulti = max * nums[i];
        int minMulti = min * nums[i];
        max = Math.max(Math.max(maxMulti, minMulti), nums[i]);
        min = Math.min(Math.min(maxMulti, minMulti), nums[i]);

        // 更新最大值
        result = Math.max(result, max);
    }
    return result;
}
```

# 参考资料

https://leetcode.com/problems/maximum-product-subarray/description/

https://leetcode.com/problems/maximum-product-subarray/solutions/48330/simple-java-code/

https://leetcode.com/problems/maximum-product-subarray/solutions/1608862/java-3-solutions-detailed-explanation-using-image/

https://leetcode.com/problems/maximum-product-subarray/solutions/48230/possibly-simplest-solution-with-o-n-time-complexity/

* any list
{:toc}