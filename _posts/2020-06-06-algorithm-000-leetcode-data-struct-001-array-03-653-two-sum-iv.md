---
layout: post
title: leetcode 数组专题 01-leetcode.653 two-sum IV 力扣 653. 两数之和 IV 二叉树/binary-tree
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, binary-search, two-pointer, tree, binary-tree, sf]
published: true
---

# 数组系列

[力扣数据结构之数组-00-概览](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-00-overview)

[力扣.53 最大子数组和 maximum-subarray](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-01-51-maximum-subarray)

[力扣.128 最长连续序列 longest-consecutive-sequence](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-02-128-longest-consecutive-sequence)

[力扣.1 两数之和 N 种解法 two-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum)

[力扣.167 两数之和 II two-sum-ii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-ii)

[力扣.170 两数之和 III two-sum-iii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-iii)

[力扣.653 两数之和 IV two-sum-IV](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-iv)

[力扣.015 三数之和 three-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-015-three-sum)

[力扣.016 最接近的三数之和 three-sum-closest](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-016-three-sum-closest)

[力扣.259 较小的三数之和 three-sum-smaller](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-259-three-sum-smaller)

[力扣.018 四数之和 four-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-05-018-four-num)

[力扣.454 四数相加之和 II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-05-454-four-num-ii)

点击 {阅读原文} 获得更好的阅读体验。

# 题目

给定一个二叉搜索树 root 和一个目标结果 k，如果二叉搜索树中存在两个元素且它们的和等于给定的目标结果，则返回 true。

示例 1：

```
        5
       / \
      3   6
     / \    \
    2   4    7
```

输入: root = [5,3,6,2,4,null,7], k = 9

输出: true

示例 2：

```
        5
       / \
      3   6
     / \    \
    2   4    7
```

输入: root = [5,3,6,2,4,null,7], k = 28

输出: false
 

提示:

二叉树的节点个数的范围是  [1, 10^4].

-10^4 <= Node.val <= 10^4

题目数据保证，输入的 root 是一棵 有效 的二叉搜索树

-10^5 <= k <= 10^5

# 思路

这种二叉树的题目，我们可以分为两步：

1）二叉树遍历转换为数组

2）数组，然后复用前面 T001/T167 的解法。

## 常见算法

### 树的遍历

[面试算法：二叉树的前序/中序/后序/层序遍历方式汇总 preorder/Inorder/postorder/levelorder](https://houbb.github.io/2020/01/23/algorithm-16-binary-tree-travel)

树的遍历有多种方式：前序 中序 后序 层序

### 找到符合的结果

1) 暴力

2）借助 Hash

3) 排序+二分

4）双指针==》针对有序数组

在这个场景里面，最简单好用的应该是 Hash 的方式。其他的我们就不再演示。

本文主要在复习一下树的遍历，太久没做了，忘记了。


# 树的遍历回顾

在二叉树中，前序遍历、中序遍历和后序遍历是三种常见的遍历方式，递归实现是最直观和常用的方式。

下面是这三种遍历的基本概念和 Java 递归实现的代码示例。

### 1. 前序遍历 (Preorder Traversal)

**遍历顺序：** 根节点 -> 左子树 -> 右子树

**递归实现：**
```java
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) {
        val = x;
    }
}

public class BinaryTree {
    public void preorderTraversal(TreeNode root) {
        if (root == null) {
            return;
        }
        System.out.print(root.val + " "); // 先访问根节点
        preorderTraversal(root.left);    // 遍历左子树
        preorderTraversal(root.right);   // 遍历右子树
    }
}
```

### 2. 中序遍历 (Inorder Traversal)
**遍历顺序：** 左子树 -> 根节点 -> 右子树

**递归实现：**
```java
public class BinaryTree {
    public void inorderTraversal(TreeNode root) {
        if (root == null) {
            return;
        }
        inorderTraversal(root.left);     // 遍历左子树
        System.out.print(root.val + " "); // 访问根节点
        inorderTraversal(root.right);    // 遍历右子树
    }
}
```

### 3. 后序遍历 (Postorder Traversal)

