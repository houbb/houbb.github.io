---
layout: post
title: leetcode 扫描线专题 06-leetcode.252 meeting room 力扣.252 会议室
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, sweep-line, sf]
published: true
---


# 题目

给定一个会议时间安排的数组 intervals ，每个会议时间都会包括开始和结束的时间 intervals[i] = [starti, endi] ，请你判断一个人是否能够参加这里面的全部会议。

示例 1：

输入：intervals = [[0,30],[5,10],[15,20]]
输出：false
示例 2：

输入：intervals = [[7,10],[2,4]]
输出：true
 

提示：

0 <= intervals.length <= 10^4

intervals[i].length == 2

0 <= starti < endi <= 10^6

# 整体思路

一般这种区间的题目，常见的有下面的解决方案：

1. 暴力

2. 排序

3. 扫描线

4. 优先队列

# v1-暴力

## 思路

直接两层循环，核心是如何判断两个会议室重叠？

### 重叠条件解释

两个会议的重叠定义为：会议 i 的时间段与会议 j 的时间段有交集。为了检查这种情况，我们考虑以下四种情形：

会议 i 在会议 j 之前结束（没有重叠）：

若 intervals[i][1] <= intervals[j][0]，则会议 i 在会议 j 开始之前结束，说明没有重叠。

会议 i 在会议 j 之后开始（没有重叠）：

若 intervals[j][1] <= intervals[i][0]，则会议 j 在会议 i 开始之前结束，也说明没有重叠。

会议 i 在会议 j 期间发生（有重叠）：

如果 intervals[i][0] < intervals[j][1] 且 intervals[i][1] > intervals[j][0]，则会议 i 的时间段与会议 j 有交集，说明有重叠。

会议 j 在会议 i 期间发生（有重叠）：

如果 intervals[j][0] < intervals[i][1] 且 intervals[j][1] > intervals[i][0]，则会议 j 的时间段与会议 i 有交集，同样说明有重叠。

## 实现

因为 i,j 是相互的，我们只需要判断一次即可。

```java
public static boolean canAttendMeetings(int[][] intervals) {
    int n = intervals.length;
    // 双重循环检查每一对会议是否重叠
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            // 检查会议 intervals[i] 和 intervals[j] 是否重叠
            if (intervals[i][1] > intervals[j][0] && intervals[j][1] > intervals[i][0]) {
                return false; // 找到重叠会议，返回 false
            }
        }
    }
    // 没有重叠会议
    return true;
}
```

## 小结

暴力算法比较容易想到，但是重叠的概念还是需要我们多思考。

# v2-排序

## 思路

我们对数字进行排序。

1) 按照开始时间排序

2）如果当前的开始时间小于上一次的结束时间。则存在重复

现在都开始了，上一次还没有结束。

## 实现

```java
public static boolean canAttendMeetings(int[][] intervals) {
    int n = intervals.length;
    Arrays.sort(intervals, Comparator.comparingInt(o -> o[0]));
    // 双重循环检查每一对会议是否重叠
    for (int i = 1; i < n; i++) {
        // 本次开始 上一次还没有结束
        if(intervals[i][0] < intervals[i-1][1]) {
            return false;
        }
    }
    // 没有重叠会议
    return true;
}
```

# v3-扫描线算法 sweep line  

## 思路

扫描线算法可以帮助我们处理区间类问题。

我们可以将每个会议的开始时间和结束时间分别标记为 +1 和 -1，然后对所有时间点进行排序并扫描，查看在任一时刻是否有超过一个会议正在进行。

如果有，则表示冲突，无法参加所有会议。

步骤：

- 将每个会议的开始时间标记为 +1，结束时间标记为 -1，然后合并到一个事件列表 events 中。

- 按时间顺序对事件进行排序，如果时间相同，则优先处理结束事件（即 -1）。

- 遍历事件列表，累加标记值，查看任意时刻是否有超过一个会议正在进行。

- 如果任意时刻会议数量超过 1，则返回 false；否则返回 true。

