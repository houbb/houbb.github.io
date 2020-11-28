---
layout: post
title:  Tree-02-java 实现 BST 二叉查询树详解
date:  2020-10-17 16:15:55 +0800
categories: [Data-Struct]
tags: [data-struct, tree, sf]
published: true
---


# 回顾

前面我们学习了 [java 如何实现 binary search 二分查找法？](https://www.jianshu.com/u/f151b42ebf74)。

那么，有没有一种数据结构，可以让我们更好的实现二分查找呢？

有的，那就是我们今天的二叉查询树。

让我们从二叉树开始，一起完成这次查询的学习之旅吧。

# 二叉树（Binary Tree）

## 概念

顾名思义，就是一个节点分出两个节点，称其为左右子节点；每个子节点又可以分出两个子节点，这样递归分叉，其形状很像一颗倒着的树。

二叉树限制了每个节点最多有两个子节点，没有子节点的节点称为叶子。

## 例子

如下一个二叉树：

```
  A simple binary tree
       A ---------> A is root node
      / \
     /   \
    B     C
   /     / \
  /     /   \
  D     E    F ---> leaves: D, E, F

      (1)      ---> Height: 3
```

其中节点B只有一个子节点D；D, E, F没有子节点，被称为叶子。

对于节点C来说，其分出两子节点，所以C的出度为2；同理，C有且只有一个父节点，所以其入度为1。

出度、入度的概念来源于图（Graph，一种更加高级复杂的数据结构），当然，也可以应用于二叉树（二叉树或者说树形数据结构也是一类特殊的图）。显然，二叉树的根节点入度为0，叶子节点出度为0。

## 分类

更加细化的分类，如下：

完全二叉树：除了最高层以外，其余层节点个数都达到最大值，并且最高层节点都优先集中在最左边。

满二叉树：除了最高层有叶子节点，其余层无叶子，并且非叶子节点都有2个子节点。

```
 Complete Binary Tree (CBT) and Full Binary Tree (FBT)
       A              A                A
      / \            / \              / \
     /   \          /   \            /   \
    B     C        B     C          B     C
   / \            / \   / \              / \
  /   \          /   \ /   \            /   \
  D    E        D    E F    G          D     E

     (2)             (3)               (4)
     CBT             FBT             not CBT
```

其中(2)就是一个完全二叉树；(3)是一个满二叉树；

而(1)和(4)不属于这两者，（虽然(4)是(2)的一种镜像二叉树）。

这里仅对二叉树做一个简单的介绍，让大家对于二叉树有一个大概的印象。二叉树本身的特性还是很多的，有机会以后单开一篇进行讲解。

# 二叉搜索树（Binary Search Tree）

## 概念

二叉查找树（BST：Binary Search Tree）是一种特殊的二叉树，它改善了二叉树节点查找的效率。

二叉查找树有以下性质：

对于任意一个节点 n，

1. 其左子树（left subtree）下的每个后代节点（descendant node）的值都小于节点 n 的值；

2. 其右子树（right subtree）下的每个后代节点的值都大于节点 n 的值。

所谓节点 n 的子树，可以将其看作是以节点 n 为根节点的树。子树的所有节点都是节点 n 的后代，而子树的根则是节点 n 本身。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1124/212211_ce2a2778_508704.png "屏幕截图.png")

### 例子

下图中展示了两个二叉树。

二叉树（b）是一个二叉查找树（BST），它符合二叉查找树的性质规定。

而二叉树（a），则不是二叉查找树。因为节点 10 的右孩子节点 8 小于节点 10，但却出现在节点 10 的右子树中。同样，节点 8 的右孩子节点 4 小于节点 8，但出现在了它的右子树中。无论是在哪个位置，只要不符合二叉查找树的性质规定，就不是二叉查找树。例如，节点 9 的左子树只能包含值小于节点 9 的节点，也就是 8 和 4。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1124/212246_5e99c881_508704.png "屏幕截图.png")

## 查找算法

查找算法过程如下：

假设我们要查找节点 n，从 BST 的根节点开始。

