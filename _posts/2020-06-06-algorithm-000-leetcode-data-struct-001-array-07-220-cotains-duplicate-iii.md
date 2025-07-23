---
layout: post
title: leetcode 002-leetcode.220 contains-duplicate-iii 力扣.220 存在重复的元素 III
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, sort, sf]
published: true
---

# 题目

给你一个整数数组 nums 和两个整数 indexDiff 和 valueDiff 。

找出满足下述条件的下标对 (i, j)：

i != j,
abs(i - j) <= indexDiff
abs(nums[i] - nums[j]) <= valueDiff

如果存在，返回 true ；否则，返回 false 。

示例 1：

输入：nums = [1,2,3,1], indexDiff = 3, valueDiff = 0
输出：true
解释：可以找出 (i, j) = (0, 3) 。
满足下述 3 个条件：
i != j --> 0 != 3
abs(i - j) <= indexDiff --> abs(0 - 3) <= 3
abs(nums[i] - nums[j]) <= valueDiff --> abs(1 - 1) <= 0


示例 2：
输入：nums = [1,5,9,1,5,9], indexDiff = 2, valueDiff = 3
输出：false
解释：尝试所有可能的下标对 (i, j) ，均无法满足这 3 个条件，因此返回 false 。
 
提示：

2 <= nums.length <= 10^5
-10^9 <= nums[i] <= 10^9
1 <= indexDiff <= nums.length
0 <= valueDiff <= 10^9

# v1-滑动窗口

## 思路

在刚解决的 T217 的基础上，我最先想到的是滑动窗口。

从 i=0 开始，保证 [i-j] 窗口大小 <= indexDiff。

天然的可以满足前两个条件：

```
a. i != j,
b. abs(i - j) <= indexDiff
c. abs(nums[i] - nums[j]) <= valueDiff
```

下面只需要判断第三个条件即可？

## 实现

```java
public boolean containsNearbyAlmostDuplicate(int[] nums, int indexDiff, int valueDiff) {
    List<Integer> valueList = new ArrayList<>();
    for(int i = 0; i < nums.length; i++){
        // 固定窗口大小
        if(i > indexDiff) {
            // 移除最开始的元素
            valueList.remove(0);
        }
        // 判断是否满足条件
        if(isValueMatch(valueList, nums[i], valueDiff)) {
            return true;
        }
        valueList.add(nums[i]);
    }
    return false;
}

public boolean isValueMatch(List<Integer> valueList,
                            int num,
                            int valueDiffer) {
    if(valueList.size() <= 0) {
        return false;
    }
    // 比较差值
    for(int v : valueList) {
        if(Math.abs(v-num) <= valueDiffer) {
            return true;
        }
    }
    return false;
}
```

## 效果

超出时间限制

47 / 54 个通过的测试用例

## 小结

思路不算难，但是很明显 isValueMatch 这个判断太慢了。

# v2-排序的思路

## 思路

很自然的想到，比较我们应该先做一个排序。

然后再比较，此时只需要比较原始数组第一个，最后一个，满足就 ok

## 代码

```java
    public boolean containsNearbyAlmostDuplicate(int[] nums, int indexDiff, int valueDiff) {
        List<Integer> valueList = new ArrayList<>();
        for(int i = 0; i < nums.length; i++){
            // 固定窗口大小
            if(i > indexDiff) {
                // 移除最开始的元素
                valueList.remove(0);
            }

            // 判断是否满足条件
            if(isValueMatch(valueList, nums[i], valueDiff)) {
                return true;
            }
            valueList.add(nums[i]);
        }

        return false;
    }

    public boolean isValueMatch(List<Integer> valueList,
                                int num,
                                int valueDiffer) {
        if(valueList.size() <= 0) {
            return false;
        }

        List<Integer> copyList = new ArrayList<>(valueList);
        Collections.sort(copyList);

        // 排序之后，如何才能避免全部循环一遍查找结果呢？
        // 二分法 YYDS
        int left = 0;
        int right = copyList.size()-1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            int differ = Math.abs(copyList.get(mid)- num);
            if(differ <= valueDiffer) {
                return true;
            }

            // 向左还是向右？
            if(copyList.get(mid) < num) {
                left = mid+1;
            } else {
                right = mid-1;
            }
        }
        return false;
    }
```

