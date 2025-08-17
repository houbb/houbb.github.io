---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 11-LC416. 分割等和子集  partition-equal-subset-sum
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下分割等和子集

# LC416. 分割等和子集  partition-equal-subset-sum

给你一个 只包含正整数 的 非空 数组 nums 。

请你判断是否可以将这个数组分割成两个子集，使得两个子集的元素和相等。

示例 1：

输入：nums = [1,5,11,5]
输出：true
解释：数组可以分割成 [1, 5, 5] 和 [11] 。
示例 2：

输入：nums = [1,2,3,5]
输出：false
解释：数组不能分割成两个元素和相等的子集。
 

提示：

1 <= nums.length <= 200
1 <= nums[i] <= 100

# v1-回溯

## 思路

我们首先计算 sum

1）sum % 2 != 0，直接返回 false

2) 尝试拆分为 2 个

如何拆分呢？

其实也就是从真个数组中找和等于 sum / 2 的数字，不是吗？

暴力就是尝试所有的可能性。

## 实现

```java
    public boolean canPartition(int[] nums) {
        int sum = 0;
        int n = nums.length;
        for(int i = 0; i < n; i++) {
            sum += nums[i];
        }
        if(sum % 2 != 0) {
            return false;
        }

        int target = sum / 2;

        return backtrack(nums, 0, target);
    }

    private boolean backtrack(int[] nums, int start, int target) {
        if (target == 0) return true;
        if (target < 0) return false;

        for (int i = start; i < nums.length; i++) {
            if (backtrack(nums, i + 1, target - nums[i])) {
                return true;
            }
        }

        return false;
    }
```

## 结果

超出时间限制
39 / 147 个通过的测试用例

## 反思

为什么这么慢？

能够改进吗？

## 改进-排序

### 思路

我们针对 nums 做一下排序。

这样的好处是，如果数字相同，我们可以跳过尝试。

### 实现

```java
    public boolean canPartition(int[] nums) {
        int sum = 0;
        int n = nums.length;
        for(int i = 0; i < n; i++) {
            sum += nums[i];
        }
        if(sum % 2 != 0) {
            return false;
        }

        int target = sum / 2;
        Arrays.sort(nums);

        return backtrack(nums, 0, target);
    }

    private boolean backtrack(int[] nums, int start, int target) {
        if (target == 0) return true;
        if (target < 0) return false;

        for (int i = start; i < nums.length; i++) {
            // 剪枝：跳过重复数字（防止同层重复尝试）
            if (i > start && nums[i] == nums[i - 1]) continue;

            if (backtrack(nums, i + 1, target - nums[i])) {
                return true;
            }
        }

        return false;
    }
```

### 效果 

超出时间限制
40 / 147 个通过的测试用例

### 反思

此路不通

## 优化2-逆序

### 思路

逆序之后，一般可以更快找到结果。

因为需要的元素更少。

### 实现

```java
    public boolean canPartition(int[] nums) {
        int n = nums.length;
        int sum = 0;
        for (int i = 0; i < n; ++i) {
            sum += nums[i];
        }
        if (sum % 2 == 1)
            return false;
        sum /= 2;
        Arrays.sort(nums);
        
        return func(nums, sum, n - 1);
    }

    public boolean func(int[] nums, int target, int end) {
        for (int i = end; i >= 0; --i) {
            if (target < nums[i])
                continue;
            if ((i != end) && (nums[i] == nums[i + 1]))
                return false;

            if (target == nums[i])
                return true;

            if (func(nums, target - nums[i], i - 1))
                return true;
        }
        return false;
    }
```

### 效果

2ms 击败 99.99%

### 反思

效果拔群

# v2-DP

解决这道题之前，我们首先要学习个知识点。

## 0-1背包问题

LC416 的 DP 本质就是 0-1 背包问题，可以这样理解：

也就是对待一个东西：选择还是不选择的问题。

### 1问题对比 0-1 背包

0-1 背包问题标准定义：

* 给定 n 个物品，每个物品有重量 `w[i]`
* 背包容量为 `C`
* 问：能否选一些物品，恰好填满背包容量 或 最大化价值

LC416 转化为背包：

| 0-1 背包概念    | LC416 对应               |
| ----------- | ---------------------- |
| 物品重量 `w[i]` | 数组元素 `nums[i]`         |
| 背包容量 `C`    | `target = sum(nums)/2` |
| 是否能装满背包     | 是否存在子集和 = target       |
| 每个物品只能用一次   | 每个数字只能选一次              |

所以，LC416 就是一个典型的 0-1 背包“是否能凑出指定容量”问题。

### 2DP 状态定义（0-1 背包模板）

* 二维 DP：

```
dp[i][j] = 前 i 个数字能否凑出和为 j
```

* 一维 DP（空间优化）：

```
dp[j] = 是否可以凑出和为 j
```

* 转移公式：

```
dp[j] = dp[j] || dp[j - nums[i]];   //(j >= nums[i])
```

* 顺序：外层循环物品，内层倒序循环容量，保证每个物品只用一次

## 思路

dp 的 5 步：

| 步骤  | 本质解释                                               |
| --- | -------------------------------------------------- |
| 状态  | `dp[i][j]` → 前 i 个数字能否凑出和为 j                       |
| 初始化 | `dp[0][0] = true` → 空集凑出 0，其他 false                |
| 转移  | 不选 i → `dp[i-1][j]`，选 i → `dp[i-1][j - nums[i-1]]` |
| 遍历  | 外层物品，内层目标和                                         |
| 返回  | `dp[n][target]` → 整个数组能否凑出 target                  |

## 实现

```java
public boolean canPartition(int[] nums) {
        int sum = 0;
        int n = nums.length;
        for(int i = 0; i < n; i++) {
            sum += nums[i];
        }
        if(sum % 2 != 0) {
            return false;
        }
        int target = sum / 2;
        
        // 转换为0-1 背包
        boolean[][] dp = new boolean[n+1][target+1];
        dp[0][0] = true;

        // 迭代
        for(int i = 1; i <= n; i++) {
            for(int j = 0; j <= target; j++) {
                // 目标值大于等于物品，
                if(j >= nums[i-1]) {
                    // dp[i-1][j] 不选择
                    // dp[i-1][j - nums[i-1]] 选择当前数字 如果能凑出 j - nums[i-1]，加上当前数字，就能凑出 j
                    dp[i][j] = dp[i-1][j] || dp[i-1][j - nums[i-1]];
                } else {
                    // 目标和太小，不能选当前数字
                    // 只能继承前 i-1 的结果
                    dp[i][j] = dp[i-1][j];
                }
            }
        }
        return dp[n][target];    
}
```

## 效果

56ms 击败 9.20%



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