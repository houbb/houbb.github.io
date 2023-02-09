---
layout: post
title: 【leetcode】010-19. 删除链表的倒数第 N 个结点 Remove Nth Node From End of List  双指针
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [Algorithm, list, leetcode, sf]
published: true
---

# 19. 删除链表的倒数第 N 个结点

给你一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。

## 示例

示例 1：

```
输入：head = [1,2,3,4,5], n = 2
输出：[1,2,3,5]
```

示例 2：

```
输入：head = [1], n = 1
输出：[]
```

示例 3：

```
输入：head = [1,2], n = 1
输出：[1]
``` 

## 提示：

链表中结点的数目为 sz

1 <= sz <= 30

0 <= Node.val <= 100

1 <= n <= sz
 
进阶：你能尝试使用一趟扫描实现吗？

# V1-借助数组

## 思路

链表是单向的，但是需要从倒数第 N 个删除，那么如何知道整体的长度呢？

所以至少需要一次遍历。

我想到的最直接的思路，就是首先遍历一遍，把 ListNode 的所有节点存放在数组中。

这样可以获取倒对应的整体长度；

想删除的时候，直接 O(1) 获取对应的下标节点。

## java 实现

```java
    /**
     * 移除倒数的元素
     *
     * 个人认为这种接法是由于题目中的给出的2种解法的。
     *
     * leetcode 的2个解法实际上都是：length + (length-n) 次移动，这是不合理的。
     * 如果 length=100，想移除倒数第一个元素，那么是遍历2次。
     * 个人借助数组，则只需要 length+O(1) 的查找。

     * 思路2：
     * 构建双向链表，添加一个尾巴节点。
     *
     * @param head 头结点
     * @param n 位数
     * @return 结果
     * @since v1
     */
    public ListNode removeNthFromEnd(ListNode head, int n) {
        List<ListNode> list = buildNodeList(head);

        if(list.size() <= 1) {
            return null;
        }

        // 考虑头尾的问题
        // 如果是移除头结点
        if(n == list.size()) {
            // 第二个元素当做头结点
            return list.get(1);
        }

        // 删除固定的节点
        ListNode pre = list.get(list.size()-n-1);
        pre.next = n >= list.size() ? null : pre.next.next;
        return list.get(0);
    }

    /**
     * 构建一个完整的数组
     * @param head 头结点
     * @return 结果
     * @since v1
     */
    private List<ListNode> buildNodeList(ListNode head) {
        List<ListNode> list = new ArrayList<>();

        list.add(head);
        while (head.next != null) {
            ListNode next = head.next;
            list.add(next);
            head = head.next;
        }

        return list;
    }
```

## 效果

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Remove Nth Node From End of List.
Memory Usage: 37.9 MB, less than 30.88% of Java online submissions for Remove Nth Node From End of List.
```

当时因为效果太好，所以直接跳过了。

本文主要查缺补漏，把官方的几个解法都记录一下。

# V2-两次遍历

## 官方解法

第一次，遍历整个链表，计算出长度 len。

第二次遍历，找到删除节点，执行删除。返回对应的头结点。

当然，为了避免处理麻烦，我们可以加一个 dummy 节点。

为了方便删除操作，我们可以从哑节点开始遍历 `len - N + 1` 个节点。

当遍历到第  `len - N + 1` 个节点时，它的下一个节点就是我们需要删除的节点，这样我们只需要修改一次指针，就能完成删除操作。

## java 实现

```java
    /**
     * 移除倒数的元素
     *
     * @param head 头结点
     * @param n 位数
     * @return 结果
     */
    public ListNode removeNthFromEnd(ListNode head, int n) {
        int len = getLen(head);

        // 创建 dummy 节点
        ListNode dummy = new ListNode(0, head);
        ListNode cur = dummy;
        for (int i = 1; i < len - n + 1; ++i) {
            cur = cur.next;
        }

        // 删除 cur 节点
        cur.next = cur.next.next;

        return dummy.next;
    }

    /**
     * 获取长度
     * @param head 头结点
     * @return 结果
     */
    private int getLen(ListNode head) {
        int i = 0;

        while (head != null) {
            head = head.next;
            i++;
        }

        return i;
    }
```

## 效果

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Remove Nth Node From End of List.
Memory Usage: 40.3 MB, less than 74.3% of Java online submissions for Remove Nth Node From End of List.
```

当然，严格来说，这个方法最差的复杂度实际上是遍历两遍。

比如 1W 个元素，删除最后一个，这样性能其实一般，只是测试用例区分性不强而已。

# V3-双指针

## 思考

假设链表的长度为 L，我们希望倒数第 n 个元素，有没有办法避免 V2 的两次遍历呢?

我们可以定义两个指针 i, j。

i 先走 n 步，然后 i j 同时往后走。当 i 走到结尾的时候，此时 j 刚好就是在倒数第 n 个位置。

当然，为了处理方便。我们可以引入 dummy 节点，让 j 从 dummy 开始，i 从 head 开始。

## java 实现

```java
public ListNode removeNthFromEnd(ListNode head, int n) {
        // 创建 dummy 节点
        ListNode dummy = new ListNode(0, head);

        // i 先走 n 步
        ListNode i = head;
        ListNode j = dummy;
        for(int k = 0; k < n; k++) {
            i = i.next;
        }

        // 二者同时开始走
        while (i != null) {
            j = j.next;
            i = i.next;
        }

        // 删除当前节点
        j.next = j.next.next;

        // 返回
        return dummy.next;
    }
```

## 效果

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Remove Nth Node From End of List.
Memory Usage: 40.4 MB, less than 64.16% of Java online submissions for Remove Nth Node From End of List.
```

# 小结

官方的解法 1 实际上比较容易想到，不过需要两次遍历。

想避免这种两次遍历，有 2 种方式：

1）通过数组存储 listNode，避免再次遍历

2）通过双指针，达到一次满足的效果。

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

## 参考资料

https://leetcode.cn/problems/remove-nth-node-from-end-of-list/solution/shan-chu-lian-biao-de-dao-shu-di-nge-jie-dian-b-61/

* any list
{:toc}