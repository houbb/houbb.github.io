---
layout: post
title: leetcode 002-leetcode.219 contains-duplicate-ii 力扣.219 存在重复的元素 II
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, sort, sf]
published: true
---


# 题目

给你一个整数数组 nums 和一个整数 k ，判断数组中是否存在两个 不同的索引 i 和 j ，满足 nums[i] == nums[j] 且 abs(i - j) <= k 。

如果存在，返回 true ；否则，返回 false 。

示例 1：

输入：nums = [1,2,3,1], k = 3
输出：true

示例 2：

输入：nums = [1,0,1,1], k = 1
输出：true

示例 3：

输入：nums = [1,2,3,1,2,3], k = 2
输出：false
 
提示：

1 <= nums.length <= 10^5

-10^9 <= nums[i] <= 10^9

0 <= k <= 10^5

# v1-HashMap

## 思路

HashMap 计数，这个应该很容易想到

1) 用 map 存储，key 对应值，value 对应 indexList

2) 我们找到相同的之后，只需要判断当前的 i 和上一次的 j 对比，是否满足条件即可。

因为 i 递增，不需要考虑 abs 的问题。

## 实现

```java
public boolean containsNearbyDuplicate(int[] nums, int k) {
        Map<Integer, List<Integer>> countMap = new HashMap<>();
        for(int i = 0; i < nums.length; i++){
            int num = nums[i];
            List<Integer> indexList = countMap.getOrDefault(num, new ArrayList<>());

            // 
            if(!indexList.isEmpty()) {
                int minLen = i - indexList.get(indexList.size()-1);
                if(minLen <= k) {
                    return true;
                }
            }
            indexList.add(i);

            // i-j <= k
            // 判断是否满足条件
            countMap.put(num, indexList);
        }

        return false;
    }
```

## 效果

```
27ms 13.36%
```

效果一般

# v2-滑动窗口

## 思路

我们其实这样考虑

因为要求 满足 nums[i] == nums[j] 且 abs(i - j) <= k

我们可以规定一个窗口，假设 i 开始，那么 窗口的大小最多为 k。

只要判断这个窗口内是否存在重复元素即可。

是否存在重复元素，是 T217 的问题，这里不再赘述。

## 实现方式

想实现这个窗口方式也比较多，我们采用 Set

## 代码

```java
public boolean containsNearbyDuplicate(int[] nums, int k) {
    Set<Integer> set = new HashSet<>();
    for(int i = 0; i < nums.length; i++){
        // 固定窗口大小
        if(i > k) {
            // 移除最开始的元素  保证窗口最多k
            set.remove(nums[i - k - 1]);
        }
        if(set.contains(nums[i])) {
            return true;
        }
        set.add(nums[i]);
    }
    return false;
}
```

## 效果

18ms  87.83%

效果还不错。

## 小结

看了一下最优解也是这样的算法，估计只是执行的时候服务器计时的差别。

滑动窗口有时候需要我们转换一下视角，挺有意思的一个角度。

* any list
{:toc}