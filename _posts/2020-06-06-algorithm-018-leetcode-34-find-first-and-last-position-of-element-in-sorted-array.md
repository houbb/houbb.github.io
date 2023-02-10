---
layout: post
title:  【leetcode】018-34. 在排序数组中查找元素的第一个和最后一个位置 Find First and Last Position of Element in Sorted Array 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, binary-search, leetcode]
published: true
---

# 写在前面

有些题目看起来很简单，深挖下去往往有很多值得深思的东西。

本文就来讨论一下二分查找法的问题，以及这道题背后真正想考察的东西。

# 34. 在排序数组中查找元素的第一个和最后一个位置

给定一个按照升序排列的整数数组 nums，和一个目标值 target。找出给定目标值在数组中的开始位置和结束位置。

如果数组中不存在目标值 target，返回 [-1, -1]。

进阶：

你可以设计并实现时间复杂度为 O(log n) 的算法解决此问题吗？
 
- 示例 1：

```
输入：nums = [5,7,7,8,8,10], target = 8
输出：[3,4]
```

- 示例 2：

```
输入：nums = [5,7,7,8,8,10], target = 6
输出：[-1,-1]
```

- 示例 3：

```
输入：nums = [], target = 0
输出：[-1,-1]
```

提示：

0 <= nums.length <= 10^5

-10^9 <= nums[i] <= 10^9

nums 是一个非递减数组

-10^9 <= target <= 10^9


# 解题思路

## 思路

看到这一题的时候，感觉非常简单。

直接来一个二分查找，然后分别向左右遍历，遇到不同的元素就停止，不就找到起始位置了吗？

## java 实现

```java
public int[] searchRange(int[] nums, int target) {
    int[] result = {-1, -1};
    int index = binarySearch(nums, target);
    if(-1 == index) {
        return result;
    }
    for(int i = index; i >= 0; i--) {
        if(nums[i] != target) {
            break;
        } else {
            // 如果相同
            result[0] = i;
        }
    }
    // 设置最后一个
    for(int i = index; i < nums.length; i++) {
        if(nums[i] != target) {
            break;
        } else {
            result[1] = i;
        }
    }
    return result;
}

/**
 * 二分法找到的元素可能不是刚好的。
 * @param nums
 * @param target
 * @return
 */
private static int binarySearch(int[] nums, int target) {
    int low = 0;
    int high = nums.length - 1;
    while (low <= high) {
        int mid = (low + high)/2;
        if(target == nums[mid]) {
            return mid;
        } else if(target < nums[mid]) {
            // 偏大
            high = mid-1;
        } else {
            low = mid + 1;
        }
    }
    // NOT FOUND
    return -1;
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Find First and Last Position of Element in Sorted Array.
Memory Usage: 42 MB, less than 88.37% of Java online submissions for Find First and Last Position of Element in Sorted Array.
```

而且這個性能也还不错，所以当时就没有太在意，直接下一题了。

# 继续优化

## 不满意的答案

在看《剑指 Offer》 的时候，其中也有一道类似的题目。

求排序数组中，一个数字出现的次数。

解法实际上和这一题是一摸一样的。

不过其中提到一个问题，虽然查找是  O(log n)，但是左右遍历的时候，如果列表中的元素全部相同，就退化成了 O(N)。

那么，我们可以优化实现，让查找哪怕元素都相同，也依然是 O(logn) 吗？

## 改进思路

所以这一题实际上是考察我们对于二分查找法的理解，如何才能直接找到第一次出现和最后一次出现的元素位置？

这就需要我们改造一下二分查找的实现。

## java 实现

```java
public int[] searchRange(int[] nums, int target) {
    // 参数校验
    if(nums == null) {
        // 或者抛出异常
        return null;
    }
    int first = binarySearchFirst(nums, target);
    int last = binarySearchLast(nums, target);
    return new int[]{first, last};
}

/**
 * 二分法找到的元素第一次出现的位置
 * @param nums 数组
 * @param target 目标值
 * @return 结果下标
 */
private static int binarySearchFirst(int[] nums, int target) {
    int low = 0;
    int high = nums.length - 1;
    while (low <= high) {
        int mid = (low + high)/2;
        if(target == nums[mid]) {
            // 调整一下返回的条件
            // 如果是第一个元素，获取上一个元素不等于当前元素
            if(mid == 0 || (nums[mid-1] != target)) {
                return mid;
            } else {
                // 否则的话，high 调整为 mid 的上一个位置
                high = mid-1;
            }
        } else if(target < nums[mid]) {
            // 偏大
            high = mid-1;
        } else {
            low = mid + 1;
        }
    }
    // NOT FOUND
    return -1;
}

/**
 * 二分法找到的元素最后一次出现的位置
 * @param nums 数组
 * @param target 目标值
 * @return 结果下标
 */
private static int binarySearchLast(int[] nums, int target) {
    int low = 0;
    int high = nums.length - 1;
    while (low <= high) {
        int mid = (low + high)/2;
        if(target == nums[mid]) {
            // 调整一下返回的条件
            // 如果是第一个元素，获取上一个元素不等于当前元素
            if(mid == nums.length-1 || (nums[mid+1] != target)) {
                return mid;
            } else {
                // 否则的话，low 调整为 mid 的下一个位置
                low = mid+1;
            }
        } else if(target < nums[mid]) {
            // 偏大
            high = mid-1;
        } else {
            low = mid + 1;
        }
    }
    // NOT FOUND
    return -1;
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Find First and Last Position of Element in Sorted Array.
Memory Usage: 42.6 MB, less than 23.21% of Java online submissions for Find First and Last Position of Element in Sorted Array.
```

