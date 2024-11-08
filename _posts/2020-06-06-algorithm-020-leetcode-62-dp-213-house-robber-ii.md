---
layout: post
title:  【leetcode】62-213. house-robber-ii  力扣 213. 打家劫舍 II  dynamic-programming
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, dp, dynamic-programming, leetcode]
published: true
---

# 题目

你是一个专业的小偷，计划偷窃沿街的房屋，每间房内都藏有一定的现金。这个地方所有的房屋都 围成一圈 ，这意味着第一个房屋和最后一个房屋是紧挨着的。同时，相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警 。

给定一个代表每个房屋存放金额的非负整数数组，计算你 在不触动警报装置的情况下 ，今晚能够偷窃到的最高金额。

 

示例 1：

输入：nums = [2,3,2]
输出：3
解释：你不能先偷窃 1 号房屋（金额 = 2），然后偷窃 3 号房屋（金额 = 2）, 因为他们是相邻的。
示例 2：

输入：nums = [1,2,3,1]
输出：4
解释：你可以先偷窃 1 号房屋（金额 = 1），然后偷窃 3 号房屋（金额 = 3）。
     偷窃到的最高金额 = 1 + 3 = 4 。
示例 3：

输入：nums = [1,2,3]
输出：3
 

提示：

1 <= nums.length <= 100
0 <= nums[i] <= 1000

# v1-dp

## 这一题还上一题的区别

最大的区别在于房间是环形的。

所以 nums[0] 和 nums[n-1] 开始与最后的房间认为是相连的，所以不能同时偷。

所以偷取的范围也发生了变化：

1. nums[0]-nums[n-2]

2. nums[1]-nums[n-1]

这会影响什么呢？

难道因为两个场景，还要分别写 2 遍？



## 个人思路

每一个房间都有 2 个选择：偷还是不偷。

可以拆分为两个数组。

rob[] 偷当前的房间
notRob[] 不偷当前的房间

### 初始化

```
// 第一个房间选择偷，财富默认为第一个房间
rob[0] = nums[0];
// 第一个房间选择不偷，财富默认为0
notRob[0] = 0;
```

递推公式：

// 当前的房间为 i
// 如果当前房间选择偷 那么上一个房间一定不能偷，否则会触发报警。 
// 上一次选择偷的房间是 rob[i-2] 

这一次是选择偷呢？还是不偷呢？

```java
// 选择偷
// 1. 上一个房间必须不能偷+当前的
// a. 上一个房间没偷的+当前 
// b. 上一个房间偷的对比  
rob[i] = Math.max(notRob[i-1]+nums[i], rob[i-1]);

// 选择不偷
//2. 不偷有两种可能性
//2.a 上一个房间没偷
//2.b 上一个房间偷了
notRob[i] = Math.max(notRob[i-1], rob[i-1]);
```

### 结果

直接取二者的最大值。


## 完整代码

```java
class Solution {
    
    public int rob(int[] nums) {
        // 拆分为两个场景
        // 0 ... n-2
        // 1 ... n-1
        final int n = nums.length;

        // 长度为1
        if(n == 1) {
           return nums[0];     
        }
        int maxZero = robAll(Arrays.copyOfRange(nums, 0, n-1));
        int maxOne = robAll(Arrays.copyOfRange(nums, 1, n));
        return Math.max(maxOne, maxZero);
    }

    public int robAll(int[] nums) {
        final int n = nums.length;
        int rob[] = new int[n];
        int notRob[] = new int[n];

        rob[0] = nums[0];
        notRob[0] = 0;

        // 遍历
        // 这里其实已经固定选择偷第一个了
        int maxResult = nums[0];
        for(int i = 1; i < n; i++) {
            // 选择偷
            // 1. 上一个房间必须不能偷+当前的
            // a. 上一个房间没偷的+当前
            // b. 上一个房间偷的对比
            rob[i] = Math.max(notRob[i-1]+nums[i], rob[i-1]);

            // 选择不偷
            //2. 不偷有两种可能性
            //2.a 上一个房间没偷
            //2.b 上一个房间偷了
            notRob[i] = Math.max(notRob[i-1], rob[i-1]);

            // 取最大值
            maxResult = Math.max(rob[i], notRob[i]);
        }
        return maxResult;
    }

}
```

## 效果

0ms 100%

效果拔群

## 小结 

这一题和上一题基本上是一样的。

区别就是把环拆分为 2 个子数组，然后复用上一题的解法。

这样，可以让实现变得非常简单。

DP 的性能一直没话说，最主要是要考虑清楚几个点：

1）数据初始化

2）递推公式

3）最大值的对比获取+返回

最难的是递推公式的获取。

当然还可以做内存的压缩改进。

# 参考资料

https://leetcode.cn/problems/house-robber/description/?envType=problem-list-v2&envId=dynamic-programming

* any list
{:toc}