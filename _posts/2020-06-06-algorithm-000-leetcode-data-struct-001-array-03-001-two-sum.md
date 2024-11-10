---
layout: post
title: leetcode 数组专题 01-leetcode.1 two-sum 力扣.1 两数之和 3种解法
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, binary-search, sf]
published: true
---


# 题目

给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target  的那 两个 整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。

你可以按任意顺序返回答案。

示例 1：

输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。

示例 2：

输入：nums = [3,2,4], target = 6
输出：[1,2]
示例 3：

输入：nums = [3,3], target = 6
输出：[0,1]
 

提示：

2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9

只会存在一个有效答案
 

进阶：你可以想出一个时间复杂度小于 O(n^2) 的算法吗？

# 前言

这道题作为 leetcode 的第一道题，看起来非常简单。

不过今天回头看，解法还是很多的。

大概可以有下面几种：

1. 暴力解法

2. 数组排序+二分

3. HashSet/HashMap 优化

# v1-暴力解法

## 思路

直接两次循环，找到符合结果的数据返回。

这种最容易想到，一般工作中也是我们用到最多的。

## 实现

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        int[] res = new int[2];

        final int n = nums.length;
        for(int i = 0; i < n; i++) {
            for(int j = i+1; j < n; j++) {
                if(nums[i] + nums[j] == target) {
                    res[0] = i;
                    res[1] = j;
                }
            }
        }

        return res;
    }
}
```

## 效果

49ms 33.92%

效果一般

## 小结

暴力算法虽然容易想到，不过如果遇到特别长的场景用例，会直接超时。

当然这一题明显看到了 leetcode 的怜悯，怕我们上来就放弃。

我们如何改进一下呢？

排序是这个场景另一种很有用的方式。


# v2-排序+二分

## 思路

我们希望排序，然后通过二分法来提升性能。

## 代码

```java
public int[] twoSum(int[] nums, int target) {
    int[] res = new int[2];
    Arrays.sort(nums);

    // 遍历+二分
    int n = nums.length;
    for(int i = 0; i < n; i++) {
        // 找另一部分
        int t = target - nums[i];
        // 找到了自己怎么办？
        int j = Arrays.binarySearch(nums, t);
        if(j > 0) {
            res[0] = i;
            res[1] = j;
            return res;
        }
    }

    return res;
}
```

## 效果

当然，你会发现这段代码无法通过测试。

因为排序导致顺序错乱了。

我们要如何保证顺序的同时，有进行排序呢？

## 顺序修正

整体思路解释：

1. 我们用一个二维数组，记录原始值+原始的下标

2. 排序后，`target-nums[i]`就是剩下要找的数，我们在数组中用二分法寻找。

这里为了限制 j > i，二分法我们直接自己实现了，顺便练习一下。

```java
class Solution {

    public int[] twoSum(int[] nums, int target) {
        int n = nums.length;

        // 存储值+下标 避免排序后找不到原始的索引
        List<int[]> indexList = new ArrayList<>();
        for(int i = 0; i < n; i++) {
            indexList.add(new int[]{nums[i], i});
        }
        Collections.sort(indexList, new Comparator<int[]>() {
            @Override
            public int compare(int[] o1, int[] o2) {
                return o1[0] - o2[0];
            }
        });

        // 遍历+二分  这里直接手写二分比较简单，因为直接查询数字可能会重复
        for(int i = 0; i < n-1; i++) {
            int t = target - indexList.get(i)[0];
            //从当前 i 的后面开始寻找
            int j = binarySearch(indexList, t, i+1);
            if(j >= 0) {
                // 原始下标
                return new int[]{indexList.get(i)[1], j};
            }
        }

        //NOT FOUND
        return new int[]{-1, -1};
    }

    private int binarySearch(List<int[]> indexList,
                             final int target,
                             final int startIx) {
        int left = startIx;
        int right = indexList.size()-1;
        while (left <= right) {
            int mid = left + (right-left) / 2;
            int val = indexList.get(mid)[0];
            if(val == target) {
                // 原始下标
                return indexList.get(mid)[1];
            }

            // update
            if(val < target) {
                left = mid+1;
            } else {
                right = mid-1;
            }
        }

        return -1;
    }

}
```

## 效果

9ms 38.89%

只能说，比暴力要好不少。

不过依然后进步的空间。

# v3-排序+双指针

在做完了第 T167 之后，收到了双指针的启发。

## 思路

我们定义两个指针 

```
left=0
right=n-1
sum=num[left]+num[right-1]
```

因为数组有有序的，所以只有 3 种情况：

1. sum == target 直接满足

2. sum < target，left++

3. sum > target, right--

## 实现

```java
class Solution {

    
    public int[] twoSum(int[] nums, int target) {
        int n = nums.length;

        // 存储值+下标 避免排序后找不到原始的索引
        List<int[]> indexList = new ArrayList<>();
        for(int i = 0; i < n; i++) {
            indexList.add(new int[]{nums[i], i});
        }
        Collections.sort(indexList, new Comparator<int[]>() {
            @Override
            public int compare(int[] o1, int[] o2) {
                return o1[0] - o2[0];
            }
        });

        // 双指针
        int left = 0;
        int right = n-1;
        while (left < right) {
            int sum = indexList.get(left)[0] + indexList.get(right)[0];
            if(sum == target) {
                return new int[]{indexList.get(left)[1], indexList.get(right)[1]};
            }
            if(sum < target) {
                left++;
            }
            if(sum > target) {
                right--;
            }
        }

        //NOT FOUND
        return new int[]{-1, -1};
    }

}
```

## 效果

8ms 39.15%

# v4-HashMap

## 思路

在我们写完上面的写法之后，有没有一种感觉？

既然是要找另一部分的值，那么直接 Hash，复杂度 O(1) 不是更快？

是的，你真是个小机灵鬼。

哈希在这种等于的场景是最快的，不过上面的二分适用性更广一些，比如查询大于或者小于的时候。

当然，这是其他类型的题目。

我们先来看一下哈希的解法。

## 代码

```java
public int[] twoSum(int[] nums, int target) {
    int n = nums.length;
    HashMap<Integer, Integer> hashMap = new HashMap<>();
    for(int i = 0; i < n; i++) {
        int other = target - nums[i];
        if(hashMap.containsKey(other)) {
            int j = hashMap.get(other);
            return new int[]{i, j};
        }
        // 存储
        hashMap.put(nums[i], i);
    }
    return new int[]{-1, -1};
}
```


## 效果

2ms 99.68%

只能说效果拔群，Hash 确实是这类方法中最快的。

# 小结

这类题目的思路基本都是类似的。

我们后续将看一下 n 数之和的系列，感兴趣的小伙伴点点赞，关注不迷路。

* any list
{:toc}