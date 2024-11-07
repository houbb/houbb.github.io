---
layout: post
title:  【leetcode】53-523. continuous-subarray-sum  力扣 523. 连续的子数组和 同余定理  前缀和+HashMap
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 题目

给你一个整数数组 nums 和一个整数 k ，如果 nums 有一个 好的子数组 返回 true ，否则返回 false：

一个 好的子数组 是：

1. 长度 至少为 2 ，且

2. 子数组元素总和为 k 的倍数。

注意：

子数组 是数组中 连续 的部分。

如果存在一个整数 n ，令整数 x 符合 x = n * k ，则称 x 是 k 的一个倍数。0 始终 视为 k 的一个倍数。
 
示例 1：

输入：nums = [23,2,4,6,7], k = 6

输出：true

解释：[2,4] 是一个大小为 2 的子数组，并且和为 6 。

示例 2：

输入：nums = [23,2,6,4,7], k = 6
输出：true
解释：[23, 2, 6, 4, 7] 是大小为 5 的子数组，并且和为 42 。 
42 是 6 的倍数，因为 42 = 7 * 6 且 7 是一个整数。

示例 3：

输入：nums = [23,2,6,4,7], k = 13
输出：false
 

提示：

1 <= nums.length <= 10^5
0 <= nums[i] <= 10^9
0 <= sum(nums[i]) <= 2^31 - 1
1 <= k <= 2^31 - 1

# v1-基本前缀和+BF

## 思路

1) 构建好前缀好，方便计算子数组的和，是否为 k 的倍数。

2）如何找到所有的子数组？

直接最暴力的 i j 两层遍历。

简单的双指针

i 0 .... n-2

j step = 2, .... n-2

## 初步实现

```java
class Solution {
    
    public boolean checkSubarraySum(int[] nums, int k) {
        final int n = nums.length;

        // 前缀和
        int[] prefix = new int[n];
        prefix[0] = nums[0];
        for(int i = 1; i < n; i++) {
            prefix[i] = prefix[i-1] + nums[i];
        }

        // 穷举
        for(int step = 1; step < n; step++) {
            for(int i = 0; i < n - step; i++) {
                int sum = prefix[i+step] - prefix[i] + nums[i];
                if(sum % k == 0) {
                    return true;
                }
            }
        }

        return false;
    }

}
```


## 效果

发现 

```
超出时间限制
94 / 101 个通过的测试用例
```

## 小结

这里要注意，固定步长，然后穷举处理。

不过性能看的出来，确实不怎么样，超时了。

# v2-同余定理的改进

## 思路

其实这道题挺离谱的，也就是你不知道这个推论，那么就无法找到这个解法的 AC 版本。

## 同余定理的定义可以用以下公式表达：

明白了！以下是可以直接复制的同余定理定义：

**同余定义**：  

如果整数 `a` 和 `b` 对模 `m` 同余，记作：

```
a ≡ b (mod m)
```

当且仅当存在整数 `k`，使得：

```
a - b = k * m
```

这表示 `a` 和 `b` 除以 `m` 后的余数相同，或者说 `a - b` 是 `m` 的倍数。

### 为什么是取余相同？

我们从 `a - b = n * k` 开始推导

我们可以假设：

```
a =  n1 * k + r1;       //r1 表示 k 余数
b =  n2 * k + r2;       //r2 表示 k 余数
```

那么

```
a - b = (n1 * k + r1) - (n2 * k + r2) = (n1-n2) * k +(r1-r2)
```

因为 `a - b = n * k` 那么可以知道 r1-r2 = 0;

也就是 a 和 b 对于 k 的余数相同。

## 代码

写到这里就比较简单了，我们只需要计算一个数对于 k 的余数，只要出现了两次，那么就直接满足条件。

```java
class Solution {
    
    public boolean checkSubarraySum(int[] nums, int k) {
        final int n = nums.length;

        // 前缀和
        int[] prefix = new int[n];
        prefix[0] = nums[0];
        for(int i = 1; i < n; i++) {
            prefix[i] = prefix[i-1] + nums[i];
        }

        // 用哈希表存储前缀和 mod k 的值
        HashMap<Integer, Integer> modMap = new HashMap<>();
        modMap.put(0, -1); // 处理从索引0开始的子数组

        // 遍历前缀和数组
        for (int i = 0; i < n; i++) {
            // 计算当前前缀和的模值
            int modValue = prefix[i] % k;

            // 如果之前有相同的 mod 值，说明有符合条件的子数组
            if (modMap.containsKey(modValue)) {
                if (i - modMap.get(modValue) > 1) {  // 子数组长度至少为 2
                    return true;
                }
            } else {
                // 只记录第一次出现的前缀和 mod k 值
                modMap.put(modValue, i);
            }
        }

        return false;
    }

}
```

## 效果

22ms 94.8%

# 参考资料

https://leetcode.cn/problems/longest-well-performing-interval/submissions/578871050/?envType=problem-list-v2&envId=prefix-sum

* any list
{:toc}