---
layout: post
title: leetcode 扫描线专题 06-leetcode.223 rectangle-area 力扣.223 矩形面积
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, sweep-line, sf]
published: true
---


# 题目

给你 二维 平面上两个 由直线构成且边与坐标轴平行/垂直 的矩形，请你计算并返回两个矩形覆盖的总面积。

每个矩形由其 左下 顶点和 右上 顶点坐标表示：

第一个矩形由其左下顶点 (ax1, ay1) 和右上顶点 (ax2, ay2) 定义。
第二个矩形由其左下顶点 (bx1, by1) 和右上顶点 (bx2, by2) 定义。
 

示例 1：

Rectangle Area
输入：ax1 = -3, ay1 = 0, ax2 = 3, ay2 = 4, bx1 = 0, by1 = -1, bx2 = 9, by2 = 2
输出：45
示例 2：

输入：ax1 = -2, ay1 = -2, ax2 = 2, ay2 = 2, bx1 = -2, by1 = -2, bx2 = 2, by2 = 2
输出：16
 

提示：

-10^4 <= ax1, ay1, ax2, ay2, bx1, by1, bx2, by2 <= 10^4


# v1-重叠面积

## 思路

如果矩形不重叠，就是 2 个矩形的面积之和。

如果重合，计算出重叠面积，就是原始的面积之和-重叠面积。

如果两个矩形重叠，那么重叠的面积一定大于0.

于是问题变成如何计算重叠的矩形面积？

