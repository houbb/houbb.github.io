---
layout: post
title: 面试算法：二叉树展开为链表
date:  2020-1-23 10:09:32 +0800 
categories: [Data-Struct]
tags: [data-struct, binary-tree, leetcode, sh]
published: true
---

# 二叉树展开为链表

## 题目

给你二叉树的根结点 root ，请你将它展开为一个单链表：

1. 展开后的单链表应该同样使用 TreeNode ，其中 right 子指针指向链表中下一个结点，而左子指针始终为 null 。

2. 展开后的单链表应该与二叉树 先序遍历 顺序相同。

示例 1：

![e1](https://assets.leetcode.com/uploads/2021/01/14/flaten.jpg)

```
输入：root = [1,2,5,3,4,null,6]
输出：[1,null,2,null,3,null,4,null,5,null,6]
```

示例 2：

```
输入：root = []
输出：[]
```

示例 3：

```
输入：root = [0]
输出：[0]
```

提示：

1. 树中结点数在范围 [0, 2000] 内

2. -100 <= Node.val <= 100

进阶：你可以使用原地算法（O(1) 额外空间）展开这棵树吗？

## 思路

我们先按照最朴素的实现来：

（1）通过前序遍历获取列表信息

（2）根据链表，重新构建 treeNode

## java 实现

我们按照上面的思路，可以得到如下的实现：

```java
public void flatten(TreeNode root) {
    List<Integer> list = new ArrayList<>();
    preorder(root, list);
    if(root != null) {
        // 清空左子树
        root.left = null;
        // 设置新的右子树
        root.right = buildRightTree(list);
    }
}

private TreeNode buildRightTree(List<Integer> list) {
    TreeNode root = null;
    TreeNode pre = null;
    for(int i = list.size()-1; i > 0 ; i--) {
        root = new TreeNode(list.get(i));
        // 右子树
        root.right = pre;
        pre = root;
    }
    return root;
}

private void preorder(TreeNode treeNode, List<Integer> list) {
    if(treeNode == null) {
        return;
    }
    list.add(treeNode.val);
    preorder(treeNode.left, list);
    preorder(treeNode.right, list);
}
```

效果：

```
Runtime: 1 ms, faster than 33.44% of Java online submissions for Flatten Binary Tree to Linked List.
Memory Usage: 38.2 MB, less than 83.12% of Java online submissions for Flatten Binary Tree to Linked List.
```

# 优化思路

那么问题来了，应该怎么优化呢？

我们回顾一下我们刚才的实现，有两个地方是可以优化的：

（1）如何实现一边遍历，一边设置对应的节点信息呢？

（2）如何才能不重复创建节点，而是直接更新已有的节点得到呢？

## 寻找前驱节点

有没有空间复杂度是 O(1) 的做法呢？

注意到前序遍历访问各节点的顺序是根节点、左子树、右子树。

如果一个节点的左子节点为空，则该节点不需要进行展开操作。

如果一个节点的左子节点不为空，则该节点的左子树中的最后一个节点被访问之后，该节点的右子节点被访问。

该节点的左子树中最后一个被访问的节点是左子树中的最右边的节点，也是该节点的前驱节点。

因此，问题转化成寻找**当前节点的前驱节点**。

### 算法流程

具体做法是，对于当前节点，如果其左子节点不为空，则在其左子树中找到最右边的节点，作为前驱节点，将当前节点的右子节点赋给前驱节点的右子节点，然后将当前节点的左子节点赋给当前节点的右子节点，并将当前节点的左子节点设为空。

对当前节点处理结束后，继续处理链表中的下一个节点，直到所有节点都处理结束。


举一个例子：

```
     1
    /  \
   2    5
  / \    \
 3   4    6 
```

我们前顺序遍历，第一个元素就是当前节点【1】

【1】节点对应的左子树

```
   2   
  / \  
 3   4 
```

那么前驱节点就是【4】，作为子树的最右边节点。

接下来，我们执行 3 个步骤：

（1）将当前节点的右子节点赋给前驱节点的右子节点

当前节点是【1】

```
     1
    /  
   2    
  / \    
 3   4    
      \
       5
        \
         6
```

（2）然后将当前节点的左子节点赋给当前节点的右子节点


```
     1
    /   \
   2     2
  / \    / \
 3   4   3  4
      \      \
       5      5
        \      \
         6      6
```

（3）并将当前节点的左子节点设为空

```
 1
  \   
   2    
  / \    
 3   4    
      \
       5
        \
         6
```

可以说是非常巧妙了。

## java 实现

```java
public void flatten(TreeNode root) {
    TreeNode curr = root;
    while (curr != null) {
        // 左子树不为空
        if (curr.left != null) {
            // 左子树
            TreeNode next = curr.left;
            // 前继结点
            TreeNode predecessor = next;
            while (predecessor.right != null) {
                predecessor = predecessor.right;
            }
            predecessor.right = curr.right;
            curr.left = null;
            curr.right = next;
        }
        curr = curr.right;
    }
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Flatten Binary Tree to Linked List.
Memory Usage: 38.3 MB, less than 83.12% of Java online submissions for Flatten Binary Tree to Linked List.
```

### 复杂度

时间复杂度：O(n)，其中 n 是二叉树的节点数。展开为单链表的过程中，需要对每个节点访问一次，在寻找前驱节点的过程中，每个节点最多被额外访问一次。

空间复杂度：O(1)。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

https://leetcode-cn.com/problems/flatten-binary-tree-to-linked-list/


* any list
{:toc}