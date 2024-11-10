---
layout: post
title: leetcode 数组专题 01-leetcode.167 two-sum-ii 力扣.167 两数之和II
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, binary-search, two-pointer, sf]
published: true
---

# 数组系列

[力扣数据结构之数组-00-概览](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-00-overview)

[力扣.53 最大子数组和 maximum-subarray](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-01-51-maximum-subarray)

[力扣.128 最长连续序列 longest-consecutive-sequence](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-02-128-longest-consecutive-sequence)

[力扣.1 两数之和 N 种解法 two-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum)

[力扣.167 两数之和 II two-sum-ii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-ii)

[力扣.170 两数之和 III two-sum-iii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-iii)

[力扣.653 两数之和 IV two-sum-IV](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-iv)

[力扣.015 三数之和 three-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-015-three-sum)

[力扣.016 最接近的三数之和 three-sum-closest](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-016-three-sum-closest)

[力扣.259 较小的三数之和 three-sum-smaller](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-259-three-sum-smaller)

# 题目

给你一个下标从 1 开始的整数数组 numbers ，该数组已按 非递减顺序排列，请你从数组中找出满足相加之和等于目标数 target 的两个数。

如果设这两个数分别是 numbers[index1] 和 numbers[index2] ，则 1 <= index1 < index2 <= numbers.length 。

以长度为 2 的整数数组 [index1, index2] 的形式返回这两个整数的下标 index1 和 index2。

你可以假设每个输入 只对应唯一的答案 ，而且你 不可以 重复使用相同的元素。

你所设计的解决方案必须只使用常量级的额外空间。

示例 1：

输入：numbers = [2,7,11,15], target = 9
输出：[1,2]
解释：2 与 7 之和等于目标数 9 。因此 index1 = 1, index2 = 2 。返回 [1, 2] 。

示例 2：

输入：numbers = [2,3,4], target = 6
输出：[1,3]
解释：2 与 4 之和等于目标数 6 。因此 index1 = 1, index2 = 3 。返回 [1, 3] 。

示例 3：

输入：numbers = [-1,0], target = -1
输出：[1,2]
解释：-1 与 0 之和等于目标数 -1 。因此 index1 = 1, index2 = 2 。返回 [1, 2] 。
 

提示：

2 <= numbers.length <= 3 * 10^4

-1000 <= numbers[i] <= 1000

numbers 按 非递减顺序 排列

-1000 <= target <= 1000

仅存在一个有效答案

# 前言

这道题和 leetcode 的第一道题非常类似，看起来非常简单。

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

注意：这里的下标从1开始。一看就不是一个面向程序员的题目。

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        int[] res = new int[2];

        final int n = nums.length;
        for(int i = 0; i < n; i++) {
            for(int j = i+1; j < n; j++) {
                if(nums[i] + nums[j] == target) {
                    res[0] = i+1;
                    res[1] = j+1;
                }
            }
        }

        return res;
    }
}
```

## 效果

超出时间限制 21 / 24 个通过的测试用例

## 小结

暴力算法虽然容易想到，不过如果遇到特别长的场景用例，会直接超时。

我们如何改进一下呢？

排序是这个场景另一种很有用的方式。

# v2-排序+二分

## 思路

我们希望排序，然后通过二分法来提升性能。

这里就发现，题目已经帮我排序好了。所以第一题的麻烦的部分全部省略了。

## 代码

```java
class Solution {
   public int[] twoSum(int[] nums, int target) {
        final int n = nums.length;
        for(int i = 0; i < n; i++) {
            int other = target - nums[i];

            int j = binarySearch(nums, other, i+1);
            if(j >= 0) {
                return new int[]{i+1, j+1};
            }
        }

        return new int[]{-1, -1};
    }

    private int binarySearch(int[] nums,
                             int target,
                             int startIx) {
        int left = startIx;
        int right = nums.length-1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            int val = nums[mid];
            if(val == target) {
                return mid;
            }
            if(val > target) {
                right = mid-1;
            } else {
                left = mid+1;
            }
        }

        return -1;
    }
}
```

## 效果

4ms 16.87%

嗯？

这个竟然不是本题目的最佳解法吗？

# v3-HashMap

## 思路

在我们写完上面的写法之后，有没有一种感觉？

既然是要找另一部分的值，那么直接 Hash，复杂度 O(1) 不是更快？

是的，你真是个小机灵鬼。

哈希在这种等于的场景是最快的，不过上面的二分适用性更广一些，比如查询大于或者小于的时候。

当然本体限制了，必须常量的空间，所以这种解法被限制了，不过也值得看一下。

我们先来看一下哈希的解法。

## 代码

注意：这里的顺序要求有序，所以返回的时候和 T1 要反过来。

```java
class Solution {
   public int[] twoSum(int[] nums, int target) {
        int n = nums.length;
        HashMap<Integer, Integer> hashMap = new HashMap<>();
        for(int i = 0; i < n; i++) {
            int other = target - nums[i];
            if(hashMap.containsKey(other)) {
                int j = hashMap.get(other);
                return new int[]{j+1, i+1};
            }
            // 存储
            hashMap.put(nums[i], i);
        }
        return new int[]{-1, -1};
    }
}
```

## 效果

7ms 6.01%

只能说性能很差，猜测是 map 构建导致的耗时，不然这个作为 O(n) 的解法一定性能更好才对。

说明这一题一定有更加适合的解法。

# v4-双指针

## 思路

其实在 v2 二分法的排序思路上，我们可以受到一些启发。

排序+二分是我们非常老实的一次遍历，然后再二分查找，复杂度为 n*log(n)

那么有没有可能在有序的数组中不用这么麻烦？

那就要说到巧妙的双指针了。

## 双指针

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

## 代码

```java
class Solution {
   public int[] twoSum(int[] nums, int target) {
        int n = nums.length;
        int left = 0;
        int right = n-1;

        while (left < right) {
            int sum = nums[left] + nums[right];
            if(sum == target) {
                return new int[]{left+1, right+1};
            }
            if(sum < target) {
                left++;
            }
            if(sum > target) {
                right--;
            }
        }

        return new int[]{-1, -1};
    }
}
```

## 效果

1ms

99.36%

# 小结

这类题目的思路基本都是类似的。

我们有常见的几种解法：

1) 暴力

2）借助 Hash

3) 排序+二分

4）双指针==》针对有序数组


我们后续将看一下 n 数之和的系列，感兴趣的小伙伴点点赞，关注不迷路。

* any list
{:toc}