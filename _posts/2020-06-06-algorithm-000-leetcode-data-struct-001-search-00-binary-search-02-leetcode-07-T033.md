---
layout: post
title:  二分查找法？binary-search-02-leetcode 033. 搜索旋转排序数组 search-in-rotated-sorted-array
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, binary-search, sf]
published: true
---


# 二分查找算法

大家好，我是老马。

今天我们一起来学习一下数组密切相关的二分查找算法力扣实战。

我们来看一下二分法当数组不再严格递增，但仍保有一定规律，可以通过**二分定位区间**

# 33. 搜索旋转排序数组

整数数组 nums 按升序排列，数组中的值 互不相同 。

在传递给函数之前，nums 在预先未知的某个下标 k（0 <= k < nums.length）上进行了 旋转，使数组变为 [nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]（下标 从 0 开始 计数）。

例如， [0,1,2,4,5,6,7] 在下标 3 处经旋转后可能变为 [4,5,6,7,0,1,2] 。

给你 旋转后 的数组 nums 和一个整数 target ，如果 nums 中存在这个目标值 target ，则返回它的下标，否则返回 -1 。

你必须设计一个时间复杂度为 O(log n) 的算法解决此问题。


示例 1：

输入：nums = [4,5,6,7,0,1,2], target = 0
输出：4

示例 2：

输入：nums = [4,5,6,7,0,1,2], target = 3
输出：-1

示例 3：

输入：nums = [1], target = 0
输出：-1
 

提示：

1 <= nums.length <= 5000
-104 <= nums[i] <= 10^4
nums 中的每个值都 独一无二
题目数据保证 nums 在预先未知的某个下标上进行了旋转
-10^4 <= target <= 10^4

# v1-暴力循环

## 思路

最朴素的暴力循环的方式

我们首先想办法，确定上下限。

直接从开始到结束来一遍

## 解法

```java
public int search(int[] nums, int target) {
    for(int i = 0; i < nums.length; i++) {
        if(target == nums[i]) {
            return i;
        }
    }
    return -1;
}
```


## 效果

0ms 击败 100.00%

这一题的测试用例有问题，没有区分度。

# v2-二分法迭代

## 思路

我们可以先找到这个被随机反转的点

有一个特点，就是数字会忽然变小，后面的小于前面的，找到这个 index ，然后将数组分为2个部分即可。

因为分成两半之后，两个部分依然是顺序的。

## 解法

```java
    public int search(int[] nums, int target) {
        int randomIndex = getRandomIndex(nums);
        // 无变化，或者整体变化
        if(randomIndex == -1) {
            return binarySearch(nums, target, 0, nums.length-1);
        }

        // 左边
        int leftIx = binarySearch(nums, target, 0, randomIndex);
        if(leftIx >= 0) {
            return leftIx;
        }

        // 右边
        int rightIx = binarySearch(nums, target, randomIndex+1, nums.length-1);
        if(rightIx >= 0) {
            return rightIx;
        }

        return -1;
    }

    private int binarySearch(int[] nums, int target, int left, int right) {
        while (left <= right) {
            int mid = left + (right - left);

            int midVal = nums[mid];
            if(midVal == target) {
                return mid;
            }

            // 大于，去左边
            if(midVal > target) {
                right = mid-1;
            } else {
                left = mid+1;
            }

        }

        return -1;
    }

    private int getRandomIndex(int[] nums) {
        for(int i = 0; i < nums.length-1; i++) {
            if(nums[i] > nums[i+1]) {
                return i;
            }
        }
        // 没有变化
        return -1;
    }
```

## 效果

0ms 击败 100.00%

## 一点补充

看到这个，忽然想到了 852. 山脉数组的峰顶索引

当然，这个转换可能不存在顶点的场景。

# v3-旋转点的二分法寻找

## 思路

原来是 for 循环遍历数组，查找断点；

现在改为二分查找方式：

每次判断 `nums[mid] > nums[mid + 1]`，如果是，就找到了旋转点；

否则判断是往左边缩小范围还是右边缩小。

## 解法

