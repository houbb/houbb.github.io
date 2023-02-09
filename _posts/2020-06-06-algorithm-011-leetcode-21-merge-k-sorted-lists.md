---
layout: post
title: 【leetcode】011-21.合并多个有序的链表 merge k sorted lists 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [Algorithm, list, leetcode, sf]
published: true
---

## 开胃菜

在进入本节的正题之前，我们先来看一道开胃菜。

### 题目 21. 合并两个有序链表

将两个升序链表合并为一个新的 升序 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。 

示例：

```
输入：1->2->4, 1->3->4
输出：1->1->2->3->4->4
```

### 解法 1

### 思路

直接两个列表合并，排序，然后重新构建一个新的链表。

- java 实现

```java
public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    List<Integer> numsOne = getIntegerList(l1);
    List<Integer> numsTwo = getIntegerList(l2);
    numsOne.addAll(numsTwo);
    Collections.sort(numsOne);
    // 构建结果
    return buildHead(numsOne);
}

private List<Integer> getIntegerList(ListNode oneNode) {
    // 使用 linkedList，避免扩容
    List<Integer> resultList = new LinkedList<>();
    while (oneNode != null) {
        int value = oneNode.val;
        resultList.add(value);
        oneNode = oneNode.next;
    }
    return resultList;
}
private ListNode buildHead(List<Integer> integers) {
    if(integers.size() == 0) {
        return null;
    }
    ListNode head = new ListNode(integers.get(0));
    ListNode temp = head;
    for(int i = 1; i < integers.size(); i++) {
        temp.next = new ListNode(integers.get(i));
        temp = temp.next;
    }
    return head;
}
```

### 效果

```
Runtime: 4 ms, faster than 22.43% of Java online submissions for Merge Two Sorted Lists.
Memory Usage: 39.6 MB, less than 19.99% of Java online submissions for Merge Two Sorted Lists.
```

这种思路虽然简单粗暴，但是效果确实不怎么样。

那么如何改进呢？

主要的问题还是出在列表本来就是有序的，我们没有很好的利用这个特性。

### 解法 2

### 思路

直接循环一遍，对比二者的数据大小，充分利用数组有序的特性。

### 实现

```java
public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    if(l1 == null) {
        return l2;
    }
    if(l2 == null) {
        return l1;
    }
    // 临时变量
    ListNode newNode = new ListNode(0);
    // 新增的头指针
    ListNode head = newNode;
    // 循环处理
    while (l1 != null && l2 != null) {
        int valOne = l1.val;
        int valTwo = l2.val;
        // 插入小的元素节点
        if(valOne <= valTwo) {
            newNode.next = l1;
            l1 = l1.next;
        } else {
            newNode.next = l2;
            l2 = l2.next;
        }
        // 变换 newNode
        newNode = newNode.next;
    }
    // 如果长度不一样
    if(l1 != null) {
        newNode.next = l1;
    }
    if(l2 != null) {
        newNode.next = l2;
    }
    return head.next;
}
```

### 效果

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Merge Two Sorted Lists.
Memory Usage: 38.8 MB, less than 88.76% of Java online submissions for Merge Two Sorted Lists.
```

超过 100% 的提交者，这次还算比较满意。

解决了这道开胃菜之后，让我们一起看下后面的正菜。

## 进阶版

> 23. 合并K个排序链表

合并 k 个排序链表，返回合并后的排序链表。请分析和描述算法的复杂度。

示例:

```
输入:
[
  1->4->5,
  1->3->4,
  2->6
]
输出: 1->1->2->3->4->4->5->6
```

## 1. 暴力破万法

### 思路

我们按照和 2 个数组类似的策略，全部放在一个列表中，然后排序，最后构建。

- java 实现

代码非常的简单，如下：

```java
public ListNode mergeKLists(ListNode[] lists) {
    if(null == lists || lists.length == 0) {
        return null;
    }
    // 查找操作比较少
    List<Integer> integerList = new LinkedList<>();
    for(ListNode listNode : lists) {
        integerList.addAll(getIntegerList(listNode));
    }
    // 排序
    Collections.sort(integerList);
    // 构建结果
    return buildHead(integerList);
}

private List<Integer> getIntegerList(ListNode oneNode) {
    // 使用 linkedList，避免扩容
    List<Integer> resultList = new LinkedList<>();
    while (oneNode != null) {
        int value = oneNode.val;
        resultList.add(value);
        oneNode = oneNode.next;
    }
    return resultList;
}