![二维](https://pic.leetcode-cn.com/255e661fd9bedddd608546a12f10f0d83bab7092e7fc5cda0c76a58540d5b9b9.jpg)

如果有重叠，重叠的部分也一定是一个矩形

交集面积的计算方式是基于两个矩形的重叠区域的 **左下角和右上角的坐标** 来推算的。

具体来说，两个矩形的交集矩形（如果存在）也是一个矩形，它的边界由两个矩形的边界决定。

## 计算重叠面积

- 第一个矩形 `rec1 = [x1, y1, x2, y2]`，表示其左下角坐标为 `(x1, y1)`，右上角坐标为 `(x2, y2)`。

- 第二个矩形 `rec2 = [x3, y3, x4, y4]`，表示其左下角坐标为 `(x3, y3)`，右上角坐标为 `(x4, y4)`。

如果两个矩形有交集，那么交集的矩形的左下角和右上角的坐标可以通过取两者的最大和最小值来确定：

- **交集矩形的左下角**：`(x1', y1') = (max(x1, x3), max(y1, y3))`

- **交集矩形的右上角**：`(x2', y2') = (min(x2, x4), min(y2, y4))`

### 判断交集是否存在

交集矩形的面积只有在其宽度和高度都大于 0 时才存在。

如果交集矩形的宽度或高度小于等于 0，说明两个矩形没有交集。

因此，交集矩形的宽度和高度的计算方式如下：

- 宽度：`width = x2' - x1'`
- 高度：`height = y2' - y1'`

交集矩形的面积则为：

- 面积 = `width * height`，但是如果宽度或高度小于等于 0，面积就为 0。

因此，计算交集的面积时，我们需要确保 `width > 0` 和 `height > 0`，否则交集的面积为 0。

### 结果

完整的面积 = 两个矩形面积之和 - 重叠面积

## 代码示例

```java
class Solution {
    public int computeArea(int ax1, int ay1, int ax2, int ay2, int bx1, int by1, int bx2, int by2) {
        int rect1 = rectangleArea(ax1, ay1, ax2, ay2);
        int rect2 = rectangleArea(bx1, by1, bx2, by2);

        int overlap = rectangleOverlapArea(new int[]{ax1, ay1, ax2, ay2}, new int[]{bx1, by1, bx2, by2});

        return rect1-overlap+rect2;
    }

    private int rectangleArea(int ax1, int ay1, int ax2, int ay2) {
        return (ax2-ax1) * (ay2-ay1);
    }

    public int rectangleOverlapArea(int[] rec1, int[] rec2) {
        // 计算交集矩形的左下角和右上角
        int x1 = Math.max(rec1[0], rec2[0]);
        int y1 = Math.max(rec1[1], rec2[1]);
        int x2 = Math.min(rec1[2], rec2[2]);
        int y2 = Math.min(rec1[3], rec2[3]);

        // 计算交集的宽度和高度
        int width = x2 - x1;
        int height = y2 - y1;

        // 如果交集的宽度和高度都大于 0，说明有重叠
        if (width > 0 && height > 0) {
            return width * height;
        }

        // 没有重叠
        return 0;
    }
}
```

## 效果 

2ms 击败21.43%

## 小结

这种解法相对对比较自然。

# v2-扫描线

![二维](https://pic.leetcode-cn.com/255e661fd9bedddd608546a12f10f0d83bab7092e7fc5cda0c76a58540d5b9b9.jpg)

## 思路

按照 x 轴，将整体的矩形面积，按照每一段 x 拆分为小矩形。

最后的和就是整体矩形之和。

## 解法

```java
public int computeArea(int ax1, int ay1, int ax2, int ay2, int bx1, int by1, int bx2, int by2) {
    int[][] arr = new int[2][];
    arr[0] = new int[]{ax1, ay1, ax2, ay2};
    arr[1] = new int[]{bx1, by1, bx2, by2};
    Arrays.sort(arr, (o1, o2) -> o1[1] == o2[1] ? o1[3] - o2[3] : o1[1] - o2[1]);
    List<Integer> xList = Arrays.asList(ax1, ax2, bx1, bx2);
    Collections.sort(xList);
    int ans = 0;
    for (int i = 1; i < 4; i++) {
        int width = xList.get(i) - xList.get(i-1);
        for (int[] ints : getLine(xList.get(i-1), xList.get(i), arr)) {
            ans += width * (ints[1] - ints[0]);
        }
    }
    return ans;
}

private List<int[]> getLine(int x1, int x2, int[][] arr) {
    List<int[]> list = new ArrayList<>();
    for (int[] ints : arr) {
        if (x1 >= ints[0] && x2 <= ints[2]) {
            if (list.isEmpty()) {
                list.add(new int[]{ints[1], ints[3]});
            } else {
                int[] tmp = list.get(list.size() - 1);
                if (tmp[1] < ints[1]) {
                    list.add(new int[]{ints[1], ints[3]});
                } else if (tmp[1] < ints[3]) {
                    tmp[1] = ints[3];
                }
            }
        }
    }
    return list;
}
```

## 效果

6ms 击败 4.76%

# 小结

整体上而言，我比较喜欢重叠面积的方式，这种比较好想到，而且可以扩展。

当然扫描线也是一种很通用的解法。

这一题的巧思属于维度投影的解法，很巧妙。

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 扫描线专题

[leetcode 扫描线专题 06-扫描线算法（Sweep Line Algorithm）](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-000-sweep-line-intro)

[leetcode 扫描线专题 06-leetcode.218 the-skyline-problem 力扣.218 天际线问题](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-218-sweep-line-skyline)

[leetcode 扫描线专题 06-leetcode.252 meeting room 力扣.252 会议室](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-252-sweep-line-meeting-room)

[leetcode 扫描线专题 06-leetcode.253 meeting room ii 力扣.253 会议室 II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-253-sweep-line-meeting-room-ii)

[leetcode 扫描线专题 06-leetcode.1851 minimum-interval-to-include-each-query 力扣.1851 包含每个查询的最小区间](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-1851-sweep-line-minimum-interval-to-include-each-query)

[leetcode 扫描线专题 06-leetcode.223 rectangle-area 力扣.223 矩形面积](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-223-sweep-line-rectangle-area)

[leetcode 扫描线专题 06-leetcode.3047 find-the-largest-area-of-square-inside-two-rectangles 力扣.3047 求交集区域的最大正方形面积](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-3047-sweep-line-find-the-largest-area-of-square-inside-two-rectangles)

[leetcode 扫描线专题 06-leetcode.391 perfect-rectangle 力扣.391 完美矩形](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-391-sweep-line-perfect-rectangle)

[leetcode 扫描线专题 06-leetcode.836 rectangle-overlap 力扣.836 矩形重叠](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-836-sweep-line-rectangle-overlap)

[leetcode 扫描线专题 06-leetcode.850 rectangle-area 力扣.850 矩形面积 II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-850-sweep-line-rectangle-area-ii)

# 参考资料

https://leetcode.cn/problems/4sum/

https://leetcode.cn/problems/rectangle-overlap/solutions/155825/tu-jie-jiang-ju-xing-zhong-die-wen-ti-zhuan-hua-we/

* any list
{:toc}