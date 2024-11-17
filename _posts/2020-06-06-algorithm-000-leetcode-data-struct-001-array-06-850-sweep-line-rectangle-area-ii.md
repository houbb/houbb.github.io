---
layout: post
title: leetcode 扫描线专题 06-leetcode.850 rectangle-area 力扣.850 矩形面积 II
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, sweep-line, sf]
published: true
---


# 题目

给你一个轴对齐的二维数组 rectangles 。 对于 rectangle[i] = [x1, y1, x2, y2]，其中（x1，y1）是矩形 i 左下角的坐标， (xi1, yi1) 是该矩形 左下角 的坐标， (xi2, yi2) 是该矩形 右上角 的坐标。

计算平面中所有 rectangles 所覆盖的 总面积 。任何被两个或多个矩形覆盖的区域应只计算 一次 。

返回 总面积 。因为答案可能太大，返回 109 + 7 的 模 。

![area](https://s3-lc-upload.s3.amazonaws.com/uploads/2018/06/06/rectangle_area_ii_pic.png)

示例 1：

输入：rectangles = [[0,0,2,2],[1,0,2,3],[1,0,3,1]]
输出：6
解释：如图所示，三个矩形覆盖了总面积为 6 的区域。
从(1,1)到(2,2)，绿色矩形和红色矩形重叠。
从(1,0)到(2,3)，三个矩形都重叠。


示例 2：

输入：rectangles = [[0,0,1000000000,1000000000]]
输出：49
解释：答案是 1018 对 (109 + 7) 取模的结果， 即 49 。
 

提示：

1 <= rectangles.length <= 200
rectanges[i].length = 4
0 <= xi1, yi1, xi2, yi2 <= 10^9


# v1-切格子

## 思路

[一个非常简单、易懂且能过关的方法：切块法](https://leetcode.cn/problems/rectangle-area-ii/solutions/1827933/yi-ge-fei-chang-jian-dan-yidong-by-pan-s-l0hb/)

官方题解难度挺高，花了半天才学会，又花了大半天，才写完。
后来想，干脆不用什么差分数组、线段树，就简单的方法，行不行？

这个简单的方法，就是按照所有矩形的横线和竖线，进行切块！
假设横线有n条，竖线有m条，那就切n*m个块。
然后对每个块暴力去check，是不是属于哪个矩形，如果属于，那就把这块面积加上。

图示一下，假设这样的矩形：

![1](https://pic.leetcode-cn.com/1663317205-Ejajob-image.png)

我们这样切割、切块：

![切割](https://pic.leetcode-cn.com/1663317402-zZRorJ-image.png)

然后对每个块进行判断！

彩色的就会被判断属于某个矩形，加上面积，得到结果。

很简单吧。

## 实现

```java
import java.util.*;

class Solution {
    public int rectangleArea(int[][] rectangles) {
        final int MOD = 1_000_000_007;
        int n = rectangles.length;
        
        // Step 1: 收集并排序所有的垂直边界 (sweeps)
        Set<Integer> xSet = new HashSet<>();
        for (int[] rect : rectangles) {
            xSet.add(rect[0]); // 左边界
            xSet.add(rect[2]); // 右边界
        }
        List<Integer> sweeps = new ArrayList<>(xSet);
        Collections.sort(sweeps);
        
        // Step 2: 收集并排序所有的水平边界 (hbounds)
        Set<Integer> ySet = new HashSet<>();
        for (int[] rect : rectangles) {
            ySet.add(rect[1]); // 底边界
            ySet.add(rect[3]); // 顶边界
        }
        List<Integer> hbounds = new ArrayList<>(ySet);
        Collections.sort(hbounds);
        
        int m = hbounds.size();
        long ans = 0;
        
        // Step 3: 遍历每个垂直区间和水平区间
        for (int i = 0; i < sweeps.size() - 1; i++) {
            for (int j = 0; j < m - 1; j++) {
                // 构造当前区间 [x1, x2] 和 [y1, y2]
                int x1 = sweeps.get(i), x2 = sweeps.get(i + 1);
                int y1 = hbounds.get(j), y2 = hbounds.get(j + 1);
                
                // Step 4: 检查当前区间是否被至少一个矩形完全覆盖
                if (check(new int[]{x1, y1, x2, y2}, rectangles)) {
                    // 累加当前区间面积
                    ans += (long) (y2 - y1) * (x2 - x1);
                    ans %= MOD;
                }
            }
        }
        
        return (int) ans;
    }
    
    // 检查当前区间 [x1, y1, x2, y2] 是否被至少一个矩形完全覆盖
    private boolean check(int[] rect, int[][] rectangles) {
        int x1 = rect[0], y1 = rect[1], x2 = rect[2], y2 = rect[3];
        for (int[] r : rectangles) {
            if (x1 >= r[0] && x2 <= r[2] && y1 >= r[1] && y2 <= r[3]) {
                return true;
            }
        }
        return false;
    }
}
```

## 效果

26ms 击败-%


# v2-扫描线

> [【宫水三叶】扫描线模板题](https://leetcode.cn/problems/rectangle-area-ii/solutions/1826992/gong-shui-san-xie-by-ac_oier-9r36/?envType=problem-list-v2&envId=line-sweep)

## 思路

将所有给定的矩形的左右边对应的 x 端点提取出来并排序，每个端点可看作是一条竖直的线段（红色），问题转换为求解「由多条竖直线段分割开」的多个矩形的面积总和（黄色）：

![黄色部分](https://pic.leetcode-cn.com/1663294074-shUiEA-image.png)

相邻线段之间的宽度为单个矩形的「宽度」（通过 x 差值直接算得），问题转换为求该区间内高度的并集（即矩形的高度）。

由于数据范围只有 200，我们可以对给定的所有矩形进行遍历，统计所有对该矩形有贡献的 y 值线段（即有哪些 rs[i] 落在该矩形中），再对线段进行求交集（总长度），即可计算出该矩形的「高度」，从而计算出来该矩形的面积。

![area](https://pic.leetcode-cn.com/1663293673-WeoWgG-image.png)

## 实现拆分

### 事件初始化

每一个 rect，拆分为左边，右边。

`(x, y1, y2, 进出标识)`

```java
// Step 1: Create events
List<int[]> events = new ArrayList<>();
for (int[] rect : rectangles) {
    //x_left y1 y2 进入 
    events.add(new int[]{rect[0], rect[1], rect[3], 1});  // Enter event
    //x_right y1 y2 离开 
    events.add(new int[]{rect[2], rect[1], rect[3], -1}); // Exit event
}
```

### 排序规则

首先按照 x 排序; 

x 相同，优先处理进入事件（矩形的左边界）。这是因为进入事件需要先将当前矩形加入活动区间，之后处理退出事件时才能正确移除。

```java
// Step 2: Sort events by x-coordinate, with ties broken by type
events.sort((a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[3], b[3]));
```

### 面积计算

剩下的就是遍历 events

```
面积 = 宽度 * 高度
宽度 = x_cur - x_pre 
```

主要难度是高度如何计算？

### active 区间高度如何计算？

高度的计算

其中 active 的高度数组更新逻辑如下：

```java
for (int i = 0; i < events.size(); i++) {
    int[] event = events.get(i);
    int currX = event[0], y1 = event[1], y2 = event[2], type = event[3];
    // Calculate area since last x-coordinate
    // 从第二个元素开始计算 
    // 面积 = (x 跨度) * 高度
    if (i > 0) {
        area += computeHeight(active) * (long) (currX - prevX);
        area %= MOD;
    }
    // Update active intervals
    if (type == 1) { // Enter event
        //事件进入，则 
        active.put(y1, active.getOrDefault(y1, 0) + 1);
        active.put(y2, active.getOrDefault(y2, 0) - 1);
    } else { // Exit event
        active.put(y1, active.getOrDefault(y1, 0) - 1);
        active.put(y2, active.getOrDefault(y2, 0) + 1);
    }
    prevX = currX;
}
```

计算 height

这里要注意，treeMap 是顺序的。

```java
private long computeHeight(TreeMap<Integer, Integer> active) {
    long height = 0; // 初始化总高度为 0
    int prevY = 0, count = 0; // prevY 记录上一个 y 坐标，count 表示活动区间是否有效

    // 遍历所有活动区间集合中的键值对，按 y 坐标从小到大
    for (Map.Entry<Integer, Integer> entry : active.entrySet()) {
        int y = entry.getKey(); // 当前 y 坐标
        int type = entry.getValue(); // 当前事件的类型 (+1 表示开始，-1 表示结束)

        // 如果当前活动区间有效，累加有效高度
        if (count > 0) {
            height += y - prevY; // 从 prevY 到 y 的高度累加到总高度
        }

        // 更新 count，根据 type (+1 或 -1) 修改活动区间计数
        count += type;

        // 更新 prevY 为当前的 y 坐标
        prevY = y;
    }

    return height; // 返回总高度
}
```

这里的高度是拆分成一个个段，累加起来的。

## 实现

我们采用经典的扫描线算法+事件驱动

```java
import java.util.*;

class Solution {
    public int rectangleArea(int[][] rectangles) {
        int MOD = (int) 1e9 + 7;

        // Step 1: Create events
        List<int[]> events = new ArrayList<>();
        for (int[] rect : rectangles) {
            //x_left y1 y2 进入 
            events.add(new int[]{rect[0], rect[1], rect[3], 1});  // Enter event
            //x_right y1 y2 离开 
            events.add(new int[]{rect[2], rect[1], rect[3], -1}); // Exit event
        }

        // Step 2: Sort events by x-coordinate, with ties broken by type
        // 首先按照 x 排序; x 相同，优先处理进入事件（矩形的左边界）。这是因为进入事件需要先将当前矩形加入活动区间，之后处理退出事件时才能正确移除。
        events.sort((a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[3], b[3]));

        // Step 3: Process events
        // TreeMap 是为了保障数据有序，且平衡插入+remove 的复杂度为 logn
        TreeMap<Integer, Integer> active = new TreeMap<>(); // Active intervals
        int prevX = 0;
        long area = 0;

        for (int i = 0; i < events.size(); i++) {
            int[] event = events.get(i);
            int currX = event[0], y1 = event[1], y2 = event[2], type = event[3];

            // Calculate area since last x-coordinate
            // 从第二个元素开始计算 
            // 面积 = (x 跨度) * 高度
            if (i > 0) {
                area += computeHeight(active) * (long) (currX - prevX);
                area %= MOD;
            }

            // Update active intervals
            if (type == 1) { // Enter event
                active.put(y1, active.getOrDefault(y1, 0) + 1);
                active.put(y2, active.getOrDefault(y2, 0) - 1);
            } else { // Exit event
                active.put(y1, active.getOrDefault(y1, 0) - 1);
                active.put(y2, active.getOrDefault(y2, 0) + 1);
            }

            // 更新 x，也可以直接在开始的时候取 events[i-1][0]
            prevX = currX;
        }

        return (int) area;
    }

    // Helper function to compute the total height of active intervals
    private long computeHeight(TreeMap<Integer, Integer> active) {
        long height = 0;
        int prevY = 0, count = 0;

        for (Map.Entry<Integer, Integer> entry : active.entrySet()) {
            int y = entry.getKey(), type = entry.getValue();
            if (count > 0) {
                height += y - prevY;
            }
            count += type;
            prevY = y;
        }
        return height;
    }
}
```

## 效果 

8ms 击败85.71%

## 小结

这种解法相对很强大，要处理的细节还是不少的。

# 疑问

## 1. 为什么高度计算这么麻烦，不能直接是当前有效的最大值 y？

虽然从直观上看，似乎只需要找出当前有效区间的 **最大 y 坐标** 就足够了

但实际上在这个问题中，**区间的高度不仅仅是最大 y 值**，而是 **所有有效区间的合并高度**，这就涉及到区间的合并和覆盖问题。

### **为什么不能只用最大 y 坐标呢？**

假设有多个重叠的矩形，它们的高度并不等于最大 y 和最小 y 之间的差值。为了更清楚地理解这一点，我们来看一个简单的例子。

#### 举个例子

假设有以下两个矩形：
1. 第一个矩形：[1, 1, 4, 5]，表示左下角 1, 1 和右上角 4, 5。
2. 第二个矩形：[2, 3, 5, 6]，表示左下角 2, 3 和右上角 5, 6。

这两个矩形的 **y 坐标** 分别是：
- 第一个矩形的 y 范围是从  y = 1  到  y = 5 。
- 第二个矩形的 y 范围是从  y = 3  到  y = 6 。

若只取 **最大 y**，那么就会错过区间重叠部分的计算。具体来说：
- 如果只考虑最大 y，最大值是  y = 6 ，最小值是  y = 1 ，得出的高度是  6 - 1 = 5 ，这显然不正确。
- 但实际上，这两个矩形的合并高度是从  y = 1  到  y = 6 ，但它们的 **有效高度** 是：
  - 从  y = 1  到  y = 3  是第一个矩形的高度（长度为 2）。
  - 从  y = 3  到  y = 5  是两个矩形重叠的部分（长度为 2）。
  - 从  y = 5  到  y = 6  是第二个矩形的高度（长度为 1）。

因此，**总高度** 应该是  2 + 2 + 1 = 5 ，而不是简单的  6 - 1 = 5 。

### **为什么需要计算合并的高度？**

通过 `computeHeight` 中的累加方式，我们计算的是每一段 **不重叠的有效高度**。

这背后的核心思想是，多个矩形之间可能有 **重叠部分**，它们会共享某些 y 范围，而我们要确保 **每个 y 范围的高度只计算一次**。

在 `TreeMap` 的遍历过程中，通过事件类型（进入和退出）更新当前活动区间，利用 `count` 来跟踪当前活动的区间数。

这样可以确保：

- 每个 y 范围内只有一个高度贡献。

- 该高度只会在区间有效时才加到总高度上。

### **总结**

- 只使用最大 y 并不能正确地计算覆盖区域的高度，因为区间可能存在重叠部分。

- 正确的方法是根据活动区间的起点和终点来动态计算每个有效高度的 **总和**，通过 **合并区间** 的方式来避免重复计算。

- `computeHeight` 方法通过维护每个活动区间的有效范围，并根据进入和退出事件动态计算每一段不重叠的高度，从而正确地计算总的有效高度。

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