## 实现

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MeetingScheduler {

    public static boolean canAttendMeetings(int[][] intervals) {
        List<int[]> events = new ArrayList<>();
        
        // 将每个会议的开始和结束时间作为事件存储
        for (int[] interval : intervals) {
            events.add(new int[]{interval[0], 1});  // 会议开始时间 +1
            events.add(new int[]{interval[1], -1}); // 会议结束时间 -1
        }

        // 按时间排序，如果时间相同，优先处理结束事件
        Collections.sort(events, (a, b) -> (a[0] == b[0]) ? Integer.compare(a[1], b[1]) : Integer.compare(a[0], b[0]));

        int ongoingMeetings = 0;

        // 扫描事件列表，检查会议的重叠情况
        for (int[] event : events) {
            ongoingMeetings += event[1];  // 加上当前事件的标记值
            if (ongoingMeetings > 1) {
                return false; // 有重叠会议
            }
        }

        return true; // 没有重叠会议
    }
}
```

## 为什么要这样排序？

在扫描线算法中，我们对事件的排序方式有特定的规则，这样排序是为了正确处理时间相同的开始和结束事件，避免错误的计数。

### 排序规则解释

在扫描线问题中，我们通常将每个区间拆分为两个事件，一个**开始事件**和一个**结束事件**。我们按照以下规则对所有事件进行排序：

1. **按时间（`a[0]`）升序排列**：这保证了我们按时间顺序扫描所有事件。
2. **时间相同时，优先处理结束事件**（即 `a[1]` 进行二次排序）：如果两个事件的时间相同，我们通过让结束事件优先于开始事件来避免计数错误。

### 为什么时间相同时优先处理结束事件？

在扫描线算法中，优先处理结束事件可以避免错误的重叠判断。

例如：

- 如果两个会议的结束时间和下一个会议的开始时间相同，那么优先处理结束事件可以让我们在下一个会议开始前，结束当前会议，确保不会被错误地计为重叠。

- 如果我们不优先处理结束事件，在计数上可能会把开始事件算在前一个活动上，从而导致错误的结果（如错误地增加了计数）。

### 具体排序语句解释

以下代码是具体的排序语句：

```java
Collections.sort(events, (a, b) -> (a[0] == b[0]) ? Integer.compare(a[1], b[1]) : Integer.compare(a[0], b[0]));
```

- **`a[0] == b[0]`**：首先比较事件发生的时间。如果两个事件的时间相同，则 `a[1]` 和 `b[1]` 的比较决定优先级。
- **`Integer.compare(a[1], b[1])`**：时间相同的情况下，`a[1]` 和 `b[1]` 的值决定排序。通常，我们用 `+1` 表示开始事件，`-1` 表示结束事件，因此结束事件优先级高（`-1` 小于 `+1`）。
- **`Integer.compare(a[0], b[0])`**：时间不同的情况下，按照事件的时间排序（从小到大）。

### 示例说明

假设有三个会议时间：`[5, 10]`, `[5, 12]`, `[10, 15]`。拆解事件后：

```
[(5, +1), (10, -1), (5, +1), (12, -1), (10, +1), (15, -1)]
```

排序结果为：

```
[(5, +1), (5, +1), (10, -1), (10, +1), (12, -1), (15, -1)]
```

### 综上所述

按这种顺序排序，可以确保**时间相同的情况下优先结束事件**，从而正确地处理重叠区间并维护扫描线的计数。

## 小结

看起来这个扫描线算法还是比较有趣的，后面我们专门一个系列学习一下。

# v4-使用优先队列（最小堆）

## 思路

这种方法通过维护一个最小堆来跟踪当前正在进行的会议，适合在更复杂的情况下进一步扩展。

例如，计算一个人最多能同时参加的会议数目等。

**步骤**：

1. 按开始时间排序 `intervals`。
2. 使用最小堆（优先队列）来保存当前正在进行的会议结束时间。
3. 对于每个会议，检查堆顶的结束时间（即最早结束的会议）是否小于等于当前会议的开始时间：
   - 如果是，则说明前一个会议已结束，可以移除堆顶。
   - 否则，将当前会议的结束时间加入到堆中。
4. 如果堆中有多个会议的结束时间存在，则表示冲突，返回 `false`；否则返回 `true`。

## 实现

```java
import java.util.Arrays;
import java.util.PriorityQueue;

public class MeetingScheduler {

