---
layout: post
title: leetcode 45 198. House Robber DP/动态规划
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, dp, sh]
published: true
---

# 198. House Robber

你是一名职业强盗，计划沿街抢劫房屋。

每个房子都藏有一定数量的钱，阻止你抢劫每个房子的唯一限制是相邻的房子有连接的安全系统，如果两个相邻的房子在同一晚被闯入，它会自动联系警察。

给定一个整数数组 nums，代表每个房子的金额，返回今晚在不报警的情况下可以抢劫的最大金额。

## EX

Example 1:

```
Input: nums = [1,2,3,1]
Output: 4
Explanation: Rob house 1 (money = 1) and then rob house 3 (money = 3).
Total amount you can rob = 1 + 3 = 4.
```

Example 2:

```
Input: nums = [2,7,9,3,1]
Output: 12
Explanation: Rob house 1 (money = 2), rob house 3 (money = 9) and rob house 5 (money = 1).
Total amount you can rob = 2 + 9 + 1 = 12.
```

## Constraints:

1 <= nums.length <= 100

0 <= nums[i] <= 400

# DP 的算法怎么解？

1. 查找递归关系

2. 递归（自上而下）

3. 递归+mem（自上而下）

4. 迭代+mem（自下而上）

5. 迭代 + N 个变量（自下而上）

## 核心

所有的 dp 问题，用递归的时候，最核心的问题就是找到递归关系。

用迭代的时候，就是寻找递推公式。

# V1-递归

## 递归关系

相邻的房子被偷盗，就会导致报警。

我们面对一个屋子 i，可以选择偷盗、或者不偷盗。

1）偷盗的话，

```
价值 = 当前屋子的偷盗价值 + 上一个屋子偷盗的价值 (i-2)
```

不能相邻，所以要看 i-2

2）不偷盗的话，当前获取为 0

```
价值 = 上一个屋子的偷盗价值(i-1)
```

可以相邻，看 i-1

选择最大价值：就是 2 个选择中的最大值作为结果。

递归终止条件：i < 0，返回 0。

## java 实现

```java
    public int rob(int[] nums) {
        return recursive(nums, nums.length-1);
    }

    private int recursive(int[] nums, int i) {
        if(i < 0) {
            return 0;
        }

        int robCur = recursive(nums, i-2) + nums[i];
        int notRobCur = recursive(nums, i-1);
        return Math.max(robCur, notRobCur);
    }
```

当然，这种算法会在 55 / 70 超时。

因为一直再重复计算。

# V2-递归+mem

## 思路

我们引入一个 mem 内存，缓存已经计算的结果，避免重复计算。

## 实现

```java
    public int rob(int[] nums) {
        Integer[] mem = new Integer[nums.length];

        return recursive(nums, nums.length-1, mem);
    }

    private int recursive(int[] nums, int i, Integer[] mem) {
        int result = 0;
        if(i < 0) {
            return result;
        }
        
        // 获取 cache
        if(mem[i] != null) {
            return mem[i];
        }

        int robCur = recursive(nums, i-2, mem) + nums[i];
        int notRobCur = recursive(nums, i-1, mem);

        result  = Math.max(robCur, notRobCur);

        // cache
        mem[i] = result;
        return result;
    }
```

耗时 0ms，超越 100%。

递归+mem 其实性能还是比较好的。

我们来看一下 dp 的方式，一般而言 dp 更加优雅，而且可以优化一下内存。

# V3-dp

## 思路

我们首先把递归改成迭代。

整体变动其实不大，mem 数组改为 dp 数组。

```java
dp[0] = 0;
dp[1] = nums[0];
```

递推公式：

我们从 i=1，开始遍历整个数组。

```java
dp[i+1] = Math.max(dp[i], dp[i-1], nums[i]);
```

本质是一样的，就是两种选择中的最大值。

## 实现

```java
    public int rob(int[] nums) {
        int[] dp = new int[nums.length + 1];
        dp[0] = 0;
        dp[1] = nums[0];

        // 从1开始，避免 i-1 越界。
        for(int i = 1; i < nums.length; i++) {
            dp[i+1] = Math.max(dp[i], dp[i-1] + nums[i]);
        }

        return dp[nums.length];
    }
```

