---
layout: post
title: 面试算法：如何根据前序与中序遍历序列构造二叉树？
date:  2020-1-23 10:09:32 +0800 
categories: [Data-Struct]
tags: [data-struct, block-chain, leetcode, sh]
published: true
---

# 从前序与中序遍历序列构造二叉树

## 题目

根据一棵树的前序遍历与中序遍历构造二叉树。

注意:

你可以假设树中没有重复的元素。

例如，给出

```
前序遍历 preorder = [3,9,20,15,7]
中序遍历 inorder = [9,3,15,20,7]
返回如下的二叉树：

    3
   / \
  9  20
    /  \
   15   7
```

## 解题思路

如何确定根节点？

如何确定是否有左右子树？

如何确定左右子树？

如何根据这些构建一棵树呢？

## 解法

前序遍历的第一个元素，就是 root

```
[ 根节点, [左子树的前序遍历结果], [右子树的前序遍历结果] ]
```

中序遍历的第一个元素，就是 left，最后一个元素是 right。

```
[ [左子树的中序遍历结果], 根节点, [右子树的中序遍历结果] ]
```

（1）根节点的确认

根据中序遍历 + 前序遍历的第一个元素，确定根节点的位置。

（2）左右节点的个数

从而推断出左节点的个数+右节点的个数

```
左子树的个数 = 中序根节点_index - 中序左边界
```

（3）左右子树的构建

这样以来，我们就知道了左子树的前序遍历和中序遍历结果，以及右子树的前序遍历和中序遍历结果，我们就可以递归地对构造出左子树和右子树，再将这两颗子树接到根节点的左右位置。

左子树对应关系：

```
(前序左边界+1, 前序左边界+左子树的个数) ==== 对应了=== 中序遍历中「从 左边界 开始到 根节点定位-1」的元素
```

右子树对应关系：

```
(前序左边界+左子树的个数+1, 前序右边界) ==== 对应了=== 中序遍历中「根节点定位+1, 右边界」的元素
```

## java 实现

```java
/**
 * 解题思路：
 *
 * （1）定位 root
 * （2）递归构建 left right
 * @param preorder 前序
 * @param inorder 中序
 * @return 结果
 */
public TreeNode buildTree(int[] preorder, int[] inorder) {
    int limit = preorder.length - 1;
    return buildTree(preorder, inorder, 0, limit, 0, limit);
}

/**
 * 构建一棵树
 * @param preorder 前序
 * @param inorder 中序
 * @param preorderLeft 前序左边
 * @param preorderRight 前序右边
 * @param inorderLeft 中序左边
 * @param inorderRight 中序右边
 * @return 结果
 */
private TreeNode buildTree(int[] preorder, int[] inorder,
                           int preorderLeft, int preorderRight,
                           int inorderLeft, int inorderRight) {
    if(preorderLeft > preorderRight) {
        return null;
    }
    // 获取根节点（前序遍历的第一个元素）
    int rootVal = preorder[preorderLeft];
    // 获取根节点在中序遍历的位置
    int rootIndex = getRootIndex(inorder, rootVal);
    // 左子树的个数
    int leftSize = rootIndex - inorderLeft;
    // 根节点
    TreeNode root = new TreeNode();
    root.val = rootVal;
    // 左子树
    // (前序左边界+1, 前序左边界+左子树的个数) ==== 对应了=== 中序遍历中「从 左边界 开始到 根节点定位-1」的元素
    root.left = buildTree(preorder, inorder, preorderLeft+1, preorderLeft+leftSize,
            inorderLeft, rootIndex-1);
    // 右子树
    // (前序左边界+左子树的个数+1, 前序右边界) ==== 对应了=== 中序遍历中「根节点定位+1, 右边界」的元素
    root.right = buildTree(preorder, inorder, preorderLeft+leftSize+1, preorderRight,
            rootIndex+1, inorderRight);
    return root;
}

private int getRootIndex(int[] inorder, int rootVal) {
    for(int i = 0; i < inorder.length; i++) {
        if(rootVal == inorder[i]) {
            return i;
        }
    }
    // no reach
    return -1;
}
```

效果：

```
Runtime: 3 ms, faster than 56.03% of Java online submissions for Construct Binary Tree from Preorder and Inorder Traversal.
Memory Usage: 38.9 MB, less than 69.15% of Java online submissions for Construct Binary Tree from Preorder and Inorder Traversal.
```

## 优化根节点获取

我们这里获取根节点，实际上是 O(n) 遍历，可以使用 map 将时间复杂度降低为 O(1)。

### java 实现

