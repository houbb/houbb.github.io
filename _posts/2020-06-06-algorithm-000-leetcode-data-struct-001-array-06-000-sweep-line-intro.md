---
layout: post
title: leetcode 扫描线专题 06-扫描线算法（Sweep Line Algorithm）
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, sweep-line, sf]
published: true
---

# chat

## 什么是扫描线算法？

扫描线算法（**Sweep Line Algorithm**）是一种常用于解决几何问题（尤其是涉及区间、时间线或事件的重叠问题）的算法。

它的基本思想是“**模拟一条扫描线从一个方向扫过所有事件**”，在扫描过程中维护一个数据结构来追踪当前的状态（例如活动区间的数量、最小值、最大值等）。

### 扫描线算法的基本步骤

1. **事件表示**：每个问题中的区间（例如会议时间）或事件，都可以转化为若干个关键事件（例如开始时间和结束时间）。
   
2. **事件排序**：将所有事件按照时间排序（如果时间相同，则根据事件的类型来排序，例如结束事件优先于开始事件）。

3. **扫描过程**：从最早的事件开始，按照排序顺序逐一处理每个事件，并在处理每个事件时更新状态（例如活动会议的数量、最大活动时间等）。

4. **数据维护**：根据事件类型，更新当前的活动状态。例如，遇到一个开始事件时，我们增加一个计数，遇到结束事件时，减少计数，或者更新其他需要维护的值。

5. **输出结果**：在扫描过程中，根据需求输出解答。

### 应用场景

扫描线算法广泛应用于处理各种区间问题，典型的应用包括：
- **会议安排**（检测会议时间是否有重叠）
- **区间覆盖问题**（检查是否有足够的资源覆盖所有区间）
- **计算最大并发数**（计算在某一时间点活跃的事件数量，如计算最多同时存在的会议数）
- **凸包问题**（计算一个点集的最小凸包）

### 扫描线算法的具体步骤

#### 1. 事件表示与排序

假设我们有若干个区间（如会议的开始时间和结束时间），我们首先将每个区间拆解为两个事件：

一个是开始事件，另一个是结束事件。

每个事件可以表示为一个元组 `(time, type)`，其中 `time` 表示事件发生的时间，`type` 可以是 `+1`（表示开始）或者 `-1`（表示结束）。

例如，会议区间 `[(5, 10), (8, 12), (13, 16)]` 可以拆解为事件：
```
[(5, +1), (10, -1), (8, +1), (12, -1), (13, +1), (16, -1)]
```

事件按时间排序。如果有多个事件发生在相同的时间点，则优先处理结束事件，因为结束事件可以使得下一个开始事件得以处理。

#### 2. 事件扫描与状态更新

扫描线的核心是对事件的处理。在扫描线遍历时，我们保持一个计数器（或其他数据结构）来跟踪当前的活动状态。对于会议安排问题，我们使用一个计数器来记录当前同时进行的会议数量。

- 当遇到一个 **开始事件**（`+1`），增加计数器，表示新的会议开始。
- 当遇到一个 **结束事件**（`-1`），减少计数器，表示一个会议结束。

#### 3. 结果输出

在扫描过程中，我们可以输出每个时间点的活动状态。例如，我们可以在每次更新计数器时，检查当前同时进行的会议数，或者记录最大会议数等。

### 例子：检测会议是否有重叠

假设我们有一组会议的时间区间，使用扫描线算法来判断是否所有会议都能参加。

给定的会议区间：`[[0, 30], [5, 10], [15, 20]]`

#### 1. 拆解事件
我们将每个会议区间拆解成开始事件和结束事件：
```
[(0, +1), (30, -1), (5, +1), (10, -1), (15, +1), (20, -1)]
```

#### 2. 事件排序
按时间排序事件，时间相同的情况下优先处理结束事件：
```
[(0, +1), (5, +1), (10, -1), (15, +1), (20, -1), (30, -1)]
```

#### 3. 扫描事件并更新状态
我们从第一个事件开始，逐一扫描：
- 在时间 `0` 处，遇到开始事件 `+1`，活动会议数增加到 1。
- 在时间 `5` 处，遇到开始事件 `+1`，活动会议数增加到 2，说明此时有两个会议重叠。
- 在时间 `10` 处，遇到结束事件 `-1`，活动会议数减少到 1。
- 在时间 `15` 处，遇到开始事件 `+1`，活动会议数增加到 2，说明此时又有两个会议重叠。
- 在时间 `20` 处，遇到结束事件 `-1`，活动会议数减少到 1。
- 在时间 `30` 处，遇到结束事件 `-1`，活动会议数减少到 0。

#### 4. 判断是否有重叠
在扫描过程中，我们发现活动会议数有过大于 1 的情况（特别是在时间 `5` 和时间 `15`），因此有重叠会议，返回 `false`。

### 扫描线算法的优势

