---
layout: post
title: leetcode 002-leetcode.217 contains-duplicate 力扣.217 存在重复的元素
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, sort, sf]
published: true
---


# 题目

给你一个整数数组 nums 。

如果任一值在数组中出现 至少两次 ，返回 true ；如果数组中每个元素互不相同，返回 false 。

示例 1：

输入：nums = [1,2,3,1]

输出：true

解释：

元素 1 在下标 0 和 3 出现。

示例 2：

输入：nums = [1,2,3,4]

输出：false

解释：

所有元素都不同。

示例 3：

输入：nums = [1,1,1,3,3,4,3,2,4,2]

输出：true

提示：

1 <= nums.length <= 10^5

-10^9 <= nums[i] <= 10^9

# 整体思路

这个系列的题目是一样的解法。

主要有几个思路：

1）HashMap 计数，这个应该很容易想到

2）利用 HashSet 去重，比如这里如果最后的 size 小于整体，则认为是满足。

3）排序 然后如果 nums[i] == nums[i+1]，则证明存在重复

4）位运算

个人其实非常喜欢前面 3 种解法，第三种应该是位运算之外最优的解法。

实用性很强，而且容易想到。

# v1-HashMap

## 思路

HashMap 计数，这个应该很容易想到

## 实现

```java
class Solution {
    public boolean containsDuplicate(int[] nums) {
        Map<Integer, Integer> countMap = new HashMap<>();
        for(int num : nums){
            countMap.put(num, countMap.getOrDefault(num, 0) +1);
        }

        for(Map.Entry<Integer, Integer> entry : countMap.entrySet()) {
            if(entry.getValue() != 1) {
                return true;
            }
        }

        return false;
    }
}
```

## 效果

```
31ms 5.06%
```

效果比较差。

# v2-set 去重

## 思路

通过 set，如果最后的 size 小于原始数组，则满足存在重复。

## 实现

```java
public boolean containsDuplicate(int[] nums) {
    Set<Integer> set = new HashSet<>();
    for(int num : nums){
        set.add(num);
    }
    return set.size() < nums.length;
}
```

## 效果

18ms 18.50%

有所提升

# v3-set 改进

## 思路

其实我们不需要等元素全部遍历一遍才返回。

我们判断包含后就直接返回。

## 代码

```java
public boolean containsDuplicate(int[] nums) {
    Set<Integer> set = new HashSet<>();
    for(int num : nums){
        if(set.contains(num)) {
            return true;
        }
        set.add(num);
    }
    return false;
}
```

## 效果

11ms 76.07%

效果还是不错的。

# v4-排序

## 思路

数字排序，重复时，则下一个元素和当前的元素相同。

## 实现

```java
class Solution {
     public boolean containsDuplicate(int[] nums) {
        Arrays.sort(nums);

        for(int i = 0; i < nums.length-1; i++){
            if(nums[i] == nums[i+1]) {
                return true;
            }
        }

        return false;
    }
}
```

## 效果 

19ms 35.43%

## 小结

其实也是不错的解法。

# v5-位运算

## 解题思路

如何通过位运算来解决这个问题呢？






## 小结


* any list
{:toc}