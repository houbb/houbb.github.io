---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC199. 二叉树的右视图 binary-tree-right-side-view
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


# chat

https://leetcode.cn/studyplan/top-100-liked/


# LC230. 二叉搜索树中第 K 小的元素

给定一个二叉树的 根节点 root，想象自己站在它的右侧，按照从顶部到底部的顺序，返回从右侧所能看到的节点值。

示例 1：

输入：root = [1,2,3,null,5,null,4]

输出：[1,3,4]

解释：

![1](https://assets.leetcode.com/uploads/2024/11/24/tmpd5jn43fs-1.png)

示例 2：


输入：root = [1,2,3,4,null,null,null,5]

输出：[1,3,4,5]

解释：

![2](https://assets.leetcode.com/uploads/2024/11/24/tmpkpe40xeh-1.png)

示例 3：

输入：root = [1,null,3]

输出：[1,3]

示例 4：

输入：root = []

输出：[]

 

提示:

二叉树的节点个数的范围是 [0,100]
-100 <= Node.val <= 100 

# 理解题意

这个一看就是层序遍历，然后取每一层的最后一个元素即可。



# v1-递归

## 思路

传入 level

1) 终止条件 node == null

2) 初始化条件 level==list.size，初始化列表

3）添加当前 node.val

4) 递归处理左右

右视图就是取每一行的最后一个元素，同理左视图就是第一个。

## 实现

```java
public List<Integer> rightSideView(TreeNode root) {
        List<List<Integer>> levelList = new ArrayList<>();
        int level = 0;
        dfs(root, level, levelList);

        // 最后一个值
        List<Integer> resultList = new ArrayList<>();
        for(List<Integer> item : levelList) {
            resultList.add(item.get(item.size()-1));
        }
        return resultList;
    }

    private void dfs(TreeNode root, int level, List<List<Integer>> levelList) {
        if(root == null) {
            return;
        }
        if(level == levelList.size()) {
            levelList.add(new ArrayList());
        }

        levelList.get(level).add(root.val);

        // dfs
        dfs(root.left, level+1, levelList);
        dfs(root.right, level+1, levelList);
    }
```

## 效果

1ms 击败 73.98%

## 反思

DFS 可以，我们自然也可以写一个 BFS 的版本。

# v2-BFS

## 思路

类似的，我们可以借助 queue 实现 BFS 版本

这个用 bfs 应该更舒服一些。

## 实现

```java
    public List<Integer> rightSideView(TreeNode root) {
        if(root == null) {
            return new ArrayList<>();
        }
        
        List<List<Integer>> levelList = new ArrayList<>();
        int level = 0;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            // 当前层全部出队列
            int size = queue.size();
            List<Integer> tempList = new ArrayList<>();
            for(int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                tempList.add(node.val);

                // 左右子树入队列
                if(node.left != null) {
                    queue.offer(node.left);
                }
                if(node.right != null) {
                    queue.offer(node.right);
                }
            }

            level++;
            levelList.add(tempList);
        }

        // 最后一个值
        List<Integer> resultList = new ArrayList<>();
        for(List<Integer> item : levelList) {
            resultList.add(item.get(item.size()-1));
        }
        return resultList;
    }
```


## 效果

1ms 击败 73.98%

## 反思

这个最核心的还是 LC102，学会层序遍历，这个自然简单。

# 在线可视化

> [二叉树遍历](https://houbb.github.io/leetcode-visual/binary-tree-travel.html)

* any list
{:toc} 