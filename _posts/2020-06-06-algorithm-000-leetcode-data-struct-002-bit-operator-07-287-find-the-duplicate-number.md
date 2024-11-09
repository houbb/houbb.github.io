---
layout: post
title: leetcode 002-leetcode.287 find-the-duplicate-number 力扣.287 寻找重复数
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, bit-operator, sf]
published: true
---

# 题目

给定一个包含 n + 1 个整数的数组 nums ，其数字都在 [1, n] 范围内（包括 1 和 n），可知至少存在一个重复的整数。

假设 nums 只有 一个重复的整数 ，返回 这个重复的数 。

你设计的解决方案必须 不修改 数组 nums 且只用常量级 O(1) 的额外空间。


示例 1：

输入：nums = [1,3,4,2,2]
输出：2

示例 2：

输入：nums = [3,1,3,4,2]
输出：3

示例 3 :

输入：nums = [3,3,3,3,3]
输出：3
 


提示：

1 <= n <= 10^5

nums.length == n + 1

1 <= nums[i] <= n

nums 中 只有一个整数 出现 两次或多次 ，其余整数均只出现 一次
 

进阶：

如何证明 nums 中至少存在一个重复的数字?

你可以设计一个线性级时间复杂度 O(n) 的解决方案吗？

# v1-HashMap/HashSet

## 思路

通过 Hash 判断元素是否已经存在过，和前面的题目类似。

## 实现

```java
public int findDuplicate(int[] nums) {
    Set<Integer> set = new HashSet<>();
    for(int i = 0; i < nums.length; i++){
        int num = nums[i];
        if(set.contains(num)) {
            return num;
        }
        set.add(num);
    }
    return -1;
}
```

## 效果

20ms 37.19%

效果一般

## 小结

思路不算难 Hash 在这个系列的适用性特别广。

其实这个复杂度就是 O(n)

# v2-排序的思路

## 思路

很自然的想到，比较我们应该先做一个排序。

然后再比较，和下一个相等就存在。


## 代码

```java
public int findDuplicate(int[] nums) {
    Arrays.sort(nums);
    for(int i = 0; i < nums.length-1; i++){
        if(nums[i] == nums[i+1]) {
             return nums[i];
        }
    }
    return -1;
}
```

## 效果

36ms  9.92%

效果竟然比较差，估计是用例的问题。

# v3-其他解法

看了下官方题解，都是二分法，快慢指针、二进制。

什么神奇的脑回路，完全 GET 不到。哈哈哈

* any list
{:toc}