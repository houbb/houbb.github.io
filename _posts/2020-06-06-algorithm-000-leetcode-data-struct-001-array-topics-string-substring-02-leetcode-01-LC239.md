---
layout: post
title: leetcode 数组专题之子串 LC239. 滑动窗口最大值
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, string, sliding-window, substring, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下数组这种数据结构。

## 主要知识

数组需要拆分下面几个部分：

1. 理论介绍

2. 源码分析

3. 数据结构实现？

4. 题目练习（按照算法思想分类）

5. 梳理对应的 sdk 包

6. 应用实战

因为这个是 leetcode 系列，所以重点是 4、5(对4再一次总结)。

为了照顾没有基础的小伙伴，会简单介绍一下1的基础理论。

简单介绍1，重点为4。其他不是本系列的重点。

# LC239. 滑动窗口最大值

给你一个整数数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到数组的最右侧。

你只可以看到在滑动窗口内的 k 个数字。滑动窗口每次只向右移动一位。

返回 滑动窗口中的最大值 。

示例 1：

输入：nums = [1,3,-1,-3,5,3,6,7], k = 3
输出：[3,3,5,5,6,7]
解释：
滑动窗口的位置                最大值
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7
示例 2：

输入：nums = [1], k = 1
输出：[1]
 

提示：

1 <= nums.length <= 10^5
-10^4 <= nums[i] <= 10^4
1 <= k <= nums.length


# v1-暴力

## 思路

直接根据滑动的范围，找到最大值就行，让后返回。

## 实现

```java
    public int[] maxSlidingWindow(int[] nums, int k) {
        int lenResult = nums.length - k + 1;
        int[] results = new int[lenResult];


        // 暴力
        int index = 0;
        for(int i = 0; i < nums.length-k+1; i++) {
            // 判断这个窗口内的最大值
            int max = nums[i];
            for(int j = i+1; j < i+k; j++) {
                if(nums[j] > max) {
                    max = nums[j];
                }
            }

            results[index++] = max;
        }
        
        return results;
    }
```

## 效果

超出时间限制 40 / 51 个通过的测试用例

`O(n * k)`

## 反思

这个找最大值的方法，明显太笨了。

# v2-双端队列模拟单调栈

## 思路

因为这个是求最大值，所以可以考虑用单调栈。

双端队列是最好的实现方式。

1）优先级队列是不行的，因为数据可能重复。

2）queue 无法维护最大值

3）heap 实现比较复杂

## 单调栈

队列中的数值，从队头到队尾是递减的

队头永远是当前窗口的最大值

一旦新进来的值更大，就把末尾的（更小的）值全踢出（因为它们再也不可能成为窗口最大值）

## 思路梳理

1）我们每次要从 dequeue 头部移除不在窗口范围的元素。因为头部放的是最大值，影响结果。

2）我们要保障整个 queue 都是递减的，我们要从队尾移除所有比 nums[i] 小的值。

当前元素 nums[i] 比队尾元素值大时，队尾元素不可能成为窗口最大值（因为当前更大，且更靠右）。

结果：不断踢出那些「不可能成为未来最大值」的元素，保证队列头是当前最大值的下标。

3) 新值入队尾

因为比当前值小的值都被移除了，所以这个队列是有序的。放在队尾，作为最大值的候选者

4）满足条件的处理

什么时候窗口满足？

i >= k-1，说明窗口位移已经够了。

## 解法

```java
public int[] maxSlidingWindow(int[] nums, int k) {
        int lenResult = nums.length - k + 1;
        int[] results = new int[lenResult];

        int index = 0;
        // queue 中存放下标，更加灵活
        Deque<Integer> deque = new ArrayDeque<>();
        for(int i = 0; i < nums.length; i++) {
            // 移除队头所有过期的数据
            if(!deque.isEmpty()
                && deque.peekFirst() < i-k+1) {
                deque.removeFirst();
            }

            // 所有比当前小，全部从队尾移除
            while (!deque.isEmpty()
                    && nums[deque.peekLast()] < nums[i]) {
                deque.removeLast();
            }

            // 队尾加入当前索引
            deque.addLast(i);

            // 如果满了
            if(i >= k-1) {
                results[index++] = nums[deque.peekFirst()];
            }
        }

        return results;
    }
```

## 效果

32ms 击败 53.97%


# v3-数组模拟单调栈

## 说明

既然是单调栈，那就可以被其他数据结构模拟。

性能最好的，基本是基础数组

## 实现

```java
public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] res = new int[n - k + 1]; // 结果数组，存放每个窗口的最大值

        int[] p = new int[n]; // 用数组模拟双端队列，存放元素下标
        int head = 0;         // 队头指针，指向队列头元素在 p 数组中的索引
        int tail = -1;        // 队尾指针，指向队列尾元素在 p 数组中的索引，初始为空队列

        for (int i = 0; i < n; i++) {
            // 1. 保持队列单调递减：
            // 当当前元素 nums[i] 大于等于队尾元素 nums[p[tail]] 时，弹出队尾元素，
            // 因为它们不可能成为之后窗口的最大值了
            while (head <= tail && nums[p[tail]] <= nums[i]) {
                tail--; // 队尾元素出队
            }

            // 2. 将当前元素下标加入队尾
            p[++tail] = i;

            // 当前窗口左边界的下标
            int left = i - k + 1;

            // 3. 移除已经滑出窗口范围的队头元素
            // 如果队头元素的下标小于窗口左边界，则该元素已经过期，移除
            if (p[head] < left) {
                head++;
            }

            // 4. 当窗口形成（i >= k-1）时，队头元素对应的 nums[p[head]] 即为当前窗口最大值
            if (left >= 0) {
                res[left] = nums[p[head]];
            }
        }

        return res;
    }
```

## 效果

9ms 击败 98.64%

TC: O(N)

第一梯队算法

# v4-动态规划

## 思路

把数组分成若干块（块大小 = k）

预先计算两个辅助数组：

left[i]：从左往右遍历，记录每个块内，从块起点到当前位置的最大值

right[i]：从右往左遍历，记录每个块内，从块末尾到当前位置的最大值

对于任意窗口 [i, i+k-1]，最大值 = max(right[i], left[i+k-1])

## 解法

```java
public int[] maxSlidingWindow(int[] nums, int k) {
    int n = nums.length;
    if (n == 0) return new int[0];
    if (k == 1) return nums;  // 窗口大小1，最大值就是自己

    int[] left = new int[n];
    int[] right = new int[n];
    int[] res = new int[n - k + 1];

    // left[i] 代表当前块从左边开始到 i 的最大值
    for (int i = 0; i < n; i++) {
        if (i % k == 0) {
            left[i] = nums[i];  // 新块起点
        } else {
            left[i] = Math.max(left[i - 1], nums[i]);
        }
    }

    // right[i] 代表当前块从右边开始到 i 的最大值
    for (int i = n - 1; i >= 0; i--) {
        if ((i + 1) % k == 0 || i == n - 1) {
            right[i] = nums[i];  // 新块终点
        } else {
            right[i] = Math.max(right[i + 1], nums[i]);
        }
    }

    // 计算每个窗口最大值
    for (int i = 0; i <= n - k; i++) {
        res[i] = Math.max(right[i], left[i + k - 1]);
    }

    return res;
}
```

## 效果

8ms 击败 99.59%

TC: O(N)

第一梯队算法

## 反思

dp 其实有时候也挺巧妙的。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解 Top100 经典题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}