```java
private int search(int[] nums) {
    int left = 0, right = nums.length - 1;
    // 没有旋转
    if (nums[left] <= nums[right]) {
        return -1;
    }

    while (left <= right) {
        int mid = left + (right - left) / 2;
        // 找到断点 不符合严格升序
        // nums = [4,5,6,7,0,1,2]
        if (nums[mid] > nums[mid + 1]) {
            return mid;
        }
        // 左边是有序的，说明断点在右边
        if (nums[mid] >= nums[left]) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}
```

这种思路其实更加自然。

性能整体式最多3次 O(logn)，也算是满足需求

# v4-一次二分

## 思路

当然，我们还可以进一步优化这个解法。

感觉这个技巧性比较强，容易出错。

1. **通过二分法不断缩小范围**前提是数组有序，那么我们必须找到有序的部分。因为被分成2个部分，所以肯定一半是有顺序的。
2. 判断当前的 `nums[mid]` 落在 **哪一边的有序区间**；
3. 利用有序区间来判断 target 应该往左还是往右。

## 实现

代码不长，行行致命。

```java
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length-1;

        while (left <= right) {
            int mid = left + (right-left) / 2;
            if(nums[mid] == target) {
                return mid;
            }

            // 判断左右两侧那边有顺序 值互不相同，需要判断等于吗？
            // 本次分割，左侧有序
            if(nums[left] <= nums[mid]) {
                // 判断当前的数是否在 [left, mid) 中，如果是，则说明 target 在这一半的左侧
                if(nums[left] <= target && target < nums[mid]) {
                    right = mid-1;
                } else {
                    left = mid+1;
                }
            } else {
                // 右侧有顺序
                // 如果 target 位于 (mid, target] 中，则说明 target 在这一半的右侧
                if(nums[mid] < target && target <= nums[right]) {
                    left = mid+1;
                } else {
                    right = mid-1;
                }
            }
        }

        return -1;
    }

```

## 举个例子

其实这个还是很难懂，我们来看一个例子。

📌 题设前提

数组是**从一个升序数组中旋转得到**的。

例如：

```java
原始升序:     [0, 1, 2, 4, 5, 6, 7]
旋转后的数组: [4, 5, 6, 7, 0, 1, 2]
```

🎯目标

我们要在这个**被旋转的数组**中查找某个 `target`，**不能额外处理旋转点**，只能用**一次二分**搞定。

👀 整体策略回顾

在每轮二分中，我们会得到一个 `mid`。

此时：

```java
nums = [..., ..., ..., ..., ..., ...]
         ↑         ↑         ↑
       left       mid       right
```

数组是部分有序的，但不是整体有序。那怎么办？

我们发现：**左半边或者右半边一定是有序的**！

🔍 详细解释：为什么判断 `nums[left] <= nums[mid]` 表示左半边是有序的？

假设数组是这样被旋转的：

```java
[4, 5, 6, 7, 0, 1, 2]
```

* 如果 `mid` 落在 `4~7` 的部分（旋转前的左边），那这一段是升序的。
* `nums[left] <= nums[mid]` 就说明 **`left~mid` 是有序的**。

而如果：

```java
nums = [6, 7, 0, 1, 2, 3, 4]
               ↑
             mid
```

* 那么 `nums[left] > nums[mid]`，说明左边不是升序的。

所以这句判断的含义就是：

```java
if (nums[left] <= nums[mid]) {
    // 左边 [left, mid] 是升序的
}
```

🧠 接下来看里面这段：

```java
if (nums[left] <= target && target < nums[mid]) {
    right = mid - 1;
} else {
    left = mid + 1;
}
```

🚩目标：判断 target 是不是在这个**有序的左半段**中

你现在知道 `[left ~ mid]` 是有序的，那么：

* 如果 target **落在这个区间**（`nums[left] <= target < nums[mid]`）：
  👉 那就继续往左边搜 → `right = mid - 1`

* 否则，target 不在 `[left~mid]`，那只能在右边 → `left = mid + 1`


# 补充-可视化效果

> [可视化效果](https://houbb.github.io/leetcode-visual/T875-binary-search-eat-banana.html)

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
