---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 11-LC674. 最长连续递增序列 longest-continuous-increasing-subsequence
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下最长连续递增序列

# 类似题目

> [128. 最长连续序列](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-topics-techniques-hash-02-leetcode-top100-LC128)

# LC674. 最长连续递增序列 longest-continuous-increasing-subsequence

给定一个未经排序的整数数组，找到最长且 连续递增的子序列，并返回该序列的长度。

连续递增的子序列 可以由两个下标 l 和 r（l < r）确定，如果对于每个 l <= i < r，都有 nums[i] < nums[i + 1] ，那么子序列 [nums[l], nums[l + 1], ..., nums[r - 1], nums[r]] 就是连续递增子序列。

示例 1：

输入：nums = [1,3,5,4,7]
输出：3
解释：最长连续递增序列是 [1,3,5], 长度为3。
尽管 [1,3,5,7] 也是升序的子序列, 但它不是连续的，因为 5 和 7 在原数组里被 4 隔开。 

示例 2：

输入：nums = [2,2,2,2,2]
输出：1
解释：最长连续递增序列是 [2], 长度为1。
 
提示：

1 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9



# v1-暴力

## 思路

遍历所有可能的 [i,j]，记录最长的满足的长度

## 实现

```java
public int findLengthOfLCIS(int[] nums) {
        int maxLen = 1;
        int n = nums.length; 
        for(int i = 0; i < n; i++) {
            for(int j = i+1; j < n; j++) {
                boolean valid = isValid(nums, i, j);

                if(valid) {
                    maxLen = Math.max(maxLen, j-i+1);
                }
            }
        }
        return maxLen;
    }

    private boolean isValid(int[] nums, int left, int right) {
        if(left == right) {
            return true;
        }

        // 每一个都要比后面的小
        for(int i = left; i < right; i++) {
            if(nums[i] >= nums[i+1]) {
                return false;
            }
        }
        return true;
    }
```

## 效果

超出时间限制
33 / 35 个通过的测试用例

## 复杂度

O(n²) 检查区间，O(n³) 如果像你原来那样写 isValid()。

## 反思

如何改进呢？

# v2-双指针

## 思路

其实没必要这么麻烦， 我们用 left right 两个指针。

left = 0;

如果遍历时不满足严格递增，那么 left = right 的最新位置。

实时计算最大值即可。

## 实现

```java
public int findLengthOfLCIS(int[] nums) {
        int maxLen = 1;
        int n = nums.length;
        int left = 0; 
        for(int right = 1; right < n; right++) {
            // 是否满足
            if(nums[right] <= nums[right-1]) {
                left = right;
            }
            
            maxLen = Math.max(maxLen, right-left+1);
        }
        return maxLen;
    }
```

## 效果

1ms  99.35%

## 复杂度

O(n)


# v3-贪心

## 思路

其实和 v2 类似，只不过我们改成一个变量 maxLen，和一个 curLen;

不符合就重置。

## 实现

```java
 public int findLengthOfLCIS(int[] nums) {
        int maxLen = 1;
        int n = nums.length;
        int cur = 1; 
        for(int i = 1; i < n; i++) {
            // 是否满足
            if(nums[i] <= nums[i-1]) {
                cur = 1;
            } else {
                cur++;

                maxLen = Math.max(maxLen, cur);
            }
        }
        return maxLen;
    }
```


## 效果

1ms  99.35%

## 复杂度

O(n)

# v4-dp

## 思路

1) 状态定义

dp[i] = 以 nums[i] 结尾的最长连续递增子序列长度

2） 转移方程：

如果 nums[i] > nums[i-1] → dp[i] = dp[i-1] + 1

否则 dp[i] = 1

3） 初始化

```java
dp[0] = 1;
```


复杂度：O(n)，只是比贪心多用了一个数组。

4) 返回值

遍历找到最长的一个


## 解法

```java
public int findLengthOfLCIS(int[] nums) {
    int n = nums.length;
    if (n == 0) return 0;

    int[] dp = new int[n];
    dp[0] = 1;
    int maxLen = 1;

    for (int i = 1; i < n; i++) {
        if (nums[i] > nums[i-1]) {
            dp[i] = dp[i-1] + 1;
        } else {
            dp[i] = 1;
        }
        maxLen = Math.max(maxLen, dp[i]);
    }
    return maxLen;
}
```

## 效果

2ms 击败 41.57%

## 反思

这个场景没必要 dp

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