---
layout: post
title:  【leetcode】58-差分数组（Difference Array） 力扣 1109. 航班预订统计 corporate-flight-bookings
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, difference-array, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 力扣 1109. 航班预订统计

这里有 n 个航班，它们分别从 1 到 n 进行编号。

有一份航班预订表 bookings ，表中第 i 条预订记录 `bookings[i] = [firsti, lasti, seatsi]` 意味着在从 firsti 到 lasti （包含 firsti 和 lasti ）的 每个航班 上预订了 seatsi 个座位。

请你返回一个长度为 n 的数组 answer，里面的元素是每个航班预定的座位总数。
 
示例 1：

```
输入：bookings = [[1,2,10],[2,3,20],[2,5,25]], n = 5
输出：[10,55,45,25,25]
解释：
航班编号        1   2   3   4   5
预订记录 1 ：   10  10
预订记录 2 ：       20  20
预订记录 3 ：       25  25  25  25
总座位数：      10  55  45  25  25
因此，answer = [10,55,45,25,25]
```

示例 2：

```
输入：bookings = [[1,2,10],[2,2,15]], n = 2
输出：[10,25]
解释：
航班编号        1   2
预订记录 1 ：   10  10
预订记录 2 ：       15
总座位数：      10  25
因此，answer = [10,25]
```

提示：

1 <= n <= 2 * 10^4
1 <= bookings.length <= 2 * 10^4
bookings[i].length == 3
1 <= firsti <= lasti <= n
1 <= seatsi <= 10^4


# v1-暴力

## 思路

我们用最笨的方法，直接使用符合原始题目的解法

注意下下标，这里是从 1 开始的。

## 解法

```java
    public int[] corpFlightBookings(int[][] bookings, int n) {
        int[] results = new int[n];

        for(int[] booking : bookings) {
            int startIx = booking[0];
            int endIx = booking[1];
            int seatNum = booking[2];

            for(int i = startIx-1; i <= endIx-1; i++) {
                results[i] += seatNum;
            }
        }
        return results;
    }
```

## 效果

804 ms 击败 8.88%

## 反思

如何进一步优化？

# v2-差分

## 思路

回顾一下 [1854. 人口最多的年份](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-topics-difference-array-02-leetcode-02-LC1854)

[370. 区间加法](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-topics-difference-array-02-leetcode-03-LC370)

我们可以构建一个差分数组，记录每个位置具体的变化值。

## 差分数组

如果我们有一个原始数组 arr，其差分数组 diff 是这样构造的：

```java
diff[0] = arr[0];
diff[i] = arr[i] - arr[i - 1];  // i >= 1
```

通过差分数组 diff，我们可以用 O(1) 的时间对任意区间做加法操作。

## 解法

```java
    public int[] corpFlightBookings(int[][] bookings, int n) {
        int[] differArray = new int[n];
        for(int[] booking : bookings) {
            int startIx = booking[0]-1;
            int endIx = booking[1]-1;
            int seatNum = booking[2];

            // startIx 开始 +seat
            differArray[startIx] += seatNum;

            // endIx 之后，去掉 seat
            if(endIx + 1 < n) {
                differArray[endIx+1] -= seatNum;
            }
        }

        // 前缀和恢复数组
        int[] results = new int[n];
        results[0] = differArray[0];
        for(int i = 1; i < n; i++) {
            results[i] = results[i-1] + differArray[i];
        }
        return results;
    }
```

## 效果

2ms 击败 100.00%

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}