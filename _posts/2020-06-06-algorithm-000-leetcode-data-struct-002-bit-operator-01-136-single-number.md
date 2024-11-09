---
layout: post
title: leetcode 002-leetcode.136 single-number 力扣.136 只出现一次的数字
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, bit-operator, sf]
published: true
---


# 题目

给你一个 非空 整数数组 nums ，除了某个元素只出现一次以外，其余每个元素均出现两次。

找出那个只出现了一次的元素。

你必须设计并实现线性时间复杂度的算法来解决此问题，且该算法只使用常量额外空间。

示例 1 ：

输入：nums = [2,2,1]
输出：1
示例 2 ：

输入：nums = [4,1,2,1,2]
输出：4
示例 3 ：

输入：nums = [1]
输出：1
 

提示：

1 <= nums.length <= 3 * 10^4
-3 * 104 <= nums[i] <= 3 * 10^4

除了某个元素只出现一次以外，其余每个元素均出现两次。

# v1-基本解法

## 思路

通过 HashMap 记录每一个元素出现的次数，然后找到为1的。

## 实现

```java
class Solution {
    public int singleNumber(int[] nums) {
        // 需要存储对应的历史数据
        // 如果不是位运算这种技巧 那么使用 HashMap 最方便

        Map<Integer, Integer> countMap = new HashMap<>();
        for(int num : nums){
            countMap.put(num, countMap.getOrDefault(num, 0) +1);
        }

        // 找到 values 为1 的数据
        for(Map.Entry<Integer, Integer> entry : countMap.entrySet()) {
            int count = entry.getValue();
            if(count == 1) {
                return entry.getKey();
            }
        }

        return 0;
    }
}
```

## 效果

```
16ms 5.96%
```

效果比较差。

# v2-两次的改进

## 思路

一个元素出现了两次，那么可以通过 Set 记录每一个数字。

1. 不存在时，加入

2. 存在后，移除

因为其他的元素成对出现，那么剩下的就是结果。

## 实现

```java
public int singleNumber(int[] nums) {
    // 需要存储对应的历史数据
    // 如果不是位运算这种技巧 那么使用 HashMap 最方便
    Set<Integer> set = new HashSet<>();
    for(int num : nums){
        if(set.contains(num)) {
            set.remove(num);
        }else {
            set.add(num);
        }
    }
    for(Integer num : set) {
        return num;
    }
    return 0;
}
```

## 效果

11ms 11.42%

一般般。

# v3-位运算

## 位运算

位运算对于这种成本出现的性能其实非常好。

## 异或

异或的性质是：相同的数字异或结果为 0，0 和任何数字异或结果为该数字本身。

所以异或所有元素，最后的结果就是那个只出现一次的数字。

## 实现

```java
public int singleNumber(int[] nums) {
    int result = 0;
    for(int num : nums){
        result ^= num;
    }
    return result;
}
```

## 效果

```
1ms 98%
```

效果拔群

## 小结

这个有一个要求 就是我们必须要能想到这个异或的计算技巧。

* any list
{:toc}