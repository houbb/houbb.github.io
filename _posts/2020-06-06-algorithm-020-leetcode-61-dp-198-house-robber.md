---
layout: post
title:  【leetcode】61-198. house-robber  力扣 198. 打家劫舍  dynamic-programming
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, dp, dynamic-programming, leetcode]
published: true
---

# 题目

你是一个专业的小偷，计划偷窃沿街的房屋。

每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。

给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃到的最高金额。

示例 1：

输入：[1,2,3,1]
输出：4

解释：偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。
     偷窃到的最高金额 = 1 + 3 = 4 。
示例 2：

输入：[2,7,9,3,1]
输出：12
解释：偷窃 1 号房屋 (金额 = 2), 偷窃 3 号房屋 (金额 = 9)，接着偷窃 5 号房屋 (金额 = 1)。
     偷窃到的最高金额 = 2 + 9 + 1 = 12 。
 

提示：

1 <= nums.length <= 100
0 <= nums[i] <= 400

# v1-dp

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
        final int n = nums.length;
        int rob[] = new int[n];
        int notRob[] = new int[n];

        rob[0] = nums[0];
        notRob[0] = 0;

        // 遍历
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