# 这是优化的尽头吗？

## 反思

上面的解法，实际上已经是《剑指 Offer》 中令面试官满意的答案了。

书中到这里内容也就结束了，如果面试微软，也许这种解法算是通过。

不过如果换做老马，肯定还会问你一个问题：

你还能针对上面的实现继续优化吗？

## 更进一步的优化

下面都是老马自己的思考，可以为大家提供一点思路。

我们举一个例子：

列表如下，目标元素为 3.

```
1 2 3 3 3 3 4 5
```

我们的优化解法中，获取开始位置，都是从开始到结尾这个范围去找到。

（1）第一次出现，找到下标为 2 的 元素3。

（2）最后一次出现，找到下标为 5 的元素3。

实际上查找最后一次出现的时候，没必要从开始 1 查找，而应该从第一次出现的位置开始查找，这样可以进一步优化查找的时间。

## java 实现

```java
public int[] searchRange(int[] nums, int target) {
    // 参数校验
    if(nums == null) {
        // 或者抛出异常
        return null;
    }
    int first = binarySearchFirst(nums, target);
    int last = binarySearchLast(nums, target, first);
    return new int[]{first, last};
}

/**
 * 二分法找到的元素第一次出现的位置
 * @param nums 数组
 * @param target 目标值
 * @return 结果下标
 */
private static int binarySearchFirst(int[] nums, int target) {
    int low = 0;
    int high = nums.length - 1;
    while (low <= high) {
        int mid = (low + high)/2;
        if(target == nums[mid]) {
            // 调整一下返回的条件
            // 如果是第一个元素，获取上一个元素不等于当前元素
            if(mid == 0 || (nums[mid-1] != target)) {
                return mid;
            } else {
                // 否则的话，high 调整为 mid 的上一个位置
                high = mid-1;
            }
        } else if(target < nums[mid]) {
            // 偏大
            high = mid-1;
        } else {
            low = mid + 1;
        }
    }
    // NOT FOUND
    return -1;
}

/**
 * 二分法找到的元素最后一次出现的位置
 * @param nums 数组
 * @param target 目标值
 * @param low 开始位置
 * @return 结果下标
 */
private static int binarySearchLast(int[] nums, int target, int low) {
    // 快速失败
    if(low == -1) {
        return -1;
    }
    int high = nums.length - 1;
    while (low <= high) {
        int mid = (low + high)/2;
        if(target == nums[mid]) {
            // 调整一下返回的条件
            // 如果是第一个元素，获取上一个元素不等于当前元素
            if(mid == nums.length-1 || (nums[mid+1] != target)) {
                return mid;
            } else {
                // 否则的话，low 调整为 mid 的下一个位置
                low = mid+1;
            }
        } else if(target < nums[mid]) {
            // 偏大
            high = mid-1;
        } else {
            low = mid + 1;
        }
    }
    // NOT FOUND
    return -1;
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Find First and Last Position of Element in Sorted Array.
Memory Usage: 42.5 MB, less than 23.21% of Java online submissions for Find First and Last Position of Element in Sorted Array.
```

# 收获

有时候 beat 100% 也不见得我们的解法就是最优的，因为测试案例实在还是太少了。

实际工作中，小伙伴们能写出第一种实现，基本已经够了。

如果去微软面试，至少需要知道第二种算法。

如果面试的童鞋看过《剑指 offer》 ，那就应该让他想出至少最后一种优化才算面试通过。

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

- 顺序查找

https://www.cnblogs.com/yw09041432/p/5908444.html

https://www.jb51.net/article/53863.htm

https://blog.csdn.net/jiandanokok/article/details/50517837

- 二分查找

[二分搜索算法](https://zh.wikipedia.org/wiki/%E4%BA%8C%E5%88%86%E6%90%9C%E7%B4%A2%E7%AE%97%E6%B3%95)

https://www.cnblogs.com/ider/archive/2012/04/01/binary_search.html

* any list
{:toc}
