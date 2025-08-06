---
layout: post
title:  【leetcode】力扣 数组 array-02-LC238 除自身以外数组的乘积  product-of-array-except-self
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, top100, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# LC238. 除自身以外数组的乘积

给你一个整数数组 nums，返回 数组 answer ，其中 answer[i] 等于 nums 中除 nums[i] 之外其余各元素的乘积 。

题目数据 保证 数组 nums之中任意元素的全部前缀元素和后缀的乘积都在  32 位 整数范围内。

请 不要使用除法，且在 O(n) 时间复杂度内完成此题。

 

示例 1:

输入: nums = [1,2,3,4]
输出: [24,12,8,6]


示例 2:

输入: nums = [-1,1,0,-3,3]
输出: [0,0,9,0,0]
 

提示：

2 <= nums.length <= 10^5
-30 <= nums[i] <= 30
输入 保证 数组 answer[i] 在  32 位 整数范围内
 

进阶：你可以在 O(1) 的额外空间复杂度内完成这个题目吗？（ 出于对空间复杂度分析的目的，输出数组 不被视为 额外空间。）





# 历史版本

打过游戏的都知道，限制使用一个技能时，大概率我们要学会新的技能了。

> [【leetcode】48-product-of-array-except-self 力扣 238. 除自身以外的数组的乘积](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-48-prefix-sum-238-product-of-array-except-self)

# v1-暴力

## 思路

就算允许用除法，这一题还是要考虑清楚几个点：

1) 0 不能做除数

2）超过1个0，结果都是0

3）只有1个0，要看当前数字是否为0

4）其他正常处理

## 实现

```java
public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] results = new int[n];

        // 计算全部的乘积
        int sumMulti = 1;
        int zeroCount = 0;
        for(int num : nums) {
            if(num == 0) {
                zeroCount++;
            } else {
                sumMulti *= num;
            }
        }

        // 结果
        for(int i = 0; i < n; i++) {
            // 超过1个0，全是0
            if(zeroCount > 1) {
                results[i] = 0;
            } else if(zeroCount == 1 && nums[i] != 0) {
                results[i] = 0;
            } else if(zeroCount == 1 && nums[i] == 0) {
                results[i] = sumMulti;
            } else {
                results[i] = sumMulti / nums[i];
            }
        }
        return results;
    }
```

## 效果

1ms 击败 100.00%

## 反思

但是这个无意义，不符合题目要求。

写出来只是为了引出后续的实现。

# v2-前缀积+后缀积

## 思路

符合条件的结果是什么呢？

```
nums[1] * nums[2] * ... （排除 nums[i]） ...* nums[n-1]
```

也就是计算当前数 `nums[i]` 左边和右边的乘积。

这个也叫前缀积，后缀积。

和前缀和类似，我们用2个数组存储一下即可。

## 实现

```java
public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] prefix = new int[n];
        int[] suffix = new int[n];

        prefix[0] = 1;
        for(int i = 1; i < n; i++) {
            prefix[i] = prefix[i-1] * nums[i-1];
        }

        suffix[n-1] = 1;
        for(int i = n-2; i >= 0; i--) {
            suffix[i] = suffix[i+1] * nums[i+1];
        }

        int[] results = new int[n];
        for(int i = 0; i < n; i++) {
            results[i] = prefix[i] * suffix[i];
        }
        return results;
}
```

## 效果 

2ms 击败 83.12%

# v3-内存优化

## 思路

题目有一个要求，进阶：你可以在 O(1) 的额外空间复杂度内完成这个题目吗？

那么如何优化内存内？

我们原来用数组存储，实际上可以简化为用两个变量替代。

不过要注意下处理的情况

## 实现

```java
public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int prefix = 1;
        int suffix = 1;

        int[] results = new int[n];

        for(int i = 0; i < n; i++) {
            results[i] = prefix;

            prefix *= nums[i];
        }

        for(int i = n-1; i >= 0; i--) {
            results[i] *= suffix;
            suffix *= nums[i];
        }

        return results;
    }
```

## 效果

1ms 100%

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}