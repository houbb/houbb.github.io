---
layout: post
title:  【leetcode】47-minimum-size-subarray-sum 力扣 209. 长度最小的子数组
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)


# 题目

给定一个含有 n 个正整数的数组和一个正整数 target 。

找出该数组中满足其总和大于等于 target 的长度最小的 子数组

 [numsl, numsl+1, ..., numsr-1, numsr] ，并返回其长度。如果不存在符合条件的子数组，返回 0 。

示例 1：

输入：target = 7, nums = [2,3,1,2,4,3]
输出：2
解释：子数组 [4,3] 是该条件下的长度最小的子数组。
示例 2：

输入：target = 4, nums = [1,4,4]
输出：1
示例 3：

输入：target = 11, nums = [1,1,1,1,1,1,1,1]
输出：0
 

提示：

1 <= target <= 10^9
1 <= nums.length <= 10^5
1 <= nums[i] <= 10^4

# v1-滑动窗口

## 思路

我们从第一个元素开始，step 从 1 ... n。开始的下标也从 0...n。

当然这个性能估计很差。

## 代码

```java
/**
     * 使用 slide window 实现
     *
     * 1. step 从 1 到 len
     *
     * @param target
     * @param nums
     * @return
     */
    public int minSubArrayLen(int target, int[] nums) {
        for(int step = 0; step < nums.length; step++) {
            for(int i = 0; i < nums.length - step; i++) {
                if(fitSum(nums, i, i+step, target)) {
                    return step+1;
                }
            }
        }

        return 0;
    }

    private boolean fitSum(int[] nums,
                        int startIndex,
                        int endIndex,
                           int target) {
        int sum = 0;
        for(int i = startIndex; i <= endIndex; i++) {
            sum += nums[i];

            if(sum >= target) {
                return true;
            }
        }

        return false;
    }
```

复杂度为 O(n^3)

## 效果

18 / 21 个通过的测试用例

超时

# V2-优化

## 优化思路

为什么我们会超时呢？

因为每一次都要重复计算数组的和。

那么，有没有一种方法，可以让我们非常快捷的计算任意两个下标之间的差呢？

## 前缀和

`prefix_sum[i]` 表示数组 `arr` 从 `arr[0]` 到 `arr[i]` 的累加和。

具体来说：

```
prefix_sum[0] = arr[0]
prefix_sum[1] = arr[0] + arr[1]
prefix_sum[2] = arr[0] + arr[1] + arr[2]
...
prefix_sum[i] = arr[0] + arr[1] + ... + arr[i]
```

我们就得到了地推公式：

```
prefix_sum[i] = prefix_sum[i-1] + ... + arr[i]
```

## 整体思路

我们可以首先 one-pass 用 O(n) 把前缀和数组构建好，然后再用上面的双指针试试？

## 代码

我们

```java
public int minSubArrayLen(int target, int[] nums) {
        // 构建前缀和数组
        int[] prefixSum = new int[nums.length];
        prefixSum[0] = nums[0];
        for(int i = 1; i < nums.length; i++) {
            prefixSum[i] = prefixSum[i-1] + nums[i];
        }

        for(int step = 0; step < nums.length; step++) {
            for(int i = 0; i < nums.length - step; i++) {
                int sum = prefixSum[i+step] - prefixSum[i] + nums[i];
                if(sum >= target) {
                    return step+1;
                }
            }
        }

        return 0;
    }
```

复杂度为 O(n^2)

## 效果

18 / 21 个通过的测试用例

超时

有点离谱，感觉这个 18 直接对优化卡的太死了。

# v3-如何进一步优化呢？

## 二分法

我们慢还有一个原因就是在找下个窗口的时候，是傻傻的从零开始找的。

但是实际上应该怎么找呢？

因为是**含有 n 个正整数的数组**

所以 prefixSum 一定是递增的。

我们在找到 i 开始的位置后，直接用二分法寻找剩余的值位置在哪里，这样可以把复杂度降低到 O(n) * O(logn)

## 代码

```java
   // 判断长度为mid的子数组和是否能够大于等于target
    private boolean isOver(int[] sum, int mid, int target) {
        int n = sum.length;
        for (int i = mid; i < n; i++) {
            if ((sum[i] - sum[i - mid]) >= target) {
                return true;
            }
        }
        return false;
    }

    public int minSubArrayLen(int target, int[] nums) {
        int n = nums.length;
        int[] sum = new int[n + 1];  // 前缀和数组
        for (int i = 1; i <= n; i++) {
            sum[i] = sum[i - 1] + nums[i - 1];  // 计算前缀和
        }

        int left = 1, right = n;
        while (left <= right) {  // 二分查找
            int mid = (right - left) / 2 + left;
            // 没找过，去右边找
            if (!isOver(sum, mid, target)) {
                left = mid + 1;
            } else {
                // 超过了 去左边找
                right = mid - 1;
            }
        }

        return left == n + 1 ? 0 : left;  // 如果没有找到满足条件的子数组，返回0
    }
```

## 效果

3ms，击败 6.18%

## 小结

这种如果从前缀和的思路一直考虑下来，还算是比较好想到的一个解法。

不过手写二分确实需要多习惯一下，太久不写又忘记了。

# v4-双指针解法

## 思路

我们通过双指针。

sum 表示 left...right 的总和

首先扩大窗口，当 sum >= target 的时候，可以尝试缩小窗口。保持 right 位置不变，只是 left 向右移动。

这样满足的条件的就是最小的 len。

## 核心代码

```java
    /**
     * 使用 slide window 实现
     *
     * 1. step 从 1 到 len
     *
     * @param target
     * @param nums
     * @return
     */
    public int minSubArrayLen(int target, int[] nums) {
        int n = nums.length;
        int minLength = Integer.MAX_VALUE;  // 用于存储最小子数组长度
        int sum = 0;  // 当前窗口的和
        int left = 0;  // 左指针

        for (int right = 0; right < n; right++) {
            // 扩展窗口，加入当前右指针的元素
            sum += nums[right];

            // 当窗口和大于等于 target 时，尝试缩小窗口
            // 因为要保证 sum >= target，所以可以同时保证 left 和 right 的位置相对正确。
            // 这是一种比较巧妙的解法。
            while (sum >= target) {
                // 更新最小长度
                minLength = Math.min(minLength, right - left + 1);

                // 缩小窗口，移除左端元素
                sum -= nums[left];
                left++;
            }
        }

        // 如果没有找到符合条件的子数组，返回 0
        return minLength == Integer.MAX_VALUE ? 0 : minLength;
    }
```

## 效果 

1ms，超过 99.99%

## 小结

有时候双指针不太能很好的直接就想到。

性能的话还是不错的。

# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/

* any list
{:toc}