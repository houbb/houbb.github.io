---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC105. 从前序与中序遍历序列构造二叉树 construct-binary-tree-from-preorder-and-inorder-traversal
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, tree, binary-tree, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下数组这种数据结构。

## 主要知识

数组需要拆分下面几个部分：

1. 理论介绍

2. 源码分析

3. 数据结构实现？

4. 题目练习（按照算法思想分类）

5. 梳理对应的 sdk 包

6. 应用实战

因为这个是 leetcode 系列，所以重点是 4、5(对4再一次总结)。

为了照顾没有基础的小伙伴，会简单介绍一下1的基础理论。

简单介绍1，重点为4。其他不是本系列的重点。


# LC105. 从前序与中序遍历序列构造二叉树

https://leetcode.cn/studyplan/top-100-liked/

给定两个整数数组 preorder 和 inorder ，其中 preorder 是二叉树的先序遍历， inorder 是同一棵树的中序遍历，请构造二叉树并返回其根节点。

示例 1:

![1](https://assets.leetcode.com/uploads/2021/02/19/tree.jpg)

输入: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
输出: [3,9,20,null,null,15,7]
示例 2:

输入: preorder = [-1], inorder = [-1]
输出: [-1]
 

提示:

1 <= preorder.length <= 3000
inorder.length == preorder.length
-3000 <= preorder[i], inorder[i] <= 3000
preorder 和 inorder 均 无重复 元素
inorder 均出现在 preorder
preorder 保证 为二叉树的前序遍历序列
inorder 保证 为二叉树的中序遍历序列

# v1-递归

## 思路

先序：根->左->右
中序：左->根->右

1. 先序第一个 → 根
2. 中序找根 → 左段是左子树，右段是右子树
3. 左段长度 L → 决定先序中哪些是左子树、哪些是右子树
4. 递归 左右子树，直到区间为空或只有一个元素

## 步骤拆分

### 1. 推导过程图（递归拆分）

```
初始：
preorder = [3, 9, 20, 15, 7]
inorder  = [9, 3, 15, 20, 7]

① 根 = 3
    inorder 左 = [9]      → 左子树
    inorder 右 = [15, 20, 7] → 右子树
    preorder 划分: 3 | [9] | [20, 15, 7]

-------------------------------------

左子树：
preorder = [9]
inorder  = [9]
→ 单节点 9

右子树：
preorder = [20, 15, 7]
inorder  = [15, 20, 7]

② 根 = 20
    inorder 左 = [15] → 左子树
    inorder 右 = [7]  → 右子树
    preorder 划分: 20 | [15] | [7]

-------------------------------------

右子树的左子树：
preorder = [15]
inorder  = [15]
→ 单节点 15

右子树的右子树：
preorder = [7]
inorder  = [7]
→ 单节点 7
```

### 2. 最终 ASCII 树图

```
       3
     /   \
    9     20
         /  \
       15    7
```


## 在线可视化

> [从前序与中序遍历序列构造二叉树](https://houbb.github.io/leetcode-visual/T105-binary-search-construct-binary-tree-from-preorder-and-inorder-traversal.html)


## 实现

```java
public TreeNode buildTree(int[] preorder, int[] inorder) {
        // 用 Hash 构建一个中序的位置  其实只是用到了中序的位置
        Map<Integer, Integer> ixMap = new HashMap<>();
        for(int i = 0; i < inorder.length; i++) {
            ixMap.put(inorder[i], i);
        }

        return recursive(preorder, ixMap,
                0, preorder.length-1, 0, inorder.length-1);
    }

    /
     *
     * @param preorder 前序
     * @param ixMap 中序 ix
     * @param pStart 前序开始
     * @param pEnd 前序结束
     * @param iStart 中序开始
     * @param iEnd 中序结束
     * @return 节点
     */
    private TreeNode recursive(int[] preorder,
                               Map<Integer, Integer> ixMap,
                               int pStart, int pEnd,
                               int iStart, int iEnd) {
        // 终止条件
        if(pStart > pEnd || iStart > iEnd) {
            return null;
        }

        // 前序的开始元素就是根
        int rootNum = preorder[pStart];
        TreeNode rootNode = new TreeNode(rootNum);

        // 二分找到位置，可以用hash加速（左边对应的个数也就是这么多？）
        // 二分不一定对
        int iRootIndex = ixMap.get(rootNum);
        // 左子树节点个数
        int leftNum = iRootIndex - iStart;

        // 前序：根 | 左子树 | 右子树
        // 中序：左子树 | 根 | 右子树
        TreeNode leftNode = recursive(preorder, ixMap,
                pStart+1, pStart+ leftNum, iStart, iRootIndex -1);

        TreeNode rightNode = recursive(preorder, ixMap,
                pStart+ leftNum +1, pEnd, iRootIndex +1, iEnd);

        // 设置左右节点
        rootNode.left = leftNode;
        rootNode.right = rightNode;

        return rootNode;
    }
```

## 效果

2ms 击败 91.71%

## 反思

这里最核心的是通过前序的 rootNum 去中序中找到位置，然后得到 leftNum 左节点的个数。

递归时要注意处理好两个数组的下标。

# v2-迭代法 stack 

## 思路

同样的，我们可以用 stack 来模拟实现。


先序：根->左->右
中序：左->根->右

1）先创建根节点（前序第一个元素），入栈。

2）遍历前序的剩余元素，当前节点：

如果栈顶节点的值不等于中序数组当前指针值，则说明当前节点是栈顶节点的左子节点，入栈。

否则，说明左子树已经处理完了，需要出栈，并且指针往中序右移，当前节点是最近出栈节点的右子节点。

3）循环直到遍历完所有前序节点。

inorderIndex 是当前中序遍历指针，指示已经处理完的中序节点。


## 实现

```java
public TreeNode buildTree(int[] preorder, int[] inorder) {
    if(preorder == null || preorder.length == 0) return null;

    Stack<TreeNode> stack = new Stack<>();
    int inorderIndex = 0;

    TreeNode root = new TreeNode(preorder[0]);
    stack.push(root);

    for(int i = 1; i < preorder.length; i++) {
        int preorderVal = preorder[i];
        TreeNode node = stack.peek();

        if(node.val != inorder[inorderIndex]) {
            // 左子节点
            node.left = new TreeNode(preorderVal);
            stack.push(node.left);
        } else {
            // 栈顶节点值 == 当前中序节点，说明左子树完成
            while(!stack.isEmpty() && stack.peek().val == inorder[inorderIndex]) {
                node = stack.pop();
                inorderIndex++;
            }
            // 右子节点
            node.right = new TreeNode(preorderVal);
            stack.push(node.right);
        }
    }
    return root;
}
```

## 解释

`while` 循环的目的是：

> 反复出栈直到栈顶节点不再等于当前中序遍历的节点值，表示连续回溯到还没处理右子树的祖先节点。

### 详细解释

* 当前栈顶节点 `stack.peek()` 的值等于中序遍历指针指向的值，说明：

  * 这个节点的左子树（包括它自己）已经处理完毕，符合中序“左→根→右”顺序。

* 这时需要“出栈”这个节点，表示回溯到它的父节点，准备处理它的右子树。

* 但是，有可能连续有多个节点满足这个条件：

  * 比如一串连续的右子树节点都已经处理完，出栈后还要继续向上回溯。

* 所以要用 `while`，把这些连续的“已处理完左子树和根”的节点全部出栈。

* 出栈并且 `inorderIndex` 向后移动，指针不断前进。

### 举个简单例子

```
preorder = [1, 2, 4, 5, 3]
inorder  = [4, 2, 5, 1, 3]
```

* 当我们遇到节点 `5` 并且栈顶是 `5`，且中序指针指向 `5`，就出栈 `5`。
* 紧接着栈顶变为 `2`，中序指针指向 `2`，又满足条件，继续出栈。
* 再继续回溯到 `1`，停止在 `1` 因为还没处理右子树。

`while` 是为了“一口气”把所有已经完成左子树的节点都出栈，避免漏掉回溯路径。

如果用 `if`，只出栈一次，可能导致树结构构建不正确，右子树无法正确连接。

## 效果

2ms 击败 91.71%

* any list
{:toc} 
