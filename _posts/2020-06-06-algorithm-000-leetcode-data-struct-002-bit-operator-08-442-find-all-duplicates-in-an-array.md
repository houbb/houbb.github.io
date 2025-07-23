---
layout: post
title: leetcode 002-leetcode.442 find-all-duplicates-in-an-array 力扣.442 数组中重复的数据
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, bit-operator, sf]
published: true
---

# 位运算专题

[Java Bit Operation-位运算基本概念介绍](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-002-bit-operator-00-base)

[Java Bit Operation-位运算类型转换](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-002-bit-operator-00-convert)

[leetcode bit operator 位运算入门介绍](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-002-bit-operator-00-intro)

[leetcode 002-leetcode.136 single-number 力扣.136 只出现一次的数字](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-002-bit-operator-01-136-single-number)

[leetcode 002-leetcode.137 single-number-ii 力扣.137 只出现一次的数字II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-002-bit-operator-02-137-single-number-ii)

[leetcode 002-leetcode.260 single-number-iii 力扣.260 只出现一次的数字III](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-002-bit-operator-03-260-single-number-iii)

# 题目

给你一个长度为 n 的整数数组 nums ，其中 nums 的所有整数都在范围 [1, n] 内，且每个整数出现 最多两次 。

请你找出所有出现 两次 的整数，并以数组形式返回。

你必须设计并实现一个时间复杂度为 O(n) 且仅使用常量额外空间（不包括存储输出所需的空间）的算法解决此问题。

示例 1：

输入：nums = [4,3,2,7,8,2,3,1]
输出：[2,3]
示例 2：

输入：nums = [1,1,2]
输出：[1]
示例 3：

输入：nums = [1]
输出：[]
 

提示：

n == nums.length
1 <= n <= 10^5
1 <= nums[i] <= n
nums 中的每个元素出现 一次 或 两次

# v1-HashMap

说明：v1+v2 都使用了额外的存储空间，不满足题目条件。但是思路还是统一放出来。

## 思路

通过 HashMap 存储每一个元素出现的次数。

## 实现

```java
public List<Integer> findDuplicates(int[] nums) {
    List<Integer> list = new ArrayList<>();
    Map<Integer, Integer> map = new HashMap<>();
    for(int num : nums){
        int count = map.getOrDefault(num, 0);
        if(count > 0) {
            list.add(num);
        }
        map.put(num, count+1);
    }
    return list;
}
```

## 效果

23ms 10.80%

效果一般

## 小结

思路不算难 Hash 在这个系列的适用性特别广。

其实这个复杂度就是 O(n)

# V2-HashSet

## 区别

唯一的区别就是唯一的数据可能重复，所以有重复的我们放入结果列表后移除即可。或者不放入也行。

## 代码

```java
public List<Integer> findDuplicates(int[] nums) {
    List<Integer> list = new ArrayList<>();
    Set<Integer> set = new HashSet<>();
    for(int num : nums){
        if(set.contains(num)) {
            list.add(num);
        }
        set.add(num);
    }
    return list;
}
```

## 效果

19ms 12.68%

# v3-排序的思路

## 思路

很自然的想到，比较我们应该先做一个排序。

然后再比较，和下一个相等就存在。

## 代码

```java
class Solution {
    public List<Integer> findDuplicates(int[] nums) {
        List<Integer> list = new ArrayList<>(nums.length);
        Arrays.sort(nums);

        for(int i = 0; i < nums.length-1;i++){
            if(nums[i] == nums[i+1]) {
                list.add(nums[i]);
            }
        }

        return list;
    }
}
```

## 效果

18ms  17.37%

效果一般。那么，应该怎么解决呢？

# v3-交换思路

看了下解答，很多都是创建了空间，所以速度比较快。

这里选择一种比较有趣的解法

当然这一题目的限制比较多，限制了数组的长度+大小

也就是这一题的特定解法。

## 交换

数组中的每个整数都在 [1, n] 范围内，因此可以将数组的值与其索引一一对应起来。

通过“交换”的方式，我们将每个元素放到它应该在的位置。具体地，数字 nums[i] 应该放在 nums[i] - 1 的位置。

如果某个元素已经在正确的位置上，我们就不做任何操作；如果它不在正确的位置上，我们就将其交换到正确的位置上。

如果某个数字在正确的位置上发现已经有重复的元素，那就说明它是重复的数字。

## 实现

```java
public List<Integer> findDuplicates(int[] nums) {
    int n = nums.length;
    List<Integer> ans = new ArrayList<>();

    for (int i = 0; i < n; i++) {
        // 不断交换，将 nums[i] 放到 i-1 处，交换到最后，会将重复的数值，放到缺失数值的位置上
        while (nums[i] != nums[nums[i] - 1]) swap(nums, i, nums[i] - 1);
    }

    for (int i = 0; i < n; i++) {
        if (nums[i] - 1 != i) ans.add(nums[i]); // 如果 数值 ≠ 位置 + 1，则说明数值是重复的
    }
    return ans;
}

private void swap(int[] nums, int index1, int index2) {
    int temp = nums[index1];
    nums[index1] = nums[index2];
    nums[index2] = temp;
}
```


* any list
{:toc}