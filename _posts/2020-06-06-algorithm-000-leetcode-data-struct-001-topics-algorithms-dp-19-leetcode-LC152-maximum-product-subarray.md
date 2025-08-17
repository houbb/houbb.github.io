---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 11-LC152. 乘积最大子数组 maximum-product-subarray
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下乘积最大子数组

# LC152. 乘积最大子数组 maximum-product-subarray

给你一个整数数组 nums ，请你找出数组中乘积最大的非空连续 子数组（该子数组中至少包含一个数字），并返回该子数组所对应的乘积。

测试用例的答案是一个 32-位 整数。

 

示例 1:

输入: nums = [2,3,-2,4]
输出: 6
解释: 子数组 [2,3] 有最大乘积 6。
示例 2:

输入: nums = [-2,0,-1]
输出: 0
解释: 结果不能为 2, 因为 [-2,-1] 不是子数组。
 

提示:

1 <= nums.length <= 2 * 104
-10 <= nums[i] <= 10
nums 的任何子数组的乘积都 保证 是一个 32-位 整数


# v0-DP

## 思路

数组中有负数和零，我们必须要考虑负数

这是最常见的解法，先放在开始。

1. **负数的影响**

   * 乘积遇到负数会翻转符号
   * 所以 **最大乘积可能来自前面的最小乘积** × 当前负数
   * 同理，最小乘积可能来自前面的最大乘积 × 当前负数

2. **动态规划（DP）**
   我们维护两个状态：

   * `maxProd[i]`：以 `nums[i]` 结尾的子数组最大乘积
   * `minProd[i]`：以 `nums[i]` 结尾的子数组最小乘积

3. **状态转移方程**

```java
maxProd[i] = max(nums[i], nums[i] * maxProd[i-1], nums[i] * minProd[i-1])
minProd[i] = min(nums[i], nums[i] * maxProd[i-1], nums[i] * minProd[i-1])
```

* 如果 `nums[i]` 为负数，`maxProd[i]` 可能由 `minProd[i-1] * nums[i]` 得到
* 如果 `nums[i]` 为正数，`maxProd[i]` 可能由 `maxProd[i-1] * nums[i]` 得到
* 如果 `nums[i]` 为零，最大/最小都重置为 `nums[i] = 0`

4. **最终答案**

   * 遍历数组，每一步记录 `maxProd[i]` 的全局最大值


## 个人理解

其实方程3可以写的简单一些，就是我们不考虑 nums 的各种场景。

直接用两个方程去找就行。

可以自定义一个 min max 方法

这个实现还是很好理解的

## java

```java
    public int maxProduct(int[] nums) {
        int n = nums.length;
        long[] minProds = new long[n];
        long[] maxProds = new long[n];
        minProds[0] = nums[0];
        maxProds[0] = nums[0];
        long max = nums[0];

        for(int i = 1; i < n; i++) {
            int cur = nums[i];

            // cur * 最大  || cur * 最小
            long preMax = cur * maxProds[i-1];
            long preMin = cur * minProds[i-1];

            minProds[i] = min(cur, preMax, preMin);
            maxProds[i] = max(cur, preMax, preMin);

            max = Math.max(max, maxProds[i]);
        }

        return (int)max;
    }   

    private long max(long num1, long num2, long num3) {
        long res = num1;
        if(num2 > res) {
            res = num2;
        }
        if(num3 > res) {
            res = num3;
        }
        return res;
    }

    private long min(long num1, long num2, long num3) {
        long res = num1;
        if(num2 < res) {
            res = num2;
        }
        if(num3 < res) {
            res = num3;
        }
        return res;
    }
```

## 效果

2ms 击败 72.91%

# v1-暴力

## 思路

穷举所有可能的连续乘积，找到最大的那一个。

我们尝试不用 dp 来解决。

## 实现

```java
    public int maxProduct(int[] nums) {
        // 任意两个位置的乘积        
        long max = nums[0];
        int n = nums.length;
        for(int i = 0; i < n; i++) {
            for(int j = i; j < n; j++) {
                long temp = calc(nums, i, j);
                max = Math.max(max, temp);
            }
        }

        return (int)max;
    }   

    private long calc(int[] nums, int start, int end) {
        long res = 1;
        for(int i = start; i <= end; i++) {
            if(nums[i] == 0) {
                return 0;    
            }
            
            res *= nums[i];
        }

        return res;
    }
```

## 结果

超出时间限制
186 / 190 个通过的测试用例

## 复杂度

TC: O(n²) 遍历，calc 也是 O(n)，整体是 O(n^3)

## 反思

calc 可以进一步提升吗？

# v2-前缀乘积

## 思路

如果我们能把 calc 提升到 O(1) 的话？

使用前缀乘积的话。

## 实现

一个支持 zero 的实现方式。

```java
    class PrefixProductWithZero {
        private long[] prefix;
        private int[] nums;
        private List<Integer> zeroPos;

        public PrefixProductWithZero(int[] nums) {
            this.nums = nums;
            prefix = new long[nums.length];
            zeroPos = new ArrayList<>();
            long prod = 1;
            for (int i = 0; i < nums.length; i++) {
                if (nums[i] == 0) {
                    zeroPos.add(i);
                    prod = 1;
                    prefix[i] = 1; // 对于0，用1占位
                } else {
                    prod *= nums[i];
                    prefix[i] = prod;
                }
            }
        }

        public long query(int i, int j) {
            // 用二分查找 zeroPos 是否在 [i..j]
            int l = 0, r = zeroPos.size() - 1;
            while (l <= r) {
                int m = (l + r) / 2;
                if (zeroPos.get(m) < i) l = m + 1;
                else if (zeroPos.get(m) > j) r = m - 1;
                else return 0; // 区间内有0
            }
            if (i == 0) return prefix[j];
            return prefix[j] / prefix[i - 1];
        }
    }
```

## 实现

calc 改为用这个实现。

## 效果

超出时间限制
187 / 190 个通过的测试用例


# v3-前缀乘积 + 双向扫描

## 思路

乘积最大子数组的问题之所以复杂，是因为：

1）负数会翻转乘积符号

偶数个负数 → 乘积为正 → 有可能是最大值

奇数个负数 → 乘积为负 → 可能错过最大值

2）零会把乘积断开

零把数组拆成多个段，最大乘积一定在某一段内

所以如果只做 单向扫描，可能错过某些 奇数个负数的情况。

那如果我们前后夹击呢？

反向扫描，就可以解决这个问题。

## 实现

```java
    public int maxProduct(int[] nums) {
        int n = nums.length;

        int max = nums[0];
        int product = 1;
        // 正
        for(int i = 0; i < n; i++) {
            product *= nums[i];
            max = Math.max(product, max);
            if(nums[i] == 0) {
                product = 1;
            } 
        }

        // 逆序
        product = 1;
        for(int i = n-1; i > 0; i--) {
            product *= nums[i];
            max = Math.max(product, max);
            if(nums[i] == 0) {
                product = 1;
            }
        }

        return max;
    }   
```

## 效果

0ms 100%

## 反思

巧妙！




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