---
layout: post
title: 【leetcode】02-leetcode 2. 两数相加 add two numbers
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, leetcode, sf]
published: true
---

# 2. 两数相加

给你两个 非空 的链表，表示两个非负的整数。它们每位数字都是按照 逆序 的方式存储的，并且每个节点只能存储 一位 数字。

请你将两个数相加，并以相同形式返回一个表示和的链表。

你可以假设除了数字 0 之外，这两个数都不会以 0 开头。

## 例子

示例 1：

![例子](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2021/01/02/addtwonumber1.jpg)

```
输入：l1 = [2,4,3], l2 = [5,6,4]
输出：[7,0,8]
解释：342 + 465 = 807.
```

示例 2：

```
输入：l1 = [0], l2 = [0]
输出：[0]
```

示例 3：

```
输入：l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
输出：[8,9,9,9,0,0,0,1]
```

## 提示：

每个链表中的节点数在范围 [1, 100] 内

0 <= Node.val <= 9

题目数据保证列表表示的数字不含前导零

# V1-简单思路

## 思路

l1 反转构建为数字

l2 反转构建为数字

num = l1+l2

然后反转列表输出。

坑：这里限定了入参是一个单向链表

## java 实现

这里使用 BigInteger，因为位数会比较长，避免超长的情况。

```java
import java.math.BigInteger;
import java.util.LinkedList;
import java.util.List;
import java.util.ListIterator;

/**
 * @author binbin.hou
 * @since 1.0.0
 * @date 2020-6-9 11:38:48
 */
public class T002_AddTwoNumbers {

    public static class ListNode {
        int val;
        ListNode next;
        ListNode() {}
        ListNode(int val) { this.val = val; }
        ListNode(int val, ListNode next) { this.val = val; this.next = next; }
    }

    /**
     * 最基本思路
     * @param l1 列表1
     * @param l2 列表2
     * @date 2020-6-9 12:08:44
     */
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        List<Integer> numOneList = getIntegerList(l1);
        List<Integer> numTwoList = getIntegerList(l2);

        BigInteger numOne = buildBigInteger(numOneList);
        BigInteger numTwo = buildBigInteger(numTwoList);

        BigInteger sum = numOne.add(numTwo);
        return buildListNode(sum);
    }

    /**
     * 构建最后的结果
     * @param sum 和
     * @return 结果
     * @since 1.0.0
     */
    private ListNode buildListNode(final BigInteger sum) {
        String string = sum.toString();

        ListNode headNode = buildListNode(string, string.length()-1);
        ListNode currentNode = headNode;
        for(int i = string.length()-2; i >= 0; i--) {
            currentNode.next = buildListNode(string, i);
            currentNode = currentNode.next;
        }

        return headNode;
    }

    private ListNode buildListNode(String string, int index) {
        int integer = Integer.parseInt(string.charAt(index) + "");
        return new ListNode(integer);
    }

    /**
     * 获取整数的链表
     * @param listNode 节点
     * @return 结果
     * @since 1.0.0
     */
    public List<Integer> getIntegerList(ListNode listNode) {
        // 使用 linkedList，避免扩容
        List<Integer> resultList = new LinkedList<>();
        ListNode oneNode = listNode;
        while (oneNode != null) {
            int value = oneNode.val;
            resultList.add(value);
            oneNode = oneNode.next;
        }
        return resultList;
    }

    /**
     * 根据单个数字构建 BigInteger，不知道入参有多长
     * @param integers 数组
     * @return 结果
     * @since 1.0.0
     */
    private BigInteger buildBigInteger(final List<Integer> integers) {
        // 逆序遍历 LinkedList 应该有双向指针，理论上不慢。
        integers.iterator();
        ListIterator<Integer> iterator = integers.listIterator(integers.size());

        // 避免扩容
        StringBuilder stringBuilder = new StringBuilder(integers.size());
        while(iterator.hasPrevious()){
            int integer = iterator.previous();
            stringBuilder.append(integer);
        }

        return new BigInteger(stringBuilder.toString());
    }

}
```

## 效果

这种是比较慢的。

