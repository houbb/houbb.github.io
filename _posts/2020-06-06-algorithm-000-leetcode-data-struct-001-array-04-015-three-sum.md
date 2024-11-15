---
layout: post
title: leetcode 数组专题 04-leetcode.15 three-sum 力扣.15 三数之和 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, binary-search, sf]
published: true
---




# 题目

给你一个整数数组 nums ，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j、i != k 且 j != k ，同时还满足 nums[i] + nums[j] + nums[k] == 0 。

请你返回所有和为 0 且不重复的三元组。

注意：答案中不可以包含重复的三元组。

示例 1：

输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1,-1,2],[-1,0,1]]

解释：
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0 。
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0 。
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0 。
不同的三元组是 [-1,0,1] 和 [-1,-1,2] 。

注意，输出的顺序和三元组的顺序并不重要。


示例 2：

输入：nums = [0,1,1]
输出：[]
解释：唯一可能的三元组和不为 0 。

示例 3：

输入：nums = [0,0,0]
输出：[[0,0,0]]

解释：唯一可能的三元组和为 0 。
 

提示：

3 <= nums.length <= 3000

-10^5 <= nums[i] <= 10^5

# 前言

这道题作为 leetcode 的第 15 道题，看起来似曾相识。

大概思路可以有下面几种：

1. 暴力解法

2. 数组排序+二分

3. Hash 优化

4. 双指针

# v1-暴力解法

## 思路

直接 3 次循环，找到符合结果的数据返回。

这种最容易想到，一般工作中也是我们用到最多的。

当然也必定超时。

## 实现

```java
class Solution {
   
   public List<List<Integer>> threeSum(int[] nums) {
        Set<List<Integer>> res = new HashSet<>();

        final int n = nums.length;
        for(int i = 0; i < n; i++){
            for(int j = i+1; j < n; j++) {
                for(int k = j+1; k < n; k++) {
                    if(nums[i]+nums[j]+nums[k] == 0) {
                        List<Integer> list = Arrays.asList(nums[i], nums[j], nums[k]);
                        Collections.sort(list);
                        res.add(list);
                    }
                }
            }
        }

        return new ArrayList<>(res);
    }

}
```

## 效果

超出时间限制

308 / 313 个通过的测试用例

## 小结

这里慢在几个地方：

1）三层循环，找到符合的数据

2）数据需要去重，所以用到了排序，虽然是一个小排序。

# v2-思维的转换

## 思路

我们把问题这么考虑

要找的数其实是：`nums[i] + nums[j] + nums[k] == 0`

那么，我们如果固定一个值：

那么问题就变成了

`nums[j] + nums[k] == -nums[i]`

也就是变成了我们的 T001/T167 的题目。

### 疑问 数据去重问题呢？

暂时先不考虑，过会根据测试用例优化

## 编程思路

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
   
   public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);

        Set<List<Integer>> res = new HashSet<>();

        final int n = nums.length;
        // 因为是有序的，从前面找2个数字，等于当前数字更加合理。
        // nums[j] + nums[k] == -nums[i]

        for(int i = 0; i < n; i++){
            int target = -nums[i];

            int left = 0;
            int right = n-1;

            // 找两个数
            while (left < right) {
                int sum = nums[left]+nums[right];
                if(sum == target) {
                    // 排序+去重
                    if(i != left && left != right && i != right) {
                        List<Integer> list = Arrays.asList(nums[left], nums[right], nums[i]);
                        Collections.sort(list);
                        res.add(list);
                    }
                }
                if(sum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }

        return new ArrayList<>(res);
    }

}
```

## 效果

超出时间限制 312 / 313 个通过的测试用例

## 小结

最大的问题还是我们为什么要去重？为什么这么麻烦


# v3-去重

## 思路

数据重复存在两个问题：

1）[0, 1, -1] 和 [1, 0, -1] 认为重复

所以我们在固定第一个元素的时候，直接跳过 nums[i] == nums[i-1]，可以解决初始值重复的问题。

2）数组排序后存在重复的数据，那么我们只需要跳过重复的元素即可

我们的 left right 指针移动的时候，也需要跳过重复

## 初始值的问题

我们固定第一个数 num[i]，下标从 0, 1, ..., n-3

剩下的两个数：从 i+1, ..., n-1 中选择

## 代码

```java
public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> res = new ArrayList<>();
    final int n = nums.length;
    for(int i = 0; i < n-2; i++){
        // 跳过重复的第一个数
        if(i > 0 && nums[i] == nums[i-1]) {
            continue;
        }

        // 目标值
        int left = i+1;
        int right = n-1;

        // 双指针
        while (left < right) {
            int sum = nums[i] + nums[left]+nums[right];
            if(sum == 0) {
                List<Integer> list = Arrays.asList(nums[i], nums[left], nums[right]);
                res.add(list);
                // 左右避免数据重复
                while (left < right && nums[left] == nums[left+1]) {
                    left++;
                }
                while (left < right && nums[right] == nums[right-1]) {
                    right--;
                }
            }
            if(sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return res;
}
```

## 效果

32ms 62.27%

效果还行。看了下基本实现就是这个。

# 小结

这里对双指针的理解要求比较高。

而且对于重复性数据的判断技巧要求特别高，算得上是一道很接近困难的题目

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

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

[力扣.018 四数之和 four-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-05-018-four-num)

[力扣.454 四数相加之和 II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-05-454-four-num-ii)

点击 {阅读原文} 获得更好的阅读体验。

* any list
{:toc}