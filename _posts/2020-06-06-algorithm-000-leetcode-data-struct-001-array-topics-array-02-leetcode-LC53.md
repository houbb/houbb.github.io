---
layout: post
title:  【leetcode】力扣 数组 array-02-53. 最大子数组和 maximum-subarray
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 53. 最大子数组和

给你一个整数数组 nums ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

子数组是数组中的一个连续部分。

示例 1：

输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大，为 6 。

示例 2：

输入：nums = [1]
输出：1

示例 3：

输入：nums = [5,4,-1,7,8]
输出：23
 

提示：

1 <= nums.length <= 10^5
-10^4 <= nums[i] <= 10^4
 

进阶：如果你已经实现复杂度为 O(n) 的解法，尝试使用更为精妙的 分治法 求解。

# 回顾

这一题的前几个解法，和 [leetcode 数组专题之子串 LC560 和为 K 的子数组](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-topics-string-substring-02-leetcode-01-LC560) 非常类似。

# v1-暴力

## 思路

最简单的思维，累加

## 实现

```java
   public int maxSubArray(int[] nums) {
        final int n = nums.length;
        int max = Integer.MIN_VALUE;

        for(int i = 0; i < n; i++) {
            for(int j = i; j < n; j++) {
                // 求和
                int sum = sum(i, j, nums);
                if(sum > max) {
                    max = sum;
                }
            }
        }
        return max;
    }

    private int sum(int startIx, int endIx, int[] nums) {
        int sum = 0;
        for(int i = startIx; i <= endIx; i++) {
            sum += nums[i];
        }
        return sum;
    }
```

## 效果

超出时间限制
200 / 210 个通过的测试用例

TC: O(n^3)

# v2-暴力改进

## 思路

没必要每次都从 i...j 重新加一遍

## 解法

```java
public int maxSubArray(int[] nums) {
        final int n = nums.length;
        int max = Integer.MIN_VALUE;

        for(int i = 0; i < n; i++) {
            int sum = 0;
            for(int j = i; j < n; j++) {
                // 本身就是从i开始累加一遍
                sum += nums[j];

                if(sum > max) {
                    max = sum;
                }
            }
        }
        return max;
    }
```

## 效果

超出时间限制
205 / 210 个通过的测试用例

# v3-前缀和

## 思路

同样的，既然是计算 i..j 的连续累加和，自然也可以改造为前缀和的版本。

## 实现

```java
   public int maxSubArray(int[] nums) {
        final int n = nums.length;
        int max = Integer.MIN_VALUE;

        int[] prefixSum = new int[n + 1];
        prefixSum[0] = 0;
        for (int i = 0; i < n; i++) {
            prefixSum[i + 1] = prefixSum[i] + nums[i];
        }

        for (int i = 0; i < n; i++) {
            int sum = 0;
            for (int j = i; j < n; j++) {
                // 本身就是从i开始累加一遍
                sum = prefixSum[j+1] - prefixSum[i];

                if (sum > max) {
                    max = sum;
                }
            }
        }
        return max;
    }
```

## 效果

和 v2 类似

超出时间限制

204 / 210 个通过的测试用例

# v4-前缀和优化

## 思路

之所以写前缀和，是为了在基础上优化。

固定 j，找 i 满足 `prefixSum[j+1] - prefixSum[i]` 最大 ➜ 即 `prefixSum[i]` 最小

所以对于每个 j，你只要找到：`minPrefixSum = min(prefixSum[0..j])` 

就可算出 `maxSum = max(maxSum, prefixSum[j+1] - minPrefixSum);`

就这样水灵灵的 TC 降低到了 O(n)

## 实现

```java
public int maxSubArray(int[] nums) {
        final int n = nums.length;
        int[] prefixSum = new int[n + 1];
        prefixSum[0] = 0;
        for (int i = 0; i < n; i++) {
            prefixSum[i + 1] = prefixSum[i] + nums[i];
        }

        int maxSum = Integer.MIN_VALUE;
        int minPrefixSum = prefixSum[0]; // 一开始是 prefixSum[0] = 0
        for (int j = 0; j < n; j++) {
            // 本身就是从i开始累加一遍
            int currentSum = prefixSum[j+1];

            // 更新累加和最大值
            maxSum = Math.max(maxSum, currentSum - minPrefixSum);

            // 更新前缀和中的最小值
            minPrefixSum = Math.min(minPrefixSum, currentSum);
        }
        return maxSum;
    }
```

