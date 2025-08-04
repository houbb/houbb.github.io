---
layout: post
title:  【leetcode】58-差分数组（Difference Array） 力扣 1094. 拼车 car-pooling
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, difference-array, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 1094. 拼车 car-pooling

车上最初有 capacity 个空座位。车 只能 向一个方向行驶（也就是说，不允许掉头或改变方向）

给定整数 capacity 和一个数组 trips ,  `trip[i] = [numPassengersi, fromi, toi]` 表示第 i 次旅行有 numPassengersi 乘客，接他们和放他们的位置分别是 fromi 和 toi 。

这些位置是从汽车的初始位置向东的公里数。

当且仅当你可以在所有给定的行程中接送所有乘客时，返回 true，否则请返回 false。

示例 1：

```
输入：trips = [[2,1,5],[3,3,7]], capacity = 4
输出：false
```

示例 2：

```
输入：trips = [[2,1,5],[3,3,7]], capacity = 5
输出：true
```


提示：

1 <= trips.length <= 1000
trips[i].length == 3
1 <= numPassengersi <= 100
0 <= fromi < toi <= 1000
1 <= capacity <= 10^5


# v1-暴力

## 思路

我们用最笨的方法，直接使用符合原始题目的解法

这里主要要注意下，to 右边是不需要影响的。此时乘客下车。

## 解法

```java
    public boolean carPooling(int[][] trips, int capacity) {
        int[] ways = new int[1001];

        for(int[] trip : trips) {
            int num = trip[0];
            int from = trip[1];
            int to = trip[2];


            // 包含右边吗？
            for(int i = from; i < to; i++) {
                ways[i] += num;
            }
        }

        // 计算最大值
        for(int i = 0; i < 1001; i++) {
            if(ways[i] > capacity) {
                return false;
            }
        }

        return true;
    }
```


## 效果

3ms 击败 29.59%

## 反思

如何进一步优化？

# v2-差分

## 思路

回顾一下 [1854. 人口最多的年份](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-topics-difference-array-02-leetcode-02-LC1854)

[370. 区间加法](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-topics-difference-array-02-leetcode-03-LC370)

[1109. 区间加法](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-topics-difference-array-02-leetcode-04-LC1109)

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
 public boolean carPooling(int[][] trips, int capacity) {
        int[] differArray = new int[1001];

        for(int[] trip : trips) {
            int num = trip[0];
            int from = trip[1];
            int to = trip[2];

            differArray[from] += num;
            // 右边不包含，直接减。更加接近 LC1854
            differArray[to] -= num;
        }


        int[] ways = new int[1001];
        // 计算最大值
        ways[0] = differArray[0];
        if(ways[0] > capacity) {
            return false;
        }

        for(int i = 1; i < 1001; i++) {
            ways[i] += ways[i-1] + differArray[i];
            if(ways[i] > capacity) {
                return false;
            }
        }

        return true;
    }
```

## 效果

1ms 击败 99.28%

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}