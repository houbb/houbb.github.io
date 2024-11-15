---
layout: post
title: leetcode 数组专题 05-leetcode.018 four-sum 力扣.018 四数之和 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, binary-search, sf]
published: true
---



# 题目

给你一个由 n 个整数组成的数组 nums ，和一个目标值 target 。

请你找出并返回满足下述全部条件且不重复的四元组 [nums[a], nums[b], nums[c], nums[d]] （若两个四元组元素一一对应，则认为两个四元组重复）：

0 <= a, b, c, d < n

a、b、c 和 d 互不相同

nums[a] + nums[b] + nums[c] + nums[d] == target

你可以按 任意顺序 返回答案 。

示例 1：

输入：nums = [1,0,-1,0,-2,2], target = 0
输出：[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]

示例 2：

输入：nums = [2,2,2,2,2], target = 8
输出：[[2,2,2,2]]

提示：

1 <= nums.length <= 200

-10^9 <= nums[i] <= 10^9

-10^9 <= target <= 10^9

# 整体思路

结合前面我们做 2sum 3sum 的经验，可能的方式：

1. 暴力

2. 排序+二分

3. 排序+双指针

4. Hash 优化（局限性比较大）

# v1-暴力

## 思路

直接 4 次 循环，虽然知道等待我们的一定是超时。

## 实现

```java
public int fourSumCount(int[] nums1, int[] nums2, int[] nums3, int[] nums4) {
        // 暴力
        int count = 0;
        for(int i = 0; i < nums1.length; i++) {
            for(int j = 0; j < nums2.length; j++) {
                for(int k = 0; k < nums3.length; k++) {
                    for(int l = 0; l < nums4.length; l++) {
                        int sum = nums1[i] + nums2[j] + nums3[k] + nums4[l];
                        if(sum == 0) {
                            count++;
                        }
                    }
                }
            }
        }
        return count;
    }
```

## 效果

超出时间限制

288 / 294 个通过的测试用例

## 小结

4 次循环容易想到。但是会慢在 2 个地方：


# v2-排序+双指针

## 思路

结合我们前面 T015 的方式：

首先固定两个位置，然后剩下的部分采用双指针。

注意点：

1）需要排除元素的重复情况

2）固定的 i, j 前两个元素都要排除。

其中避免 i 重复时，`i > 0 && nums[i] == nums[i-1]` 跳过

其中避免 j 重复时，`j > i+1 && nums[j] == nums[j-1]` 跳过

## 实现

```java
class Solution {
    
    public List<List<Integer>> fourSum(int[] nums, int target) {
        Arrays.sort(nums);

        List<List<Integer>> res = new ArrayList<>();

        final int n = nums.length;
        for(int i = 0; i < n-3; i++) {
            // 跳过重复的元素
            if(i > 0 && nums[i] == nums[i-1]) {
                continue;
            }
            for(int j = i+1; j < n-2; j++) {
                if(j > i+1 && nums[j] == nums[j-1]) {
                    continue;
                }

                // 双指针
                int left = j+1;
                int right = n-1;

                while (left < right) {
                    int sum = nums[i] + nums[j] + nums[left] + nums[right];

                    if(sum == target) {
                        // 跳过后续可能重复的数据
                        List<Integer> list = Arrays.asList(nums[i], nums[j], nums[left], nums[right]);
                        res.add(list);

                        // 考虑左边
                        while (left < right && nums[left] == nums[left+1]) {
                            left++;
                        }
                        // 右边
                        while (left < right && nums[right] == nums[right-1]) {
                            right--;
                        }
                    }

                    if(sum < target) {
                        left++;
                    } else {
                        right--;
                    }
                }
            }
        }

        return res;
    }
}
```

## 效果

解答错误 292 / 294 个通过的测试用例

```
输入
nums =
[1000000000,1000000000,1000000000,1000000000]
target =
-294967296

添加到测试用例
输出
[[1000000000,1000000000,1000000000,1000000000]]
预期结果
[]
```

### 为什么错误了

是因为这里越界了，明显是加入了一个 int 越界的问题，感觉没必要，影响解法整体的美感。

我们调整一下 sum 的类型，改为 long。只改下面的一行

从 

```java
int sum = nums[i] + nums[j] + nums[left] + nums[right];
```

改为:

```java
long sum = (long) nums[i] + nums[j] + nums[left] + nums[right];
```

### 效果

17ms 37.37%

# 小结

整体这个类型的题目到这里就告一段落了。

整体只是披着数组的形式，本质上就是下面几种：

1）暴力求解

2）排序+二分

3）排序+双指针

4）Hash 改进优化

其中 3 的适用性还是比较强的。

# 参考资料

https://leetcode.cn/problems/4sum/

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