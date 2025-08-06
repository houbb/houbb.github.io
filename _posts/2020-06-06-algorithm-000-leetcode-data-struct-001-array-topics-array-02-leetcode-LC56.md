---
layout: post
title:  【leetcode】力扣 数组 array-02-56. 合并区间
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 56. 合并区间

以数组 intervals 表示若干个区间的集合，其中单个区间为 intervals[i] = [starti, endi] 。

请你合并所有重叠的区间，并返回 一个不重叠的区间数组，该数组需恰好覆盖输入中的所有区间 。
 

示例 1：

输入：intervals = [[1,3],[2,6],[8,10],[15,18]]
输出：[[1,6],[8,10],[15,18]]
解释：区间 [1,3] 和 [2,6] 重叠, 将它们合并为 [1,6].
示例 2：

输入：intervals = [[1,4],[4,5]]
输出：[[1,5]]
解释：区间 [1,4] 和 [4,5] 可被视为重叠区间。
 

提示：

1 <= intervals.length <= 10^4
intervals[i].length == 2
0 <= starti <= endi <= 10^4




# v1-排序+贪心

## 思路

这一题的排序+贪心反而是最好理解的。

但是贪心其实是不太好想的 因为每次贪心的策略都不同

## 实现

```java
    public int[][] merge(int[][] intervals) {
        // 按照开始位置排序
        Arrays.sort(intervals, new Comparator<int[]>() {
            @Override
            public int compare(int[] o1, int[] o2) {
                return o1[0] - o2[0];
            }
        });

        int n = intervals.length;

        
        List<int[]> tempList = new ArrayList<>();

        // 遍历所有区间，如果当前的起点在上一个末尾之前，则合并
        // 如果在上一个区间末尾之后，则把上一个区间放到答案中去
        int[] pre = intervals[0];
        for(int i = 1; i < n; i++) {
            int[] cur = intervals[i];
            // 如果当前的起点在上一个末尾之前，则合并
            if(cur[0] <= pre[1]) {
                pre[1] = Math.max(pre[1], cur[1]);
            } else {
                // 无重叠，直接上一个元素结果
                tempList.add(pre);

                // 更新
                pre = cur;
            }
        }

        // 加入最后一个
        tempList.add(pre);

        // 转换为 array
        int[][] results = new int[tempList.size()][2];
        for(int i = 0; i< tempList.size(); i++) {
            results[i] = tempList.get(i);
        }
        return results;
    }
```

## 效果

9ms击败 15.81%

## 复杂度

时间	O(n log n)（排序）+ O(n)（合并）

空间	O(n)（结果列表）

基本算是这一题的标准解法，其他的看了下技巧性太强，不太适合记忆。

# v2-不排序+纯暴力

## 思路

假设我们不对数据做任何预处理。

做最笨的实现，要怎么解决？

## 核心流程

1) 遍历 intervals，每次取出一个区间 current；

2) 在结果集中遍历所有已有区间，看是否有重叠；

如果有重叠，就合并成新区间，替换旧区间；

如果没有重叠，就加入结果集；

3) 重复这个过程直到所有区间都处理完。

## 解法

```java
public int[][] merge(int[][] intervals) {
    List<int[]> list = new ArrayList<>();
    for (int[] itv : intervals) {
        list.add(itv);
    }

    boolean changed = true;

    while (changed) {
        changed = false;
        List<int[]> next = new ArrayList<>();

        while (!list.isEmpty()) {
            int[] curr = list.remove(0);
            boolean merged = false;

            for (int i = 0; i < list.size(); i++) {
                int[] other = list.get(i);
                if (overlap(curr, other)) {
                    curr = mergeTwo(curr, other);
                    list.remove(i);
                    merged = true;
                    changed = true;
                    break; // 本轮合并后，再重新处理 curr
                }
            }

            if (merged) {
                list.add(0, curr); // 把合并后的放回去继续处理
            } else {
                next.add(curr); // 没有合并，收集结果
            }
        }

        list = next;
    }

    return list.toArray(new int[list.size()][]);
}

private boolean overlap(int[] a, int[] b) {
    return !(a[1] < b[0] || b[1] < a[0]);
}

private int[] mergeTwo(int[] a, int[] b) {
    return new int[]{Math.min(a[0], b[0]), Math.max(a[1], b[1])};
}
```

## 复杂度

TC 最坏仍为 O(n²)


# v3-不排序+递归

## 思路

核心流程不变，只是改为递归写法。

可能递归的看起来更加自然一些。

## 实现

```java
public int[][] merge(int[][] intervals) {
    List<int[]> list = new ArrayList<>();
    for (int[] interval : intervals) {
        list.add(interval);
    }

    List<int[]> merged = mergeRecursive(list);
    return merged.toArray(new int[merged.size()][]);
}

private List<int[]> mergeRecursive(List<int[]> intervals) {
    if (intervals.isEmpty()) return new ArrayList<>();

    int[] curr = intervals.remove(0);
    List<int[]> rest = new ArrayList<>();
    boolean merged = false;

    for (int[] other : intervals) {
        if (overlap(curr, other)) {
            curr = mergeTwo(curr, other);
            merged = true;
        } else {
            rest.add(other);
        }
    }

    if (merged) {
        // 可能还会跟 rest 中的其他区间重叠，继续递归
        rest.add(0, curr);
        return mergeRecursive(rest);
    } else {
        // 没有任何重叠，curr 已经是独立区间
        List<int[]> result = mergeRecursive(rest);
        result.add(0, curr); // 保证顺序
        return result;
    }
}

private boolean overlap(int[] a, int[] b) {
    return !(a[1] < b[0] || b[1] < a[0]);
}

private int[] mergeTwo(int[] a, int[] b) {
    return new int[]{Math.min(a[0], b[0]), Math.max(a[1], b[1])};
}
```

## 复杂度

TC 最坏仍为 O(n²)


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。



# 参考资料

* any list
{:toc}