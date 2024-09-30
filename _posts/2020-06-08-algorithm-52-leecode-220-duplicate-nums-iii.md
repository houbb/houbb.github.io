---
layout: post
title: leetcode 220 Contains Duplicate III
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, hash, bit, sort, sh]
published: true
---

# 题目


给你一个整数数组 nums 和两个整数 indexDiff 和 valueDiff 。

找出满足下述条件的下标对 (i, j)：

i != j,

abs(i - j) <= indexDiff

abs(nums[i] - nums[j]) <= valueDiff

如果存在，返回 true ；否则，返回 false 。

## 示例 1：

输入：nums = [1,2,3,1], indexDiff = 3, valueDiff = 0
输出：true
解释：可以找出 (i, j) = (0, 3) 。
满足下述 3 个条件：
i != j --> 0 != 3
abs(i - j) <= indexDiff --> abs(0 - 3) <= 3
abs(nums[i] - nums[j]) <= valueDiff --> abs(1 - 1) <= 0

## 示例 2：

输入：nums = [1,5,9,1,5,9], indexDiff = 2, valueDiff = 3
输出：false
解释：尝试所有可能的下标对 (i, j) ，均无法满足这 3 个条件，因此返回 false 。

提示：

2 <= nums.length <= 10^5
-10^9 <= nums[i] <= 10^9
1 <= indexDiff <= nums.length
0 <= valueDiff <= 10^9


# 思路

首先是前2个条件，类似 217 题。但是不同的是不是等于，而是小于等于。


# V1-暴力算法

## 思路

不管3*7=21,直接 for for，注定超时。

## 实现

```java
public boolean containsNearbyAlmostDuplicate(int[] nums, int indexDiff, int valueDiff) {
        // 遍历所有可能的 i,j
        for(int i = 0; i < nums.length; i++) {
            for(int j = 0; j < nums.length; j++) {
                if(i != j && Math.abs(i-j) <= indexDiff && Math.abs(nums[i] - nums[j]) <= valueDiff) {
                    return true;
                }
            }
        }

        return false;
    }
```

## 效果

直接在 47 / 54 testcases passed TLE

# v2-优化 indexDiff?

## 思路

因为 1 <= indexDiff <= nums.length

所以其实没必要每一次 j 都从零开始。

而是 j = i+indexDiffer 开始；

不过优化效果一般

## 实现

```java
    public boolean containsNearbyAlmostDuplicate(int[] nums, int indexDiff, int valueDiff) {
        // 遍历所有可能的 i,j
        for(int i = 0; i < nums.length; i++) {
            for(int j = i + 1; j < i+indexDiff+1; j++) {
                if(j >= nums.length) {
                    continue;
                }

                if(Math.abs(nums[i] - nums[j]) <= valueDiff) {
                    return true;
                }
            }
        }

        return false;
    }
```

## 效果

TLE

49 / 54 testcases passed


# V3-AVL 平衡树

## 思路

范围查询其实非常适合使用树。

这种指定 index 范围的比较适合 AVL 树。

我们可以使用红黑树。

这个是官方的解法。

## 解法

```java
public boolean containsNearbyAlmostDuplicate(int[] nums, int indexDiff, int valueDiff) {
        //1. treeSet
        // 滑动窗口结合查找表，此时滑动窗口即为查找表本身（控制查找表的大小即可控制窗口大小）
        TreeSet<Long> set = new TreeSet<>();

        for(int i = 0; i < nums.length; i++) {
            // 边添加边查找
            // 查找表中是否有大于等于 nums[i] - t 且小于等于 nums[i] + t 的值
            //  the least key greater than or equal to the given key, or null if there is no such key.
            Long ceiling = set.ceiling((long) nums[i] - (long) valueDiff);
            if (ceiling != null && ceiling <= ((long) nums[i] + (long) valueDiff)) {
                return true;
            }

            // 添加后，控制查找表（窗口）大小，移除窗口最左边元素
            set.add((long) nums[i]);

            // 这里其实不会错误删除。因为重复的元素，如果满足，上面就直接 return 了。
            // 这里删除的只是这个位置最早的一个值？????
            if (set.size() == indexDiff + 1) {
                set.remove((long) nums[i - indexDiff]);
            }
        }


        return false;
    }
```

疑惑点，最后的删除真的不影响数据？

数据的每一次插入，都是自动排序好的。