## 效果

2ms 37%

## 优化1-去掉前缀和数组

### 思路

和前面类似，我们 currentSum 就是从 0...j 一直连续累加，所以一个变量可以直接替代。

### 实现

```java
   public int maxSubArray(int[] nums) {
        final int n = nums.length;


        int maxSum = Integer.MIN_VALUE;
        int minPrefixSum = 0; // 一开始是 prefixSum[0] = 0
        int currentSum = 0;
        for (int j = 0; j < n; j++) {
            // 本身就是从i开始累加一遍
            currentSum += nums[j];

            // 更新累加和最大值
            maxSum = Math.max(maxSum, currentSum - minPrefixSum);

            // 更新前缀和中的最小值
            minPrefixSum = Math.min(minPrefixSum, currentSum);
           }
        return maxSum;
    }
```

### 效果

1ms 100%

### 反思

此时 TC O(n^2) SC: 1

可以说是双A的解法。

# v5-动态规划

## 思路

我们定义一个 dp[] 数组

1）初始化

```java
dp[0] = nums[0]
```

一个数就是第一个结果

2）状态转移方程

在 nums[i] 自己和 dp[i-1]+nums 中取最大值

```java
dp[i] = max(nums[i], dp[i-1]+nums[i])
   ```

3) 得出结果

不断更新最大值

还是 dp 好啊，找到转移方程是关键

## 效果

```java
public int maxSubArray(int[] nums) {
        final int n = nums.length;

        int[] dp = new int[n];
        dp[0] = nums[0];
        int maxSum = nums[0];

        for (int i = 1; i < n; i++) {
            dp[i] = Math.max(nums[i], dp[i-1]+nums[i]);

            maxSum = Math.max(maxSum, dp[i]);
        }
        return maxSum;
    }
```

## 效果

2ms 击败 37.01%

TC: O(n)

SC: O(n)

## 优化版本

### 思路

dp[] 数组其实用不到，我们只是存储了个上一次的最大值而已。

一个变量也足够了。

### 实现

```java
   public int maxSubArray(int[] nums) {
        final int n = nums.length;

        int dp = nums[0];
        int maxSum = nums[0];

        for (int i = 1; i < n; i++) {
            dp = Math.max(nums[i], dp+nums[i]);

            maxSum = Math.max(maxSum, dp);
        }
        return maxSum;
    }
```

### 效果

1ms 击败 100.00%

### 复杂度

TC: O(n)

SC: O(1)

双A解法。

# v6-分治法（Divide and Conquer）

## 思路

还有其他解法吗？

分治的思路大概如下：

把数组分为左右两半，最大子数组可能出现在：

1 左半边

2 右半边

3 横跨中间（跨过中点）

这个三个的最大值就是结果。

我们递归处理左边和右边，然后单独计算“跨中间”的最大子数组和。

这个类似于归并排序，思想最重要。

写法感觉比 DP 复杂太多，实际效果也一般。

## 实现

```java
public int maxSubArray(int[] nums) {
    return divide(nums, 0, nums.length - 1);
}

private int divide(int[] nums, int left, int right) {
    if (left == right) return nums[left]; // base case

    int mid = (left + right) / 2;

    int leftSum = divide(nums, left, mid);
    int rightSum = divide(nums, mid + 1, right);
    int crossSum = cross(nums, left, mid, right);

    return Math.max(Math.max(leftSum, rightSum), crossSum);
}

private int cross(int[] nums, int left, int mid, int right) {
    int leftMax = Integer.MIN_VALUE;
    int sum = 0;
    for (int i = mid; i >= left; i--) {
        sum += nums[i];
        leftMax = Math.max(leftMax, sum);
    }

    int rightMax = Integer.MIN_VALUE;
    sum = 0;
    for (int i = mid + 1; i <= right; i++) {
        sum += nums[i];
        rightMax = Math.max(rightMax, sum);
    }

    return leftMax + rightMax;
}
```

## 效果

15 ms 击败 3.58%

## 复杂度

TC：O(n log n)，每一层合并需要 O(n)，总共 log n 层

SC：O(log n)（递归栈）

## 改进？


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}