算法不断地比较节点值的大小直到找到该节点，或者判定不存在。每一步我们都要处理两个节点：树中的一个节点，称为节点 c，和要查找的节点 n，然后并比较 c 和 n 的值。开始时，节点 c 为 BST 的根节点。然后执行以下步骤：

1. 如果 c 值为空，则 n 不在 BST 中；

2. 比较 c 和 n 的值；

3. 如果值相同，则找到了指定节点 n；

4. 如果 n 的值小于 c，那么如果 n 存在，必然在 c 的左子树中。回到第 1 步，将 c 的左孩子作为 c；

5. 如果 n 的值大于 c，那么如果 n 存在，必然在 c 的右子树中。回到第 1 步，将 c 的右孩子作为 c；

通过 BST 查找节点，理想情况下我们需要检查的节点数可以减半。

### 复杂度

如下图中的 BST 树，包含了 15 个节点。从根节点开始执行查找算法，第一次比较决定我们是移向左子树还是右子树。

对于任意一种情况，一旦执行这一步，我们需要访问的节点数就减少了一半，从 15 降到了 7。

同样，下一步访问的节点也减少了一半，从 7 降到了 3，以此类推。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1124/212440_f8874a58_508704.png "屏幕截图.png")

根据这一特点，查找算法的时间复杂度应该是 O(log­2n)，简写为 O(lg n)。

可知，log­2n = y，相当于 2^y = n。

即，如果节点数量增加 n，查找时间只缓慢地增加到 log­2n。下图中显示了 O(log­2n) 和线性增长 O(n) 的增长率之间的区别。时间复杂度为 O(log­2n) 的算法运行时间为下面那条线。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1124/212516_1d935c8e_508704.png "屏幕截图.png")

从上图可以看出，O(log­2n) 曲线几乎是水平的，随着 n 值的增加，曲线增长十分缓慢。

举例来说，查找一个具有 1000 个元素的数组，需要查询 1000 个元素，而查找一个具有 1000 个元素的 BST 树，仅需查询不到10 个节点（log21024 = 10）。

### 最差情况

而实际上，对于 BST 查找算法来说，其十分依赖于树中节点的拓扑结构，也就是节点间的布局关系。

下图描绘了一个节点插入顺序为 20, 50, 90, 150, 175, 200 的 BST 树。

这些节点是按照递升顺序被插入的，结果就是这棵树没有广度（Breadth）可言。

也就是说，它的拓扑结构其实就是将节点排布在一条线上，而不是以扇形结构散开，所以查找时间也为 O(n)。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1124/212552_c118fa2c_508704.png "屏幕截图.png")

当 BST 树中的节点以扇形结构散开时，对它的插入、删除和查找操作最优的情况下可以达到亚线性的运行时间 O(log2n)。

因为当在 BST 中查找一个节点时，每一步比较操作后都会将节点的数量减少一半。

尽管如此，如果拓扑结构像上图中的样子时，运行时间就会退减到线性时间 O(n)。

因为每一步比较操作后还是需要逐个比较其余的节点。也就是说，在这种情况下，在 BST 中查找节点与在数组（Array）中查找就基本类似了。

因此，BST 算法查找时间依赖于树的拓扑结构。

**最佳情况是 O(log­2n)，而最坏情况是 O(n)。**

ps: 针对这个问题，我们会在下一节 AVL 树给出解决方案。

## 插入节点

我们不仅需要了解如何在二叉查找树中查找一个节点，还需要知道如何在二叉查找树中插入和删除一个节点。

当向树中插入一个新的节点时，该节点将总是作为叶子节点。所以，最困难的地方就是如何找到该节点的父节点。类似于查找算法中的描述，我们将这个新的节点称为节点 n，而遍历的当前节点称为节点 c。开始时，节点 c 为 BST 的根节点。

则定位节点 n 父节点的步骤如下：

1. 如果节点 c 为空，则节点 c 的父节点将作为节点 n 的父节点。如果节点 n 的值小于该父节点的值，则节点 n 将作为该父节点的左孩子；否则节点 n 将作为该父节点的右孩子。