那么我们能不能通过自己实现一个插入排序来解决呢？

# V4-自己实现一个 TreeSet

## 思路

类似上面的 TreeSet，我们自己实现一个插入排序的数组。

实际上方法不变，只是自己实现了一个 TreeSet 简单版本。

## 解法

contains  二分法查找元素是否存在

remove 二分法查找元素位置，删除

celling 二分法查找最小的大于等于目标值的元素。

```java
import com.github.houbb.leetcode.component.MyTreeSet;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.TreeSet;

public class T220_ContainsDuplicateIII_V4 {

    private static class MyTreeSet {
        private ArrayList<Long> list;

        public MyTreeSet() {
            list = new ArrayList<>();
        }

        public void add(Long value) {
            // 首先检查元素是否已存在
            if (!contains(value)) {
                int index = getInsertPosition(list, value);
                list.add(index, value);
            }
        }

        public boolean remove(Long value) {
            if (contains(value)) {
                int index = binarySearch(value);
                list.remove(index);
                return true;
            }
            return false;
        }

        public Long ceiling(Long value) {
            return findCeiling(list, value);
        }

        private boolean contains(Long value) {
            return binarySearch(value) >= 0;
        }

        private int binarySearch(Long value) {
            int low = 0;
            int high = list.size()-1;

            while (low <= high) {
                int mid = (low+high) / 2;

                Long midVal = list.get(mid);
                if(midVal.equals(value)) {
                    return mid;
                } else if(midVal.compareTo(value) < 0) {
                    // 小于指定元素
                    low = mid+1;
                } else {
                    // 大于指定元素
                    high = mid-1;
                }
            }

            return -1;
        }

        private static int getInsertPosition(List<Long> resultList, long target) {
            int left = 0;
            int right = resultList.size();
            while (left < right) {
                int mid = left + (right - left) / 2;
                if (target <= resultList.get(mid)) {
                    right = mid;
                } else {
                    left = mid + 1;
                }
            }
            // left 就是插入的索引位置
            return left;
        }

        public static Long findCeiling(List<Long> nums, Long target) {
            if (nums == null || nums.isEmpty()) {
                return null;
            }

            int left = 0;
            int right = nums.size() - 1;
            Long result = null;

            while (left <= right) {
                int mid = (left + right) / 2;
                Long midVal = nums.get((int) mid);

                if (midVal >= target) {
                    result = midVal;
                    right = mid - 1; // 尝试在左侧查找更小的值
                } else {
                    left = mid + 1; // 否则在右侧查找
                }
            }

            // 检查结果是否满足大于等于target的条件
            if (result != null && result >= target) {
                return result;
            }
            return null;
        }

        public int size() {
            return list.size();
        }

        public void printList() {
            System.out.println(list);
        }

    }

    public boolean containsNearbyAlmostDuplicate(int[] nums, int indexDiff, int valueDiff) {
        //1. treeSet
        // 滑动窗口结合查找表，此时滑动窗口即为查找表本身（控制查找表的大小即可控制窗口大小）
        MyTreeSet set = new MyTreeSet();

        for(int i = 0; i < nums.length; i++) {
            // 边添加边查找
            // 查找表中是否有大于等于 nums[i] - t 且小于等于 nums[i] + t 的值
            //  the least key greater than or equal to the given key, or null if there is no such key.
            Long ceiling = set.ceiling((long) nums[i] - (long) valueDiff);
            if (ceiling != null && ceiling <= ((long) nums[i] + (long) valueDiff)) {
                return true;
            }

            // 添加后，控制查找表（窗口）大小，移除窗口最左边元素
            set.add((long) nums[i]);

            // 这里其实不会错误删除。因为重复的元素，如果满足，上面就直接 return 了。
            // 这里删除的只是这个位置最早的一个值？????
            if (set.size() == indexDiff + 1) {
                set.remove((long) nums[i - indexDiff]);
            }
        }

        return false;
    }

}
```

## 效果

PASS

但是，击败 7% 的人。

# V5-优化自己实现的 TreeSet

## 思路2

主要是我们的 add / remove 中多余的是否包含判断。

可以简化掉:

## 实现

add 时，只需要判断 index 和右边的元素是否相同即可。

remove 时，直接判断对应的元素是否 >= 0，存在才删除。

