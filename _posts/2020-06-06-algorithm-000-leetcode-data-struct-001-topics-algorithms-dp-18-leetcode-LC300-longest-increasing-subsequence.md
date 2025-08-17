---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 11-LC300. 最长递增子序列 longest-increasing-subsequence
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下最长递增子序列

# LC300. 最长递增子序列 longest-increasing-subsequence

给你一个整数数组 nums ，找到其中最长严格递增子序列的长度。

子序列 是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。

例如，[3,6,2,7] 是数组 [0,3,1,6,2,2,7] 的子序列。
 
示例 1：

输入：nums = [10,9,2,5,3,7,101,18]
输出：4
解释：最长递增子序列是 [2,3,7,101]，因此长度为 4 。
示例 2：

输入：nums = [0,1,0,3,2,3]
输出：4
示例 3：

输入：nums = [7,7,7,7,7,7,7]
输出：1
 

提示：

1 <= nums.length <= 2500
-10^4 <= nums[i] <= 10^4
 

进阶：

你能将算法的时间复杂度降低到 O(n log(n)) 吗?


# 历史回顾

> [128. 最长连续序列](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-topics-techniques-hash-02-leetcode-top100-LC128)


注意：这一题的选择，是可以跳过的，并不要求连续。


# v1-dp 

## 思路

1） 状态定义：

dp[i] 表示 以 nums[i] 结尾的 LIS 长度。

2） 转移方程：

对每个 j < i：

如果 nums[j] < nums[i]，说明可以接在 nums[j] 后面，
那么 dp[i] = max(dp[i], dp[j] + 1)。

3）初始化

```java
dp[0] = 1;  // 最少为1，可以全部初始化为1
```

4）返回值

dp 数组的最大值就是答案。

我们可以遍历 dp 数组，或者更新的时候比较就行。

## 实现

```java
    public int lengthOfLIS(int[] nums) {
        int n = nums.length;
        int[] dp = new int[n];
        int maxLen = 1;
        Arrays.fill(dp, 1);

        // 循环
        for(int i = 1; i < n; i++) {
            for(int j = 0; j < i; j++) {
                // 如果 nums[j] < nums[i]，说明可以接在 nums[j] 后面，
                // 那么 dp[i] = max(dp[i], dp[j] + 1)。
                if(nums[j] < nums[i]) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);

                    maxLen = Math.max(dp[i], maxLen);
                }
            }
        }
    
        return maxLen;
    }
```

## 结果

64ms 击败 27.03%

## 复杂度

TC: O(n²)

## 反思

可以更快吗？

# v2-贪心 + 二分

## 思路

老马感觉这个比较难以想到。

这个解法的核心在于 贪心 + 二分，本质还是 DP，只不过我们不再用 O(n²) 的方式更新 dp[i]，而是把 状态压缩到一个数组 sub。

dp[i]（在优化版中就是 sub[i]）不再表示以 nums[i] 结尾的 LIS 长度

而是表示 长度为 i+1 的递增子序列的最小末尾元素

为什么要存“最小末尾元素”？**保证同样长度的序列中，末尾元素越小，后续能接上的新元素越多**

## 核心流程

维护一个数组 sub（长度就是 LIS 长度），末尾尽量小

遍历每个元素：

比 sub 最后一个大 → append

否则 → 替换 sub 中第一个大于等于它的位置

复杂度：O(n log n)

## 解法

```java
public int lengthOfLIS(int[] nums) {
    int n = nums.length;
    if (n == 0) return 0;

    int[] sub = new int[n];
    int len = 0; // 当前 sub 的长度

    for (int x : nums) {
        // 二分查找 sub 中第一个 >= x 的位置
        int i = 0, j = len;
        while (i < j) {
            int mid = i + (j - i) / 2;
            if (sub[mid] < x) {
                i = mid + 1;
            } else {
                j = mid;
            }
        }

        sub[i] = x;
        if (i == len) len++; // 新元素比所有都大，长度增加
    }

    return len;
}
```

## 效果

2ms 击败 99.72%

## 反思

这个解法感觉不是很好想到，可以作为一个思路。

# 开源项目

为方便大家学习，所有相关文档和代码均已开源。

[leetcode-visual 资源可视化](https://github.com/houbb/leetcode-visual)

[leetcode 算法实现源码](https://github.com/houbb/leetcode)

[leetcode 刷题学习笔记](https://github.com/houbb/leetcode-notes)

[老马技术博客](https://houbb.github.io/)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解力扣经典，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}