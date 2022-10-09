---
layout: post
title: 面试算法：前 K 个高频元素详解汇总
date:  2020-1-23 10:09:32 +0800 
categories: [Data-Struct]
tags: [data-struct, binary-tree, leetcode, sh]
published: true
---

# 前 K 个高频元素

## 题目

给定一个非空的整数数组，返回其中出现频率前 k 高的元素。

- 示例 1:

```
输入: nums = [1,1,1,2,2,3], k = 2
输出: [1,2]
```

- 示例 2:

```
输入: nums = [1], k = 1
输出: [1]
```

- 提示：

你可以假设给定的 k 总是合理的，且 1 ≤ k ≤ 数组中不相同的元素的个数。

你的算法的时间复杂度必须优于 O(n log n) , n 是数组的大小。

题目数据保证答案唯一，换句话说，数组中前 k 个高频元素的集合是唯一的。

你可以按任意顺序返回答案。

## 思路1-列表排序

我们直接遍历数组，统计对应的次数。

然后对所有的次数进行排序，取出 TOPK 的次数。

再次遍历 map，对比次数，获取结果。

```java
public static int[] topKFrequent(int[] nums, int k) {
    // 参数校验
    if(nums == null || k <= 0) {
        return null;
    }
    // 次数统计
    Map<Integer, Integer> countMap = new HashMap<>(nums.length);
    for(int num : nums) {
        int count = countMap.getOrDefault(num, 0) + 1;
        countMap.put(num, count);
    }

    // 计算 topK 的次数
    List<Integer> countList = new ArrayList<>(countMap.values());
    countList.sort(new Comparator<Integer>() {
        @Override
        public int compare(Integer o1, Integer o2) {
            // 倒排，次数多的放在前面
            return o2 - o1;
        }
    });

    // 1 2 3  TOP3 就是对应最后一个
    int countLimit = countList.get(k - 1);
    // 5 4 3 2 1
    int[] results = new int[k];
    int resultIndex = 0;
    for(Map.Entry<Integer, Integer> entry : countMap.entrySet()) {
        int num = entry.getKey();
        int numCount = entry.getValue();
        if(numCount >= countLimit) {
            results[resultIndex++]  = num;
        }
    }
    return results;
}
```

效果：

```
Runtime: 10 ms, faster than 64.94% of Java online submissions for Top K Frequent Elements.
Memory Usage: 41.6 MB, less than 62.33% of Java online submissions for Top K Frequent Elements.
```

## 思路2-优先级队列排序

也就是大小堆排序。

```java
public static int[] topKFrequent(int[] nums, int k) {
    // 次数统计
    Map<Integer, Integer> countMap = new HashMap<>(nums.length);
    for(int num : nums) {
        int count = countMap.getOrDefault(num, 0) + 1;
        countMap.put(num, count);
    }
    // 计算 topK 的次数
    PriorityQueue<Integer> priorityQueue = new PriorityQueue<>(countMap.values());
    int minCount = 0;
    int times = priorityQueue.size() - k;
    for(int i = 0; i < times; i++) {
        minCount = priorityQueue.poll();
    }
    // 构建结果
    int[] results = new int[k];
    int resultIndex = 0;
    for(Map.Entry<Integer, Integer> entry : countMap.entrySet()) {
        int num = entry.getKey();
        int numCount = entry.getValue();
        if(numCount > minCount) {
            results[resultIndex++]  = num;
        }
    }
    return results;
}
```

效果：

```
Runtime: 9 ms, faster than 84.95% of Java online submissions for Top K Frequent Elements.
Memory Usage: 42.2 MB, less than 18.01% of Java online submissions for Top K Frequent Elements.
```

## 思路3-TreeMap 实现

TreeMap 也可以达到类似的排序效果：