2. 比较节点 c 与节点 n 的值。

3. 如果节点 c 的值与节点 n 的值相等，则说明用户在试图插入一个重复的节点。解决办法可以是直接丢弃节点 n，或者可以抛出异常。

4. 如果节点 n 的值小于节点 c 的值，则说明节点 n 一定是在节点 c 的左子树中。则将父节点设置为节点 c，并将节点 c 设置为节点 c 的左孩子，然后返回至第 1 步。

5. 如果节点 n 的值大于节点 c 的值，则说明节点 n 一定是在节点 c 的右子树中。则将父节点设置为节点 c，并将节点 c 设置为节点 c 的右孩子，然后返回至第 1 步。

当合适的节点找到时，该算法结束。从而使新节点被放入 BST 中成为某一父节点合适的孩子节点。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1124/212718_1481dfcd_508704.png "屏幕截图.png")

BST 的插入算法的复杂度与查找算法的复杂度是一样的：

**最佳情况是 O(log­2n)，而最坏情况是 O(n)。**

因为它们对节点的查找定位策略是相同的。

## 删除节点

从 BST 中删除节点比插入节点难度更大。因为删除一个非叶子节点，就必须选择其他节点来填补因删除节点所造成的树的断裂。如果不选择节点来填补这个断裂，那么就违背了 BST 的性质要求。

删除节点算法的第一步是定位要被删除的节点，这可以使用前面介绍的查找算法，因此运行时间为 O(log­2n)。接着应该选择合适的节点来代替删除节点的位置，它共有三种情况需要考虑。

情况 1：如果删除的节点没有右孩子，那么就选择它的左孩子来代替原来的节点。二叉查找树的性质保证了被删除节点的左子树必然符合二叉查找树的性质。因此左子树的值要么都大于，要么都小于被删除节点的父节点的值，这取决于被删除节点是左孩子还是右孩子。因此用被删除节点的左子树来替代被删除节点，是完全符合二叉搜索树的性质的。

情况 2：如果被删除节点的右孩子没有左孩子，那么这个右孩子被用来替换被删除节点。因为被删除节点的右孩子都大于被删除节点左子树的所有节点，同时也大于或小于被删除节点的父节点，这同样取决于被删除节点是左孩子还是右孩子。因此，用右孩子来替换被删除节点，符合二叉查找树的性质。

情况 3：如果被删除节点的右孩子有左孩子，就需要用被删除节点右孩子的左子树中的最下面的节点来替换它，就是说，我们用被删除节点的右子树中最小值的节点来替换。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1124/212923_f15acb61_508704.png "屏幕截图.png")

我们知道，在 BST 中，最小值的节点总是在最左边，最大值的节点总是在最右边。因此替换被删除节点右子树中最小的一个节点，就保证了该节点一定大于被删除节点左子树的所有节点。同时，也保证它替代了被删除节点的位置后，它的右子树的所有节点值都大于它。因此这种选择策略符合二叉查找树的性质。

和查找、插入算法类似，删除算法的运行时间也与 BST 的拓扑结构有关，最佳情况是 O(log­2n)，而最坏情况是 O(n)。

## 遍历节点

对于线性的连续的数组来说，遍历数组采用的是单向的迭代法。从第一个元素开始，依次向后迭代每个元素。

而 BST 则有三种常用的遍历方式：

- 前序遍历（Perorder traversal）

- 中序遍历（Inorder traversal）

- 后序遍历（Postorder traversal）

当然，这三种遍历方式的工作原理是类似的。它们都是从根节点开始，然后访问其子节点。

区别在于遍历时，访问节点本身和其子节点的顺序不同。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1124/213059_ef5b4ba0_508704.png "屏幕截图.png")

### 前序遍历（Perorder traversal）

前序遍历从当前节点（节点 c）开始访问，然后访问其左孩子，再访问右孩子。开始时，节点 c 为 BST 的根节点。

算法如下：

- 访问节点 c；

- 对节点 c 的左孩子重复第 1 步；

- 对节点 c 的右孩子重复第 1 步；

