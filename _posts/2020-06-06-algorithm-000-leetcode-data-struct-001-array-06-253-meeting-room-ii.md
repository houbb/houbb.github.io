---
layout: post
title: leetcode 数组专题 06-leetcode.253 meeting room ii 力扣.253 会议室 II
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, binary-search, sf]
published: true
---

# 题目

给你一个会议时间安排的数组 intervals ，每个会议时间都会包括开始和结束的时间 intervals[i] = [starti, endi] ，返回 所需会议室的最小数量 。

示例 1：

```
输入：intervals = [[0,30],[5,10],[15,20]]
输出：2
```

示例 2：

```
输入：intervals = [[7,10],[2,4]]
输出：1
```

提示：

1 <= intervals.length <= 10^4

0 <= starti < endi <= 10^6

# 整体思路

一般这种区间的题目，常见的有下面的解决方案：

1. 暴力

2. 排序

3. 扫描线

4. 优先队列

不过这个感觉暴力不是很实用，不排序的话时间顺序无法确定，会导致结果不正确。

# v1-排序

## 思路

会议的开始/结束时间，分别放在 2 个数组。然后对比。

如果不使用优先队列（最小堆），而是只通过 **排序** 和 **直接对比** 来实现最小会议室数，思路可以是这样的：

1. **排序**：首先按照会议的开始时间排序，然后再按结束时间排序。

2. **模拟会议室的分配**：

   - 在同一时刻，检查所有已安排的会议室是否有空余的。具体来说，当一个会议开始时，检查是否有会议已经结束（通过结束时间来判断）。如果有空余的会议室，就可以复用该会议室，否则需要额外增加一个会议室。

   - 通过维护一个结束时间列表来跟踪当前所有会议的结束时间。

3. **直接比较**：
   - 对于每个会议，通过扫描结束时间列表判断是否有会议结束。如果有，则将其结束时间更新为当前会议的结束时间；如果没有结束的会议，说明需要增加一个新的会议室。

### 代码实现：
我们不使用优先队列，直接通过两个数组来实现。

1. **排序会议的开始时间**。
2. **通过一个循环遍历会议**，来模拟每次会议的安排过程。

### 代码实现：

```java
import java.util.*;

public class MeetingRoomsII {
    public static int minMeetingRooms(int[][] intervals) {
        if (intervals.length == 0) {
            return 0;
        }

        int n = intervals.length;

        // Step 1: Create two arrays to store the start and end times
        int[] startTimes = new int[n];
        int[] endTimes = new int[n];

        for (int i = 0; i < n; i++) {
            startTimes[i] = intervals[i][0];
            endTimes[i] = intervals[i][1];
        }

        // Step 2: Sort both start and end times
        Arrays.sort(startTimes);
        Arrays.sort(endTimes);

        int roomCount = 0;
        int endIndex = 0;

        // Step 3: Process each meeting one by one
        for (int i = 0; i < n; i++) {
            // If the current meeting starts after or when a meeting ends, reuse the room
            // 如果这一次开始时间在上一次的结束之后，则可以复用房间
            if (startTimes[i] >= endTimes[endIndex]) {
                // Reuse the room: move the endIndex to the next meeting
                endIndex++;
            } else {
                // If no room is available, we need a new one
                roomCount++;
            }
        }

        // The room count will be the number of rooms we need
        return roomCount + 1; // We need at least one room
    }
}
```

### 代码解释：

1. **排序**：
   - 我们将所有的会议的开始时间和结束时间分别存入 `startTimes` 和 `endTimes` 数组，并对这两个数组进行排序。这样，我们可以确保在处理会议时，始终按顺序处理会议的开始和结束时间。
   
2. **直接对比**：
   - 我们使用一个 `endIndex` 变量来跟踪当前最早结束的会议的结束时间。
   - 对于每个会议（按开始时间顺序），我们判断它是否可以复用当前已经结束的会议室：即，当前会议的开始时间是否大于等于最早结束会议的结束时间。如果可以复用，我们将 `endIndex` 移动到下一个结束的会议；如果不能复用，则说明需要一个新的会议室。
   - `roomCount` 用于记录会议室的数量。

3. **返回值**：
   - 最终返回 `roomCount + 1`，因为我们至少需要一个会议室来安排第一个会议。


# v2-扫描线

## 思路

使用 **扫描线算法** 来解决 **Leetcode 253 - 会议室 II** 的问题，是一种非常巧妙且高效的方法。这个方法的核心思想是将所有的会议事件（开始和结束）转化为事件点，然后按时间顺序处理这些事件，模拟会议室的使用情况。

### 思路：
1. **事件拆分**：对于每个会议 `interval[i] = [starti, endi]`，我们将其拆解为两个事件：
   - **开始事件**：表示一个新的会议室被占用。
   - **结束事件**：表示一个会议室被释放。
   
2. **排序事件**：所有的事件按时间进行排序。需要注意：
   - **开始事件**：在相同的时间点，会议的开始需要比结束事件优先处理。这是因为，如果两个会议同时开始和结束，我们希望优先安排新的会议，而不是释放会议室。
   
3. **扫描处理事件**：扫描这些排序后的事件，使用一个变量来记录当前同时进行的会议室数量，并更新最大会议室数量。
   - **遇到开始事件**，会议室数增加。
   - **遇到结束事件**，会议室数减少。

4. **最大会议室数**：扫描过程中维护一个 `maxRooms` 变量来记录需要的最大会议室数量。