    public static boolean canAttendMeetings(int[][] intervals) {
        // 按开始时间排序
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        
        // 最小堆用于跟踪会议的结束时间
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        
        for (int[] interval : intervals) {
            // 如果堆顶的会议结束时间小于等于当前会议的开始时间，弹出堆顶
            if (!minHeap.isEmpty() && minHeap.peek() <= interval[0]) {
                minHeap.poll();
            }
            
            // 将当前会议的结束时间加入堆中
            minHeap.add(interval[1]);
            
            // 如果堆中有超过一个会议的结束时间，说明有重叠
            if (minHeap.size() > 1) {
                return false;
            }
        }
        
        return true;
    }
}
```

## 为啥要用优先级队列？

优先级队列（`PriorityQueue`）在扫描线算法中的作用主要是动态地管理和维护当前活动的区间或事件。

即使我们先对所有事件进行了排序，使用优先级队列在扫描过程中仍然可以有效地处理区间重叠、活动计数等问题。

### 为什么排序之后不直接对比而要用优先级队列？

虽然排序能够帮助我们按时间顺序处理事件，但在扫描过程中，**动态维护当前活动的区间或事件**是很重要的。

这就是优先级队列的作用。它可以在扫描过程中高效地维护哪些区间或事件仍然处于“活跃”状态。

### 优先级队列的关键作用

1. **动态更新活动状态**：

   - 在扫描过程中，我们需要保持一个**活跃的集合**，即哪些区间正在被处理（比如会议正在进行中）。这些区间的状态会随着时间推移而变化。

   - 优先级队列可以让我们在每个事件发生时快速地进行添加、删除和更新操作。例如，当会议开始时，我们将其添加到优先级队列中；当会议结束时，我们将其从队列中移除。

2. **高效获取当前活动状态**：
   - 在扫描过程中，每当遇到一个事件时，我们需要判断当前活动的区间或事件是否满足特定条件（例如当前同时进行的会议数量，或者判断是否有重叠的区间）。使用优先级队列可以让我们在 `O(log n)` 时间内快速地插入和删除事件，并且始终能够访问当前最优的区间或状态。

3. **保持区间顺序**：
   - 虽然我们已经对所有事件进行了排序，但在扫描过程中，活动区间的结束时间是动态变化的。因此，使用优先级队列可以帮助我们动态地维护一个**按结束时间排序的集合**。这样每次我们需要知道最早结束的区间时，可以在 `O(1)` 时间内获取。

### 典型的使用场景

以经典的 **会议室问题**（LC 253）为例：

#### 1. **事件排序**：
   我们首先将所有的开始事件和结束事件按照时间进行排序。如果时间相同，我们优先处理结束事件。排序后的事件列表可能如下：

   ```
   [(5, +1), (5, +1), (10, -1), (10, +1), (12, -1), (15, -1)]
   ```

#### 2. **使用优先级队列维护活动会议**：
   在扫描事件时，我们需要维护当前活跃的会议。例如，我们可能希望知道目前有多少会议在同时进行。每当遇到一个开始事件（`+1`），我们将其加入优先级队列；每当遇到一个结束事件（`-1`），我们将其从优先级队列中移除。

   使用优先级队列可以确保：
   - 对于每个会议，按开始时间和结束时间进行正确排序。
   - 在遇到结束事件时，能够及时从队列中移除已经结束的会议。

#### 3. **最小会议室数**：
   每次扫描到一个开始事件时，我们会将当前活动的会议数增加；每次扫描到结束事件时，我们会减少当前活动的会议数。我们通过维护当前活动会议的数量，最终可以得到最大并发的会议数，也就是所需的最小会议室数。

   这时，优先级队列的作用是：
   - **插入操作**：在遇到一个开始事件时，向队列中插入新的会议。
   - **删除操作**：在遇到一个结束事件时，从队列中删除结束的会议。

#### 4. **具体实现细节**：

假设我们使用一个优先级队列来保存当前正在进行的会议的结束时间。每当遇到开始事件时，我们将该会议的结束时间加入队列；每当遇到结束事件时，我们将其从队列中移除。

### 优先级队列在这里的作用：

1. **维护活动会议**：优先级队列根据结束时间维护当前正在进行的会议的结束时间。在扫描事件时，能够高效地添加、删除结束的会议。

2. **统计活动会议数**：在扫描过程中，队列的大小代表当前正在进行的会议数，最终输出的最大队列大小即为所需的最小会议室数。

### 总结

排序后的事件只是帮助我们按时间顺序扫描事件。

优先级队列则通过动态管理活跃区间（如会议的结束时间等），保证我们能高效地判断每个时刻的活动状态，快速获得当前活跃区间的数量或其它信息。

在这种问题中，排序加优先级队列的组合为扫描线算法提供了高效且灵活的解决方案。

## 小结

不得不说，用数组替代 map 的方法确实令人叹为观止。

那么，我们前面的 two-sum 是不是也可以这样优化？

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