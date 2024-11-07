---
layout: post
title:  【leetcode】51-1124. longest-well-performing-interval  力扣 1124. 表现良好的最长时间段
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
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



# 参考资料

https://leetcode.cn/problems/longest-well-performing-interval/submissions/578871050/?envType=problem-list-v2&envId=prefix-sum

* any list
{:toc}