则上图中树的遍历结果为：90, 50, 20, 5, 25, 75, 66, 80, 150, 95, 92, 111, 175, 166, 200。

### 中序遍历（Inorder traversal）

中序遍历是从当前节点（节点 c）的左孩子开始访问，再访问当前节点，最后是其右节点。开始时，节点 c 为 BST 的根节点。

算法如下：

- 访问节点 c 的左孩子；

- 对节点 c 重复第 1 步；

- 对节点 c 的右孩子重复第 1 步。

则上图中树的遍历结果为：5, 20, 25, 50, 66, 75, 80, 90, 92, 95, 111, 150, 166, 175, 200。

### 后序遍历（Postorder traversal）

后序遍历首先从当前节点（节点 c）的左孩子开始访问，然后是右孩子，最后才是当前节点本身。开始时，节点 c 为 BST 的根节点。

算法如下：

- 访问节点 c 的左孩子；

- 对节点 c 的右孩子重复第1 步；

- 对节点 c 重复第 1 步；

则上图中树的遍历结果为：5, 25, 20, 66, 80, 75, 50, 92, 111, 95, 166, 200, 175, 150, 90。

## 其他

之所以称为二叉搜索树，是因为这种二叉树能大幅度提高搜索效率。

如果一个二叉树满足：**对于任意一个节点，其值不小于左子树的任何节点，且不大于右子树的任何节点（反之亦可），则为二叉搜索树。**

如果按照中序遍历，其遍历结果是一个有序序列。因此，二叉搜索树又称为二叉排序树。不同于最大堆（或最小堆），其只要求当前节点与当前节点的左右子节点满足一定关系。

下面以非降序二叉搜索树为例。

```
Asuming each node value is not equal
 A simple binary search tree
          6                  6
         / \                / \
        /   \              /   \
       3     8            3     8
      /     / \          /     / \
     /     /   \        /     /   \
    2     7     9      2     4*    9

      (A) BST             (B) Not BST

```

其中（A）为二叉搜索树，（B）不是。因为根节点6大于右子树中的节点4。

# java 实现

老马作为一个喜欢研究底层实现的 coder，对树和图实际上有一种本能的畏惧，因为平时用的太少，学过很多次，然后每次学完就忘。

后来痛定思痛，发现没有完整的实现过一个 BST，今天就和大家一起实现一个 java 版本的 BST，加深自己对二叉查询树的理解。

### 节点定义

类似于链表等其他数据结构，我们首先定义一个 Node 节点:

```java
/**
 * 树节点
 * @author 老马啸西风
 * @since 0.0.4
 */
public class TreeNode<V extends Comparable<? super V>> {

    /**
     * 左节点
     * @since 0.0.4
     */
    private TreeNode<V> left;

    /**
     * 右节点
     * @since 0.0.4
     */
    private TreeNode<V> right;

    /**
     * 数据信息
     * @since 0.0.4
     */
    private V data;

    public TreeNode(V data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }

    // getter and setter
}
```

节点定义也比较简单，左节点，右节点，以及一个 Comparable 的元素信息。

### 接口的定义

为了便于后期拓展和维护，我们定义一套针对比较树的接口：