**遍历顺序：** 左子树 -> 右子树 -> 根节点

**递归实现：**
```java
public class BinaryTree {
    public void postorderTraversal(TreeNode root) {
        if (root == null) {
            return;
        }
        postorderTraversal(root.left);    // 遍历左子树
        postorderTraversal(root.right);   // 遍历右子树
        System.out.print(root.val + " "); // 访问根节点
    }
}
```

### 总结

- **前序遍历**：先访问根节点，再遍历左子树和右子树。

- **中序遍历**：先遍历左子树，再访问根节点，最后遍历右子树。

- **后序遍历**：先遍历左子树，再遍历右子树，最后访问根节点。

这些遍历方式的递归实现思路基本相同，区别在于访问根节点的时机不同。在实际应用中，可以根据需求选择不同的遍历方式。

前中后是以 root 的节点为主视角，看什么时候被访问。

# v1-前序遍历

## 思路

我们可以把整个数组完全构建出来，然后复用以前的解法。

当然这样会比较慢，我们可以在遍历的时候找到对应的结果。

传递的值更新问题，我们用 resFlag 数组来记录最后的结果。

## 实现

```java
class Solution {
   public boolean findTarget(TreeNode root, int k) {
        // 构建结果列表
        Set<Integer> numSet = new HashSet<>();

        int[] resFlag = new int[]{1};
        resFlag[0] = 0;
        preOrderTravel(numSet, root, k, resFlag);

        return resFlag[0] != 0;
    }

    private void preOrderTravel(Set<Integer> numSet,
                                TreeNode root,
                                int k,
                                int[] resFlag) {
        if(root == null || resFlag[0] != 0) {
            return;
        }

        // 符合
        int value = root.val;
        if(numSet.contains(k - value)) {
            resFlag[0] = 1;
            return;
        }
        numSet.add(value);

        preOrderTravel(numSet, root.left, k, resFlag);
        preOrderTravel(numSet, root.right, k, resFlag);
    }
}
```

## 效果

3ms 79.82

# v2-中序遍历

## 思路

采用中序遍历，其他保持不变。

## 代码

```java
public boolean findTarget(TreeNode root, int k) {
    // 构建结果列表
    Set<Integer> numSet = new HashSet<>();
    int[] resFlag = new int[]{1};
    resFlag[0] = 0;
    inOrderTravel(numSet, root, k, resFlag);
    return resFlag[0] != 0;
}

private void inOrderTravel(Set<Integer> numSet,
                           TreeNode root,
                           int k,
                           int[] resFlag) {
    if(root == null || resFlag[0] != 0) {
        return;
    }
    inOrderTravel(numSet, root.left, k, resFlag);
    // 符合
    int value = root.val;
    if(numSet.contains(k - value)) {
        resFlag[0] = 1;
        return;
    }
    numSet.add(value);
    inOrderTravel(numSet, root.right, k, resFlag);
}
```

## 效果

```
3ms 79.82%
```

# v3-后序遍历

## 思路

很简单，调整为后续遍历即可。

## 实现

```java
    public boolean findTarget(TreeNode root, int k) {
        // 构建结果列表
        Set<Integer> numSet = new HashSet<>();

        int[] resFlag = new int[]{1};
        resFlag[0] = 0;
        postOrderTravel(numSet, root, k, resFlag);

        return resFlag[0] != 0;
    }

    private void postOrderTravel(Set<Integer> numSet,
                                 TreeNode root,
                                 int k,
                                 int[] resFlag) {
        if(root == null || resFlag[0] != 0) {
            return;
        }

        postOrderTravel(numSet, root.left, k, resFlag);

        postOrderTravel(numSet, root.right, k, resFlag);

        // 符合
        int value = root.val;
        if(numSet.contains(k - value)) {
            resFlag[0] = 1;
            return;
        }
        numSet.add(value);
    }
```

## 效果

4ms 29.82%

估计是服务器波动，也和测试用例有一定的关系。

# v4-层序遍历

## 层序遍历

层序遍历（Level Order Traversal）是按层级顺序从上到下、从左到右遍历二叉树。