## 效果

超出时间限制

37 / 54 个通过的测试用例

效果甚至还不如上一次。

## 小结

为什么这么慢呢？

主要是慢在 2 个地方：

1. 我们为了避免造成原始数组乱序，每次都要复制数组

2. 我们每次都要重新排序

如何避免呢？

确切的说，我们需要一种数据结构。可以让 删除+插入的性能都很好，而且支持排序。

# v3-TreeSet

## 简单介绍一下 treeSet

`TreeSet` 是 Java 中的一种基于 **红黑树（Red-Black Tree）** 实现的集合类，它属于 `NavigableSet` 接口的实现类，并且实现了 `Set` 接口。

`TreeSet` 提供了元素的自动排序，并且能够高效地进行元素的插入、删除、查找等操作。

### 特点：

1. **自动排序**：`TreeSet` 会根据元素的自然顺序（即元素实现 `Comparable` 接口）或者根据给定的比较器（`Comparator`）来对元素进行排序。这意味着，插入到 `TreeSet` 中的元素始终是有序的。
   
2. **无重复元素**：`TreeSet` 是一个不允许重复元素的集合。当你插入重复元素时，插入操作会被忽略。

3. **基于红黑树实现**：`TreeSet` 使用红黑树（自平衡二叉查找树）来存储元素，因此其基本操作（如插入、删除、查找）都可以在对数时间内完成，时间复杂度为 `O(log n)`。

4. **支持高效的范围查询**：由于红黑树的特性，`TreeSet` 提供了高效的范围查询操作，比如可以查找比某个元素小的最大元素、比某个元素大的最小元素等。

### 常用方法：

- **`add(E e)`**：将元素添加到集合中，若元素已存在，则返回 `false`。
- **`remove(Object o)`**：从集合中移除指定的元素。
- **`contains(Object o)`**：判断集合中是否包含指定元素。
- **`first()`**：返回集合中最小的元素。
- **`last()`**：返回集合中最大的元素。
- **`lower(E e)`**：返回小于指定元素 `e` 的最大元素，若没有则返回 `null`。
- **`ceiling(E e)`**：返回大于等于指定元素 `e` 的最小元素，若没有则返回 `null`。
- **`floor(E e)`**：返回小于等于指定元素 `e` 的最大元素，若没有则返回 `null`。
- **`higher(E e)`**：返回大于指定元素 `e` 的最小元素，若没有则返回 `null`。
- **`subSet(E fromElement, E toElement)`**：返回集合中从 `fromElement` 到 `toElement` 之间的部分视图。
- **`pollFirst()`**：返回并移除集合中的最小元素。
- **`pollLast()`**：返回并移除集合中的最大元素。

### 适用场景：

1. **需要排序的场景**：当你需要一个 **自动排序** 的集合，并且对插入、删除和查找操作有较高的性能要求时，`TreeSet` 是一个合适的选择。
   
2. **无重复元素**：当你需要一个不允许重复元素的集合时，`TreeSet` 会自动过滤重复的元素。

3. **范围查询**：`TreeSet` 提供了高效的范围查询和查找功能，可以用来实现一些需要频繁查询某一范围内元素的场景。

## 代码

于是在 v2 的基础上，我们直接把复杂的过程改成用 treeSet 来实现。

```java
public boolean containsNearbyAlmostDuplicate(int[] nums, int indexDiff, int valueDiff) {
    // 使用 TreeSet 来维护滑动窗口，元素会自动排序
    TreeSet<Integer> window = new TreeSet<>();
    for (int i = 0; i < nums.length; i++) {
        // 如果窗口大小超过 indexDiff，移除最旧的元素
        if (i > indexDiff) {
            window.remove(nums[i - indexDiff - 1]);
        }


        // 查找当前元素是否满足条件：存在一个元素在当前窗口内，且差值不超过 valueDiff
        Integer floor = window.floor(nums[i] + valueDiff);  // 查找小于等于 nums[i] + valueDiff 的最大元素
        if (floor != null && Math.abs(floor - nums[i]) <= valueDiff) {
            return true;
        }
        Integer ceiling = window.ceiling(nums[i] - valueDiff);  // 查找大于等于 nums[i] - valueDiff 的最小元素
        if (ceiling != null && Math.abs(ceiling - nums[i]) <= valueDiff) {
            return true;
        }

        // 将当前元素加入到窗口中
        window.add(nums[i]);
    }
    return false;
}
```