# V3-dp+内存优化

## 思路

当然，如果我们再追求极致一些，dp 数组都是可以优化的。

递推公式 `dp[i+1] = Math.max(dp[i], dp[i-1] + nums[i]);` 中，实际上只会依赖 dp[i-1]、dp[i]。

所以使用 2 个变量就可以搞定。

## 实现

```java
    public int rob(int[] nums) {
        int pre1 = 0;
        int pre2 = 0;

        for(int val : nums) {
            int temp = pre1;
            pre1 = Math.max(pre1, pre2+val);
            pre2 = temp;
        }

        return pre1;
    }
```

# 213. 打家劫舍 II

你是一个专业的小偷，计划偷窃沿街的房屋，每间房内都藏有一定的现金。

**这个地方所有的房屋都围成一圈，这意味着第一个房屋和最后一个房屋是紧挨着的。**

同时，相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警 。

给定一个代表每个房屋存放金额的非负整数数组，计算你 在不触动警报装置的情况下 ，今晚能够偷窃到的最高金额。

## 例子

示例 1：

```
输入：nums = [2,3,2]
输出：3
解释：你不能先偷窃 1 号房屋（金额 = 2），然后偷窃 3 号房屋（金额 = 2）, 因为他们是相邻的。
```

示例 2：

```
输入：nums = [1,2,3,1]
输出：4
解释：你可以先偷窃 1 号房屋（金额 = 1），然后偷窃 3 号房屋（金额 = 3）。
     偷窃到的最高金额 = 1 + 3 = 4 。
```

示例 3：

```
输入：nums = [1,2,3]
输出：3
```

## 提示：

1 <= nums.length <= 100

0 <= nums[i] <= 1000

# V1-复用以前的算法

## 思路

这一题和前面的区别就在于屋子是环形排列的，首尾相连。

那么，应该如何解决呢？

如果有 10 个房子，a0, a1, ..., a9

那么有两种偷取的方式：

1）偷取 a0

a1、a9 和 a0 都紧挨着。

那么子问题变成如何在 a2, ..., a8 中获取最大收益。

2）不偷取 a0

那么子问题变成如何在 a1, ..., a9 中获取最大收益。

然后我们取两种场景的最大值即可。

## 实现

```java
public class T213_HouseRobberII {


    public int rob(int[] nums) {
        //rob0，从 2...-1 开始
        int sum1 = nums[0] + robNoCircle(getSubArray(nums, 2, nums.length-2));

        //not rob0
        int sum2 = robNoCircle(getSubArray(nums, 1, nums.length-1));

        return Math.max(sum1, sum2);
    }

    private int[] getSubArray(int[] nums,
                              int startIndex,
                              int endIndex) {
        if(endIndex < startIndex) {
            return new int[0];
        }

        int len = endIndex - startIndex + 1;
        int[] results = new int[len];
        int size = 0;
        for(int i = startIndex; i <= endIndex; i++) {
            results[size++] = nums[i];
        }
        return results;
    }

    // 无环时
    public int robNoCircle(int[] nums) {
        if(nums.length == 0) {
            return 0;
        }

        int[] dp = new int[nums.length + 1];
        dp[0] = 0;
        dp[1] = nums[0];

        // 从1开始，避免 i-1 越界。
        for(int i = 1; i < nums.length; i++) {
            dp[i+1] = Math.max(dp[i], dp[i-1] + nums[i]);
        }

        return dp[nums.length];
    }

}
```

# 参考资料

https://leetcode.com/problems/house-robber/description/

https://leetcode.com/problems/house-robber/solutions/156523/from-good-to-great-how-to-approach-most-of-dp-problems/

https://leetcode.cn/problems/house-robber-ii/

https://leetcode.com/problems/house-robber-ii/solutions/893957/python-just-use-house-robber-twice/?orderBy=most_votes

* any list
{:toc}