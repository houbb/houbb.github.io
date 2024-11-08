---
layout: post
title:  【leetcode】51-1124. longest-well-performing-interval  力扣 1124. 表现良好的最长时间段  前缀和+HashMap
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 题目

给你一份工作时间表 hours，上面记录着某一位员工每天的工作小时数。

我们认为当员工一天中的工作小时数大于 8 小时的时候，那么这一天就是「劳累的一天」。

所谓「表现良好的时间段」，意味在这段时间内，「劳累的天数」是严格 大于「不劳累的天数」。

请你返回「表现良好时间段」的最大长度。


示例 1：

输入：hours = [9,9,6,0,6,6,9]
输出：3
解释：最长的表现良好时间段是 [9,9,6]。
示例 2：

输入：hours = [6,6,6]
输出：0
 

提示：

1 <= hours.length <= 10^4
0 <= hours[i] <= 16

# v1-前缀和

## 思路

前缀和 提前构架好整个数组。

我们用类似于 303 的解法，唯一的区别就是首先对数据进行一下加工处理。


## 实现

```java
public int longestWPI(int[] hours) {
        final int n = hours.length;
        int[] nums = new int[n];
        for(int i = 0; i < n; i++) {
            if(hours[i] > 8) {
                nums[i] = 1;
            } else {
                nums[i] = -1;
            }
        }


        // 然后计算最长子数组？
        int[] prefix = new int[n];
        prefix[0] = nums[0];
        for(int i = 1; i < n; i++) {
            prefix[i] = prefix[i-1] + nums[i];
        }

        // 计算最长的数组？
        // 找到大于0的最长子数组
        for(int step = nums.length-1; step >= 0; step--) {
            for(int i = 0; i < nums.length - step; i++) {
                int sum = prefix[i+step] - prefix[i] + nums[i];
                if(sum > 0) {
                    return step+1;
                }
            }
        }

        return 0;
    }
```

## 效果

399ms, 6.87%

## 小结

这道题的下方查询方式值得优化。

结果发现好像不是那么回事。

初步考虑可以采用二分法，或者改进后的双指针。


# V2-前缀和+HashMap 的方式

## 前提

这一题和等于 0 的很像。

这一题做一下数据处理。

其实原来已经处理过了，就是 1, -1。

要计算 **和大于0** 的最长子数组，只是这次我们需要找到的是和大于 0 的子数组，而不是精确的目标和 `k`。

我们可以通过 **前缀和** 和 **哈希表** 来高效地实现这一点。

## 推导

sum[i] = sum[j] 的时候，可以推断出对应的子数组为0.

### 思路：

1. **前缀和**：计算当前的前缀和，如果当前前缀和大于 0，说明从数组的起始位置到当前索引之间的子数组和为正数。

2. **更新最大长度**：当我们遇到一个前缀和大于 0 时，我们会尝试更新最大子数组的长度。

3. **哈希表**：我们还可以利用哈希表来存储前缀和，避免重复计算。

### 具体做法：

1. **前缀和计算**：遍历数组的每个元素，累计前缀和。

2. **判断子数组和是否大于0**：对于每个前缀和，判断当前前缀和是否大于0。如果是，说明从数组开始到当前索引的子数组和大于0。

3. **使用哈希表优化**：可以记录每个前缀和第一次出现的位置，这样就能有效判断从某个位置到当前的位置之间的子数组和是否大于0。

## 基本解法

```java
class Solution {

    public int longestWPI(int[] hours) {
        int n = hours.length;
        
        // 前缀和数组
        int[] prefixSum = new int[n];
        
        // 初始化第一个元素
        prefixSum[0] = hours[0] > 8 ? 1 : -1;

        // 计算前缀和数组，prefixSum[i] 表示前 i 个小时的“工作强度”的前缀和
        for (int i = 1; i < n; i++) {
            prefixSum[i] = prefixSum[i - 1] + (hours[i] > 8 ? 1 : -1);
        }
        
        // 哈希表记录前缀和第一次出现的位置
        Map<Integer, Integer> map = new HashMap<>();
        int res = 0;
        
        // 遍历前缀和数组
        for (int i = 0; i < n; i++) {
            // 如果前缀和大于 0，说明从数组的起始位置到当前位置的子数组和大于 0
            if (prefixSum[i] > 0) {
                res = Math.max(res, i + 1);
            } else {
                // 查找前缀和减去 1 的位置
                // 找一个和等于1的数，此时也满足 > 0
                if (map.containsKey(prefixSum[i] - 1)) {
                    res = Math.max(res, i - map.get(prefixSum[i] - 1));
                }
            }
            
            // 如果前缀和第一次出现，记录其位置
            if (!map.containsKey(prefixSum[i])) {
                map.put(prefixSum[i], i);
            }
        }
        
        return res;
    }

}
```

### 疑问1：为什么这里不需要设置对应的 map.put(0. -1)?

1) map.put(0, -1) 在求和为 0 的最长子数组时的作用：

主要是处理“从数组的开始到某个位置和为零”的情况。在这种情况下，前缀和为 0 的位置意味着从数组开始到该位置的子数组和为零，因此需要用 map.put(0, -1) 来记录这一点，以便在后续处理中计算长度。

2) 大于 0 的最长子数组不需要初始化 map.put(0, -1)：

因为在这种情况下我们不关心 prefixSum[i] == 0 时的特殊情况，我们只关注当前的前缀和与之前出现过的前缀和之间的差异是否满足条件。

因此，不需要像求和为 0 的子数组时那样进行特殊初始化。

### 疑问2：prefixSum[i] > 0 时，比较好理解，就是子数组大于0。但是为什么要判断 map.containsKey(prefixSum[i] - 1)？ 

这是其实是 2 个场景：

1）`prefixSum[i] > 0` 根据前缀和的定义，说明这个 [0, i] 的子数组直接满足条件。

2）如果 `prefixSum[i] <= 0` 呢？

`map.containsKey(prefixSum[i] - 1)` 这个是什么意思，其实在等于 k 中推导过：

#### 推导过程

1 = sum[i] - sum[j] 

那么：

`sum[i] = sum[j] + 1`

所以二者的差别是 1

如果当前前缀和为 prefixSum[i]，那么我们希望找到一个之前的前缀和为 prefixSum[i] + 1 的位置。

这个位置 j 到当前索引 i 之间的子数组和就等于 1，是满足 》 0 的。

## 效果

10ms 60%

# 参考资料

https://leetcode.cn/problems/longest-well-performing-interval/submissions/578871050/?envType=problem-list-v2&envId=prefix-sum

* any list
{:toc}