## 效果

167ms 35.37%

所以呢？这么复杂的解法竟然还有高手？

# v4-桶排序

## 思路

除了基于 `TreeSet` 的解法，另一种常见的解法是使用 **桶排序（Bucket Sort）**。

这个解法特别适合于范围查找的问题，特别是当元素的差值不超过某个阈值（例如 `valueDiff`）时。

### 桶排序解法：

1. **思想**：
   - 将数组元素分配到若干个桶中，桶的大小由 `valueDiff` 决定。这样可以确保同一个桶中的元素之间的差值不会超过 `valueDiff`。
   - 然后，我们只需要检查每个桶中的相邻元素，以及桶之间相邻的元素，来判断是否满足条件。

2. **步骤**：
   - 创建一个桶的大小为 `valueDiff + 1`，将元素划分到不同的桶中。
   - 对于每个元素，我们检查：
     - 同一桶内的元素是否满足差值条件。
     - 相邻桶中的元素是否满足差值条件（因为相邻桶的元素差距在 `valueDiff` 范围内）。

3. **优化点**：
   - 桶排序的优势在于它能够将元素分成较小的区域进行查找，从而避免了直接对所有元素进行比较的高复杂度。

## 实现

```java
public class Solution {
    public boolean containsNearbyAlmostDuplicate(int[] nums, int indexDiff, int valueDiff) {
        if (nums == null || nums.length < 2 || indexDiff <= 0 || valueDiff < 0) {
            return false;
        }

        // 桶大小
        long bucketSize = (long) valueDiff + 1;
        Map<Long, Long> bucketMap = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            long bucketId = getBucketId(nums[i], bucketSize);

            // 检查当前桶是否有元素满足条件
            if (bucketMap.containsKey(bucketId)) {
                return true;
            }

            // 检查相邻桶的元素是否满足条件
            if (bucketMap.containsKey(bucketId - 1) && Math.abs(nums[i] - bucketMap.get(bucketId - 1)) < bucketSize) {
                return true;
            }
            if (bucketMap.containsKey(bucketId + 1) && Math.abs(nums[i] - bucketMap.get(bucketId + 1)) < bucketSize) {
                return true;
            }

            // 将当前元素放入桶中
            bucketMap.put(bucketId, (long) nums[i]);

            // 保持窗口大小
            if (i >= indexDiff) {
                bucketMap.remove(getBucketId(nums[i - indexDiff], bucketSize));
            }
        }

        return false;
    }

    private long getBucketId(int num, long bucketSize) {
        return num < 0 ? (num + 1) / bucketSize - 1 : num / bucketSize;
    }
}
```

### 代码解释：

- **桶的大小**：桶的大小设置为 `valueDiff + 1`，确保桶内的差值不超过 `valueDiff`。

- **桶的 ID**：每个元素根据其值和桶的大小分配到对应的桶。桶 ID 是通过 `num / bucketSize` 计算得出的。

- **相邻桶的检查**：检查当前桶、前一个桶和后一个桶中的元素，以确保相邻元素之间的差值满足条件。

- **滑动窗口**：我们通过控制桶的大小，确保每次只保留最多 `indexDiff` 个元素在桶中，满足窗口大小要求。

### 适用场景：

- 如果数据分布比较均匀或者 `valueDiff` 和 `indexDiff` 的范围较小时，桶排序方法能够非常高效地解决问题。它通过分桶避免了大范围的比较操作，适合用于类似本题的范围查找问题。

## 效果

71ms 83.67%

很好 很有精神

## 小结

我们可以发现

1. treeSet 是一种兼顾插入/删除 的排序容器，类似的问题找他准没错

2. 范围查询到额时候，应该要想到桶排序

# chat

## 桶排序的 id 获取问题

这行代码：

```java
return num < 0 ? (num + 1) / bucketSize - 1 : num / bucketSize;
```

是用来计算每个元素应该放入哪个桶（桶 ID）的关键代码。