private ListNode buildHead(List<Integer> integers) {
    if(integers.size() == 0) {
        return null;
    }
    ListNode head = new ListNode(integers.get(0));
    ListNode temp = head;
    for(int i = 1; i < integers.size(); i++) {
        temp.next = new ListNode(integers.get(i));
        temp = temp.next;
    }
    return head;
}
```

### 效果

```
Runtime: 103 ms, faster than 15.12% of Java online submissions for Merge k Sorted Lists.
Memory Usage: 40.6 MB, less than 94.79% of Java online submissions for Merge k Sorted Lists.
```

花了共计 100ms，如果我说我们的最终版本可以把这个解法提升 100 倍，你信吗？

这个问题和以前一样，那我们换一种套路。

## 2. k = (k-1) + 1

### 思路

实际上 n 个列表合并，我们可以拆分为两两合并，最后变为一个完整的链表。

### 实现

```java
public ListNode mergeKLists(ListNode[] lists) {
    if(null == lists || lists.length == 0) {
        return null;
    }
    //
    ListNode result = lists[0];
    // 从第二个开始遍历
    for(int i = 1; i < lists.length; i++) {
        ListNode node = lists[i];
        result = mergeTwoLists(result, node);
    }
    return result;
}
```

mergeTwoLists 使我们在两个链表合并中的最佳解法，这里复用了一下。

### 效果

```
Runtime: 98 ms, faster than 16.31% of Java online submissions for Merge k Sorted Lists.
Memory Usage: 41.4 MB, less than 47.50% of Java online submissions for Merge k Sorted Lists.
```

改善效果不是很明显。

那么如何改进呢？

实际上这里有个问题就是我们是依次遍历，（1，2）合并成一个节点，和（3）继续合并。

下面我们来看一个比较取巧的解法。

## 3. 优先级队列-排序我最强

### 思路

我们可以借助优先级队列，让我们的排序从原来的 N 优化为 LogN 。

### 实现

```java
public ListNode mergeKLists(ListNode[] lists) {
    if(null == lists || lists.length == 0) {
        return null;
    }
    PriorityQueue<ListNode> queue = new PriorityQueue<>(lists.length, new Comparator<ListNode>() {
        @Override
        public int compare(ListNode o1, ListNode o2) {
            return o1.val - o2.val;
        }
    });
    // 循环添加元素
    for(ListNode listNode : lists) {
        if(listNode != null) {
            queue.offer(listNode);
        }
    }
    // 依次弹出
    return buildHead(queue);
}
/**
 * 构建头节点
 * @param queue 列表
 * @return 结果
 * @since v2
 */
private ListNode buildHead(Queue<ListNode> queue) {
    ListNode dummy = new ListNode(0);
    ListNode tail = dummy;
    while (!queue.isEmpty()) {
        tail.next = queue.poll();
        tail = tail.next;
        // 这里类似于将 queue 层层剥开放入 queue 中
        if(tail.next != null) {
            queue.add(tail.next);
        }
    }
    return dummy.next;
}
```

### 效果

```
Runtime: 4 ms, faster than 81.55% of Java online submissions for Merge k Sorted Lists.
Memory Usage: 41.1 MB, less than 74.81% of Java online submissions for Merge k Sorted Lists.
```

4ms! 这次简直是质的飞跃，从 100ms 提升了 25 倍左右。可喜可贺。

那么，我们会止步于此吗？

还能够更上一层楼吗？

## 4. 分治-分而治之，各个击破

- 思想

这种 k 个有序链表的问题，其实都可以拆分为更小的子问题。

所有类似的问题，基本上都可以使用 DP 或者分治的方式来解决。

本次展示一下分治算法，将合并的链表从中间拆分为二个部分处理。

### 实现

```java
public ListNode mergeKLists(ListNode[] lists) {
    final int length = lists.length;
    if(lists.length == 0) {
        return null;
    }
    if(lists.length == 1) {
        return lists[0];
    }
    // 递归获取两个节点
    int mid = (length) / 2;
    ListNode one = mergeKLists(subArray(lists, 0, mid));
    ListNode two = mergeKLists(subArray(lists, mid, length));
    // 合并最后2个节点
    return mergeTwoLists(one, two);
}

private ListNode[] subArray(ListNode[] listNodes, int start, int end) {
    int size = end-start;
    ListNode[] result = new ListNode[size];
    int index = 0;
    for(int i = start; i < end; i++) {
        result[index++] = listNodes[i];
    }
    return result;
}
```

### 效果

```
Runtime: 2 ms, faster than 91.66% of Java online submissions for Merge k Sorted Lists.
Memory Usage: 41.5 MB, less than 34.83% of Java online submissions for Merge k Sorted Lists.
```

2ms! 我们又把速度提升了一倍，这下你满意了吗？

不管你满不满意，我不满意，因为还没做到最好。

最明显的一个地方就是我们为了使用分治，对数组进行复制拷贝，这种复制实际上是很消耗时间的，那么又没有办法可以解决呢？

## 5. 优化的尽头

### 思路

我们分治是把数组分为左右两个部分，实际上我们有另一种办法也可以达到类似的效果。

比如：

```
[1, 2, 3, 4]
```

我们可以首位结合：

```
[(1,4), 2, 3]
[(1,4,3), 2]
[(1,4,3,2)]
```

这样可以达到同样的效果，也避免了空间的浪费，和时间的消耗。

### 实现

```java
public ListNode mergeKLists(ListNode[] lists) {
    if (lists.length == 0) {
        return null;
    }
    int i = 0;
    int j = lists.length - 1;
    while (j > 0) {
        // ?
        i = 0;
        while (i < j) {
            lists[i] = mergeTwoLists(lists[i], lists[j]);
            i++;
            j--;
        }
    }
    return lists[0];
}
```

### 效果

```
Runtime: 1 ms, faster than 100.00% of Java online submissions for Merge k Sorted Lists.
Memory Usage: 41.5 MB, less than 35.98% of Java online submissions for Merge k Sorted Lists.
```

1ms! 我们将这个算法从 100ms 优化到 1ms。

可见有时候 cpu 核数翻倍，也没有一个优秀的算法来的效果显著，这也正是算法的威力。

夜已经深了，本次解析先到这里，后续将深入讲解一下本文提到的优先级队列。

如果你对这个算法不满意，在保住头发的前提下，请继续优化~

## 拓展阅读

[优先级队列 Priority Queue](https://houbb.github.io/2019/01/18/jcip-10-priority-queue)

[优先级队列与堆排序](https://houbb.github.io/2019/01/04/prority-queue)

[leetcode 源码实现](https://github.com/houbb/leetcode)

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

## 参考资料

https://leetcode.com/problems/merge-k-sorted-lists/submissions/

https://leetcode-cn.com/problems/merge-two-sorted-lists

* any list
{:toc}