```java
import java.util.List;

/**
 * 树接口
 * @author 老马啸西风
 * @since 0.0.4
 */
public interface ISortTree<V extends Comparable<? super V>> {

    /**
     * 是否包含
     * @param data 元素
     * @return 是否包含
     * @since 0.0.4
     */
    boolean contains(V data);

    /**
     * 添加元素
     * @param data 元素
     * @since 0.0.4
     */
    void add(V data);

    /**
     * 删除节点
     * @param data 元素
     * @since 0.0.4
     * @return 是否删除
     */
    boolean remove(V data);

    /**
     * 返回元素的个数
     * @return 个数
     * @since 0.0.4
     */
    int getSize();

    /**
     * 是否为空
     * @return 是否为空
     * @since 0.0.5
     */
    boolean isEmpty();

    /**
     * 最大深度
     * @return 深度
     * @since 0.0.4
     */
    int getHeight();

    /**
     * 获取最小值
     * @return 最小值
     * @since 0.0.4
     */
    V getMinValue();

    /**
     * 获取最大值
     * @return 最大值
     * @since 0.0.4
     */
    V getMaxValue();

    /**
     * 中序遍历：即左-根-右遍历，对于给定的二叉树根，寻找其左子树；对于其左子树的根，再去寻找其左子树；递归遍历，直到寻找最左边的节点i，其必然为叶子，然后遍历i的父节点，再遍历i的兄弟节点。随着递归的逐渐出栈，最终完成遍历。
     * @since 0.0.4
     * @return 结果
     */
    List<V> inOrder();

    /**
     * 先序遍历：即根-左-右遍历，不再详述。
     * @since 0.0.4
     * @return 结果
     */
    List<V> preOrder();

    /**
     * 先序遍历：即根-左-右遍历，不再详述。
     * @since 0.0.4
     * @return 结果
     */
    List<V> postOrder();

    /**
     * 层级遍历
     * @return 结果
     * @since 0.0.4
     */
    List<V> levelOrder();

    /**
     * 获取所有路径列表
     * 从根节点，到叶子节点的路径
     * @return 0.0.4
     */
    List<List<V>> pathList();

    /**
     * 以树的形式打印出来元素
     *        2
     *       / \
     *      2   3
     *     /   /
     *    1   3
     *   /
     *  1
     * @since 0.0.4
     */
    void print();

}
```

这里定义了几个常见的方法，下面我们就来看一下如何实现。

## 类定义

```java
public class BinarySearchTree<V extends Comparable<? super V>> implements ISortTree<V> {

    /**
     * 根节点
     *
     * @since 0.0.4
     */
    private TreeNode<V> root;

    public BinarySearchTree() {
        this.root = null;
    }

}
```

## 基本方法

很多方法都是通过递归的方式实现的，这样可以让我们的代码变得非常简洁。

### 是否包含指定元素

```java
public boolean contains(V data) {
    return (contains(root, data));
}
/**
 * 递归查询
 *
 * @param node 节点
 * @param data 元素
 * @return 是否包含
 * @since 0.0.4
 */
private boolean contains(TreeNode<V> node, V data) {
    if (node == null) {
        return false;
    }
    if (node.getData().compareTo(data) == 0) {
        return true;
    } else if (data.compareTo(node.getData()) < 0) {
        // 小于节点，则查询左子树
        return (contains(node.getLeft(), data));
    } else {
        // 大于节点，则查询右子树
        return (contains(node.getRight(), data));
    }
}
```

### 获取元素个数

```java
@Override
public int getSize() {
    return size(root);
}

/**
 * 递归获取 size
 *
 * @param node 节点
 * @return 结果
 * @since 0.0.4
 */
private int size(TreeNode<V> node) {
    if (node == null) {
        return (0);
    }
    return (size(node.getLeft()) + 1 + size(node.getRight()));
}
```

## 4 种遍历方式

这里通过递归的方式实现，所以前中后都变得非常简洁。

### 中序遍历

中序遍历：即左-根-右遍历，对于给定的二叉树根，寻找其左子树；对于其左子树的根，再去寻找其左子树；递归遍历，直到寻找最左边的节点i，其必然为叶子，然后遍历i的父节点，再遍历i的兄弟节点。随着递归的逐渐出栈，最终完成遍历。

```java
@Override
public List<V> inOrder() {
    List<V> list = new ArrayList<>();
    inOrder(list, root);
    return list;
}

private void inOrder(List<V> list, TreeNode<V> treeNode) {
    if (treeNode == null) return;
    inOrder(list, treeNode.getLeft());
    list.add(treeNode.getData());
    inOrder(list, treeNode.getRight());
}
```

### 先序遍历

即根-左-右遍历，不再详述。

```java
@Override
public List<V> preOrder() {
    List<V> list = new ArrayList<>();
    preOrder(list, root);
    return list;
}

private void preOrder(List<V> list, TreeNode<V> treeNode) {
    if (treeNode == null) return;
    list.add(treeNode.getData());
    preOrder(list, treeNode.getLeft());
    preOrder(list, treeNode.getRight());
}
```

