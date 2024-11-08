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

## 疑问

### 为什么需要 map.put(0, 1)?

`map.put(0, 1);` 的作用是为了处理那些从数组开始部分就满足条件的子数组，比如从第一个元素到某个位置的子数组。

让我们详细分析一下为什么需要 `map.put(0, 1)` ：

1. **前缀和的定义**：
   - 假设 `prefixSum[i]` 表示从数组开始（index `0`）到 `i` 的元素和。
   - 为了找出从 `j` 到 `i` 的子数组和是否等于 `k`，我们需要满足 `prefixSum[i] - prefixSum[j-1] = k`。

2. **处理从起点开始的子数组**：
   - 当一个子数组从索引 `0` 开始时，`prefixSum[i] = k` 就代表了从 `0` 到 `i` 的元素和等于 `k`。
   - 要计算这种情况，我们将 `prefixSum[0]` 视作起始点的“虚拟前缀和”，因此在一开始就将 `map.put(0, 1)` 加入 `map` 中，这样一来，如果 `prefixSum[i] == k`，即 `prefixSum[i] - 0 = k`，那么可以直接从 `map.get(0)` 中得到值。

3. **示例**：
   - 假设 `nums = [1,1,1]`，`k = 2`，我们希望找到和为 `2` 的子数组。
   - 当遍历到 `prefixSum[1]` 时，如果 `prefixSum[1] - k = 0` 存在于 `map` 中，则说明有一个子数组的和等于 `k`，即 `[1, 1]`。
   - 如果我们没有初始化 `map.put(0, 1)`，就无法识别这种从开头开始的子数组情况。

4. **总结**：
   - `map.put(0, 1)` 的初始化确保了从数组起点计算的子数组和可以正确被计入，简化了逻辑并避免了额外判断。

### 疑问2：当 k = 0, nums[0] = 0 时，也是正确的吗？

本地 debug 一下就会发现：

```java
int count = 0;

map.put(0, 1);
for (int i = 0; i < n; i++) {
    int sum = prefixSum[i];

    // 如果k=0 且 第一个元素为0，那么 i=0时，条件满足
    if (map.containsKey(sum - k)) {
        // count 不就会累加了吗？
        // count += 1;  结果刚好是1，满足条件。
        count += map.get(sum - k);
    }

    map.put(sum, map.getOrDefault(sum, 0) + 1);
}
return count;
````


## 小结

前面做多了，这里也就很自然的想到了前缀和+HashMap


# 参考资料

https://leetcode.cn/problems/longest-well-performing-interval/submissions/578871050/?envType=problem-list-v2&envId=prefix-sum

* any list
{:toc}