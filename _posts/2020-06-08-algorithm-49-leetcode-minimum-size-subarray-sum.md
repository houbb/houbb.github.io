---
layout: post
title: leetcode 49 209. Minimum Size Subarray Sum 双指针 binary-search 二分法查找
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, tree, sh]
published: true
---


# 209. 长度最小的子数组

给定一个含有 n 个正整数的数组和一个正整数 target 。

找出该数组中满足其和 ≥ target 的长度最小的 连续子数组 [numsl, numsl+1, ..., numsr-1, numsr] ，并返回其长度。如果不存在符合条件的子数组，返回 0 。

示例 1：

```
输入：target = 7, nums = [2,3,1,2,4,3]
输出：2
解释：子数组 [4,3] 是该条件下的长度最小的子数组。
```

示例 2：

```
输入：target = 4, nums = [1,4,4]
输出：1
```

示例 3：

```
输入：target = 11, nums = [1,1,1,1,1,1,1,1]
输出：0
```

提示：

1 <= target <= 10^9

1 <= nums.length <= 10^5

1 <= nums[i] <= 10^5

进阶：

如果你已经实现 O(n) 时间复杂度的解法, 请尝试设计一个 O(n log(n)) 时间复杂度的解法。

# V1-暴力解法

## 思路

我们直接从 step=1 的步长开始遍历，得到最后的结果。

把 `[startIndex, endIndex]` 中的所有元素累加，如果符合结果，则返回。

## 实现

```java
public class T209_MinimumSizeSubarraySum {

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

}
```

当然，这个会在 18/22 的时候超时。

# V2-引入 cache

## 思路

我一开始在想，是不是因为每次计算 sum，都要从头开始计算导致的？

因为我们步长从小到大，那么 `sum[0, i] = sum[0...i-1] + nums[i]`。引入一个缓存，让计算 sum 的辅助度降低为 O(1).

## 实现

```java
public class T209_MinimumSizeSubarraySumV2 {

    /**
     * 使用 slide window 实现
     *
     * 1. step 从 1 到 len
     *
     * 添加缓存，依然超时
     * @param target
     * @param nums
     * @return
     */
    public int minSubArrayLen(int target, int[] nums) {
        // 缓存，因为步长最短。
        Integer[][] cache = new Integer[nums.length][nums.length];

        for(int step = 0; step < nums.length; step++) {
            for(int i = 0; i < nums.length - step; i++) {
                int sum = calcSum(nums, i, i+step, cache);
                if(sum >= target) {
                    return step+1;
                }
            }
        }

        return 0;
    }

    private int calcSum(int[] nums,
                        int startIndex,
                        int endIndex,
                        Integer[][] cache) {
        int sumCache = 0;
        if(endIndex > 0) {
            Integer val = cache[startIndex][endIndex-1];
            if(val != null) {
                sumCache = val;
            }
            // 其他为0
        }

        int sum = sumCache + nums[endIndex];
        cache[startIndex][endIndex] = sum;
        return sum;
    }

}
```

不过因为测试的 case 数据量很大，导致内存限制。所以不可行。

# V3-最短的另一种思路

## 思路

我们一开始是扩大步长的方式，然后逐个尝试。

这样会比较麻烦。

其实我们可以换一种思路：

（1）从 0 开始累加 sum，当 >= target 的时候，end 指标停下。如果全部加起来还不满足，那直接 false。

（2）另一个指针 start，开始从 0 往后，开始缩小对应的元素个数，到 <= target 结束。

这样可以再 [start, end] 这个范围内找到满足的结果，对应的下标差距就是结果。

## 实现

```java
class Solution {
    
    public int minSubArrayLen(int s, int[] nums) {
        int start = 0;
        int end = 0;
        int sum = 0;
        int minLen = Integer.MAX_VALUE;

        while (end < nums.length) {
            while (end < nums.length && sum < s) {
                sum += nums[end++];
            }
            // 剪枝：全部的和不满足
            if (sum < s) {
                break;
            }

            // 开始尝试减少长度
            while (start < end && sum >= s) {
                sum -= nums[start++];
            }
            if (end - start + 1 < minLen) {
                minLen = end - start + 1;
            }
        }

        return minLen == Integer.MAX_VALUE ? 0 : minLen;
    }

}
```

# 参考资料

https://leetcode.com/problems/minimum-size-subarray-sum/description/

https://leetcode.cn/problems/minimum-size-subarray-sum/description/

https://leetcode.com/problems/minimum-size-subarray-sum/solutions/59103/two-ac-solutions-in-java-with-time-complexity-of-n-and-nlogn-with-explanation/

* any list
{:toc}