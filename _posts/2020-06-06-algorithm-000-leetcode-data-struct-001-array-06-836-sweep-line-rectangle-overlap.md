---
layout: post
title: leetcode 扫描线专题 06-leetcode.836 rectangle-overlap 力扣.836 矩形重叠
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, sweep-line, sf]
published: true
---


# 题目

矩形以列表 [x1, y1, x2, y2] 的形式表示，其中 (x1, y1) 为左下角的坐标，(x2, y2) 是右上角的坐标。

矩形的上下边平行于 x 轴，左右边平行于 y 轴。

如果相交的面积为 正 ，则称两矩形重叠。

需要明确的是，只在角或边接触的两个矩形不构成重叠。

给出两个矩形 rec1 和 rec2。如果它们重叠，返回 true；否则，返回 false 。

示例 1：

```
输入：rec1 = [0,0,2,2], rec2 = [1,1,3,3]
输出：true
```

示例 2：

```
输入：rec1 = [0,0,1,1], rec2 = [1,0,2,1]
输出：false
```

示例 3：

```
输入：rec1 = [0,0,1,1], rec2 = [2,2,3,3]
输出：false
```

提示：

rect1.length == 4

rect2.length == 4

-10^9 <= rec1[i], rec2[i] <= 10^9

rec1 和 rec2 表示一个面积不为零的有效矩形

# 小结

感觉有一个顺序的问题。

应该先学习一下 T836 + T223 + T850 可能再做这一题就会比较自然。

# v1-基本思路

## 思路

个人思路

因为只有两个矩形。

所以判断方法比较简单：

1）以左边矩形固定，分别判断右边矩形的 4 个点是否在左边的矩形内

2）判断逻辑：

x y 是否在第一个范围内即可

## 解法

```java
class Solution {
    public boolean isRectangleOverlap(int[] rec1, int[] rec2) {
        // 判断 x 轴和 y 轴投影是否有交集
        boolean xOverlap = rec1[2] > rec2[0] && rec1[0] < rec2[2];
        boolean yOverlap = rec1[3] > rec2[1] && rec1[1] < rec2[3];
        
        // 两个投影都有交集才算重叠
        return xOverlap && yOverlap;
    }
}
```


# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 扫描线专题

[leetcode 扫描线专题 06-扫描线算法（Sweep Line Algorithm）](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-000-sweep-line-intro)

[leetcode 扫描线专题 06-leetcode.218 the-skyline-problem 力扣.218 天际线问题](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-218-sweep-line-skyline)

[leetcode 扫描线专题 06-leetcode.252 meeting room 力扣.252 会议室](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-252-sweep-line-meeting-room)

[leetcode 扫描线专题 06-leetcode.253 meeting room ii 力扣.253 会议室 II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-06-253-sweep-line-meeting-room-ii)

# 参考资料

https://leetcode.cn/problems/4sum/

* any list
{:toc}