1. **时间复杂度**：事件排序的时间复杂度是 `O(n log n)`，其中 `n` 是会议数或事件数。扫描线的遍历时间复杂度是 `O(n)`。因此，整体时间复杂度是 `O(n log n)`，比暴力算法（`O(n^2)`）要高效得多。
   
2. **空间复杂度**：需要存储所有事件，空间复杂度为 `O(n)`。

3. **易于扩展**：扫描线算法可以很容易地适应更多的需求，例如统计某一时刻活动的最大数量、求得活动的区间并进行其他计算等。

### 扩展应用

- **最大并发活动数**：通过扫描线算法，我们可以轻松地计算在某个时刻同时进行的最多会议数（即最大并发数）。
- **区间合并**：我们还可以通过扫描线算法来合并重叠的区间。
- **区间覆盖**：检查一组区间是否能完全覆盖一个目标区间等。

### 总结

扫描线算法是一种非常强大且高效的算法，尤其适用于处理与区间重叠、事件排序相关的几何问题。

在许多情况下，它比暴力算法要高效得多，尤其是在数据量大的时候，能够显著减少计算的复杂度。

## 扫描线算法的应用场景

扫描线算法（Sweep Line Algorithm）是一种用于处理二维平面上的区间或事件的高效算法。

其核心思想是将问题转化为按特定顺序扫描一条虚拟的直线（通常是水平或垂直）处理事件，维护实时的状态信息。

以下是扫描线算法的主要应用场景：

---

### 1. **几何问题**
#### **线段交点检测**
   - 应用：检测一组线段中是否存在交点，或计算所有交点。
   - 思路：将每个线段的起点和终点作为事件点，通过扫描线维护当前活跃的线段集合，并检查可能的交点。
   - 示例题目：
     - [Bentley-Ottmann Algorithm for Line Segment Intersection](https://en.wikipedia.org/wiki/Bentley%E2%80%93Ottmann_algorithm)

#### **矩形重叠面积计算**
   - 应用：计算多个矩形的重叠面积。
   - 思路：将矩形的左右边界作为事件点，在扫描过程中动态维护活动矩形的集合，并计算贡献的重叠区域。
   - 示例题目：
     - [LeetCode 850. Rectangle Area II](https://leetcode.com/problems/rectangle-area-ii/)

#### **最近点对问题**
   - 应用：在平面上找到最近的两点。
   - 思路：结合分治法和扫描线算法，在划分子问题时利用扫描线动态维护可能的候选点。
   - 示例题目：
     - [LeetCode 587. Closest Pair of Points](https://leetcode.com/problems/closest-points-to-a-line/)

---

### 2. **区间问题**
#### **活动调度问题**
   - 应用：判断最多有多少个区间（如会议时间、任务）同时重叠。
   - 思路：将区间起点和终点作为事件，通过扫描线动态计算活动的最大重叠数。

#### **区间覆盖长度**
   - 应用：计算多个区间的总覆盖长度。
   - 思路：将每个区间的左右端点作为事件点，扫描时维护当前活跃区间数量。
   - 示例题目：
     - [LeetCode 352. Data Stream as Disjoint Intervals](https://leetcode.com/problems/data-stream-as-disjoint-intervals/)

---

### 3. **图像处理与计算几何**
#### **计算多边形的面积**
   - 应用：计算复杂多边形的面积或其他几何属性。
   - 思路：将多边形边界点作为事件，通过扫描线维护当前边界的状态。

#### **多边形的布尔运算**
   - 应用：计算两个多边形的交集、并集或差集。
   - 思路：使用扫描线维护多边形的边界信息，动态判断重叠关系。

---

### 4. **统计与计数问题**
#### **区间内点的个数**
   - 应用：统计二维空间内某个矩形范围内的点的个数。
   - 思路：将点和矩形边界作为事件，通过扫描线动态维护点的状态。

#### **在线动态统计**
   - 应用：例如在线统计区间内的元素个数或和。
   - 示例题目：
     - [LeetCode 2158. Amount of New Area Painted Each Day](https://leetcode.com/problems/amount-of-new-area-painted-each-day/)

---

### 5. **动态数据维护问题**
#### **事件调度与处理**
   - 应用：如动态分配资源、任务调度问题。
   - 思路：将任务的开始和结束时间作为事件点，通过扫描线动态分配或释放资源。

#### **动态数列问题**
   - 应用：动态更新区间信息（如最大值、最小值）。
   - 示例题目：
     - [LeetCode 218. The Skyline Problem](https://leetcode.com/problems/the-skyline-problem/)

---

### 总结

扫描线算法非常适合处理涉及区间、事件和动态维护的问题。其核心优势在于能够通过事件点的排序与动态维护，减少冗余计算，提升效率。

这使其在几何处理、区间统计以及动态事件维护中广泛应用。


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

* any list
{:toc}