### 后续遍历

后序遍历：即左-右-根遍历

```java
private void preOrder(List<V> list, TreeNode<V> treeNode) {
    if (treeNode == null) return;
    list.add(treeNode.getData());
    preOrder(list, treeNode.getLeft());
    preOrder(list, treeNode.getRight());
}
@Override
public List<V> postOrder() {
    List<V> list = new ArrayList<>();
    postOrder(list, root);
    return list;
}
```

### 层级遍历

层级遍历更加符合人的直觉：

```java
@Override
public List<V> levelOrder() {
    List<V> result = new ArrayList<>();
    TreeNode<V> node = root;
    Queue<TreeNode<V>> queue = new LinkedList<>();
    queue.add(node);
    while (!queue.isEmpty()) {
        node = queue.poll();
        result.add(node.getData());
        if (node.getLeft() != null)
            queue.add(node.getLeft());
        if (node.getRight() != null)
            queue.add(node.getRight());
    }
    return result;
}
```

## 插入新元素

插入和查找有些类似，实现起来并不困难。

```java
public void add(V data) {
    root = add(root, data);
}

private TreeNode<V> add(TreeNode<V> node, V data) {
    // 如果节点为空，则插入到当前位置
    if (node == null) {
        node = new TreeNode<>(data);
    } else {
        // 优先插在左边
        if (data.compareTo(node.getData()) <= 0) {
            node.setLeft(add(node.getLeft(), data));
        } else {
            node.setRight(add(node.getRight(), data));
        }
    }
    // in any case, return the new pointer to the caller
    return node;
}
```

## 删除元素

删除是最复杂的一个场景，实现如下。

```java
    /**
     * 情况 1：如果删除的节点没有右孩子，那么就选择它的左孩子来代替原来的节点。
     * 二叉查找树的性质保证了被删除节点的左子树必然符合二叉查找树的性质。
     * 因此左子树的值要么都大于，要么都小于被删除节点的父节点的值，这取决于被删除节点是左孩子还是右孩子。
     * 因此用被删除节点的左子树来替代被删除节点，是完全符合二叉搜索树的性质的。
     *
     * 情况 2：如果被删除节点的右孩子没有左孩子，那么这个右孩子被用来替换被删除节点。
     * 因为被删除节点的右孩子都大于被删除节点左子树的所有节点，同时也大于或小于被删除节点的父节点，这同样取决于被删除节点是左孩子还是右孩子。
     * 因此，用右孩子来替换被删除节点，符合二叉查找树的性质。
     *
     * 情况 3：如果被删除节点的右孩子有左孩子，就需要用被删除节点右孩子的左子树中的最下面的节点来替换它，
     * 就是说，我们用被删除节点的右子树中最小值的节点来替换。
     * @param data 元素
     */
    @Override
    public boolean remove(V data) {
        //引用当前节点，从根节点开始
        TreeNode<V> current = root;
        //应用当前节点的父节点
        TreeNode<V> parent = root;
        //是否为左节点
        boolean isLeftChild = true;

        while(current.getData().compareTo(data) != 0){
            parent = current;
            //进行比较，比较查找值和当前节点的大小
            if(current.getData().compareTo(data) > 0){
                current = current.getLeft();
                isLeftChild = true;
            } else {
                current = current.getRight();
                isLeftChild = false;
            }

            // 没有找到这个元素
            if(current == null){
                return false;
            }
        }

        //1. 该节点是叶子节点，没有子节点
        //要删除叶节点，只需要改变该节点的父节点的引用值，将指向该节点的引用设置为null就可以了。
        if(current.getLeft() == null && current.getRight() == null){
            // 根节点
            if(current == root){
                root = null;
            }else if(isLeftChild){
                //如果它是父节点的左子节点
                parent.setLeft(null);
            }else{
                parent.setRight(null);
            }

        //2、该节点有一个子节点
        //改变父节点的引用，将其直接指向要删除节点的子节点。
        }else if (current.getRight() == null){
            // 如果右节点为空，使用左节点，替代被删除的节点。
            if(current == root){
                root = current.getLeft();
            }else if(isLeftChild){
                parent.setLeft(current.getLeft());
            }else{
                parent.setRight(current.getLeft());
            }
        }else if (current.getLeft() == null){
            // 如果左节点为空，则使用右节点替代
            if(current == root){
                root = current.getRight();
            }else if(isLeftChild){
                parent.setLeft(current.getRight());
            }else{
                parent.setRight(current.getRight());;
            }
        } else {
        //3、该节点有两个子节点
        //要删除有两个子节点的节点，就需要使用它的中序后继来替代该节点。
        TreeNode<V> successor = getSuccessor(current);
        if(current == root){
            root = successor;
        } else if(isLeftChild) {
            parent.setLeft(successor);
        }else{
            parent.setRight(successor);
        }
        successor.setLeft(current.getLeft());
    }
    return true;
}
```