```java
public static int[] topKFrequent(int[] nums, int k) {
    // 次数统计
    Map<Integer, Integer> countMap = new HashMap<>(nums.length);
    for(int num : nums) {
        int count = countMap.getOrDefault(num, 0) + 1;
        countMap.put(num, count);
    }
    TreeMap<Integer, List<Integer>> sortedMap = new TreeMap<>(new Comparator<Integer>() {
        @Override
        public int compare(Integer o1, Integer o2) {
            // 次數的在前面
            return o2 - o1;
        }
    });

    // 设置次数（因为结果唯一，实际上次数并不唯一，可能相同。比如 [1,2]，返回2）
    // 如果次数相同，会导致覆盖。
    for(Map.Entry<Integer, Integer> entry : countMap.entrySet()) {
        // 次数 - 元素
        int times = entry.getValue();
        List<Integer> list = sortedMap.getOrDefault(times, new ArrayList<>());
        list.add(entry.getKey());
        sortedMap.put(entry.getValue(), list);
    }
    // 返回前 k 个
    int[] results = new int[k];
    int index = 0;
    for(Map.Entry<Integer, List<Integer>> entry : sortedMap.entrySet()) {
        for(Integer integer : entry.getValue()) {
            if(index >= k) {
                break;
            }
            results[index++] = integer;
        }
    }
    return results;
}
```

不过这里需要注意，因为 sortedMap 是用次数当做唯一 key。

相同的次数可能对应多个数，比如 [1,2]，所以对应的 value 应该是一个链表。

效果：

```
Runtime: 9 ms, faster than 84.95% of Java online submissions for Top K Frequent Elements.
Memory Usage: 41.5 MB, less than 62.33% of Java online submissions for Top K Frequent Elements.
```

## 思路4-摩尔投票法

