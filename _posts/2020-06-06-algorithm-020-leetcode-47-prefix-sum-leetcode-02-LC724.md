---
layout: post
title:  【leetcode】47-Prefix Sum 724. 寻找数组的中心下标 + 1991. 找到数组的中间位置
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, leetcode]
published: true
---


# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 724. 寻找数组的中心下标

给你一个整数数组 nums ，请计算数组的 中心下标 。

数组 中心下标 是数组的一个下标，其左侧所有元素相加的和等于右侧所有元素相加的和。

如果中心下标位于数组最左端，那么左侧数之和视为 0 ，因为在下标的左侧不存在元素。

这一点对于中心下标位于数组最右端同样适用。

如果数组有多个中心下标，应该返回 最靠近左边 的那一个。如果数组不存在中心下标，返回 -1 。

示例 1：

输入：nums = [1, 7, 3, 6, 5, 6]
输出：3
解释：
中心下标是 3 。
左侧数之和 sum = nums[0] + nums[1] + nums[2] = 1 + 7 + 3 = 11 ，
右侧数之和 sum = nums[4] + nums[5] = 5 + 6 = 11 ，二者相等。

示例 2：

输入：nums = [1, 2, 3]
输出：-1
解释：
数组中不存在满足此条件的中心下标。

示例 3：

输入：nums = [2, 1, -1]
输出：0
解释：
中心下标是 0 。
左侧数之和 sum = 0 ，（下标 0 左侧不存在元素），
右侧数之和 sum = nums[1] + nums[2] = 1 + -1 = 0 。
 

提示：

1 <= nums.length <= 10^4
-1000 <= nums[i] <= 1000
 

注意：本题与主站 1991 题相同：https://leetcode-cn.com/problems/find-the-middle-index-in-array/

# v1-暴力

## 思路

根据题目逻辑，直接判断 i 位置左右的元素之和即可。

## 实现

```java
  public int pivotIndex(int[] nums) {
        for(int i = 0; i < nums.length; i++) {
            // 左边
            long leftSum = 0;
            for(int j = 0; j < i; j++) {
                leftSum += nums[j];
            }

            long rightSum = 0;
            for(int j = i+1; j < nums.length; j++) {
                rightSum += nums[j];
            }
            // 右边
            if(leftSum == rightSum) {
                return i;
            }
        }

        return -1;
    }
```

## 效果

AC

441ms 击败 5.02%

## 反思

慢是正常的，因为我们一直在重复计算。

# v2-前缀和

## 思路

可以发现，我们多次用到了计算两个连续区间的和。

那么，就可以用前缀和来改进。

## 实现

```java
public int pivotIndex(int[] nums) {
        int n = nums.length;
        //1. 前缀和
        int[] prefixSum = new int[n+1];
        for(int i = 0; i < n; i++) {
            prefixSum[i+1] = prefixSum[i] + nums[i];
        }

        for(int i = 0; i < n; i++) {
            // 左边 [0,i-1]
            long leftSum = prefixSum[i]-prefixSum[0];

            // 右边 [i+1,length]
            long rightSum = prefixSum[n]-prefixSum[i+1];

            // 相等
            if(leftSum == rightSum) {
                return i;
            }
        }

        return -1;
    }
```

## 效果

1ms 64.36%

45.23MB 5.16%

此时，已经是第一梯队解法，但是没有区分度。

## 反思

还有更好的解法吗？

或者说空间可以进一步优化吗？

# v3-前缀和压缩优化

## 思路

我们的整个数组之和

```java
totalSum = leftSum + rightSum + nums[i];
```

所以：

```java
rightSum = totalSum - leftSum - nums[i];
```

有了这个公式之后，我们就可以对代码进行优化。

压缩一下空间，从 O(n)->O(1)

1）先计算 totalSum

2) 循环的时候，累加得到 leftSum

3) 判断 leftSum == rightSum

## 解法

```java
  public int pivotIndex(int[] nums) {
        int n = nums.length;
        //1. 前缀和
        int totalSum = 0;
        for(int i = 0; i < n; i++) {
            totalSum += nums[i];
        }

        int leftSum = 0;
        int rightSum = 0;
        for(int i = 0; i < n; i++) {
            // 右边 [i+1,length]
            rightSum = totalSum - leftSum - nums[i];

            // 相等
            if(leftSum == rightSum) {
                return i;
            }

            // 更新 leftSum
            leftSum += nums[i];
        }

        return -1;
    }
```

## 效果

0ms 100%

44.65 MB 击败 30.82%

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/

* any list
{:toc}