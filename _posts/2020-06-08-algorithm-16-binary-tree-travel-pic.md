---
layout: post
title: 面试算法：二叉树的前序/中序/后序非递归遍历图解
date:  2020-1-23 10:09:32 +0800 
categories: [Data-Struct]
tags: [data-struct, block-chain, leetcode, sh]
published: true
---

# 要求

本文用于整理二叉树的 3 种常见遍历方式：前序遍历、中序遍历、后序遍历。

本文主要详细讲解非递归的方式，并结合图进行详细讲解。

希望每一位小伙伴可以真正的理解二叉树的遍历流程，让我们开始吧！

# 准备工作

本文主要是为了重新梳理二叉树的非递归遍历，所以基本的遍历可以参考下面的文章：

[面试算法：二叉树的前序/中序/后序/层序遍历方式汇总](https://houbb.github.io/2020/01/23/algorithm-16-binary-tree-travel)

## 节点定义

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

## 测试

感觉二叉树的测试一直是个比较麻烦的问题。

为了简单，我们这里复用一下排序列表转二叉搜索树的方法，把链表节点调整为整数列表。

### 二叉树构造

```java
public TreeNode sortedListToBST(List<Integer> list) {
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
    int rootIndex = (start + end)/2;
    int rootVal = list.get(rootIndex);
    TreeNode treeNode = new TreeNode(rootVal);
    // left
    treeNode.left = generateTree(list, start, rootIndex-1);
    // right
    treeNode.right = generateTree(list, rootIndex+1, end);
    return treeNode;
}
```

### 效果

```java
List<Integer> list = Arrays.asList(1,2,3,4,5,6,7);
TreeNode treeNode = tree.sortedListToBST(list);
```

以上面的输入为例，构建的结果如下。

- 图1 二叉搜索树

![输入图片说明](https://images.gitee.com/uploads/images/2021/0328/101244_5f1a777e_508704.png "未命名绘图.png")

完整代码地址：

> [leetcode](https://github.com/houbb/leetcode/blob/master/src/main/java/com/github/houbb/leetcode/medium/F100T200/ConvertSortedListToBinarySearchTreeForTest.java)

# 前序遍历

数据=》左=》右

图 1 的前序遍历结果如下：

```
[4, 2, 1, 3, 6, 5, 7]
```

## java 实现

```java
/**
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

### 遍历分析

图 1 中的二叉搜索树遍历结果如下：

```
[4, 2, 1, 3, 6, 5, 7]
```

## 非递归实现

### 思路

前序遍历的访问顺序：节点=》left=》right

使用 stack，因为是先进后出，所以入栈的顺序应该是：

（1）首先访问当前节点 node 的值

（2）node.right 右节点入栈，先进后出。

（3）继续访问 node.left 左节点，如果 left 为空 && 右节点栈不为空，则弹出右节点。

### java 实现

```java
public List<Integer> preorderTraversal(TreeNode root){
    List<Integer> lists = new ArrayList<>();
    if(root == null){
        return lists;
    }
    Stack<TreeNode> stack = new Stack<>();
    //根节点先入栈
    stack.push(root);
    TreeNode current = null;
    while(!stack.isEmpty()){
        current = stack.pop();
        lists.add(current.val);

        //这里注意，要先压入右子结点，再压入左节点。因为栈是先进后出
        if(current.right != null){
            stack.push(current.right);
        }
        if(current.left != null){
            stack.push(current.left);
        }
    }
    return lists;
}
```

### 栈信息

我们可以加一点 debug 日志，把访问的节点和 stack 的内容输出出来。

```java
public List<Integer> preorderTraversal(TreeNode root){
    List<Integer> lists = new ArrayList<>();
    if(root == null){
        return lists;
    }
    Stack<TreeNode> stack = new Stack<>();
    //根节点先入栈
    stack.push(root);
    System.out.println("【根节点】root.value="+root.val+" 入栈，STACK " + root);
    TreeNode current = null;
    while(!stack.isEmpty()){
        current = stack.pop();
        lists.add(current.val);
        System.out.println("\n【出栈】"+current.val+"，STACK " + lists);
        System.out.println("【添加】添加 "+current.val+" 到 LIST" + lists);

        //这里注意，要先压入右子结点，再压入左节点。因为栈是先进后出
        if(current.right != null){
            stack.push(current.right);
            System.out.println("【右节点】入栈 "+current.right.val+" 到 STACK " + stack);
        }
        if(current.left != null){
            stack.push(current.left);
            System.out.println("【左节点】入栈 "+current.left.val+" 到 STACK " + stack);
        }
    }
    return lists;
}
```

重新执行以下，日志如下：

```
【根节点】root.value=4 入栈，STACK (4: (2: (1: null,null),(3: null,null)),(6: (5: null,null),(7: null,null)))

【出栈】4，STACK []
【添加】添加 4 到 LIST[4]
【右节点】入栈 6 到 STACK [(6: (5: null,null),(7: null,null))]
【左节点】入栈 2 到 STACK [(6: (5: null,null),(7: null,null)), (2: (1: null,null),(3: null,null))]

【出栈】2，STACK [4]
【添加】添加 2 到 LIST[4, 2]
【右节点】入栈 3 到 STACK [(6: (5: null,null),(7: null,null)), (3: null,null)]
【左节点】入栈 1 到 STACK [(6: (5: null,null),(7: null,null)), (3: null,null), (1: null,null)]

【出栈】1，STACK [4, 2]
【添加】添加 1 到 LIST[4, 2, 1]

【出栈】3，STACK [4, 2, 1]
【添加】添加 3 到 LIST[4, 2, 1, 3]

【出栈】6，STACK [4, 2, 1, 3]
【添加】添加 6 到 LIST[4, 2, 1, 3, 6]
【右节点】入栈 7 到 STACK [(7: null,null)]
【左节点】入栈 5 到 STACK [(7: null,null), (5: null,null)]

【出栈】5，STACK [4, 2, 1, 3, 6]
【添加】添加 5 到 LIST[4, 2, 1, 3, 6, 5]

【出栈】7，STACK [4, 2, 1, 3, 6, 5]
【添加】添加 7 到 LIST[4, 2, 1, 3, 6, 5, 7]
[4, 2, 1, 3, 6, 5, 7]
```

大家可以和下图对照下，老马这里把指向子节点的箭头移除，使用曲线标识访问的顺序（见曲线数字编号）。

- 图2 前序遍历流程

![输入图片说明](https://images.gitee.com/uploads/images/2021/0328/102454_eb42ce30_508704.png "前序遍历-图解.png")

# 中序遍历

遍历，是以第一个被访问的元素来定的。

左子树 => 根 => 右子树。

图 1 的中序遍历结果如下：

```
[1, 2, 3, 4, 5, 6, 7]
```

ps: 这里也可以发现，二叉搜索树的中序遍历，就是一个排序好的链表，此处不做展开。

## 递归实现

递归的实现非常简洁，直接按照 left root right 的顺序访问即可。

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

### 思路

递归的顺序：left root right

那么，如果借助 stack 的话，流程应该如下：

（1）当前节点 current 入栈，一直遍历 current.left，如果不为空，全部入栈。直到最左边左子树。(NULL)

（2）弹出栈内信息，访问节点。一开始是最左子树（子节点都是 NULL 的时候），然后是根节点。

（3）访问根节点的 root.right 右节点。

前序访问时，栈中保存的元素是右子树还没有被访问到的节点的地址，而中序访问时栈中保存的元素是**节点自身和它的右子树都没有被访问到的节点地址**。

### java 实现

```java
public List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> list = new ArrayList<>();
    Stack<TreeNode> stack = new Stack<>();
    TreeNode current = root;
    while(current !=null || !stack.empty()){
        // 寻找到最左边的节点
        while(current !=null){
            stack.add(current);
            current = current.left;
        }

        // pop 处理
        current = stack.pop();
        list.add(current.val);
        current = current.right;
    }
    return list;
}
```

### 栈信息

同理，为了便于大家理解，我们加一点日志。

```java
public List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> list = new ArrayList<>();
    Stack<TreeNode> stack = new Stack<>();
    TreeNode current = root;

    while(current !=null || !stack.empty()){
        // 寻找到最左边的节点
        while(current !=null){
            stack.add(current);
            System.out.println("【入栈】当前节点" + current +", STACK: " + stack);
            System.out.println("【左子树】继续访问 " +current.val +" 左子树: " + current.left);
            current = current.left;
        }

        // pop 处理
        current = stack.pop();
        System.out.println("【出栈】当前节点: " + current +", STACK: " + stack);
        list.add(current.val);
        System.out.println("【添加】添加节点" + current.val +", LIST: " + list);
        System.out.println("【右子树】访问节点" + current.val +" 右子树" + current.right + "\n");
        current = current.right;
    }
    return list;
}
```

日志信息如下：

```
【入栈】当前节点(4: (2: (1: null,null),(3: null,null)),(6: (5: null,null),(7: null,null))), STACK: [(4: (2: (1: null,null),(3: null,null)),(6: (5: null,null),(7: null,null)))]
【左子树】继续访问 4 左子树: (2: (1: null,null),(3: null,null))
【入栈】当前节点(2: (1: null,null),(3: null,null)), STACK: [(4: (2: (1: null,null),(3: null,null)),(6: (5: null,null),(7: null,null))), (2: (1: null,null),(3: null,null))]
【左子树】继续访问 2 左子树: (1: null,null)
【入栈】当前节点(1: null,null), STACK: [(4: (2: (1: null,null),(3: null,null)),(6: (5: null,null),(7: null,null))), (2: (1: null,null),(3: null,null)), (1: null,null)]
【左子树】继续访问 1 左子树: null
【出栈】当前节点: (1: null,null), STACK: [(4: (2: (1: null,null),(3: null,null)),(6: (5: null,null),(7: null,null))), (2: (1: null,null),(3: null,null))]
【添加】添加节点1, LIST: [1]
【右子树】访问节点1 右子树null

【出栈】当前节点: (2: (1: null,null),(3: null,null)), STACK: [(4: (2: (1: null,null),(3: null,null)),(6: (5: null,null),(7: null,null)))]
【添加】添加节点2, LIST: [1, 2]
【右子树】访问节点2 右子树(3: null,null)

【入栈】当前节点(3: null,null), STACK: [(4: (2: (1: null,null),(3: null,null)),(6: (5: null,null),(7: null,null))), (3: null,null)]
【左子树】继续访问 3 左子树: null
【出栈】当前节点: (3: null,null), STACK: [(4: (2: (1: null,null),(3: null,null)),(6: (5: null,null),(7: null,null)))]
【添加】添加节点3, LIST: [1, 2, 3]
【右子树】访问节点3 右子树null

【出栈】当前节点: (4: (2: (1: null,null),(3: null,null)),(6: (5: null,null),(7: null,null))), STACK: []
【添加】添加节点4, LIST: [1, 2, 3, 4]
【右子树】访问节点4 右子树(6: (5: null,null),(7: null,null))

【入栈】当前节点(6: (5: null,null),(7: null,null)), STACK: [(6: (5: null,null),(7: null,null))]
【左子树】继续访问 6 左子树: (5: null,null)
【入栈】当前节点(5: null,null), STACK: [(6: (5: null,null),(7: null,null)), (5: null,null)]
【左子树】继续访问 5 左子树: null
【出栈】当前节点: (5: null,null), STACK: [(6: (5: null,null),(7: null,null))]
【添加】添加节点5, LIST: [1, 2, 3, 4, 5]
【右子树】访问节点5 右子树null

【出栈】当前节点: (6: (5: null,null),(7: null,null)), STACK: []
【添加】添加节点6, LIST: [1, 2, 3, 4, 5, 6]
【右子树】访问节点6 右子树(7: null,null)

【入栈】当前节点(7: null,null), STACK: [(7: null,null)]
【左子树】继续访问 7 左子树: null
【出栈】当前节点: (7: null,null), STACK: []
【添加】添加节点7, LIST: [1, 2, 3, 4, 5, 6, 7]
【右子树】访问节点7 右子树null
```

大家可以和下图对照下，老马这里把指向子节点的箭头移除，使用曲线标识访问的顺序（见曲线数字编号）。

- 图3 中序遍历流程

![输入图片说明](https://images.gitee.com/uploads/images/2021/0328/112405_d205ffd2_508704.png "中序遍历流程.png")

# 后序遍历

## 流程

左=》右=》数据

图 1 的后续遍历结果如下：

[1, 3, 2, 5, 7, 6, 4]

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

### 思路

①先序遍历顺序：根节点-左孩子-右孩子

②后序遍历顺序：左孩子-右孩子-根节点

③后序遍历倒过来：根节点-右孩子-左孩子

①和③对比发现，访问顺序只有左孩子和右孩子颠倒了一下

思路：

第一步，将二叉树按照先序非递归算法进行遍历，

注意在入栈的时候左右孩子入栈的顺序，先左后右。

第二步，将遍历得到的结果进行倒置。 

这个思路实际上还是很巧妙的，值得学习。

### 前序遍历回顾

很多东西都是看着简单，写起来容易出错。

老马把前序遍历的实现放在这里，省的大家往前翻。

```java
public List<Integer> preorderTraversal(TreeNode root){
    List<Integer> lists = new ArrayList<>();
    if(root == null){
        return lists;
    }
    Stack<TreeNode> stack = new Stack<>();
    //根节点先入栈
    stack.push(root);
    TreeNode current = null;
    while(!stack.isEmpty()){
        current = stack.pop();
        lists.add(current.val);

        //这里注意，要先压入右子结点，再压入左节点。因为栈是先进后出
        if(current.right != null){
            stack.push(current.right);
        }
        if(current.left != null){
            stack.push(current.left);
        }
    }
    return lists;
}
```

接下来，就有 2 个小问题需要思考：

（1）入栈的时候，如何调整左右节点的顺序？

直接在左右子树入栈的时候，调整一下顺序即可。

（2）如何反转最后的结果

结果反转，最简单的就是从后向前重新遍历列表。

当然，也可以每次添加元素的时候，添加到链表的头部。这里我们使用这一种。

### java 实现

所以，实现起来也并不难：

```java
public List<Integer> postorderTraversal(TreeNode root){
    LinkedList<Integer> lists = new LinkedList<>();
    if(root == null){
        return lists;
    }
    Stack<TreeNode> stack = new Stack<>();
    stack.push(root);
    TreeNode current = null;
    while(!stack.isEmpty()){
        current = stack.pop();
        lists.addFirst(current.val);

        if(current.left != null){
            stack.push(current.left);
        }
        if(current.right != null){
            stack.push(current.right);
        }
    }
    return lists;
}
```

### 栈信息

我们可以加一点 debug 日志，把访问的节点和 stack 的内容输出出来。

```java
public List<Integer> postorderTraversal(TreeNode root){
    LinkedList<Integer> lists = new LinkedList<>();
    if(root == null){
        return lists;
    }

    Stack<TreeNode> stack = new Stack<>();
    stack.push(root);
    System.out.println("【根节点】root.value="+root.val+" 入栈，STACK " + root);
    TreeNode current = null;
    while(!stack.isEmpty()){
        current = stack.pop();
        lists.addFirst(current.val);
        System.out.println("\n【出栈】"+current.val+"，STACK " + lists);
        System.out.println("【添加】添加 "+current.val+" 到 LIST" + lists);

        if(current.left != null){
            stack.push(current.left);
            System.out.println("【左节点】入栈 "+current.left.val+" 到 STACK " + stack);
        }
        if(current.right != null){
            stack.push(current.right);
            System.out.println("【右节点】入栈 "+current.right.val+" 到 STACK " + stack);
        }
    }
    return lists;
}
```

日志如下：

```
【根节点】root.value=4 入栈，STACK (4: (2: (1: null,null),(3: null,null)),(6: (5: null,null),(7: null,null)))

【出栈】4，STACK [4]
【添加】添加 4 到 LIST[4]
【左节点】入栈 2 到 STACK [(2: (1: null,null),(3: null,null))]
【右节点】入栈 6 到 STACK [(2: (1: null,null),(3: null,null)), (6: (5: null,null),(7: null,null))]

【出栈】6，STACK [6, 4]
【添加】添加 6 到 LIST[6, 4]
【左节点】入栈 5 到 STACK [(2: (1: null,null),(3: null,null)), (5: null,null)]
【右节点】入栈 7 到 STACK [(2: (1: null,null),(3: null,null)), (5: null,null), (7: null,null)]

【出栈】7，STACK [7, 6, 4]
【添加】添加 7 到 LIST[7, 6, 4]

【出栈】5，STACK [5, 7, 6, 4]
【添加】添加 5 到 LIST[5, 7, 6, 4]

【出栈】2，STACK [2, 5, 7, 6, 4]
【添加】添加 2 到 LIST[2, 5, 7, 6, 4]
【左节点】入栈 1 到 STACK [(1: null,null)]
【右节点】入栈 3 到 STACK [(1: null,null), (3: null,null)]

【出栈】3，STACK [3, 2, 5, 7, 6, 4]
【添加】添加 3 到 LIST[3, 2, 5, 7, 6, 4]

【出栈】1，STACK [1, 3, 2, 5, 7, 6, 4]
【添加】添加 1 到 LIST[1, 3, 2, 5, 7, 6, 4]
```

为了便于大家理解，老马整理了一下流程图，如下：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0328/121532_c4cf5cf9_508704.png "后续遍历流程.png")

ps: 当然这个顺序得到的链表是反序的，做一下 reverse 即可。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[图解二叉树非递归版的中序遍历算法](https://blog.csdn.net/daigualu/article/details/78352491)

[二叉树的前中后和层序遍历详细图解（递归和非递归写法）](https://blog.csdn.net/Monster_ii/article/details/82115772)

https://blog.csdn.net/Monster_ii/article/details/82115772

[二叉树的后序遍历(非递归算法)](https://blog.csdn.net/qq_37677421/article/details/82633785)

[二叉树的前中后层序遍历（递归、非递归Java实现）](https://blog.csdn.net/qq_43584847/article/details/103762978)

* any list
{:toc}