它的目的是根据元素的值和桶的大小来确定该元素应该属于哪个桶，确保负数元素也能正确分配到合适的桶中。我们来逐步解释这行代码。

### 1. **桶排序的基本思路**

在桶排序中，我们将元素划分到多个桶中，每个桶的大小为 `bucketSize`。桶内的元素值之间的差距通常较小，因此我们可以快速查找是否存在满足条件的元素。

为了实现桶排序，首先需要根据元素的值计算它属于哪个桶。具体地，我们将元素的值除以桶的大小，得到桶的索引。

假设我们有一个元素 `num`，桶的大小是 `bucketSize`。如果我们简单地使用 `num / bucketSize` 来计算桶的索引，问题会出现在负数的情况下。

### 2. **负数问题**

Java 中的除法操作对于负数存在一个问题：如果 `num` 是负数，那么 `num / bucketSize` 会向零舍入，而不是向下舍入。

这会导致负数值被错误地分配到桶中，甚至可能导致负数与正数共享同一个桶。例如，`-1 / 3` 结果会是 `0`，但是我们想要它落到一个不同的桶。

为了避免这种情况，我们通过如下的方法来确保负数能够正确地被分配到相应的桶：

### 3. **计算桶 ID**

我们使用的是三元运算符，分为两种情况：

- **`num >= 0`**：对于非负数，直接通过 `num / bucketSize` 来计算桶 ID。

- **`num < 0`**：对于负数，我们通过 `(num + 1) / bucketSize - 1` 来计算桶 ID。

让我们具体分析这两种情况：

#### 3.1 **`num >= 0`** 的情况：
如果 `num` 是非负数，我们可以直接通过 `num / bucketSize` 来计算桶的索引：
- 例如，`num = 8` 和 `bucketSize = 3` 时，`num / bucketSize` 会得到 `2`，这意味着 8 应该被放入桶 2 中。
  
这种方式没有问题，因为对非负数来说，直接除法操作是符合预期的。

#### 3.2 **`num < 0`** 的情况：
对于负数，Java 中的整数除法向零舍入，这意味着 `-1 / 3` 的结果是 `0`。但是我们希望负数 `-1` 放到比 `0` 更小的桶中。为了实现这一点，我们通过 `(num + 1) / bucketSize - 1` 来调整。

- 假设 `num = -1`，`bucketSize = 3`：
  - `(num + 1) / bucketSize = (-1 + 1) / 3 = 0 / 3 = 0`。
  - 然后再减去 `1`，得到桶 ID 为 `-1`。这样我们就确保了负数 `-1` 被分配到正确的桶。

**为什么要加 1 然后再减 1？**
- 通过 `num + 1` 我们保证了负数的除法不会向零舍入，而是向下舍入，这样可以确保负数正确地落入预期的桶。
- 减去 `1` 是为了校正因为加 1 导致的偏移，确保负数元素正确地分配到桶中。

### 4. **举个例子**

假设我们有 `bucketSize = 3`，并且正在计算以下几个数字的桶 ID：

- `num = 8`：  
  计算 `8 / 3 = 2`，所以 8 会被分到桶 2。

- `num = -1`：  
  计算 `(-1 + 1) / 3 - 1 = 0 / 3 - 1 = 0 - 1 = -1`，所以 -1 会被分到桶 -1。

- `num = -3`：  
  计算 `(-3 + 1) / 3 - 1 = -2 / 3 - 1 = 0 - 1 = -1`，所以 -3 会被分到桶 -1。

- `num = -4`：  
  计算 `(-4 + 1) / 3 - 1 = -3 / 3 - 1 = -1 - 1 = -2`，所以 -4 会被分到桶 -2。

通过这种方式，我们确保了负数在分配到桶时的正确性。

### 5. **总结**

这行代码的作用就是确保每个元素都能正确地根据其值和桶的大小计算出桶的 ID，并且能够正确处理负数的情况。

具体地：

- 对于非负数，直接使用 `num / bucketSize` 来确定桶的 ID。

- 对于负数，通过 `(num + 1) / bucketSize - 1` 来调整，使得负数能够正确地分配到不同的桶。

这样处理后，无论是正数还是负数，都能在桶排序中正确地被分配到合适的桶，从而避免了负数元素的错误分配。

* any list
{:toc}