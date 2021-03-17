---
layout: post
title:  面试算法力扣98-验证二叉搜索树
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, search]
published: true
---

# 题目

给定一个二叉树，判断其是否是一个有效的二叉搜索树。

假设一个二叉搜索树具有如下特征：

- 节点的左子树只包含小于当前节点的数。

- 节点的右子树只包含大于当前节点的数。

- 所有左子树和右子树自身必须也是二叉搜索树。

示例 1:

```
输入:
    2
   / \
  1   3
输出: true
```

示例 2:

```
输入:
    5
   / \
  1   4
     / \
    3   6
输出: false
解释: 输入为: [5,1,4,null,null,3,6]。
     根节点的值为 5 ，但是其右子节点值为 4 。
```


# 递归的解法

## 错误的第一次解法

```java
/**
 * 递归：
 *
 * （1）当前节点，左，右
 * （2）左子树
 * （3）右子树
 *
 * 最大值，最小值
 * 
 * @param root 根节点
 * @return 结果
 */
public boolean isValidBST(TreeNode root) {
    if(root == null) {
        return true;
    }
    int rootVal = root.val;
    TreeNode left = root.left;
    TreeNode right = root.right;
    //节点的左子树只包含小于当前节点的数。
    if(left != null) {
        int leftVal = left.val;
        if(leftVal >= rootVal) {
            return false;
        }
    }
    //节点的右子树只包含大于当前节点的数。
    if(right != null) {
        int rightVal = right.val;
        if(rightVal <= rootVal) {
            return false;
        }
    }
    //所有左子树和右子树自身必须也是二叉搜索树。
    return isValidBST(left) && isValidBST(right);
}
```

这里只考虑了每一个节点，和左右节点。

实际上还是忽略了整体的左右大小比较。

`[5,4,6,null,null,3,7]` 这个 CASE 就是过不去的。

## 正确的解法

```java
public boolean isValidBST(TreeNode root) {
    return isValidBST(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

// 测试场景中会针对 int 的最大/小值做边界测试
private boolean isValidBST(TreeNode root, long lower, long upper) {
    if(root == null) {
        return true;
    }
    int val = root.val;
    //节点的左子树只包含小于当前节点的数。
    if(lower >= val) {
        return false;
    }
    //节点的右子树只包含大于当前节点的数。
    if(upper <= val) {
        return false;
    }
    //所有左子树和右子树自身必须也是二叉搜索树。
    return isValidBST(root.left, lower, val) && isValidBST(root.right, val, upper);
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Validate Binary Search Tree.
Memory Usage: 38.5 MB, less than 81.15% of Java online submissions for Validate Binary Search Tree.
```

# 解法二：中序遍历

这一题通过中序遍历去解决也比较自然。

BST 通过中序遍历获得的结果一定是一个升序队列。

如果不满足，就说明不是。

## 中序遍历为什么是升序？

中序遍历是二叉树的一种遍历方式，它先遍历左子树，再遍历根节点，最后遍历右子树。

而我们二叉搜索树保证了左子树的节点的值均小于根节点的值，根节点的值均小于右子树的值，因此中序遍历以后得到的序列一定是升序序列。

## 实现

```java
Long pre = Long.MIN_VALUE;

public boolean isValidBST(TreeNode root) {    
    if(root == null) {
        return true;
    }
    // 左
    boolean l = isValidBST(root.left);
    // 中
    int val = root.val;
    if(val <= pre) {
        return false;
    }
    pre = (long) val;
    // 右
    boolean r = isValidBST(root.right);
    return l && r;
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Validate Binary Search Tree.
Memory Usage: 38.8 MB, less than 44.59% of Java online submissions for Validate Binary Search Tree.
```

# 参考资料

[98. 验证二叉搜索树](https://leetcode-cn.com/problems/validate-binary-search-tree)

* any list
{:toc}