# 如何打印一棵树

## 问题

老马看过很多实现，大部分都和上面的类似。

不过有时候我们想更加直观的看到一棵树的样子，应该怎么办呢？

各种遍历方式，得到的结果实际上并不是树的样子。

## 思路

树中的每一个元素，如果想展现出正确的位置，我们把节点认为是一个点，只需要知道对应的（x,y） 坐标即可。

y 是高度，我们如果知道元素在哪一层，就可以确定。

x 坐标，实际上通过中序遍历可以完全确认。

除此之外，我们还需要知道每一行的最后一个元素是谁，用来输出换行。这个要如何判断呢？

实际上根节点（第一层）肯定是 1 个元素，我们根据这一层的左右节点，可以计算出下一层的元素个数，以此类推。

## 实现

下面的实现是老马的实现，还不够简洁，仅供大家思考。

### 定义用于输出的对象节点

```java
public class PrintTreeNode<V extends Comparable<? super V>> {

    private V data;

    /**
     * 左节点
     */
    private boolean isLeft;

    /**
     * 右节点
     */
    private boolean isRight;

    /**
     * 是否为最后一个元素
     */
    private boolean isEndLine;

    /**
     * 当前层级
     */
    private int level;

    /**
     * x 轴的偏移量
     */
    private int offset;

    // getter and setter 

}
```

### 核心实现

```java
@Override
public void print() {
    List<PrintTreeNode<V>> printList = new ArrayList<>();
    int level = 0;
    TreeNode<V> node = root;
    Queue<TreeNode<V>> queue = new LinkedList<>();
    queue.add(node);

    //root
    PrintTreeNode<V> printTreeNode = buildPrintNode(node, level, false, false, true);
    printList.add(printTreeNode);
    // 入队的时候构建元素
    int[] levelArray = new int[1000];
    levelArray[level] = 1;
    // 临时存放元素的列表
    List<V> tempList = new ArrayList<>();
    while (!queue.isEmpty()) {
        node = queue.poll();
        tempList.add(node.getData());
        if (node.getLeft() != null) {
            queue.add(node.getLeft());
            levelArray[level+1]++;
            PrintTreeNode<V> leftNode = buildPrintNode(node.getLeft(), level+1,
                    true, false, false);
            printList.add(leftNode);
        }
        if (node.getRight() != null) {
            queue.add(node.getRight());
            levelArray[level+1]++;
            PrintTreeNode<V> rightNode = buildPrintNode(node.getRight(), level+1,
                    false, true, false);
            printList.add(rightNode);
        }
        // 判断是否为当前这行最后一个元素
        if(tempList.size() == levelArray[level]) {
            printList.get(printList.size()-1).endLine(true);
            tempList.clear();
            level++;
        }
    }

    // 中序遍历，确定 x 坐标
    List<V> inOrders = inOrder();
    for(PrintTreeNode<V> node1 : printList) {
        V value = node1.data();
        int index = inOrders.indexOf(value);
        node1.offset(index);
    }

    // 输出
    int offset = 0;
    for(PrintTreeNode<V> node1 : printList) {
        int xOffset = node1.offset();
        String text = leftPad(xOffset, offset, node1.data());
        offset += text.length();
        System.out.print(text);
        if(node1.endLine()) {
            System.out.println();
            offset = 0;
        }
    }
}
```

