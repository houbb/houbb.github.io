---
layout: post
title:  【leetcode】力扣 数组 array-02-LC56. 合并区间
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, greedy, leetcode]
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


# v1-不排序+纯暴力

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


# v2-不排序+递归

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

# v3-排序+贪心

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

# v4-排序 + 双指针（扫描线的简化版）

## 思路

思路：

先把 start[] 和 end[] 分开排序

用两个指针扫描：

如果 start[i] <= end[j]，说明还在当前区间范围内，继续
如果 start[i] > end[j]，说明当前区间结束，记录下来

## 实现

```java
public int[][] merge(int[][] intervals) {
        int n = intervals.length;
        int[] start = new int[n];
        int[] end = new int[n];
        for (int i = 0; i < n; i++) {
            start[i] = intervals[i][0];
            end[i] = intervals[i][1];
        }
        Arrays.sort(start);
        Arrays.sort(end);

        List<int[]> res = new ArrayList<>();

        for (int i = 0, j = 0; i < n; i++) {
            if (i == n - 1 || start[i + 1] > end[i]) { // 区间结束
                res.add(new int[]{start[j], end[i]});
                j = i + 1;
            }
        }

        return res.toArray(new int[res.size()][]);
    }
```

### 核心代码解释

i 表示当前处理的 end 数组下标（终点）

j 表示当前合并区间的 起点在 start[] 里的位置

1） 判断条件

`if (i == n - 1 || start[i + 1] > end[i])` 的意思：

`i == n-1` 已经到最后一个终点了，当前合并区间必须结束

`start[i+1] > end[i]` 下一个区间的起点已经超过当前的终点，说明没有重叠 → 当前合并段结束

2) 动作

`res.add(new int[]{start[j], end[i]});`

当前合并区间是 `[start[j], end[i]]`

然后 `j = i + 1` 表示下一个合并段从下一个起点重新开始

## 效果

5ms 击败 98.98%

## 反思

优点：代码很简短，没有复杂的 if 嵌套

缺点：丢失了区间原本的对应关系（但题目不需要）

# v5-扫描线（差分计数法）

## 思路

把所有区间的起点当作 +1，终点当作 -1（表示一个区间开始和结束）

按坐标排序并累加计数

当计数从 0 → 1 时，记录区间开始；从 1 → 0 时，记录区间结束

## 实现

```java
public int[][] merge(int[][] intervals) {
    List<int[]> events = new ArrayList<>();
    for (int[] in : intervals) {
        events.add(new int[]{in[0], 1});   // 起点：+1
        events.add(new int[]{in[1], -1});  // 终点：-1
    }
    // 关键：同一坐标时把 start(+1) 放在 end(-1) 前面 -> 使用 b[1]-a[1]
    events.sort((a, b) -> a[0] != b[0] ? a[0] - b[0] : b[1] - a[1]);

    List<int[]> res = new ArrayList<>();
    int count = 0, start = 0;
    for (int[] e : events) {
        if (count == 0) start = e[0];   // 从 0 -> 非0 时开始一个新的合并段
        count += e[1];
        if (count == 0) res.add(new int[]{start, e[0]}); // 从 非0 -> 0 时结束
    }
    return res.toArray(new int[0][]);
}
```

## 效果

11ms 击败 6.67%

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}