```java
private static class MyTreeSet {
        private ArrayList<Long> list;

        public MyTreeSet() {
            list = new ArrayList<>();
        }

        public void add(Long value) {
            // 首先检查元素是否已存在
            int index = getInsertPosition(list, value);
            // 元素是否重复？当前元素和右边的对比？
            if(index+1 < list.size()) {
               if(list.get(index+1) == value) {
                   return;
               }
            }

            list.add(index, value);
        }

        // 优化一下
        public boolean remove(Long value) {
            int index = binarySearch(value);
            if(index >= 0) {
                list.remove(index);
                return true;
            }

            return false;
        }

        public Long ceiling(Long value) {
            return findCeiling(list, value);
        }

        private int binarySearch(Long value) {
            int low = 0;
            int high = list.size()-1;

            while (low <= high) {
                int mid = (low+high) / 2;

                Long midVal = list.get(mid);
                if(midVal.equals(value)) {
                    return mid;
                } else if(midVal.compareTo(value) < 0) {
                    // 小于指定元素
                    low = mid+1;
                } else {
                    // 大于指定元素
                    high = mid-1;
                }
            }

            return -1;
        }

        private static int getInsertPosition(List<Long> resultList, long target) {
            int left = 0;
            int right = resultList.size();
            while (left < right) {
                int mid = left + (right - left) / 2;
                if (target <= resultList.get(mid)) {
                    right = mid;
                } else {
                    left = mid + 1;
                }
            }
            // left 就是插入的索引位置
            return left;
        }

        public static Long findCeiling(List<Long> nums, Long target) {
            if (nums == null || nums.isEmpty()) {
                return null;
            }

            int left = 0;
            int right = nums.size() - 1;
            Long result = null;

            while (left <= right) {
                int mid = (left + right) / 2;
                Long midVal = nums.get((int) mid);

                if (midVal >= target) {
                    result = midVal;
                    right = mid - 1; // 尝试在左侧查找更小的值
                } else {
                    left = mid + 1; // 否则在右侧查找
                }
            }

            // 检查结果是否满足大于等于target的条件
            if (result != null && result >= target) {
                return result;
            }
            return null;
        }

        public int size() {
            return list.size();
        }

        public void printList() {
            System.out.println(list);
        }

    }
```


## 效果

Runtime Beats 73.54%

Memory Beats 76.98%

# v6-桶排序？

## 思路

排序，可以让 value 差异比较变得简单

HashMap并不能很好的支持范围查询，所以应该直接 PASS。

但是发现其实数据本身也存在差异，所以也许比较适合桶排序？

一定差异范围的放在里面？

但是，如何相同的数据，需要放在不同的桶？

## 解法

```java
class Solution {

    public boolean containsNearbyAlmostDuplicate(int[] nums, int k, int t) {
        if (t < 0) return false;
        int n = nums.length;

        Map<Long, Long> map = new HashMap<>();
        // 为什么是 t+1?
        // 令 size = t + 1 的本质是因为差值为 t 两个数在数轴上相隔距离为 t + 1，它们需要被落到同一个桶中。
        long w = (long) t + 1;

        for (int i=0;i<n;i++) {

            // 得到当前数的桶编号
            long id = getID(nums[i], w);

            // 在桶中已经存在了
            if (map.containsKey(id)) {

                return true;
            }

            // 相邻的桶中有在[num - t, num + t]内：左边相邻的桶中
            if (map.containsKey(id - 1) && Math.abs(nums[i] - map.get(id - 1)) < w) {

                return true;
            }
            //右边相邻的桶中
            if (map.containsKey(id + 1) && Math.abs(nums[i] - map.get(id + 1)) < w) {
                return true;
            }

            // 不会导致覆盖吗？
            /**
             * 桶的解法相当凝练，不过有一点可以啰嗦两句。不知道有没有人疑惑，在比较id - 1和id + 1这两个相邻桶时，
             * 只比较了一个元素，这足够吗？
             *
             * 哈希表的行为不是会用新元素覆盖旧元素，一个桶里有多个元素怎么办？
             *
             * 其实是覆盖根本不会发生...因为一旦要覆盖，就说明存在两个元素同属一个桶，直接返回true了。
             *
             * 这就是题解说的“一个桶内至多只会有一个元素”——数组输入里当然可以有多个元素属于同一个桶，但是一旦出现一对，算法就结束了。
             */
            map.put(id, (long) nums[i]);

            // 为什么需要删除？
            if (i >= k) {
                map.remove(getID(nums[i - k], w));
            }
        }
        return false;
    }

    public long getID(long num, long w) {

        if (num >= 0) {

            return num / w;
        }

        //但由于 0 号桶已经被使用了，我们还需要在此基础上进行 -1，相当于将负数部分的桶下标（idx）往左移，即得到 ((nums[i] + 1) / size) - 1

        return (num + 1) / w - 1;
    }

}
```

