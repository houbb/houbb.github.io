---
layout: post
title: leetcode 数组专题 01-力扣.53 最大子数组和 leetcode maximum-subarray 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, sf]
published: true
---

# 数组系列

[力扣数据结构之数组-00-概览](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-00-overview)

[力扣.53 最大子数组和 maximum-subarray ](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-01-51-maximum-subarray)

[力扣.128 最长连续序列 longest-consecutive-sequence](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-02-128-longest-consecutive-sequence)

[力扣.1 两数之和 N 种解法 two-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum)

[力扣.167 两数之和 II two-sum-ii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-ii)

[力扣.170 两数之和 III two-sum-iii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-iii)

[力扣.653 两数之和 IV two-sum-IV](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-iv)

[力扣.015 三数之和 IV three-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-015-three-sum)


# 题目

给你一个整数数组 nums ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

子数组是数组中的一个连续部分。

示例 1：

输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大，为 6 。
示例 2：

输入：nums = [1]
输出：1
示例 3：

输入：nums = [5,4,-1,7,8]
输出：23
 

提示：

1 <= nums.length <= 10^5
-104 <= nums[i] <= 10^4
 

进阶：如果你已经实现复杂度为 O(n) 的解法，尝试使用更为精妙的 分治法 求解。

# v1-前缀和 BF

## 思路

看到连续子数组和，比较自然的是想到用前缀和来加速子数组和的计算。

1）构建好前缀和

2）穷举所有可能的子数组和，找出最大值。

## 实现

```java
class Solution {
    public int maxSubArray(int[] nums) {
        final int n = nums.length;

        int[] prefixSum = new int[n];
        prefixSum[0] = nums[0];
        for(int i = 1; i < n; i++) {
            prefixSum[i] = prefixSum[i-1] + nums[i];
        }

        // BF 匹配
        int maxSum = nums[0];
        for(int i = 0; i < n; i++) {
            // 后面的数组 》 前一个标识
            for(int j = i; j < n; j++) {
                int sum = prefixSum[j] - prefixSum[i] + nums[i];

                // 更新最大值
                 maxSum = Math.max(maxSum, sum);
            }
        }
        return maxSum;
    }
}
```

## 效果

超出时间限制

204 / 210 个通过的测试用例

# v2-如何改进? 双指针？

## 思路

我们之所以很慢，是因为在计算连续子数组和的时候，计算了各种场景。但是这里要如何优化呢？

但是不对比所有的，如何找到最大的呢？

最气人的是题目中的那一句：`如果你已经实现复杂度为 O(n) 的解法，尝试使用更为精妙的 分治法 求解。`

## 左右两边的双指针可行吗？

感觉双指针不可行 双指针适合计算最大的长度，但是不太适合这种最大的和。

# v3-贪心

## 思路1

看了一眼相似题目，其中有一个是 【买卖股票的最佳时机】{简单}  

于是贪心的话，思路可以简化为：

```java
public int maxSubArray(int[] nums) {
    final int n = nums.length;
    // BF 匹配
    int maxSum = nums[0];
    for(int i = 1; i < n; i++) {
        // 加上当前值变大？不加当前值？
        // 变大
        int num = nums[i];
        // 无脑直接加
        if(num >= 0) {
            maxSum += num;
        } else {
            // 如果不是呢？
            // 也不能贸然丢弃 因为连续起来，后来可能又大于0的？
            // 那么 怎么简单的判断这个事情呢？
            
        }
    }
    return maxSum;
}
```

## 思路-打开评论区

首先看到一首打油诗 被逗笑了

```
打开我的题库，调为简单难度。

计算最大子数，直接给我难住。

报错铺满屏幕，凝望没有思路。

缝缝补补做出，击败零个用户。

翻阅评论找补，令我勃然大怒。

不禁心有一问，都是人，凭什么我——这么废物。

55555555
```

被打开的不单单是评论区的，当然还有自己的思路。

我们整体的方向没错，但是这里需要一个技巧。

如下：

```java
/**解题思路

用 temp 记录局部最优值，用 result 记录全局最优值。
每遍历一个新元素时，判断（已遍历的连续子数组的和）加上（当前元素值），与（当前元素值）对比谁更大。
（1）如果已遍历的连续子数组的和 + 当前元素值 >= 当前元素值
说明（已遍历的连续子数组的和）是大于等于0的，令 temp = 已遍历的连续子数组的和 + 当前元素值。

（2）如果已遍历的连续子数组的和 + 当前元素值 < 当前元素值
说明（已遍历的连续子数组的和）是小于0的，加上这部分只会拖累当前元素，故应该直接抛弃掉这部分，令 * temp = 当前元素值。

（3）对比 temp 和 result，如果 temp 更大，则更新到 result 中。 
*/
```

## 代码

```java
class Solution {
    public int maxSubArray(int[] nums) {
        final int n = nums.length;

        // BF 匹配
        int maxSum = nums[0];
        int tempSum = nums[0];
        for(int i = 1; i < n; i++) {
            int num = nums[i];

            // 历史数据大于等于0，则保留继续累加
            if(tempSum >= 0) {
                tempSum += num;
            } else {
                // 历史和小于 0，直接舍弃。只保留今天
                tempSum = num;
            }

            maxSum = Math.max(maxSum, tempSum);
        }

        return maxSum;
    }
}
```

简单的优化，我们直接判断是否大于等于0即可，减少一次累加计算。聊胜于无。

## 效果

```
1ms 100%
```

效果拔群

## 小结

那么这一题和股票有啥关系呢？

股票的买卖贪心其实要简单一些，就是明天比今天高，直接无脑买卖。而且不要求连续。

这里要求连续，就需要一个巧妙的构思，有时候不一定能很快想到。

比如我们可买卖股票无限次数上点难度，增加一个限制，买卖的天数必须是连续的天数，怎么解？

其实就是 {买+卖} 的和当做一个数，然后就变成这一题了

# v3-DP

## 思路

一个问题能不能被 DP 解决呢？

就看能不能拆分为递推的子问题。

那么，这个问题可以吗?

## 递推公式是什么？

也就是我们还是需要想到上面那个思路。

```java
dp[i] = Math.max(0, dp[i-1]) + nums[i];
```

## 实现

```java
class Solution {
    public int maxSubArray(int[] nums) {
        final int n = nums.length;

        int[] dp = new int[n];
        dp[0] = nums[0];
        int maxResult = nums[0];
        for(int i = 1; i < n; i++) {
            int num = nums[i];
            dp[i] = Math.max(0, dp[i-1]) + nums[i];
            maxResult = Math.max(dp[i], maxResult);
        }

        return maxResult;
    }
}
```

## 效果

```
2ms 36.91%
```

## 小结

DP 的优点是使用范围更加广泛，这如果是一个系列的题目，不断上难度，DP 也许可以成为一个模板。

但是如果是性能，比不上上面的 greedy。

或者说上面的贪心，是对下面递推数组的存储空间优化。

差点挂在了第一个选择的数组题目上....ORZ

* any list
{:toc}