---
layout: post
title:  【leetcode】58-差分数组（Difference Array） 力扣 370. 区间加法
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, difference-array, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 力扣 370. 区间加法

给你一个长度为 `length` 的数组 `arr`，初始时全为 0。

还有一个二维数组 `updates`，其中 `updates[i] = [startIdx, endIdx, inc]`，表示将 `inc` 加到 `arr` 中从索引 `startIdx` 到 `endIdx`（包含两端）之间的每个元素上。

请你返回所有 `updates` 操作后得到的最终数组 `arr`。

**示例 1：**

```
输入：length = 5, updates = [[1,3,2],[2,4,3],[0,2,-2]]
输出：[-2,0,3,5,3]
```

**示例 2：**

```
输入：length = 10, updates = []
输出：[0,0,0,0,0,0,0,0,0,0]
```

## 模板方法

```java
public int[] getModifiedArray(int length, int[][] updates) {
}
```


# v1-暴力

## 思路

我们用最笨的方法，直接使用符合原始题目的解法

## 解法

```java
    public int[] getModifiedArray(int length, int[][] updates) {
        int[] results = new int[length];
        Arrays.fill(results, 0);

        // 针对所有的数组处理
        for(int i = 0; i < updates.length; i++) {
            int[] update = updates[i];

            int start = update[0];
            int end = update[1];
            int inc = update[2];

            // 循环处理，包括2端
            for(int j = start; j <= end; j++) {
                results[j] += inc;
            }
        }

        return results;
    }
```

## 复杂度

最坏情况：`O(k * n)`，其中 k 是 updates 的长度，n 是最大可能的区间长度（接近 length）；

所以当 updates 很多，或者每个更新范围很大时，这种写法会超时。

## 反思

如何进一步优化？

# v2-差分

## 思路

回顾一下 [1854. 人口最多的年份](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-topics-difference-array-02-leetcode-02-LC1854)

我们可以构建一个差分数组，记录每个位置具体的变化值。

## 差分数组

如果我们有一个原始数组 arr，其差分数组 diff 是这样构造的：

```java
diff[0] = arr[0];
diff[i] = arr[i] - arr[i - 1];  // i >= 1
```

通过差分数组 diff，我们可以用 O(1) 的时间对任意区间做加法操作。

## 结合我们的写法

以前的写法

```java
// 循环处理，包括2端
for(int j = start; j <= end; j++) {
    results[j] += inc;
}
```

这里的意思是，从 start 到 end 全部 +inc。

如果改为差分的写法：

```java
res[start] += inc;               // 从 start 开始累加 inc
if (end + 1 < length) {
    res[end + 1] -= inc;         // 从 end+1 开始减去 inc，终止影响
}
```

复杂度从 O(n)-> O(1)，但是效果要如何才能一样呢？

那就是差分数组构建完成后，我们要用前缀和把数据加一遍。

这样就等价于原始的写法：

1) start 开始全部 +inc

2) end 之后 +inc 全部抵消掉。

很巧妙，但是不太好想。

估计还是这种题目刷少了。

## 解法

```java
public int[] getModifiedArray(int length, int[][] updates) {
        int[] differArray = new int[length];
        int[] results = new int[length];

        // 差分
        for(int[] update : updates) {
            int start = update[0];
            int end = update[1];
            int inc = update[2];

            // start 开始+inc
            differArray[start] += inc;
            // 表示从 end + 1 开始，不再加 inc 了，要把它减回来
            if(end + 1 < length) {
                differArray[end + 1] -= inc;
            }
        }

        // 前缀和恢复
        results[0] = differArray[0];
        for(int i = 1; i < length; i++) {
            results[i] = differArray[i] + results[i-1];
        }

        return results;
}
```

## 复杂度

时间复杂度 `O(n + m)`

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}