我们在 [如何找到数组中出现次数最多的元素？](https://houbb.github.io/2020/01/23/algorithm-25-major-element) 中介绍过摩尔投票法。

不过感觉这里并不适用，因为当 k 较大的时候，投票的复杂度就是 k*n，如果 k=n 就是 n^2，不符合题意。

所以这里没有实战下去。


# 692. 前K个高频单词

## 题目

给一非空的单词列表，返回前 k 个出现次数最多的单词。

返回的答案应该按单词出现频率由高到低排序。如果不同的单词有相同出现频率，按字母顺序排序。

- 示例 1：

```
输入: ["i", "love", "leetcode", "i", "love", "coding"], k = 2
输出: ["i", "love"]
解析: "i" 和 "love" 为出现次数最多的两个单词，均为2次。
    注意，按字母顺序 "i" 在 "love" 之前。
``` 

- 示例 2：

```
输入: ["the", "day", "is", "sunny", "the", "the", "the", "sunny", "is", "is"], k = 4
输出: ["the", "is", "sunny", "day"]
解析: "the", "is", "sunny" 和 "day" 是出现次数最多的四个单词，
    出现次数依次为 4, 3, 2 和 1 次。
``` 

注意：

假定 k 总为有效值， 1 ≤ k ≤ 集合元素数。

输入的单词均由小写字母组成。
 

扩展练习：

尝试以 O(n log k) 时间复杂度和 O(n) 空间复杂度解决。

## 思路分析

这一题和上面一题，某种角度而言是一模一样，只不过 key 从数字变成了字符串。

还有一点，这里的次数可能相同，如果不同的单词有相同出现频率，按字母顺序排序。

## 思路1-TreeMap

```java
public static List<String> topKFrequent(String[] words, int k) {
    // 防御
    // 列表为空？内容为空？k 大于 words 长度？
    // 次数统计
    Map<String, Integer> countMap = new HashMap<>();
    for(String string : words) {
        countMap.put(string, countMap.getOrDefault(string, 0) + 1);
    }

    // 次数排序
    TreeMap<Integer, List<String>> treeMap = new TreeMap<>((o1, o2) -> o2-o1);
    for(Map.Entry<String, Integer> entry : countMap.entrySet()) {
        int count = entry.getValue();
        List<String> list = treeMap.getOrDefault(count, new ArrayList<>());
        list.add(entry.getKey());
        treeMap.put(count, list);
    }

    // 返回结果
    List<String> results = new ArrayList<>(k);
    for(List<String> values : treeMap.values()) {
        // 排序
        Collections.sort(values);
        // 添加元素
        for(String value : values) {
            results.add(value);
            if(results.size() >= k) {
                return results;
            }
        }
    }
    return results;
}
```

最后的字符串，如果次数相同，则需要执行一次排序。

效果：

```
Runtime: 7 ms, faster than 23.26% of Java online submissions for Top K Frequent Words.
Memory Usage: 39.3 MB, less than 36.81% of Java online submissions for Top K Frequent Words.
```

## 思路2-排序

其实 TreeMap 承担了 2 个职责，一个是次数统计，还有一个就是排序。

当然，我们可以完全不借助 TreeMap，而是把一切都交给排序来做。

```java
public static List<String> topKFrequent(String[] words, int k) {
    // 次数统计
    Map<String, Integer> countMap = new HashMap<>(words.length);
    for(String string : words) {
        countMap.put(string, countMap.getOrDefault(string, 0) + 1);
    }

    // 次数排序
    List<String> sortList = new ArrayList<>(countMap.keySet());
    sortList.sort(new Comparator<String>() {
        @Override
        public int compare(String o1, String o2) {
            //1. 比较次数
            int count1 = countMap.get(o1);
            int count2 = countMap.get(o2);
            // 次数不等
            if (count1 != count2) {
                return count2 - count1;
            } else {
                // 自然排序
                return o1.compareTo(o2);
            }
        }
    });

    // 截取结果
    return sortList.subList(0, k);
}
```

### 效果

```
Runtime: 5 ms, faster than 86.38% of Java online submissions for Top K Frequent Words.
Memory Usage: 39.3 MB, less than 36.81% of Java online submissions for Top K Frequent Words.
```

### 辅助度

时间：主要是排序。N(logN)

空间：countMap O(N)

ps: 实际上可以发现 Leetcode 中的很多题目，解法是大同小异的。

有时候我们掌握一题，这个系列的题目都会解决了。

所以刷题在于精，而不在于多。

# 215. 数组中的第K个最大元素

## 题目

在未排序的数组中找到第 k 个最大的元素。请注意，你需要找的是数组排序后的第 k 个最大的元素，而不是第 k 个不同的元素。

- 示例 1:

```
输入: [3,2,1,5,6,4] 和 k = 2
输出: 5
```

- 示例 2:

```
输入: [3,2,3,1,2,4,5,5,6] 和 k = 4
输出: 4
```

说明:

你可以假设 k 总是有效的，且 1 ≤ k ≤ 数组的长度。

## 思路1-排序

最简单的方式，就是直接倒排排序，然后返回指定位置的元素即可。

不过 java 的 Arrays.sort 方法对 int[] 指定比较器不友好，我们从后往前返回即可：

### 效果

```java
public static int findKthLargest(int[] nums, int k) {
    Arrays.sort(nums);
    return nums[nums.length - k];
}
```

### 效果

```
Runtime: 1 ms, faster than 98.08% of Java online submissions for Kth Largest Element in an Array.
Memory Usage: 39.2 MB, less than 60.04% of Java online submissions for Kth Largest Element in an Array.
```

## 思路2-堆

当然，这种 topK 的问题，使用堆还是比较简单的。

```java
public static int findKthLargest(int[] nums, int k) {
    int len = nums.length;
    // 使用一个含有 len 个元素的最大堆，lambda 表达式应写成：(a, b) -> b - a
    PriorityQueue<Integer> maxHeap = new PriorityQueue<>(len, (a, b) -> b - a);
    for (int num : nums) {
        maxHeap.add(num);
    }
    for (int i = 0; i < k - 1; i++) {
        maxHeap.poll();
    }
    return maxHeap.peek();
}
```

效果：

```
Runtime: 4 ms, faster than 62.52% of Java online submissions for Kth Largest Element in an Array.
Memory Usage: 39.2 MB, less than 60.04% of Java online submissions for Kth Largest Element in an Array.
```

不过性能却不是很好。

这个也可以优化，因为 PriorityQueue 无法直接 O(1) 访问，如果 k 很大，则寻找起来特别慢。

这个可以根据 k 是否超过 num.length/2 进行优化。

## 思路3-自定义堆

感觉最好的方式，实际上是利用数组实现一个大小堆。

这样可以 O(1) 访问，性能应该会好一些。

当然，这一题也可以使用 quickSort/mergeSort 等方法解决，我们后续还是重温一下排序算法。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

https://leetcode-cn.com/problems/number-of-digit-one/

* any list
{:toc}