其中构建元素节点实现如下：

```java
private PrintTreeNode<V> buildPrintNode(TreeNode<V> node, int level,
                            boolean isLeft, boolean isRight,
                                        boolean isEndLine) {
    PrintTreeNode<V> treeNode = new PrintTreeNode<>();
    treeNode.data(node.getData())
            .right(isRight)
            .level(level)
            .left(isLeft)
            .endLine(isEndLine);
    return treeNode;
}
```

leftPad 主要是为了更好的输出元素 x 位置：

```java
private String leftPad(int xoffset, int offset, V value) {
    int left = xoffset - offset;
    if(left <= 0) {
        return value.toString();
    }
    // 直接填充
    return CharUtil.repeat(' ', left)+value.toString();
}
```

# 测试验证

上面我们洋洋洒洒的写了一堆代码，到底对不对呢？

需要我们测试验证一下。

## 构建 BST

我们构建一颗最简单的树。

```java
@Test
public void build123Test() {
    BinarySearchTree<Integer> tree = new BinarySearchTree<>();
    tree.add(2);
    tree.add(1);
    tree.add(3);
    System.out.println(tree.inOrder());
    System.out.println(tree.preOrder());
    System.out.println(tree.postOrder());
    System.out.println(tree.levelOrder());
    System.out.println(tree.getMinValue());
    System.out.println(tree.getMaxValue());
    System.out.println(tree.getHeight());
    System.out.println(tree.getSize());
    System.out.println(tree.contains(2));
    System.out.println(tree.contains(5));
}
```

日志如下：

```
[1, 2, 3]
[2, 1, 3]
[1, 3, 2]
[2, 1, 3]
1
3
2
3
true
false
```

## 打印一棵树

```java
BinarySearchTree<Integer> tree = new BinarySearchTree<>();
tree.add(5);
tree.add(2);
tree.add(7);
tree.add(1);
tree.add(3);
tree.add(6);
tree.add(9);

tree.print();
```

输出如下：

```
   5
 2   7
1 3 6 9
```

看起来这个输出还可以，不过还是有 2 点不足：

（1）没有输出 `/\` 连接节点，需要读者自行脑补。

（2）如果元素的值重复，上面的输出可能导致位置错位。

各位小伙伴如果感兴趣，可以改良一下这个树的输出实现。

## 打印另一个棵树

```java
BinarySearchTree<Integer> tree = new BinarySearchTree<>();
tree.add(1);
tree.add(2);
tree.add(3);
tree.add(4);
tree.add(5);
tree.add(6);
tree.add(7);

tree.print();
```

输出如下：

```
1
 2
  3
   4
    5
     6
      7
```

这棵树实际上查询性能是非常差的，和链表一样，已经退化成了 O(n)。

那么有什么办法可以解决这个问题吗？

下一节我们将一起学习一下 AVL 树，感兴趣的小伙伴可以关注不迷路，实时获取最新内容。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

http://cslibrary.stanford.edu/110/BinaryTrees.html

https://www.javatpoint.com/binary-tree

https://www.javatpoint.com/tree

[[数据结构]——二叉树（Binary Tree）、二叉搜索树（Binary Search Tree）及其衍生算法](https://www.cnblogs.com/eudiwffe/p/6207196.html)

[二叉树 - Binary Tree](https://www.jianshu.com/p/2bb52415d07e)

[二叉查找树](https://www.cnblogs.com/gaochundong/p/binary_search_tree.html)

[【Java】 二叉树的遍历（递归与循环+层序遍历）](https://www.cnblogs.com/yongh/p/9629940.html)

[二叉树的图形显示](https://blog.csdn.net/copica/article/details/39291141)

[数据结构学习--Java删除二叉树节点](https://www.cnblogs.com/xiaohualu/p/11815207.html)

* any list
{:toc}

