---
layout: post
title: 面试算法：二叉树的前序/中序/后序/层序遍历方式汇总 preorder/Inorder/postorder/levelorder
date:  2020-1-23 10:09:32 +0800 
categories: [Data-Struct]
tags: [data-struct, block-chain, leetcode, sh]
published: true
---

# 要求

本文用于整理二叉树的 4 种遍历方式：前序遍历、中序遍历、后序遍历、层序遍历。

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

# 后序遍历

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

# 层序遍历

## 题目

给你一个二叉树，请你返回其按层序遍历得到的节点值。 （即逐层地，从左到右访问所有节点）。

示例：

```
二叉树：[3,9,20,null,null,15,7],

    3
   / \
  9  20
    /  \
   15   7
返回其层序遍历结果：

[
  [3],
  [9,20],
  [15,7]
]
```

## 解法一：前序遍历

### 解题思路

如何判断层级呢？

我们可以使用前序遍历：数据=》左=》右

然后把层级传递下去，每次左（右）level+1。

### java 实现

```java
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> results = new ArrayList<>();
    levelOrder(results, root, 0);
    return results;
}

private void levelOrder(List<List<Integer>> results, TreeNode treeNode, int level) {
    if(treeNode == null) {
        return;
    }
    // 当前节点
    // AVOID BOUND EX
    if(results.size() <= level) {
        results.add(new ArrayList<>());
    }
    List<Integer> list = results.get(level);
    // 节点
    int val = treeNode.val;
    list.add(val);
    results.set(level, list);
    // 左
    levelOrder(results, treeNode.left, level+1);
    // 右
    levelOrder(results, treeNode.right, level+1);
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Binary Tree Level Order Traversal.
Memory Usage: 39.2 MB, less than 56.89% of Java online submissions for Binary Tree Level Order Traversal.
```

# 从下往上的层序遍历

## 题目

我们把层序遍历做一个简单的调整：要求从最下面一层往上面遍历，其他不变。

给你一个二叉树，请你返回其按 层序遍历 得到的节点值。 （即逐层地，从左到右访问所有节点）。
 

示例：

```
二叉树：[3,9,20,null,null,15,7],

    3
   / \
  9  20
    /  \
   15   7
返回其层序遍历结果：

[
  [3],
  [9,20],
  [15,7]
]
```

## 思路

如果直接做这一题难度还是有的，不过如果我们在上一题的基础上去做，就变得非常简单。

（1）获取层序遍历的列表

（2）列表反序

## 实现

```java
public List<List<Integer>> levelOrderBottom(TreeNode root) {
    List<List<Integer>> results = new ArrayList<>();
    levelOrder(results, root, 0);
    // reverse
    return reverseList(results);
}

private List<List<Integer>> reverseList(List<List<Integer>> list) {
    if(list.size() <= 1) {
        return list;
    }
    // 从后向前遍历
    List<List<Integer>> results = new ArrayList<>();
    for(int i = list.size()-1; i >= 0; i--) {
        List<Integer> temp = list.get(i);
        results.add(temp);
    }
    return results;
}

private void levelOrder(List<List<Integer>> results, TreeNode treeNode, int level) {
    if(treeNode == null) {
        return;
    }
    // 当前节点
    // AVOID BOUND EX
    if(results.size() <= level) {
        results.add(new ArrayList<>());
    }
    List<Integer> list = results.get(level);
    // 节点
    int val = treeNode.val;
    list.add(val);
    results.set(level, list);
    // 左
    levelOrder(results, treeNode.left, level+1);
    // 右
    levelOrder(results, treeNode.right, level+1);
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Binary Tree Level Order Traversal.
Memory Usage: 39.2 MB, less than 56.89% of Java online submissions for Binary Tree Level Order Traversal.
```

# 层级 Z 字形遍历

## 题目

给定一个二叉树，返回其节点值的锯齿形层序遍历。（即先从左往右，再从右往左进行下一层遍历，以此类推，层与层之间交替进行）。

例如：

```
给定二叉树 [3,9,20,null,null,15,7],

    3
   / \
  9  20
    /  \
   15   7
返回锯齿形层序遍历如下：

[
  [3],
  [20,9],
  [15,7]
]
```

## 解题思路

实际上这个在我们掌握了层级遍历之后，一切都变得非常简单。

我们可以先层级遍历，然后把每一个偶数层的数组反转即可。

## 实现如下

```java
public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
    List<List<Integer>> results = new ArrayList<>();
    levelOrder(results, root, 0);
    // 根據層級進行反轉
    reverseByLevel(results);
    return results;
}

private void reverseByLevel(List<List<Integer>> results) {
    if(results.size() <= 1) {
        return;
    }
    // 偶數開始便利
    for(int i = 1; i < results.size(); i+=2) {
        List<Integer> list = results.get(i);
        Collections.reverse(list);
        results.set(i, list);
    }
}

/**
 *
 * @param results 結果
 * @param treeNode 樹
 * @param level 層級
 */
private void levelOrder(List<List<Integer>> results, TreeNode treeNode, int level) {
    if(treeNode == null) {
        return;
    }
    // 当前节点
    // AVOID BOUND EX
    if(results.size() <= level) {
        results.add(new ArrayList<>());
    }
    List<Integer> list = results.get(level);
    // 节点
    int val = treeNode.val;
    list.add(val);
    results.set(level, list);
    // 左
    levelOrder(results, treeNode.left, level+1);
    // 右
    levelOrder(results, treeNode.right, level+1);
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Binary Tree Zigzag Level Order Traversal.
Memory Usage: 39.2 MB, less than 50.08% of Java online submissions for Binary Tree Zigzag Level Order Traversal.
```

# 参考资料

[二叉树的先序(preorder)，中序（inorder），后序(postorder)的遍历(python)](https://blog.csdn.net/weixin_42664431/article/details/100751446)

https://leetcode.com/problems/binary-tree-postorder-traversal/discuss/45551/Preorder-Inorder-and-Postorder-Iteratively-Summarization

[102. 二叉树的层序遍历](https://leetcode-cn.com/problems/binary-tree-level-order-traversal/)

* any list
{:toc}