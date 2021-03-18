---
layout: post
title:  面试算法：有序链表转换为高度平衡的二叉搜索树
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, search]
published: true
---

# 题目

给定一个单链表，其中的元素按升序排序，将其转换为高度平衡的二叉搜索树。

本题中，一个高度平衡二叉树是指一个二叉树每个节点的左右两个子树的高度差的绝对值不超过 1。

示例:

```
给定的有序链表： [-10, -3, 0, 5, 9],

一个可能的答案是：[0, -3, 9, -10, null, 5], 它可以表示下面这个高度平衡二叉搜索树：

      0
     / \
   -3   9
   /   /
 -10  5
```

# 解题思路

我们可以利用一下查找二叉树的性质。

## 二叉树的性质

**左子树的所有值小于根节点，右子树的所有值大于根节点。**

所以如果求 1...n 的所有可能。

我们只需要把 1 作为根节点，[ ] 空作为左子树，[ 2 ... n ] 的所有可能作为右子树。

2 作为根节点，[ 1 ] 作为左子树，[ 3...n ] 的所有可能作为右子树。

3 作为根节点，[ 1 2 ] 的所有可能作为左子树，[ 4 ... n ] 的所有可能作为右子树，然后左子树和右子树两两组合。

4 作为根节点，[ 1 2 3 ] 的所有可能作为左子树，[ 5 ... n ] 的所有可能作为右子树，然后左子树和右子树两两组合。

...

n 作为根节点，[ 1... n ] 的所有可能作为左子树，[ ] 作为右子树。

至于，[ 2 ... n ] 的所有可能以及 [ 4 ... n ] 以及其他情况的所有可能，可以利用上边的方法，把每个数字作为根节点，然后把所有可能的左子树和右子树组合起来即可。

如果只有一个数字，那么所有可能就是一种情况，把该数字作为一棵树。而如果是 [ ]，那就返回 null。

## 高度平衡

高度平衡，一个高度平衡二叉树是指一个二叉树每个节点的左右两个子树的高度差的绝对值不超过 1。

如果是偶数，左右子树的个数一致。

如果是奇数，我们可以选择让左边或者右边多一个。

```
int left = total / 2;

int right = total - left;
```

## 实现

```java
public TreeNode sortedListToBST(ListNode head) {
    List<Integer> list = getIntegers(head);
    if(list.size() <= 0) {
        return null;
    }
    return generateTree(list, 0, list.size()-1);
}

private TreeNode generateTree(List<Integer> list, int start, int end) {
    //此时没有数字，将 null 加入结果中
    if(start > end) {
        return null;
    }
    // root 节点
    // 1 2 3 4 5
    int rootIndex = start + (end - start) / 2;
    int rootVal = list.get(rootIndex);
    TreeNode treeNode = new TreeNode(rootVal);
    // left
    treeNode.left = generateTree(list, start, rootIndex-1);
    // right
    treeNode.right = generateTree(list, rootIndex+1, end);
    return treeNode;
}

private List<Integer> getIntegers(ListNode head) {
    List<Integer> list = new ArrayList<>();
    while (head != null) {
        list.add(head.val);
        head = head.next;
    }
    return list;
}
```

效果：

```
Runtime: 1 ms, faster than 43.98% of Java online submissions for Convert Sorted List to Binary Search Tree.
Memory Usage: 40.4 MB, less than 24.39% of Java online submissions for Convert Sorted List to Binary Search Tree.
```

## 复杂度

时间复杂度：O(n)，其中 n 是链表的长度。

# 优化方式-分治

是不是遍历了这个 list，导致结果变慢了呢？

可以使用快慢指针进行优化。

## 快慢指针

找出链表中位数节点的方法多种多样，其中较为简单的一种是「快慢指针法」。

初始时，快指针 fast 和慢指针 slow 均指向链表的左端点 left。

我们将快指针 fast 向右移动两次的同时，将慢指针 slow 向右移动一次，直到快指针到达边界（即快指针到达右端点或快指针的下一个节点是右端点）。

此时，慢指针对应的元素就是中位数。

在找出了中位数节点之后，我们将其作为当前根节点的元素，并递归地构造其左侧部分的链表对应的左子树，以及右侧部分的链表对应的右子树。

## java 实现

```java
public TreeNode sortedListToBST(ListNode head) {
    return buildTree(head, null);
}

public TreeNode buildTree(ListNode left, ListNode right) {
    if (left == right) {
        return null;
    }
    ListNode mid = getMedian(left, right);
    TreeNode root = new TreeNode(mid.val);
    root.left = buildTree(left, mid);
    root.right = buildTree(mid.next, right);
    return root;
}

public ListNode getMedian(ListNode left, ListNode right) {
    ListNode fast = left;
    ListNode slow = left;
    while (fast != right && fast.next != right) {
        fast = fast.next.next;
        slow = slow.next;
    }
    return slow;
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Convert Sorted List to Binary Search Tree.
Memory Usage: 39.9 MB, less than 61.25% of Java online submissions for Convert Sorted List to Binary Search Tree.
```

## 复杂度

时间复杂度：O(nlogn)，其中 n 是链表的长度。

# 小结

这一题需要我们理解 BST，然后结合中位数实现即可。

快慢指针是获取中间元素非常常用的技巧，利用链表存储元素，也可以解决随机访问的问题。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

https://leetcode-cn.com/problems/convert-sorted-list-to-binary-search-tree/

* any list
{:toc}