```java
/**
 * 解题思路：
 *
 * （1）定位 root
 * （2）递归构建 left right
 * @param preorder 前序
 * @param inorder 中序
 * @return 结果
 */
public TreeNode buildTree(int[] preorder, int[] inorder) {
    int limit = preorder.length - 1;
    // 构建 inOrderMap
    Map<Integer, Integer> inorderMap = new HashMap<>(inorder.length);
    for(int i = 0; i < inorder.length; i++) {
        inorderMap.put(inorder[i], i);
    }
    return buildTree(preorder, inorder, 0, limit, 0, limit,
            inorderMap);
}

/**
 * 构建一棵树
 * @param preorder 前序
 * @param inorder 中序
 * @param preorderLeft 前序左边
 * @param preorderRight 前序右边
 * @param inorderLeft 中序左边
 * @param inorderRight 中序右边
 * @param inorderMap map
 * @return 结果
 */
private TreeNode buildTree(int[] preorder, int[] inorder,
                           int preorderLeft, int preorderRight,
                           int inorderLeft, int inorderRight,
                           Map<Integer, Integer> inorderMap) {
    if(preorderLeft > preorderRight) {
        return null;
    }
    // 获取根节点（前序遍历的第一个元素）
    int rootVal = preorder[preorderLeft];
    // 获取根节点在中序遍历的位置
    int rootIndex = inorderMap.get(rootVal);
    // 左子树的个数
    int leftSize = rootIndex - inorderLeft;
    // 根节点
    TreeNode root = new TreeNode();
    root.val = rootVal;
    // 左子树
    // (前序左边界+1, 前序左边界+左子树的个数) ==== 对应了=== 中序遍历中「从 左边界 开始到 根节点定位-1」的元素
    root.left = buildTree(preorder, inorder, preorderLeft+1, preorderLeft+leftSize,
            inorderLeft, rootIndex-1, inorderMap);
    // 右子树
    // (前序左边界+左子树的个数+1, 前序右边界) ==== 对应了=== 中序遍历中「根节点定位+1, 右边界」的元素
    root.right = buildTree(preorder, inorder, preorderLeft+leftSize+1, preorderRight,
            rootIndex+1, inorderRight, inorderMap);
    return root;
}
```

效果：

```
Runtime: 1 ms, faster than 98.69% of Java online submissions for Construct Binary Tree from Preorder and Inorder Traversal.
Memory Usage: 39.5 MB, less than 26.72% of Java online submissions for Construct Binary Tree from Preorder and Inorder Traversal.
```

这个优化效果还是非常显著的。

## 小结

二叉树相关的问题，通过递归的方式解决会更加便于理解。

这一题最核心的部分就在于找到两种遍历之间的映射关系，对于遍历获取索引，通过 map 优化，也是很常见的一个小技巧。


# 从中序与后序遍历序列构造二叉树

## 题目

根据一棵树的中序遍历与后序遍历构造二叉树。

注意:
你可以假设树中没有重复的元素。

```
例如，给出

中序遍历 inorder = [9,3,15,20,7]
后序遍历 postorder = [9,15,7,20,3]
返回如下的二叉树：

    3
   / \
  9  20
    /  \
   15   7
```

## 思路

和上一题类似。

后序遍历的第一个元素，最后一个就是 root

```
[ [左子树的后序遍历结果], [右子树的前序遍历结果]，根节点]
```

中序遍历：

```
[ [左子树的中序遍历结果], 根节点, [右子树的中序遍历结果] ]
```

## 依然是下面的几个步骤

（1）根节点的确认

后续的最右边的元素，就是 root。

（2）左子树的个数

leftSize = 中序 rootIndex - 中序 leftIndex;

（3）左右子树的对应关系

左子树：

```
后序 left, left+leftSize-1   对应：   中序 left, rootIndex-1  
```


右子树：

```
后续 left+leftSize+1, right-1    对应 中序 rootIndex+1, right
```


## java 实现

```java
public TreeNode buildTree(int[] inorder, int[] postorder) {
    int limit = inorder.length - 1;
    // 构建 inOrderMap
    Map<Integer, Integer> inorderMap = new HashMap<>(inorder.length);
    for(int i = 0; i < inorder.length; i++) {
        inorderMap.put(inorder[i], i);
    }
    return buildTree(inorder, postorder, 0, limit, 0, limit,
            inorderMap);
}

/**
 * 构建一棵树
 * @param inorder 中序
 * @param postorder 后序
 * @param postorderLeft 后序左边
 * @param postorderRight 后序右边
 * @param inorderLeft 中序左边
 * @param inorderRight 中序右边
 * @param inorderMap map
 * @return 结果
 */
private TreeNode buildTree(int[] inorder, int[] postorder,
                           int postorderLeft, int postorderRight,
                           int inorderLeft, int inorderRight,
                           Map<Integer, Integer> inorderMap) {
    if (postorderLeft > postorderRight || inorderLeft > inorderRight) {
        return null;
    }
    // 获取根节点（后序遍历的最后一个元素）
    int rootVal = postorder[postorderRight];
    // 获取根节点在中序遍历的位置
    int rootIndex = inorderMap.get(rootVal);
    // 左子树的个数
    int leftSize = rootIndex - inorderLeft;
    // 根节点
    TreeNode root = new TreeNode();
    root.val = rootVal;
    // 左子树
    // 后序 left, left+leftSize-1   对应：   中序 left, rootIndex-1
    root.left = buildTree(inorder, postorder, postorderLeft, postorderLeft +leftSize-1,
            inorderLeft, rootIndex-1, inorderMap);
    // 右子树
    // 后续 left+leftSize, right-1    对应 中序 rootIndex+1, right
    root.right = buildTree(inorder, postorder, postorderLeft +leftSize, postorderRight-1,
            rootIndex+1, inorderRight, inorderMap);
    return root;
}
```

效果：

```
Runtime: 1 ms, faster than 96.64% of Java online submissions for Construct Binary Tree from Inorder and Postorder Traversal.
Memory Usage: 39.2 MB, less than 47.18% of Java online submissions for Construct Binary Tree from Inorder and Postorder Traversal.
```


ps，后来发现这个 inorder 数组可以简化掉，因为索引完全通过 inorderMap 就可以获取到。

```java

```

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

https://leetcode-cn.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/solution/cong-qian-xu-yu-zhong-xu-bian-li-xu-lie-gou-zao-9/

https://leetcode-cn.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/

* any list
{:toc}