### 详细步骤：
1. 将每个会议拆分成开始和结束两个事件。
2. 按照事件的时间进行排序，如果时间相同，则结束事件优先。
3. 扫描所有事件，计算同时进行的会议数量，得到最大值。

### 扫描线算法实现：

```java
import java.util.*;

public class MeetingRoomsII {
    public static int minMeetingRooms(int[][] intervals) {
        if (intervals.length == 0) {
            return 0;
        }

        // Step 1: Create a list to store all events (start and end times)
        List<int[]> events = new ArrayList<>();
        for (int[] interval : intervals) {
            // Add start event
            events.add(new int[]{interval[0], 1});
            // Add end event
            events.add(new int[]{interval[1], -1});
        }

        // Step 2: Sort the events:
        // - First by time.
        // - If two events have the same time, prioritize end event (-1) over start event (1).
        events.sort((a, b) -> a[0] == b[0] ? Integer.compare(a[1], b[1]) : Integer.compare(a[0], b[0]));

        // Step 3: Scan the events and maintain the number of meeting rooms in use.
        int maxRooms = 0;
        int roomsInUse = 0;

        for (int[] event : events) {
            // Update the number of rooms in use
            roomsInUse += event[1];

            // Update the maximum number of rooms needed
            maxRooms = Math.max(maxRooms, roomsInUse);
        }

        return maxRooms;
    }

    public static void main(String[] args) {
        int[][] intervals1 = {{0, 30}, {5, 10}, {15, 20}};
        System.out.println(minMeetingRooms(intervals1)); // Expected output: 2

        int[][] intervals2 = {{7, 10}, {2, 4}};
        System.out.println(minMeetingRooms(intervals2)); // Expected output: 1
    }
}
```

### 代码解释：
1. **事件转换**：
   - 对于每个会议 `interval[i] = [starti, endi]`，我们生成两个事件：一个是开始事件 `starti`，表示需要一个会议室；另一个是结束事件 `endi`，表示释放一个会议室。
   - 我们用 `1` 表示开始事件，用 `-1` 表示结束事件，这样在事件排序时可以通过 `-1` 优先处理结束事件，确保结束会议时会议室被释放。
   
2. **排序事件**：
   - 首先根据时间排序。如果时间相同，我们优先处理结束事件（`-1`），因为如果两个会议同时开始和结束，我们希望先释放会议室，再开始新的会议。
   
3. **扫描事件**：
   - 初始化 `roomsInUse` 变量来记录当前正在使用的会议室数量。
   - 遍历所有排序后的事件，每次遇到开始事件（`1`），就增加 `roomsInUse`；每次遇到结束事件（`-1`），就减少 `roomsInUse`。
   - 同时，维护一个 `maxRooms` 变量来记录 `roomsInUse` 的最大值，即最大会议室数量。

### 时间复杂度：
- **事件拆分**：我们有 `N` 个会议，每个会议生成两个事件，因此总共有 `2N` 个事件，时间复杂度是 O(N)。
- **排序**：排序事件的时间复杂度是 O(2N log(2N))，也就是 O(N log N)。
- **扫描**：扫描事件的时间复杂度是 O(2N)，也就是 O(N)。

因此，总的时间复杂度是 **O(N log N)**，主要由排序操作主导。

### 空间复杂度：

- 需要一个大小为 `2N` 的列表来存储事件，空间复杂度是 **O(N)**。

### 示例分析：
#### 示例 1：
输入：`[[0, 30], [5, 10], [15, 20]]`

1. 拆分为事件：`[(0, 1), (30, -1), (5, 1), (10, -1), (15, 1), (20, -1)]`
2. 排序后：`[(0, 1), (5, 1), (10, -1), (15, 1), (20, -1), (30, -1)]`
3. 扫描过程：
   - 会议 `[0, 30]` 开始，`roomsInUse = 1`，最大会议室数 `maxRooms = 1`。
   - 会议 `[5, 10]` 开始，`roomsInUse = 2`，`maxRooms = 2`。
   - 会议 `[10, 30]` 结束，`roomsInUse = 1`。
   - 会议 `[15, 20]` 开始，`roomsInUse = 2`，`maxRooms = 2`。
   - 会议 `[20, 30]` 结束，`roomsInUse = 1`。
   - 会议 `[30, 30]` 结束，`roomsInUse = 0`。

最终最大会议室数为 `2`。

#### 示例 2：
输入：`[[7, 10], [2, 4]]`

1. 拆分为事件：`[(7, 1), (10, -1), (2, 1), (4, -1)]`
2. 排序后：`[(2, 1), (4, -1), (7, 1), (10, -1)]`
3. 扫描过程：
   - 会议 `[2, 4]` 开始，`roomsInUse = 1`，最大会议室数 `maxRooms = 1`。
   - 会议 `[4, 7]` 结束，`roomsInUse = 0`。
   - 会议 `[7, 10]` 开始，`roomsInUse = 1`，`maxRooms = 1`。
   - 会议 `[10, 10]` 结束，`roomsInUse = 0`。

最终最大会议室数为 `1`。

### 总结：
通过扫描线算法，我们将会议的开始和结束拆分为事件点，并按时间顺序处理这些事件。这个方法通过有效的事件排序和扫描，能够以 O(N log N) 的时间复杂度解决问题，且实现简单直观。





# 参考资料

https://leetcode.cn/problems/4sum/

* any list
{:toc}