> [效果如下](https://leetcode.com/problems/add-two-numbers/submissions/351082274/)

```
Runtime: 18 ms, faster than 5.29% of Java online submissions for Add Two Numbers.
Memory Usage: 40.4 MB, less than 16.38% of Java online submissions for Add Two Numbers.
```

# V2-记录进位

## 思路

每一个节点的值都是 0-9，处理的时候其实我们只需要关心相加是否进位即可。

并不需要这么复杂的把信息处理完相加，从而减少处理时间。

## java 实现

说明：这里是自己实现模拟了 BigInteger 的加法。

```java
import java.util.LinkedList;
import java.util.List;

/**
 * 官方的解法
 *
 * 核心：
 * 5+7=12 会产生进位，但是最多只有一次进位
 * 因为：9+9+1=19
 *
 * @author binbin.hou
 * @since 1.0.0
 * @date 2020-6-9 11:38:48
 */
public class T002_AddTwoNumbersV1 {

    public static class ListNode {
        int val;
        ListNode next;
        ListNode() {}
        ListNode(int val) { this.val = val; }
        ListNode(int val, ListNode next) { this.val = val; this.next = next; }
    }

    /**
     * Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)
     * Output: 7 -> 0 -> 8
     * Explanation: 342 + 465 = 807.
     *
     * 注意：
     * （1）两个列表并不是一样长的，可能还有数字为空。
     * （2）末尾也可能产生进位
     *
     * 思路：
     * 直接遍历链表，使用一个位置保留进位。
     *
     * 列表的遍历一直是以最长的为准，走到最后。
     *
     * @param l1 列表1
     * @param l2 列表2
     * @return 结果
     * @date 2020-6-9 12:08:44
     */
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        List<Integer> oneList = getIntegerList(l1);
        List<Integer> twoList = getIntegerList(l2);

        //[5,5] 最后一位进1
        int size = oneList.size() > twoList.size() ? oneList.size() : twoList.size();
        // 借助第三条数组，存放进位
        int[] overflowFlags = new int[size+1];

        // 直接构建结果列表
        ListNode headNode = buildListNode(oneList, twoList, 0, overflowFlags);
        ListNode currentNode = headNode;
        for(int i = 1; i < size; i++) {
            currentNode.next = buildListNode(oneList, twoList, i, overflowFlags);
            currentNode = currentNode.next;
        }

        // 最后如果存在进位的话
        if(overflowFlags[size] == 1) {
            currentNode.next = new ListNode(1);
        }

        return headNode;
    }

    /**
     * 构建元素列表
     *
     * （1）为了避免 index == 0 时，判断
     * 将 index==0 时的信息直接保存在 0 位，当前进位保存在下一位。
     * @param oneList 第一个列表
     * @param twoList 第二个列表
     * @param index 下标
     * @param overflowFlags 越界标识
     * @return 结果
     */
    private ListNode buildListNode(final List<Integer> oneList,
                                   final List<Integer> twoList,
                                   final int index,
                                   int[] overflowFlags) {
        int one = getIndexValue(oneList, index);
        int two = getIndexValue(twoList, index);

        int sum = one + two;
        int previousOverflow = overflowFlags[index];

        // 一般都是小于 10
        int value = sum + previousOverflow;

        if(value >= 10) {
            overflowFlags[index+1] = 1;
            // 保留个位
            value -= 10;
        }

        return new ListNode(value);
    }

    /**
     * 获取下标对应的值
     * @param list 列表
     * @param index 下标
     * @return 值
     * @since 1.0.0
     */
    private int getIndexValue(final List<Integer> list,
                              final int index) {
        if(index < list.size()) {
            return list.get(index);
        }

        return 0;
    }

    /**
     * 获取整数的链表
     * @param listNode 节点
     * @return 结果
     * @since 1.0.0
     */
    private List<Integer> getIntegerList(ListNode listNode) {
        // 使用 linkedList，避免扩容
        List<Integer> resultList = new LinkedList<>();
        ListNode oneNode = listNode;
        while (oneNode != null) {
            int value = oneNode.val;
            resultList.add(value);
            oneNode = oneNode.next;
        }
        return resultList;
    }

}
```

## 效果

> [效果如下](https://leetcode.com/problems/add-two-numbers/submissions/894403904/)：

```
Runtime: 3 ms, faster than 29.29% of Java online submissions for Add Two Numbers.
Memory Usage: 42.64 MB, less than 47.4% of Java online submissions for Add Two Numbers.
```
# V3-优化链表遍历

## 思路

上面的方式中，对于链表的遍历是分别独立进行的。

性能至少有两个优化点：

1）同时遍历两个链表

2）遍历链表的同时，构建节点

内存优化：因为是一边遍历，一边构建节点。所以进位的标识，可以用一个值替代。

## java 实现

```java
import com.github.houbb.leetcode.ListNode;

/**
 * 官方的解法
 *
 * 核心：
 * 5+7=12 会产生进位，但是最多只有一次进位
 * 因为：9+9+1=19
 *
 * 核心流程：
 *
 * @author binbin.hou
 * @since 1.0.0
 * @date 2020-6-9 11:38:48
 */
public class T002_AddTwoNumbersV3 {

    /**
     * 进位标识
     * @since 0.0.1
     */
    private static volatile int overflowFlag = 0 ;

    /**
     * Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)
     * Output: 7 -> 0 -> 8
     * Explanation: 342 + 465 = 807.
     *
     * TODO: 要学会避免前两次的列表循环。
     *
     * 注意：
     * （1）两个列表并不是一样长的，可能还有数字为空。
     * （2）末尾也可能产生进位
     *
     * 思路：
     * 直接遍历链表，使用一个位置保留进位。
     *
     * 列表的遍历一直是以最长的为准，走到最后。
     *
     *
     * @param l1 列表1
     * @param l2 列表2
     * @return 结果
     * @date 2020-6-9 12:08:44
     */
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        overflowFlag = 0;
        // 直接构建结果列表
        ListNode headNode = buildListNode(l1, l2);
        ListNode currentNode = headNode;

        ListNode l1Next = l1.next;
        ListNode l2Next = l2.next;
        while (l1Next != null || l2Next != null) {
            currentNode.next = buildListNode(l1Next, l2Next);
            currentNode = currentNode.next;

            // 往后遍历
            if(l1Next != null) {
                l1Next = l1Next.next;
            }
            if(l2Next != null) {
                l2Next = l2Next.next;
            }
        }

        // 最后如果存在进位的话
        if(overflowFlag == 1) {
            currentNode.next = new ListNode(1);
        }

        return headNode;
    }

    /**
     * 获取下一个元素值
     *
     * 默认返回 0
     * @param listNode 当前节点
     * @return 下一个节点的值
     * @since 1.0.0
     */
    private int getValue(ListNode listNode) {
        if(listNode == null) {
            return 0;
        }

        return listNode.val;
    }

    /**
     * 构建元素列表
     *
     * （1）为了避免 index == 0 时，判断
     * 将 index==0 时的信息直接保存在 0 位，当前进位保存在下一位。
     * @param l1 节点1
     * @param l2 节点2
     * @return 结果
     * @since 0.0.1
     */
    private ListNode buildListNode(ListNode l1, ListNode l2) {
        int valueOne = getValue(l1);
        int valueTwo = getValue(l2);

        int sum = valueOne+valueTwo + overflowFlag;

        if(sum >= 10) {
            sum -= 10;
            overflowFlag = 1;
        } else {
            overflowFlag = 0;
        }

        return new ListNode(sum);
    }

}
```

## 效果

> [效果如下](https://leetcode.com/problems/add-two-numbers/submissions/351135516/)：

```
Runtime: 1 ms, faster than 100.00% of Java online submissions for Add Two Numbers.
Memory Usage: 39.7 MB, less than 44.45% of Java online submissions for Add Two Numbers.
```

# 小结

对于链表的题目，基本都可以先使用笨方法，把节点放点列表中，然后处理，构建结果列表来解决。

但是这种性能基本是最差的。

对于节点的遍历和构建，值得我们进一步思考与学习。

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 参考资料

https://leetcode.cn/problems/add-two-numbers/

* any list
{:toc}