与前序、中序、后序不同，层序遍历通常是使用广度优先搜索（BFS）实现的，常见的做法是使用队列来辅助遍历。

### 层序遍历的实现步骤：

1. 使用一个队列存储当前层的节点。

2. 先将根节点加入队列。

3. 然后逐层遍历队列，取出队首节点，访问该节点，并将它的左右子节点（如果有的话）依次加入队列。

4. 重复这个过程，直到队列为空。

### 层序遍历的 Java 实现：

```java
// 层序遍历
public void levelOrderTraversal(TreeNode root) {
    if (root == null) {
        return;
    }
    
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root); // 将根节点加入队列
    
    while (!queue.isEmpty()) {
        TreeNode node = queue.poll(); // 取出队首元素
        System.out.print(node.val + " "); // 访问当前节点
        
        if (node.left != null) {
            queue.offer(node.left); // 左子节点加入队列
        }
        if (node.right != null) {
            queue.offer(node.right); // 右子节点加入队列
        }
    }
}
```

### 代码说明：

1. **队列**：我们使用 `LinkedList` 来实现队列，因为队列的特点是先入先出（FIFO）。

2. **访问节点**：每次从队列中取出一个节点，访问它并将其左右子节点加入队列。

3. **层级遍历**：这种方式会保证节点按照层次顺序被访问，父节点先于子节点。


## 结合本题

```java
    public boolean findTarget(TreeNode root, int k) {
        // 构建结果列表
        Set<Integer> numSet = new HashSet<>();

        // 队列 模拟
        int[] resFlag = new int[]{1};
        resFlag[0] = 0;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        levelOrderTravel(numSet, queue, k, resFlag);

        return resFlag[0] != 0;
    }

    private void levelOrderTravel(Set<Integer> numSet,
                                  Queue<TreeNode> queue,
                                  int k,
                                  int[] resFlag) {
        while (!queue.isEmpty()) {
            // 取出
            TreeNode root = queue.poll();
            // 符合
            int value = root.val;
            if(numSet.contains(k - value)) {
                resFlag[0] = 1;
                return;
            }
            numSet.add(value);

            // 加入左右
            if(root.left != null) {
                queue.offer(root.left);
            }
            if(root.right != null) {
                queue.offer(root.right);
            }
        }
    }
```

## 效果

4ms 29.82

# 小结

层序遍历放在本题看起来没有特别大的优势。

不过层序遍历在有些场景还是很有用的，比如 T337 打家劫舍 III。

# v5-还有高手 

## 思路

除了这 4 种方式，还有其他更快的方式吗？

那就是我们其实对二叉树的理解还是不够深入。

中序遍历之后，结果其实是一个升序数组。

也就是我们可以利用排序后的数组进行处理，结合 T167.

中序是：left==>val==>right

## 回顾 T167

其实就是两步

1）构建有序数组

2）双指针直接获取

当然双指针也可以用二分法，此处不再赘述、

## java

```java
    public boolean findTarget(TreeNode root, int k) {
        List<Integer> sortList = new ArrayList<>();

        // 中序获取排序数组
        inOrderTravel(sortList, root);

        // 双指针
        return twoSum(sortList, k);
    }

    public boolean twoSum(List<Integer> sortList, int target) {
        int n = sortList.size();
        int left = 0;
        int right = n-1;

        while (left < right) {
            int sum = sortList.get(left) + sortList.get(right);
            if(sum == target) {
                return true;
            }
            if(sum < target) {
                left++;
            }
            if(sum > target) {
                right--;
            }
        }

        return false;
    }


    private void inOrderTravel(List<Integer> sortList,
                               TreeNode root) {
        if(root == null) {
            return;
        }
        inOrderTravel(sortList, root.left);

        // add
        sortList.add(root.val);

        inOrderTravel(sortList, root.right);
    }
```

## 效果

3ms 79.82%

## 小结

这种解法，其实已经很巧妙了。

本题的难度定位在简单有点浪费，用到这种方式实际上已经结合了多个知识点。

* any list
{:toc}