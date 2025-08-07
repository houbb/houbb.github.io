---
layout: post
title:  二分查找法？binary-search-02-leetcode T4 寻找两个正序数组的中位数 median-of-two-sorted-arrays
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, binary-search, top100, sf]
published: true
---

# 二分查找算法

大家好，我是老马。

今天我们一起来学习一下数组密切相关的二分查找算法力扣实战。

我们来看一下二分法当数组不再严格递增，但仍保有一定规律，可以通过**二分定位区间**

# T4 寻找两个正序数组的中位数 median-of-two-sorted-arrays

给定两个大小分别为 m 和 n 的正序（从小到大）数组 nums1 和 nums2。

请你找出并返回这两个正序数组的 中位数 。

算法的时间复杂度应该为 O(log (m+n)) 。

示例 1：

输入：nums1 = [1,3], nums2 = [2]
输出：2.00000
解释：合并数组 = [1,2,3] ，中位数 2
示例 2：

输入：nums1 = [1,2], nums2 = [3,4]
输出：2.50000
解释：合并数组 = [1,2,3,4] ，中位数 (2 + 3) / 2 = 2.5

提示：

nums1.length == m
nums2.length == n
0 <= m <= 1000
0 <= n <= 1000
1 <= m + n <= 2000
-10^6 <= nums1[i], nums2[i] <= 10^6

# 历史回顾

