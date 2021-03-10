---
layout: post
title: 二叉树遍历的三种方式：前序遍历、中序遍历（Inorder Traversal）、后续遍历
date:  2020-1-23 10:09:32 +0800
categories: [Data-Struct]
tags: [data-struct, block-chain, sh]
published: true
---

# 要求

本文用于整理二叉树的 3 种遍历方式：前序遍历、中序遍历、后续遍历。

并且使用递归和非递归两种方式。

# 统一节点定义

```java
public class TreeNode {

    public int val;
    public TreeNode left;
    public TreeNode right;
    public TreeNode() {}
    public TreeNode(int val) { this.val = val; }
    public TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }

}
```

# 中序遍历

https://leetcode.com/problems/binary-tree-inorder-traversal

左子树 => 根 => 右子树。

## 递归实现

```java
public List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> results = new ArrayList<>();
    travel(results, root);
    return results;
}

private void travel(List<Integer> list, TreeNode treeNode) {
    if(treeNode == null) {
        return;
    }
    // 左
    if(treeNode.left != null) {
        travel(list, treeNode.left);
    }
    // 中
    list.add(treeNode.val);
    // 右边
    if(treeNode.right != null) {
        travel(list, treeNode.right);
    }
}
```

## 迭代实现

思路：利用 stack 保存一下左節點。

最后弹出（此时可以视为是子树的 root 节点），处理一下对应的节点，和右子节点信息即可。

```java
public List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode p = root;
    while(!stack.isEmpty() || p != null) {
        if(p != null) {
            stack.push(p);
            p = p.left;
        } else {
            TreeNode node = stack.pop();
            result.add(node.val);  // Add after all left children
            p = node.right;   
        }
    }
    return result;
}
```

# 前序遍历

## java 实现

```java
/**
 *
 * 【思路】
 *
 * 数据=》左=》右
 *
 * Runtime: 0 ms, faster than 100.00% of Java online submissions for Binary Tree Preorder Traversal.
 * Memory Usage: 37 MB, less than 89.16% of Java online submissions for Binary Tree Preorder Traversal.
 */
public List<Integer> preorderTraversal(TreeNode root) {
    List<Integer> results = new ArrayList<>();
    travel(results, root);
    return results;
}

private void travel(List<Integer> list, TreeNode treeNode) {
    if(treeNode == null) {
        return;
    }
    // 数据
    list.add(treeNode.val);
    // 左
    if(treeNode.left != null) {
        travel(list, treeNode.left);
    }
    // 右边
    if(treeNode.right != null) {
        travel(list, treeNode.right);
    }
}
```

## 非递归实现

```java
public List<Integer> preorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode p = root;
    while(!stack.isEmpty() || p != null) {
        if(p != null) {
            stack.push(p);
            result.add(p.val);  // Add before going to children
            p = p.left;
        } else {
            TreeNode node = stack.pop();
            p = node.right;   
        }
    }
    return result;
}
```

# 后续遍历

## 流程

左=》右=》数据

## 递归实现

```java
/**
 *
 * 【思路】
 *
 * 左=》右=>D
 *
 * Runtime: 0 ms, faster than 100.00% of Java online submissions for Binary Tree Postorder Traversal.
 * Memory Usage: 37.7 MB, less than 19.80% of Java online submissions for Binary Tree Postorder Traversal.
 * 
 */
public List<Integer> postorderTraversal(TreeNode root) {
    List<Integer> results = new ArrayList<>();
    travel(results, root);
    return results;
}
private void travel(List<Integer> list, TreeNode treeNode) {
    if(treeNode == null) {
        return;
    }
    // 左
    if(treeNode.left != null) {
        travel(list, treeNode.left);
    }
    // 右边
    if(treeNode.right != null) {
        travel(list, treeNode.right);
    }
    // 数据
    list.add(treeNode.val);
}
```

## 非递归实现

```java
public List<Integer> postorderTraversal(TreeNode root) {
    LinkedList<Integer> result = new LinkedList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode p = root;
    while(!stack.isEmpty() || p != null) {
        if(p != null) {
            stack.push(p);
            result.addFirst(p.val);  // Reverse the process of preorder
            p = p.right;             // Reverse the process of preorder
        } else {
            TreeNode node = stack.pop();
            p = node.left;           // Reverse the process of preorder
        }
    }
    return result;
}
```

# 参考资料

[二叉树的先序(preorder)，中序（inorder），后序(postorder)的遍历(python)](https://blog.csdn.net/weixin_42664431/article/details/100751446)

https://leetcode.com/problems/binary-tree-postorder-traversal/discuss/45551/Preorder-Inorder-and-Postorder-Iteratively-Summarization

* any list
{:toc}