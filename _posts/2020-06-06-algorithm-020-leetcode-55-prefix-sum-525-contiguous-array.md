---
layout: post
title:  【leetcode】53-525. continuous-subarray-sum  力扣 525. 连续的子数组和 同余定理  前缀和+HashMap
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 题目

给定一个二进制数组 nums , 找到含有相同数量的 0 和 1 的最长连续子数组，并返回该子数组的长度。

示例 1:

输入: nums = [0,1]
输出: 2
说明: [0, 1] 是具有相同数量 0 和 1 的最长连续子数组。
示例 2:

输入: nums = [0,1,0]
输出: 2
说明: [0, 1] (或 [1, 0]) 是具有相同数量0和1的最长连续子数组。
 

提示：

1 <= nums.length <= 10^5

nums[i] 不是 0 就是 1

# v1-基本前缀和

## 思路

1) 构建好前缀好，方便计算子数组的和，是否为 k 的倍数。

2）因为只有 0 和1，所以和是数组长度的一半，说明二者一样多。

计算 i-j 的值，如果等于个数除以2，则满足。必须是偶数。且 i-j 的长度对应数组长度为偶数。

## 初步实现

```java
class Solution {
    public int findMaxLength(int[] nums) {
        final int n = nums.length;
        int[] prefix = new int[n];
        prefix[0] = nums[0];
        for(int i = 1; i < n; i++) {
            prefix[i] = prefix[i-1] + nums[i];
        }

        // 从大大小遍历？
        for(int step = n-1; step >=1; step--) {
            int len = step+1;
            if(len % 2 != 0) {
                continue;
            }

            for(int i = 0; i < n - step; i++) {
                int next = i + step;
                int sum = prefix[next] - prefix[i] + nums[i];
                if(sum == (len / 2)) {
                    return len;
                }
            }
        }
        return 0;
    }
}
```


## 效果

```
1395ms 6.43%
```

勉强 AC

## 小结

这里用的是前缀和+暴力的解法。

比较好想到，但是暴力匹配确实性能比较差。

# v2-改进

## 思路

我猜测有一种解法应该可以用位运算来实现。

可惜位运算一直比较菜。

TBC...

# v3-前缀和+HashMap

## 思路

这一题不说和 T523 一模一样吧，只能说是一模一样。

## 数据处理

我们把 0 处理为 -1，1 保持不变。问题就变成了求 **如何求得最长一段区间和为 0 的子数组**

## 怎么求

sum[i] = sum[j]

那么

```
sum[i] - [sum]j = 0
```

根据前缀和定义，二者位置的数据就是等于 0 的。

## 代码

```java
public int findMaxLength(int[] nums) {
        final int n = nums.length;
        int[] prefix = new int[n+1];
        // 初始化
        prefix[0] = nums[0] == 1 ? 1 : -1;
        for(int i = 1; i < n; i++) {
            // 预处理，简化计算
            int val =  nums[i] == 1 ? 1 : -1;
            prefix[i] = prefix[i-1] + val;
        }

        Map<Integer, Integer> map = new HashMap<>();
        // 处理从索引0开始的子数组
        map.put(0, -1);
        int maxLen = 0;

        for(int i = 0; i < n; i++) {
            int sum = prefix[i];
            if(map.containsKey(sum)) {
                maxLen = Math.max(maxLen, i - map.get(sum));
            } else {
                map.put(sum, i);
            }
        }
        return maxLen;
    }
```

## 效果

21ms 击败 77.14%

# 参考资料

https://leetcode.cn/problems/longest-well-performing-interval/submissions/578871050/?envType=problem-list-v2&envId=prefix-sum

* any list
{:toc}