## 回顾

桶排序的算法相对来说感觉比较难以想到

而且 getId 需要考虑的点比较复杂，但是不失为一种巧妙的解法。

# 拓展阅读

## 桶排序






## 插入排序

基于二分法自己实现一个插入排序。


## TreeSet AVL 树

`TreeSet` 是 Java 中 `java.util` 包下的一个类，它实现了 `Set` 接口。

`TreeSet` 基于红黑树（一种自平衡二叉搜索树），因此它能够保证元素处于排序状态。

`TreeSet` 提供了多种操作，例如插入、删除和查找元素，这些操作的时间复杂度都是对数时间复杂度 O(log n)。

以下是 `TreeSet` 的一些主要特性：

1. **排序**：`TreeSet` 中的元素会自动按照自然顺序排序，或者按照创建 `TreeSet` 时提供的 `Comparator` 进行排序。

2. **唯一性**：`TreeSet` 不允许存在重复的元素。如果尝试添加一个已存在的元素，那么 `TreeSet` 会忽略这个添加操作。

3. **不包含 null 元素**：`TreeSet` 不允许添加 `null` 元素。

4. **线程不安全**：`TreeSet` 是非线程安全的，所以在多线程环境下需要额外的同步措施。

5. **性能**：大多数操作的时间复杂度是 O(log n)，例如 `add`、`remove` 和 `contains`。

6. **元素范围操作**：`TreeSet` 提供了获取元素范围的方法，如 `headSet`、`tailSet` 和 `subSet`。

7. **元素流操作**：`TreeSet` 提供了 `first` 和 `last` 方法，用于获取第一个和最后一个元素。

8. **序列化**：`TreeSet` 实现了 `Serializable` 接口，因此可以被序列化。

下面是一些 `TreeSet` 的常用方法：

- `add(E e)`: 添加一个元素到 `TreeSet` 中。
- `remove(Object o)`: 从 `TreeSet` 中移除一个元素。
- `contains(Object o)`: 检查 `TreeSet` 是否包含一个元素。
- `first()`: 返回 `TreeSet` 中的第一个元素。
- `last()`: 返回 `TreeSet` 中的最后一个元素。
- `pollFirst()`: 移除并返回 `TreeSet` 中的第一个元素。
- `pollLast()`: 移除并返回 `TreeSet` 中的最后一个元素。
- `headSet(E toElement)`: 返回从第一个元素到指定元素之前的元素视图。
- `tailSet(E fromElement)`: 返回从指定元素到 `TreeSet` 最后一个元素的元素视图。
- `subSet(E fromElement, E toElement)`: 返回从 `fromElement` 到 `toElement` 范围内的元素视图。

下面是创建和使用 `TreeSet` 的一个简单例子：

```java
import java.util.TreeSet;

public class TreeSetExample {
    public static void main(String[] args) {
        TreeSet<Integer> treeSet = new TreeSet<>();

        // 添加元素
        treeSet.add(5);
        treeSet.add(3);
        treeSet.add(9);
        treeSet.add(3); // 重复元素，不会被添加

        // 遍历 TreeSet
        for (int num : treeSet) {
            System.out.println(num);
        }

        // 检查 TreeSet 是否包含某个元素
        boolean contains = treeSet.contains(9);
        System.out.println("Contains 9: " + contains);

        // 移除元素
        treeSet.remove(5);

        // 获取第一个和最后一个元素
        Integer first = treeSet.first();
        Integer last = treeSet.last();
        System.out.println("First element: " + first);
        System.out.println("Last element: " + last);
    }
}
```

在这个例子中，我们创建了一个 `TreeSet`，添加了一些元素，并展示了如何遍历、检查元素存在性、移除元素以及获取首尾元素。






# 参考资料

https://leetcode.cn/problems/contains-duplicate-iii/description/

* any list
{:toc}