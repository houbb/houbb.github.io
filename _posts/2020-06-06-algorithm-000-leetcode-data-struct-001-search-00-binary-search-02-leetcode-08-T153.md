---
layout: post
title:  二分查找法？binary-search-02-leetcode 153. 寻找旋转排序数组中的最小值
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, binary-search, sf]
published: true
---


# 二分查找算法

大家好，我是老马。

今天我们一起来学习一下数组密切相关的二分查找算法力扣实战。

我们来看一下二分法当数组不再严格递增，但仍保有一定规律，可以通过**二分定位区间**

# 153. 寻找旋转排序数组中的最小值

已知一个长度为 n 的数组，预先按照升序排列，经由 1 到 n 次 旋转 后，得到输入数组。

例如，原数组 nums = [0,1,2,4,5,6,7] 在变化后可能得到：
若旋转 4 次，则可以得到 [4,5,6,7,0,1,2]
若旋转 7 次，则可以得到 [0,1,2,4,5,6,7]
注意，数组 [a[0], a[1], a[2], ..., a[n-1]] 旋转一次 的结果为数组 [a[n-1], a[0], a[1], a[2], ..., a[n-2]] 。

给你一个元素值 互不相同 的数组 nums ，它原来是一个升序排列的数组，并按上述情形进行了多次旋转。

请你找出并返回数组中的 最小元素 。

你必须设计一个时间复杂度为 O(log n) 的算法解决此问题。


示例 1：

输入：nums = [3,4,5,1,2]
输出：1
解释：原数组为 [1,2,3,4,5] ，旋转 3 次得到输入数组。
示例 2：

输入：nums = [4,5,6,7,0,1,2]
输出：0
解释：原数组为 [0,1,2,4,5,6,7] ，旋转 4 次得到输入数组。
示例 3：

输入：nums = [11,13,15,17]
输出：11
解释：原数组为 [11,13,15,17] ，旋转 4 次得到输入数组。
 

提示：

n == nums.length
1 <= n <= 5000
-5000 <= nums[i] <= 5000
nums 中的所有整数 互不相同
nums 原来是一个升序排序的数组，并进行了 1 至 n 次旋转

# v1-暴力循环

## 思路

最朴素的暴力循环的方式

我们首先想办法，确定上下限。

直接从开始到结束来一遍

## 解法

```java
    public int findMin(int[] nums) {
        int min = Integer.MAX_VALUE;
        for(int num : nums) {
            min = Math.min(num, min);
        }
        return min;
    }
```


## 效果

0ms 击败 100.00%

这一题的测试用例有问题，没有区分度。

# v2-二分法迭代

## 和 T033 对比

### 🔍 题目目标对比

| 题号   | 名称       | 要做什么？                     | 是否包含重复元素？           |
| ---- | -------- | ------------------------- | ------------------- |
| T033 | 搜索旋转排序数组 | 在**旋转排序数组中搜索一个指定值**（返回下标） | ❌ 不含重复              |
| T153 | 寻找最小值    | 找出这个**旋转数组中的最小值**         | ❌ 不含重复（但有 T154 含重复） |

### 🎯 它们的本质区别

| 项            | T033（搜索目标值）              | T153（找最小值）           |
| ------------ | ------------------------ | -------------------- |
| 📌 **核心问题**  | target 在哪里？              | 最小值在哪里？              |
| 🔄 **判断逻辑**  | 哪一边是**有序的**，target 落在哪边？ | 哪一边是**无序的**，最小值在无序那边 |
| 🎯 **目标值**   | 可能在左边或右边                 | 肯定在**最小的那一段**        |
| 🔁 **偏移后影响** | 会影响 target 的位置判断         | 只关注最小值在哪里            |

### 🧠 更形象地理解

T033 是“**找值**”

我们拿个例子：

```java
nums = [4,5,6,7,0,1,2], target = 6
```

它本质上是在问：

> “在这个被旋转的数组里，目标值在哪里？”

你需要识别数组中哪一半是升序，然后看 target 应该在哪边，就继续二分。

👉 逻辑是：

* **哪一半是有序的？**
* target 是否落在有序段中？落在就往那边搜

T153 是“**找最小值**”

这个题并不关心 target，只关心：

> “哪一边是乱的？乱的那边才会有最小值。”

同样的数组：

```java
nums = [4,5,6,7,0,1,2]
```

我们需要找 `0`。

👉 逻辑是：

* 比较 `nums[mid]` 和 `nums[right]`

  * 如果 `nums[mid] > nums[right]`：最小值在右边（mid 一定不是最小）
  * 否则：最小值在左边或就是 mid

## 思路

我还是比较倾向于实用经典二分的模板

```java
while (left <= right) {
    int mid = ...
    if (...) {
        ...
    } else {
        ...
    }
}
```

不然各种边界条件，完全记不住。

## 实现

我认为下面的解法，才是真方便结合模板记忆的方法。

二分法的精髓在于我们必须找到一种数据的特征，来过滤掉一半的数据。

```java
    public int findMin(int[] nums) {
        int left = 0;
        int right = nums.length-1;

        // 记录最小值
        int min = nums[0];

        while (left <= right) {
            int mid = left + (right-left) / 2;

            // 整体有序
            if(nums[left] <= nums[right]) {
                min = Math.min(min, nums[left]);
                return min;
            }

            // 更新最小值
            min = Math.min(min, nums[mid]);

            // 左边有序，最小值在右边
            if(nums[left] <= nums[mid]) {
                left = mid + 1;
            } else {
                // 右边有序，最小值在左边
                right= mid-1;
            }
        }

        return min;
    }
```

## 效果

0ms 击败 100.00%

# 补充-可视化效果

> [可视化效果](https://houbb.github.io/leetcode-visual/T153-binary-search-find-minimum-in-rotated-sorted-array.html)

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
