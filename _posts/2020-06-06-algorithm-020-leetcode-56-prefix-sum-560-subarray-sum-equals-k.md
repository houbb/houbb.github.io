---
layout: post
title:  【leetcode】56-560. subarray-sum-equals-k  力扣 560. 和为 k 的子数组  前缀和+HashMap
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 题目

给你一个整数数组 nums 和一个整数 k ，请你统计并返回 该数组中和为 k 的子数组的个数 。

子数组是数组中元素的连续非空序列。

示例 1：

输入：nums = [1,1,1], k = 2
输出：2
示例 2：

输入：nums = [1,2,3], k = 3
输出：2
 

提示：

1 <= nums.length <= 2 * 10^4
-1000 <= nums[i] <= 1000
-10^7 <= k <= 10^7

# v1-基本前缀和+HashMap

## 思路

1) 构建好前缀好，方便计算子数组的和，是否为 k

2）因为只有 0 和1，所以和是数组长度的一半，说明二者一样多。

直接通过 `map.containsKey(sum - k)` 来确认。

因为 `sum[i] - sum[j] = k` 则说明二者的子数组和刚好是 k

3) 总数

这里有一个需要注意点，因为原始是计算数量。

所以 map 初始化为 (0, 1) 表示如果从两开始的，前缀和为0，数量为1；

## 初步实现

```java
class Solution {
    
    public int subarraySum(int[] nums, int k) {
        int n = nums.length;

        // 前缀和数组
        int[] prefixSum = new int[n];
        prefixSum[0] = nums[0];
        for (int i = 1; i < n; i++) {
            prefixSum[i] = prefixSum[i-1] + nums[i];
        }

        // 哈希表记录前缀和第一次出现的位置
        Map<Integer, Integer> map = new HashMap<>();
        // 从零开始的计算  下标为0的元素，前缀和为0，数量为1
        map.put(0, 1);
        int count = 0;

        // 遍历前缀和数组
        for (int i = 0; i < n; i++) {
            // 查找前缀和减去 k 的位置，则说明满足等于 k
            int sum = prefixSum[i];
            if (map.containsKey(sum - k)) {
                count += map.get(sum - k);
            }

            map.put(sum, map.getOrDefault(sum, 0) + 1);
        }

        return count;
    }

}
```


## 效果

```
19ms 95.20%
```

## 小结

前面做多了，这里也就很自然的想到了前缀和+HashMap


# 参考资料

https://leetcode.cn/problems/longest-well-performing-interval/submissions/578871050/?envType=problem-list-v2&envId=prefix-sum

* any list
{:toc}