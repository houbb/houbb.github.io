---
layout: post
title:  【leetcode】54-325. max-size-subarray-sum-equals-k  力扣 325：和等于 k 的最长子数组长度
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 说明

这一题实际上非常重要，很多题目都是这一题的变形或者转换。

# 题目

给定一个数组 `nums` 和一个目标值 `k`，找出和为 `k` 的最长子数组的长度。如果不存在这样的子数组，返回 0。

### 示例 1：

给定 `nums = [1, -1, 5, -2, 3]`，`k = 3`，  
返回 4。（因为子数组 `[1, -1, 5, -2]` 的和为 3，且它是最长的）

### 示例 2：

给定 `nums = [-2, -1, 2, 1]`，`k = 1`，  
返回 2。（因为子数组 `[-1, 2]` 的和为 1，且它是最长的）

### 后续问题：

你能在 O(n) 时间复杂度内解决这个问题吗？  

# v1-基本前缀和

## 思路

1) 构建好前缀好，方便计算子数组的和，是否等于 k。

2) 可以用双指针构建全部的结果。

## 初步实现

这一道题是 PLUS 题目，下面的代码，是伪代码。未经过实际测试验证

```java
class Solution {
    public int findMaxLength(int[] nums, int k) {
        final int n = nums.length;
        int[] prefix = new int[n];
        prefix[0] = nums[0];
        for(int i = 1; i < n; i++) {
            prefix[i] = prefix[i-1] + nums[i];
        }

        // 从大=>小遍历？
        for(int step = n-1; step >=1; step--) {
            int len = step+1;

            for(int i = 0; i < n - step; i++) {
                int next = i + step;
                int sum = prefix[next] - prefix[i] + nums[i];
                if(sum == k) {
                    return len;
                }
            }
        }
        return 0;
    }
}
```


## 效果

勉强 AC

这个性能比较差

## 小结

这里用的是前缀和+暴力的解法。

比较好想到，但是暴力匹配确实性能比较差。

# v2-结合 HashMap-等于0的场景

## 思路：

前缀和：首先计算数组的前缀和，即数组到某个索引的和。

哈希表：用哈希表来记录每个前缀和第一次出现的位置。因为如果某个前缀和在多个位置出现，那么这两个位置之间的子数组和为0。

### 疑问1：为什么出现多次，就说明子数组为0？

假设有两个位置 i 和 j，其中 i < j，并且它们的前缀和相等，即：

prefixSum[i]=prefixSum[j]

根据前缀和的定义，我们可以得到：

prefixSum[i] - prefixSum[j] = 0；

也就是说明 i 到 j 中间的子数组和为0；

### 疑问2：为什么  map.put(0, -1); 是为了什么？

`map.put(0, -1);` 这一行代码的作用是在哈希表中初始化一个前缀和为 `0` 的情况，并将其位置设置为 `-1`。

这实际上是为了处理一种特殊情况：当数组从索引 `0` 开始的子数组和为 `0` 时，我们可以正确地计算出该子数组的长度。

## 代码

```java
import java.util.HashMap;

public class LongestSubarraySumZero {

    public static int longestSubarrayWithSumZero(int[] nums) {
        int n = nums.length;
        
        // 计算前缀和数组
        int[] prefixSums = new int[n + 1];  // prefixSums[i]表示nums[0...i-1]的和
        
        // 填充前缀和数组
        for (int i = 0; i < n; i++) {
            prefixSums[i + 1] = prefixSums[i] + nums[i];
        }
        
        // 用哈希表记录前缀和第一次出现的位置
        HashMap<Integer, Integer> map = new HashMap<>();
        map.put(0, -1);  // 特殊情况，前缀和为0时从开头开始
        
        int maxLength = 0;
        
        // 遍历前缀和数组
        for (int i = 0; i <= n; i++) {
            // 如果前缀和出现过，说明子数组和为0
            if (map.containsKey(prefixSums[i])) {
                // 计算当前子数组的长度
                int length = i - map.get(prefixSums[i]);
                // 更新最大长度
                maxLength = Math.max(maxLength, length);
            } else {
                // 如果前缀和没有出现过，记录它的位置
                map.put(prefixSums[i], i);
            }
        }
        
        return maxLength;
    }

    public static void main(String[] args) {
        int[] nums = {1, -1, 3, -2, -1, 1, 2, -3};
        System.out.println(longestSubarrayWithSumZero(nums));  // 输出: 4
    }
}
```

# v3-如果等于 k 呢？

求得最长一段区间和为 `k` 的子数组，可以通过类似于**前缀和**和**哈希表**的方式来实现，方法与求和为0的子数组类似，但需要在哈希表中查找目标和 `prefixSum - k`。

## 思路：

1. **前缀和**：首先计算数组的前缀和，即从数组起始到当前元素的和。

2. **哈希表**：用哈希表记录每个前缀和首次出现的位置。如果当前前缀和减去目标值 `k` 的结果已经在哈希表中出现过，说明有一段子数组的和为 `k`。

### 疑问：为什么 prefixSum - k 就是满足目标的数据呢、

子数组和 = k = sum[i] - sum[j] 

那么：

`sum[i] = sum[j] + k;`

所以二者的差别是 k

如果当前前缀和为 prefixSum[i]，那么我们希望找到一个之前的前缀和为 prefixSum[i] + k 的位置。这个位置 j 到当前索引 i 之间的子数组和就等于 k。

## 代码实现：

```java
package com.github.houbb.leetcode.F300T400;

import java.util.HashMap;

public class T325_LongestSubarraySumK_V1 {

    public static int longestSubarrayWithSumK(int[] nums, int k) {
        int n = nums.length;
        // 预处理前缀和
        int[] prefixSum = new int[n];
        prefixSum[0] = nums[0];
        for (int i = 1; i < n; i++) {
            prefixSum[i] = prefixSum[i-1] + nums[i];
        }

        // 用哈希表记录前缀和第一次出现的位置
        HashMap<Integer, Integer> map = new HashMap<>();
        // 特殊情况，前缀和为0时从开头开始
        map.put(0, -1);
        int maxLength = 0;
        // 遍历前缀和数组
        for (int i = 0; i < n; i++) {
            // 如果prefixSum[i] - k在map中，表示存在子数组和为k
            if (map.containsKey(prefixSum[i] - k)) {
                // 计算当前子数组的长度
                int length = i - map.get(prefixSum[i] - k);
                maxLength = Math.max(maxLength, length);
            }

            // 如果当前前缀和没有出现过，则记录它的位置
            if (!map.containsKey(prefixSum[i])) {
                map.put(prefixSum[i], i);
            }
        }

        return maxLength;
    }

    public static void main(String[] args) {
        int[] nums = {1, -1, 5, -2, 3};
        int k = 3;
        System.out.println(longestSubarrayWithSumK(nums, k));  // 输出: 4

        int[] nums2 = {-2,-1,2,1};
        System.out.println(longestSubarrayWithSumK(nums2, 1));  // 输出: 2
    }

}
```

## 效果

这个效果应该是比较好的。

# 参考资料

https://leetcode.cn/problems/longest-well-performing-interval/submissions/578871050/?envType=problem-list-v2&envId=prefix-sum

* any list
{:toc}