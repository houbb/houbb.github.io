---
layout: post
title:  Tree-00-概览
date:  2020-10-17 16:15:55 +0800
categories: [Data-Struct]
tags: [data-struct, tree, overview, sf]
published: true
---

# 目录

排序

二分查找法

Tree

二叉查找树

AVL Tree

红黑树

B Tree

B+ Tree

--------------------------------------------------------------------------------------

[Tree-00-概览](https://houbb.github.io/2020/10/17/data-struct-tree-00-overview)

[Tree-01-二叉树 Binary Tree](https://houbb.github.io/2020/10/17/data-struct-tree-01-binary-tree)

[Tree-02-java 实现 BST 二叉查询树详解](https://houbb.github.io/2020/10/17/data-struct-tree-02-binary-search-tree)

[Tree-03-图解 AVL 自平衡二叉查找树及 java 实现](https://houbb.github.io/2020/10/17/data-struct-tree-03-avl-tree)

[Tree-04-图解红黑树 Red Black Tree 及 java 实现](https://houbb.github.io/2020/10/17/data-struct-tree-04-red-black-tree)

[Tree-05-伸展树 Splay Tree 及 java 实现](https://houbb.github.io/2020/10/17/data-struct-tree-05-spaly-tree)

[Tree-06- B 树之 2-3 Tree](https://houbb.github.io/2020/10/17/data-struct-tree-06-2-3-tree)

[Tree-08-多路查找树 BTree 及 java 实现](https://houbb.github.io/2020/10/17/data-struct-tree-08-b-tree)

[Tree-09-多路查找树 B+ 树 及 java 实现](https://houbb.github.io/2020/10/17/data-struct-tree-09-bplus-tree)

[Tree-10-多路查找树 B* 树 及 java 实现](https://houbb.github.io/2020/10/17/data-struct-tree-10-bstar-tree)

[Tree-11-mysql index 数据库索引](https://houbb.github.io/2020/10/17/data-struct-tree-11-database-index)

# 什么是树

树（Tree）是由多个节点（Node）的集合组成，每个节点又有多个与其关联的子节点（Child Node）。

子节点就是直接处于节点之下的节点，而父节点（Parent Node）则位于节点直接关联的上方。

树的根（Root）指的是一个没有父节点的单独的节点。

所有的树都呈现了一些共有的性质：

- 只有一个根节点；

- 除了根节点，所有节点都有且只有一个父节点；

- 无环。将任意一个节点作为起始节点，都不存在任何回到该起始节点的路径。（正是前两个性质保证了无环的成立。）

# 常用概念

根（Root）：树中最顶端的节点，根没有父节点。

子节点（Child）：节点所拥有子树的根节点称为该节点的子节点。

父节点（Parent）：如果节点拥有子节点，则该节点为子节点的父节点。

兄弟节点（Sibling）：与节点拥有相同父节点的节点。

子孙节点（Descendant）：节点向下路径上可达的节点。

叶节点（Leaf）：没有子节点的节点。

内节点（Internal Node）：至少有一个子节点的节点。

度（Degree）：节点拥有子树的数量。

边（Edge）：两个节点中间的链接。

路径（Path）：从节点到子孙节点过程中的边和节点所组成的序列。

层级（Level）：根为 Level 0 层，根的子节点为 Level 1 层，以此类推。

高度（Height）/深度（Depth）：树中层的数量。比如只有 Level 0,Level 1,Level 2 则高度为 3。

# 类别

## 二叉查找树（Binary Search Tree）

二叉查找树，笛卡尔树，T 树

##  自平衡二叉查找树（Self-balancing Binary Search Tree） 

AA 树，

AVL 树，

红黑树（Red-Black Tree），

伸展树（Splay Tree）

## B 树（B-Tree）

2-3 树，
 
2-3-4 树，

B 树，

B+ 树，

B* 树

## 字典树（Trie-Tree）

后缀树，

基数树，

三叉查找树，

快速前缀树 

## 空间数据分割树（Spatial Data Partitioning Tree）

R 树，

R+ 树，

R* 树，

线段树，

优先 R 树

# 小结

# 参考资料

http://cslibrary.stanford.edu/110/BinaryTrees.html

https://www.javatpoint.com/binary-tree

https://www.javatpoint.com/tree

[漫画：什么是红黑树？（完整版）](https://zhuanlan.zhihu.com/p/143396578)

[人人都是 DBA（VII）B 树和 B+ 树](https://www.cnblogs.com/gaochundong/p/btree_and_bplustree.html)

* any list
{:toc}