> [【leetcode】04-4.median of two sorted arrays 寻找两个正序数组的中位数](https://houbb.github.io/2020/06/08/algorithm-004-leetcode-04-median-of-two-sorted-arrays)

## 解法汇总

| 解法编号 | 方法          | 时间复杂度             | 空间复杂度          | 是否满足题目要求 | 适用场景       |
| ---- | ----------- | ----------------- | -------------- | -------- | ---------- |
| 1    | 暴力合并排序      | O((m+n)log(m+n))  | O(m+n)         | ❌ 不满足    | 入门、直观理解    |
| 2    | 合并 + 模拟归并排序 | O(m+n)            | O(1) or O(m+n) | ❌ 不满足    | 入门、双指针模拟归并 |
| 3    | 二分查找第 k 小   | O(log(m+n))       | O(1)           | ✅ 满足     | 最优解        |
| 4    | 二分查找分割点     | O(log(min(m, n))) | O(1)           | ✅ 满足     | 最优解，官方推荐   |


# v1-暴力循环

## 思路

直接合并+排序

1）奇数 返回中间

2）偶数 返回中间2个/2

## 解法

```java
public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int i = 0;
        int totalLen = nums1.length+nums2.length;
        int[] nums = new int[totalLen];
        for(int num : nums1) {
            nums[i++] = num;
        }
        for(int num : nums2) {
            nums[i++] = num;
        }
        Arrays.sort(nums);

        // 单个
        int mid = totalLen / 2;
        if(totalLen % 2 == 1) {
            return nums[mid];
        }
        // 4 个数 0 1 2 3
        return (nums[mid] + nums[mid - 1])*1.0 / 2;
    }
```

## 效果

3ms 击败 14.25%

## 复杂度

TC：O((m + n) * log(m + n))

SC: O(m + n)

# v2-归并排序

## 思路

使用两个指针 i 和 j 分别遍历 nums1 和 nums2

每次从两个数组中取较小的那个数，模拟「归并」

只需要合并到 第 (m + n)/2 个数，就可以确定中位数

## 实现

```java
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int m = nums1.length, n = nums2.length;
        int totalLen = m + n;

        int i = 0, j = 0;
        int prev = 0, curr = 0;

        for (int k = 0; k <= totalLen / 2; k++) {
            prev = curr;

            // nums1 有数 && (nums2 没数了 || nums1 更小)
            if (i < m && (j >= n || nums1[i] <= nums2[j])) {
                curr = nums1[i++];
            } else {
                curr = nums2[j++];
            }
        }

        // 如果总长度是奇数，返回当前的中位数
        if (totalLen % 2 == 1) {
            return curr;
        }

        // 如果是偶数，返回中间两个数的平均
        return (prev + curr) / 2.0;
    }
```

## 效果 

1ms 100%

## 复杂度

时间复杂度：O((m + n)/2)，因为只需遍历一半元素

空间复杂度：O(1)，没有使用额外空间（除中间变量）

# v3-二分法

## 思路

中位数就是第 (m + n)/2 小的元素（或平均值）。

我们定义一个函数 `getKthElement(int[] nums1, int[] nums2, int k)`，用于找到第 k 小的元素。

核心思想：

1. 每次丢掉 k/2 个元素

2. 递归 / 循环实现二分

PS: 二分还是太强了，什么都能解。

## 实现

```java
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int totalLen = nums1.length + nums2.length;
        if (totalLen % 2 == 1) {
            // 奇数，返回第 (totalLen / 2 + 1) 小的数
            return getKthElement(nums1, nums2, totalLen / 2 + 1);
        } else {
            // 偶数，返回中间两个数的平均
            int left = getKthElement(nums1, nums2, totalLen / 2);
            int right = getKthElement(nums1, nums2, totalLen / 2 + 1);
            return (left + right) / 2.0;
        }
    }

    // 寻找两个有序数组中的第 k 小的元素（k 从 1 开始）
    private int getKthElement(int[] nums1, int[] nums2, int k) {
        int index1 = 0, index2 = 0;
        int len1 = nums1.length, len2 = nums2.length;

        while (true) {
            // 边界情况
            if (index1 == len1) {
                return nums2[index2 + k - 1];
            }
            if (index2 == len2) {
                return nums1[index1 + k - 1];
            }
            if (k == 1) {
                return Math.min(nums1[index1], nums2[index2]);
            }

            // 正常情况，比较第 k/2 个元素
            int half = k / 2;
            int newIndex1 = Math.min(index1 + half, len1) - 1;
            int newIndex2 = Math.min(index2 + half, len2) - 1;

            int pivot1 = nums1[newIndex1];
            int pivot2 = nums2[newIndex2];

            if (pivot1 <= pivot2) {
                // 舍弃 nums1 的前 half 个元素
                k -= (newIndex1 - index1 + 1);
                index1 = newIndex1 + 1;
            } else {
                // 舍弃 nums2 的前 half 个元素
                k -= (newIndex2 - index2 + 1);
                index2 = newIndex2 + 1;
            }
        }
    }
```

## 效果

2ms 23.08%

## 复杂度

时间复杂度：O(log(k))，最坏 O(log(m + n))

空间复杂度：O(1)（使用循环实现，没有递归栈）

# v4-二分查找分割点

## 思想

* `nums1` 长度为 `m`，`nums2` 长度为 `n`
* 假设总共有 `m + n` 个元素，要找中位数的位置

我们要在 `nums1` 上找到一个分割点 `i`，使得 `nums1[0...i-1] + nums2[0...j-1]` 是左半部分，`nums1[i...] + nums2[j...]` 是右半部分，满足：

```
maxLeft <= minRight
```

换句话说，需要满足：

```
nums1[i-1] <= nums2[j]  且  nums2[j-1] <= nums1[i]
```

其中：

```
i ∈ [0, m]，j = (m + n + 1) / 2 - i
```

## 实现

```java
public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // 确保 nums1 是较短的数组，降低二分范围
        if (nums1.length > nums2.length) {
            return findMedianSortedArrays(nums2, nums1);
        }

        int m = nums1.length;
        int n = nums2.length;

        int left = 0;
        int right = m;
        int halfLen = (m + n + 1) / 2;

        while (left <= right) {
            int i = (left + right) / 2;
            int j = halfLen - i;

            int nums1LeftMax = (i == 0) ? Integer.MIN_VALUE : nums1[i - 1];
            int nums1RightMin = (i == m) ? Integer.MAX_VALUE : nums1[i];

            int nums2LeftMax = (j == 0) ? Integer.MIN_VALUE : nums2[j - 1];
            int nums2RightMin = (j == n) ? Integer.MAX_VALUE : nums2[j];

            // 找到正确的分割
            if (nums1LeftMax <= nums2RightMin && nums2LeftMax <= nums1RightMin) {
                if ((m + n) % 2 == 1) {
                    return Math.max(nums1LeftMax, nums2LeftMax);
                } else {
                    return (Math.max(nums1LeftMax, nums2LeftMax) + Math.min(nums1RightMin, nums2RightMin)) / 2.0;
                }
            } else if (nums1LeftMax > nums2RightMin) {
                // i 太大，往左移
                right = i - 1;
            } else {
                // i 太小，往右移
                left = i + 1;
            }
        }

        // 理论上不会走到这里
        return -1;
    }
```

## 举个例子

```
nums1 = [1, 3]
nums2 = [2, 4, 5, 6]

total = 6 → halfLen = 3

在 nums1 上二分，尝试 i = 1 → j = 2
→ nums1[0] = 1，nums1[1] = 3
→ nums2[1] = 4，nums2[2] = 5
→ 满足条件：左边最大是 3，右边最小是 4
→ 中位数 = (3 + 4)/2 = 3.5
```

## 效果

1ms 100%

## 时间复杂度

TC: O(log(min(m, n)))，只对短数组二分
SC: O(1)

# 项目开源

> [技术博客](https://houbb.github.io/)

> [leetcode-visual 资源可视化](https://github.com/houbb/leetcode-visual)

> [leetcode 算法实现](https://github.com/houbb/leetcode)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解二分的实战题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

https://leetcode.cn/problems/binary-search/description/

* any list
{:toc}
