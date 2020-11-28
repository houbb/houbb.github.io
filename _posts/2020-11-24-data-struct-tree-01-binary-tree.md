---
layout: post
title:  Tree-01-二叉树 Binary Tree 
date:  2020-10-17 16:15:55 +0800
categories: [Data-Struct]
tags: [data-struct, tree, sf]
published: true
---

# 二叉树（Binary Tree）

顾名思义，就是一个节点分出两个节点，称其为左右子节点；每个子节点又可以分出两个子节点，这样递归分叉，其形状很像一颗倒着的树。

二叉树限制了每个节点最多有两个子节点，没有子节点的节点称为叶子。

二叉树引导出很多名词概念，这里先不做系统介绍，遇到时再结合例子一一说明。

如下一个二叉树：

```
/*   A simple binary tree
 *        A ---------> A is root node
 *       / \
 *      /   \
 *     B     C
 *    /     / \
 *   /     /   \
 *   D     E    F ---> leaves: D, E, F
 *
 *       (1)      ---> Height: 3
 */
```

其中节点B只有一个子节点D；D, E, F没有子节点，被称为叶子。

对于节点C来说，其分出两子节点，所以C的出度为2；同理，C有且只有一个父节点，所以其入度为1。

出度、入度的概念来源于图（Graph，一种更加高级复杂的数据结构），当然，也可以应用于二叉树（二叉树或者说树形数据结构也是一类特殊的图）。显然，二叉树的根节点入度为0，叶子节点出度为0。

如何衡量一颗二叉树？比如大小、节点稠密等。

与楼房一样，一般会对二叉树分层，并且通常将根节点视为第一层。

接下来B与C同属第二层，D, E, F同属第三层。

注意，并不是所有的叶子都在同一层。

通常将二叉树节点的最高层数作为其树的高度，上例中二叉树高度为3。显然，一个二叉树的节点总数必然小于2的树高幂，转化成公式表示为：N<2^H，其中N为节点总数，H为二叉树高度；对于第k层，最多有2^(k-1)个节点。

## 分类

更加细化的分类，如下：

完全二叉树：除了最高层以外，其余层节点个数都达到最大值，并且最高层节点都优先集中在最左边。

满二叉树：除了最高层有叶子节点，其余层无叶子，并且非叶子节点都有2个子节点。

```
/*  Complete Binary Tree (CBT) and Full Binary Tree (FBT)
 *        A              A                A
 *       / \            / \              / \
 *      /   \          /   \            /   \
 *     B     C        B     C          B     C
 *    / \            / \   / \              / \
 *   /   \          /   \ /   \            /   \
 *   D    E        D    E F    G          D     E
 *
 *      (2)             (3)               (4)
 *      CBT             FBT             not CBT
 */
```

其中(2)就是一个完全二叉树；

(3)是一个满二叉树；

而(1)和(4)不属于这两者，（虽然(4)是(2)的一种镜像二叉树）。

易知，满二叉树必然是一个完全二叉树，反之则不然。从节点数量上看，满二叉树的第k层有2^(k-1)个节点，所以其总节点数为2^H - 1；完全二叉树除了最后一层外，第k层节点有2^(k-1)个节点，最后一层最多有2^(H-1)个节点。

其实，关于完全二叉树的定义有多种，然而不管怎样定义，其实质是一样的，关键在于怎样理解。

如果完全二叉树除去最后一层，则成为一个满二叉树

。所谓的“最后一层节点优先集中在左边”，用语言很难解释，但是结合上例的(2)和(4)可以很好理解。

为什么要这样定义呢？

这是因为这种完全二叉树的效率非常高，并且完全二叉树绝大多数情况使用数组存储，即无序堆（Heap）！

优先将叶子安排在最左边，以保证该数组每个存储单元都被利用（如果是(4)的情况，则该数组会有部分空间浪费）。这就是为什么要要求“最后一层优先集中在最左边”。

# 二叉树的构建和遍历

数据结构和算法，最终要落实在代码上，首先给出一般C风格的二叉树节点定义，其中val在同一颗树中唯一：

## 节点定义

```c
// A simple binary tree node define
typedef struct __TreeNode
{
    int val;
    struct __TreeNode *left, *right;
}TreeNode;
```

很简单，看着很像双链表节点的定义，如果抛开字段名称，其实质完全跟双链表节点结构一样。

事实上，有很多情况下需要将二叉树就地转换成一个双链表，甚至是单链表。

如何构建一个二叉树？

很抱歉，这个占据数据结构与算法半壁江山的二叉树，竟然没有一个标准的构建方法！

因为二叉树使用太过广泛，针对不同应用有不同的构建方法，如果仅仅将一个节点插入（或删除）到二叉树中，这又太过简单，简单的与链表插入（或删除）一样。

故本文不提供构建方法。

## 遍历

对于给定的一颗二叉树，如何遍历呢？

有四种常见方法。

中序遍历：即左-根-右遍历，对于给定的二叉树根，寻找其左子树；对于其左子树的根，再去寻找其左子树；递归遍历，直到寻找最左边的节点i，其必然为叶子，然后遍历i的父节点，再遍历i的兄弟节点。随着递归的逐渐出栈，最终完成遍历。

例如(1)中的遍历结果为：D->B->A->E->C->F

先序遍历：即根-左-右遍历，不再详述。例如(1)中的遍历结果：A->B->D->C->E->F

后序遍历：即左-右-根遍历，不再详述。例如(1)中的遍历结果：D->B->E->F->C->A

层序遍历：即从第一层开始，逐层遍历，每层遍历按照从左到右遍历。例如(1)中的遍历结果：A->B->C->D->E->F

很明显，先序遍历的第一个节点必然是树的根节点；后序遍历的最后一个节点也必然是树的根节点。层序遍历更加符合人对二叉树的树形结构的遍历顺序。

一般参考代码

```c
// root is in middle order travel, (1):D->B->A->E->C->F
void inorder(TreeNode *root)
{
    if (root == NULL) return;
    inorder(root->left);
    printf("%d ",root->val); // visit
    inorder(root->right);
}
// previous visit root order travel, (1):A->B->D->C->E->F
void preorder(TreeNode *root)
{
    if (root == NULL) return;
    printf("%d ",root->val); // visit
    preorder(root->left);
    preorder(root->right)
}
// post vist root order travel, (1):D->B->E->F->C->A
void postorder(TreeNode *root)
{
    if (root == NULL) return;
    postorder(root->left);
    postorder(root->right);
    printf("%d ",root->val); // visit
}
```

看着很简单感觉不太对，毋庸置疑，事实上就是这么简单。

此处仅给出递归版本，虽然递归间接用到了栈，但是即便使用循环版本实现，其仍然需要辅助空间存储。

为什么在实现堆的代码中，用的是循环而不是递归？

这就是因为堆的形象化是一个完全二叉树，并且用数组存储，可见完全二叉树的效率如此之高。

对于层序遍历，就需要使用辅助的存储空间，一般使用队列（queue），因为其要求每层的顺序要从左到右。

下面使用STL中queue进行实现，关于队列的介绍，请自行补充。

```c
// level order travel, (1):A->B->C->D->E->F
void levelorder(TreeNode *root)
{
    if(root==NULL) return;
    queue<TreeNode*> q;
    for(q.push(root); q.size(); q.pop()){
        TreeNode *r = q.front();
        printf("%d ",r->val);    // visit
        if (r->left) q.push(r->left);
        if (r->right) q.push(r->right);
    }
}
```

上面是一种层序遍历，但并没有对每层进行分割，换言之，并不知道当前遍历的节点属于哪一层。

如需实现，只需要两个队列交替遍历，每个队列遍历完就是一层的结束，感兴趣的可以自行写出。

其中，前面三种遍历最为常见，先序遍历是二叉树的深度优先遍历（Depth First Search，DFS），使用最广泛。

层序遍历是二叉树的广度优先遍历（Breadth First Search，BFS）。 



# 二叉搜索树（Binary Search Tree）

## 概念

二叉查找树（BST：Binary Search Tree）是一种特殊的二叉树，它改善了二叉树节点查找的效率。二叉查找树有以下性质：

对于任意一个节点 n，

1. 其左子树（left subtree）下的每个后代节点（descendant node）的值都小于节点 n 的值；

2. 其右子树（right subtree）下的每个后代节点的值都大于节点 n 的值。

所谓节点 n 的子树，可以将其看作是以节点 n 为根节点的树。子树的所有节点都是节点 n 的后代，而子树的根则是节点 n 本身。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1124/212211_ce2a2778_508704.png "屏幕截图.png")

下图中展示了两个二叉树。

二叉树（b）是一个二叉查找树（BST），它符合二叉查找树的性质规定。

而二叉树（a），则不是二叉查找树。因为节点 10 的右孩子节点 8 小于节点 10，但却出现在节点 10 的右子树中。同样，节点 8 的右孩子节点 4 小于节点 8，但出现在了它的右子树中。无论是在哪个位置，只要不符合二叉查找树的性质规定，就不是二叉查找树。例如，节点 9 的左子树只能包含值小于节点 9 的节点，也就是 8 和 4。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1124/212246_5e99c881_508704.png "屏幕截图.png")

## 查找算法

从二叉查找树的性质可知，BST 各节点存储的数据必须能够与其他的节点进行比较。给定任意两个节点，BST 必须能够判断这两个节点的值是小于、大于还是等于。

假设我们要查找 BST 中的某一个节点。例如在上图中的二叉查找树（b）中，我们要查找值为 10 的节点。

我们从根开始查找。可以看到，根节点的值为 7，小于我们要查找的节点值 10。因此，如果节点 10 存在，必然存在于其右子树中，所以应该跳到节点 11 继续查找。此时，节点值 10 小于节点 11 的值，则节点 10 必然存在于节点 11 的左子树中。在查找节点 11 的左孩子，此时我们已经找到了目标节点 10，定位于此。

如果我们要查找的节点在树中不存在呢？

例如，我们要查找节点 9。重复上述操作，直到到达节点 10，它大于节点 9，那么如果节点 9 存在，必然存在于节点 10 的左子树中。然而我们看到节点 10 根本就没有左孩子，因此节点 9 在树中不存在。

总结来说，我们使用的查找算法过程如下：

假设我们要查找节点 n，从 BST 的根节点开始。算法不断地比较节点值的大小直到找到该节点，或者判定不存在。每一步我们都要处理两个节点：树中的一个节点，称为节点 c，和要查找的节点 n，然后并比较 c 和 n 的值。开始时，节点 c 为 BST 的根节点。然后执行以下步骤：

1. 如果 c 值为空，则 n 不在 BST 中；

2. 比较 c 和 n 的值；

3. 如果值相同，则找到了指定节点 n；

4. 如果 n 的值小于 c，那么如果 n 存在，必然在 c 的左子树中。回到第 1 步，将 c 的左孩子作为 c；

5. 如果 n 的值大于 c，那么如果 n 存在，必然在 c 的右子树中。回到第 1 步，将 c 的右孩子作为 c；

通过 BST 查找节点，理想情况下我们需要检查的节点数可以减半。


## 复杂度

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

因此，BST 算法查找时间依赖于树的拓扑结构。最佳情况是 O(log­2n)，而最坏情况是 O(n)。


## 插入节点

我们不仅需要了解如何在二叉查找树中查找一个节点，还需要知道如何在二叉查找树中插入和删除一个节点。

当向树中插入一个新的节点时，该节点将总是作为叶子节点。所以，最困难的地方就是如何找到该节点的父节点。类似于查找算法中的描述，我们将这个新的节点称为节点 n，而遍历的当前节点称为节点 c。开始时，节点 c 为 BST 的根节点。则定位节点 n 父节点的步骤如下：

1. 如果节点 c 为空，则节点 c 的父节点将作为节点 n 的父节点。如果节点 n 的值小于该父节点的值，则节点 n 将作为该父节点的左孩子；否则节点 n 将作为该父节点的右孩子。

2. 比较节点 c 与节点 n 的值。

3. 如果节点 c 的值与节点 n 的值相等，则说明用户在试图插入一个重复的节点。解决办法可以是直接丢弃节点 n，或者可以抛出异常。

4. 如果节点 n 的值小于节点 c 的值，则说明节点 n 一定是在节点 c 的左子树中。则将父节点设置为节点 c，并将节点 c 设置为节点 c 的左孩子，然后返回至第 1 步。

5. 如果节点 n 的值大于节点 c 的值，则说明节点 n 一定是在节点 c 的右子树中。则将父节点设置为节点 c，并将节点 c 设置为节点 c 的右孩子，然后返回至第 1 步。

当合适的节点找到时，该算法结束。从而使新节点被放入 BST 中成为某一父节点合适的孩子节点。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1124/212718_1481dfcd_508704.png "屏幕截图.png")

BST 的插入算法的复杂度与查找算法的复杂度是一样的：最佳情况是 O(log­2n)，而最坏情况是 O(n)。因为它们对节点的查找定位策略是相同的。

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
// Asuming each node value is not equal
/*  A simple binary search tree
 *           6                  6
 *          / \                / \
 *         /   \              /   \
 *        3     8            3     8
 *       /     / \          /     / \
 *      /     /   \        /     /   \
 *     2     7     9      2     4*    9
 *
 *       (A) BST             (B) Not BST
 */
```

其中（A）为二叉搜索树，（B）不是。因为根节点6大于右子树中的节点4。

构建二叉搜索树的过程，与堆的构建类似，即逐渐向二叉搜索树种添加一个节点。每次新添加一个节点，直接寻找到对应的插入点，使其满足二叉搜索树的性质。

下面是一种简易的构建过程：

```c
// Initialize a bst
TreeNode *bst_init(int arr[], int n)
{
    if (n<1) return NULL;
    TreeNode *r = (TreeNode*)malloc(sizeof(TreeNode));
    r->val = arr[0];     // ensure bst_append will not update root address
    r->left = r->right = NULL;
    for (; --n; bst_append(r,arr[n]));
    return r;
}
```

对于给定的数组数据，如果仅有一个元素，则直接构造一个节点，将其返回；否则，逐渐遍历该数组，将其元素插入到二叉树中（不要忘记将无子节点的指针置为空），其中bst_append将元素插入的二叉查找树中。为什么对于单独一个元素要特殊处理，而不是所有节点都通过bst_append插入呢？

显然，当插入第一个元素时，此时二叉树根节点为空，直接插入必然修改根节点的地址。

当然可以通过返回值获取插入后二叉树的根节点指针，但这样仅仅针对 1/n 的情况，却每次（共N次）都重新对根节点赋值，牺牲太多性能。

当然也可以将bst_append传参列表声明为二级指针，这里为了追求简洁，故不使用。

当给出插入节点的代码时，你会发现二叉搜索树的构建跟堆的构建思路有异曲同工之妙，并且插入方法与先序遍历十分相似：

```c
// Append a node to bst, return add count
int bst_append(TreeNode *r, int val)
{
    // find insertion position
    for (; r && r->val!=val;){
        if (r->val < val && r->right) r=r->right;
        else if (r->val > val && r->left) r=r->left;
        else break;
    }
    if (r==NULL || r->val==val) return 0;
    TreeNode *tn = (TreeNode*)malloc(sizeof(TreeNode));
    tn->left = tn->right = NULLL;
    tn->val = val;
    if (r->val < val) r->right = tn;
    else r->left = tn;
    return 1;
}
```

通常情况，认为二叉树的节点值为唯一，即不存在新插入的值与已有节点值相同的情况，正如一个集合中不存在相同的两个元素。虽然STL也提供multiset与multimap以便允许重复元素，但其增加了新的字段count用于存储每个值val所包含的节点个数。

易知，对于set而言，其每个节点的count值均为1。注意，对于同一个元素集合，其数组中的顺序不同，生成的二叉查找树也不同。

其中，二叉搜索树的插入时间复杂度为O(logn)，构建二叉搜索树的总时间复杂度为O(nlogn)。寻找插入位置的过程，实际上类似于二分查找。

既然叫二叉搜索树，那么如何高效的查找一个元素是否在该二叉搜索树呢？与插入类似，同样使用先序遍历的结构：

```c
// Find value in bst, return node address
TreeNode *bst_find(TreeNode *r, int val)
{
    for (; r && r->val!=val;){
        if (r->val < val) r=r->right;
        else if (r->val > val) r=r->left;
    }
    return r;
}
```

如果找到了，直接返回该节点指针，否则返回空指针。二叉搜索树对于元素的查找效率与二分查找一样，都为O(logn)，只不过前者使用二叉树链式存储，而二分查找使用顺序的数组存储，两者各有优劣。

很多时候，常常需要删除其中的某些元素，对于二分查找来说，其使用的是有序数组存储，对于数据的插入和删除效率较低，均为O(n)；而二叉搜索树却有着O(logn)的快速，那么如何删除节点？

与堆不同，二叉搜索树使用链式存储，需要注意内存释放，避免其父节点、左右子节点意外分离于原二叉搜索树。因此需要根据待删除节点所处位置，进行分类处理。

在这之前，首先引入一个概念——前驱节点（Precursor Node）。所谓前驱，即按照某种遍历方法，节点前的一个节点为该节点的前驱节点。以（1）为例，其中序遍历为“D->B->A->E->C->F”，那么对于节点A来说，其前驱节点为B；对于节点E来说，A是其前驱节点（下面不作特殊说明，均以中序遍历顺序情况）。与之相反，后继节点则为按照某种遍历方法该节点的下一个节点。即，A是B的后继节点。对于二叉搜索树来讲，如果使用中序遍历，其遍历结果是有序的，即：任意一个节点的前驱节点是满足不大于该节点的最大节点；任意一个节点的后继节点是满足不小于该节点的最小节点。以（A）为例，其中序遍历为“2-3-6-7-8-9”。

对于二叉搜索树的节点删除，一般可分为三种情况：待删除的节点有两个子节点，待删除的节点有一个子节点，待删除的节点无子节点：

```
/* Erase node from a bst - sketch, i' is special for erase 6 (i)
 *       6            d=6,(3)       f=6           6           d=6,(5)
 *      / \            / \          / \          / \           /  \
 *     /   \          /   \        /   \        /   \         /    \
 *    3    8        p=3    8     d=3    8      3   f=8      f=3     8
 *   /    / \        /    / \     /    / \     /    / \      / \   / \
 *  /    /   \      /    /   \   /    /   \   /    /   \    /   \ /   \
 *  2    7    9    2    7    9   2    7    9  2   d=7  9   2  p=5 7   9
 *                                                             /
 *     BST             (i)           (ii)        (iii)        /  (i')
 *                   erase 6      erase 3      erase 7       4
 */
```

(i) 待删除的节点有两个子节点：以删除6为例，为了便于说明，这里将待删除节点称为d=6，其前驱节点为p=3。按照(i)图示方法，可以将其前驱节点p的值替换待删除节点d，并删除前驱节点。注意，如果前驱节点p仍有子节点（子树），则其必然是左节点（左子树），为什么？请自行思考。这里将前驱节点p的父节点称为f，此时的f正好是d，但不是所有情况都是。对于(i')图示，前驱节点p=5的父节点为f=3，当删除d=6时，可以将f的右子节点指向p的左子节点；对于(i)，由于f与d相同，所以可以直接将d的左子节点指向p的左子节点。

(ii)待删除的节点有一个子节点：以删除3为例，由于只有一个子节点，所以可将d节点的子节点继承d，此时需要将d的父节点f=6的子节点指向继承节点。并且需要区分当前删除节点d是父节点f的左子节点还是右子节点，以及d节点的子节点是左子还是右子。图示d为f的左子节点，d有左子节点，所以将f的左子节点指向d的左子节点。

(iii)待删除的节点无子节点：以删除7为例，很简单，将其直接删除，并且将其父节点f的子节点指向空。同样需要判断d是f的左子还是右子。

请注意，对于单根二叉树，即一个二叉搜索树有且只有一个节点，此时需要删除该根节点，那么删除根节点后，二叉树为空。与bst_append类似，如果为空，需要通过返回值回传根节点为空，或者通过传参列表声明二级节点指针。为了简化代码，此处不对其进行处理，由调用删除节点处自行处理。

下面是一种实现代码，其中返回值表示删除的节点个数，对于单根二叉树返回-1，告诉调用者，并由调用者自行处理：

```c
int bst_erase(TreeNode *r, int val)
{
    TreeNode *f, *p, *d;
    // f is father node
    // p is precursor node
    // d is to be deleted node
    for (f=NULL,d=r; d && d->val!=val;){
        f = d;
        if (d->val < val) d=d->right;
        else d=d->left;
    }
    if (d==NULL) return 0;          // cannot find erase node
 
    if (d->left && d->right){     // deletion has two children
        // find deletion node d's precursor
        for (f=d,p=d->left; p->right; f=p, p=p->right);
        d->val = p->val;          // replace deletion val by precursor
        if (f==d) d->left = p->left;// case (i)
        else f->right = p->left;  // case (i')
    }
    else if (d->left==NULL && d->right==NULL){
        if (d==r) return -1;        // deletion is single root, this will
                                    // replace root address to NULL, please
                                    // deal this at calling procedure.
        // deletion is leaf
        if (f->left == d) f->left=NULL;
        else if (f->right == d) f->right=NULL;
        free(d);
    }
    else {  // deletion has single child node or branch
        p = (d->left ? d->left : d->right);
        d->val = p->val;
        d->left = p->left;
        d->right = p->right;
        free(p);
    }
    return 1;   // return erase node count
}
```

到此为止，二叉搜索树介绍完毕。

显然，二叉搜索树的删除要复杂的多。实际上，二叉搜索树才仅仅是二叉树的一个衍生树，后续的平衡二叉搜索树、AVL树以及红黑树等，才是实际使用最为广泛的。

由于篇幅限制，后续进行讲解。




# 二叉树问题

这是14个二叉树问题，难度递增。

一些问题在二进制搜索树（也称为“有序二进制树”）上起作用，而其他问题在无特殊排序的普通二进制树上起作用。 
 
阅读数据结构是一个很好的介绍，但是在某些时候，学习的唯一方法是实际尝试解决一些空白纸开始的问题。

为了充分利用这些问题，在查看解决方案之前，您至少应尝试解决它们。 
 
即使您的解决方案不太正确，您也会建立正确的技能。 
 
对于任何基于指针的代码，最好制作一些简单情况的内存图，以了解算法应如何工作。

## 1. build123（）

只需一点指针操作，这是一个非常基本的问题。 （如果您已经熟悉了指针，则可以跳过此问题。）编写代码以构建以下小的1-2-3二进制搜索树...

```
    2
   / \
  1   3
```

## 2. size（）

此问题说明了简单的二叉树遍历。 给定一个二叉树，计算该树中的节点数。

## 3. maxDepth（）

给定一棵二叉树，计算其“maxDepth”-沿着从根节点到最远叶节点的最长路径的节点数。 

空树的maxDepth为0，第一页上树的maxDepth为3。

## 4. minValue（）

给定一个非空的二进制搜索树（有序的二进制树），返回在该树中找到的最小数据值。 

注意，没有必要搜索整个树。 

maxValue（）函数在结构上与此函数非常相似。 

这可以通过递归或简单的while循环来解决。

## 5. printTree（）

给定一个二叉搜索树（又名“有序二叉树”），遍历节点以按升序打印出来。 

那棵树...

```
    4
   / \
  2 5
 / \
1 3
```

产生输出“ 1 2 3 4 5”。 这被称为树的“有序”遍历。

提示：对于每个节点，策略是：向左递归，打印节点数据，向右递归。

## 6. printPostorder（）

给定一棵二叉树，请按照自下而上的“后置”遍历打印出树的节点-节点的两个子树在打印节点本身之前就已完全打印出来，每个左子树都在右子树之前打印出来。 

那棵树...

```
    4
   / \
  2 5
 / \
1 3
```

产生输出“ 1 3 2 5 4”。 

描述很复杂，但是代码很简单。 

这是一种自下而上的遍历，可用于评估一个表达式树，其中一个节点是一个类似于“+”的操作，其子树递归地是“+”的两个子表达式。

## 7. hasPathSum（）

我们将“根到叶的路径”定义为树中的一系列节点，从根节点开始，一直向下到叶（无子节点）。 我们将说一棵空树不包含根到叶的路径。 

因此，例如，以下树具有四个从根到叶的路径：

```
      5
     / \
    4   8
   /   / \
  11  13  4
 /  \      \
7    2      1
```

Root-to-leaf paths:

```
path 1: 5 4 11 7
path 2: 5 4 11 2
path 3: 5 8 13
path 4: 5 8 4 1
```

对于此问题，我们将关注该路径的值之和-例如，在5-4-11-7路径上的值之和为5 + 4 + 11 + 7 = 27。

给定一个二叉树和一个和，如果该树具有从根到叶的路径，使得该路径上的所有值相加等于给定的和，则返回true。 

如果找不到这样的路径，则返回false。 （感谢Owen Astrachan提出了这个问题。）

## 8. printPaths（）

给定一棵二叉树，打印出上面定义的所有其从根到叶的路径。 

这个问题比看起来要难一些，因为“到目前为止的路径”需要在递归调用之间传递。 

提示：在C，C ++和Java中，最好的解决方案可能是创建一个递归帮助函数printPathsRecur（node，int path []，int pathLen），其中路径数组传达导致当前调用的节点序列。 

或者，可以自底向上解决问题，每个节点返回其路径列表。 

这种策略在Lisp中效果很好，因为它可以利用内置的列表和映射原语。 （感谢Matthias Felleisen提出了这个问题。）

给定一棵二叉树，打印出其所有的从根到叶的路径，每行一条。

## 9. mirror() 镜像

更改树，以便在每个节点上交换左右指针的角色。

那棵树...

```
    4
   / \
  2 5
 / \
1 3
```

改为...

```
  4
 / \
5 2
   / \
  3 1
```

解决方案很短，但是非常递归。 

碰巧的是，这可以在不更改根节点指针的情况下完成，因此不需要返回新的根结构。 

或者，如果您不想更改树节点，则可以基于原始树来构造并返回新的镜像树。

## 10. doubleTree（）

对于二叉搜索树中的每个节点，创建一个新的重复节点，并将重复的节点作为原始节点的左子节点插入。 

结果树仍然应该是二叉搜索树。

那棵树...

```
  2
 / \
1   3
```

改为...

```
       2
      / \
     2   3
    /   /
   1   3
  /
 1
```

与先前的问题一样，这可以在不更改根节点指针的情况下完成。

## 11. sameTree（）

给定两个二进制树，如果它们在结构上相同，则返回true －它们由具有相同值且以相同方式排列的节点组成。 （感谢朱莉·泽伦斯基建议这个问题。）

## 12. countTrees（）

从一般意义上来说，这不是二进制树编程问题，而是使用二进制树的数学/组合递归问题。 （感谢杰里·凯恩建议这个问题。）

假设您正在构建一个值为1..N的N节点二进制搜索树。 有多少结构不同的二叉搜索树存储这些值？ 

编写一个递归函数，在给定不同值的数量的情况下，该函数计算存储这些值的结构唯一的二进制搜索树的数量。 

例如，countTrees（4）应该返回14，因为有14个结构独特的二进制搜索树存储了1，2，3和4。

基本情况很容易，并且递归很短但很密集。 您

的代码不应构造任何实际的树； 这只是一个计数问题。


## 二进制搜索树检查（针对问题13和14）

接下来的两个问题会使用此背景：给定一个普通的二叉树，请检查该树以确定其是否满足成为二叉搜索树的要求。 

要成为二叉搜索树，对于每个节点，其左树中的所有节点必须为<=节点，而其右子树中的所有节点必须为>节点。 

考虑以下四个示例...

```
a.  5   -> TRUE
   / \
  2   7
 

b.  5   -> FALSE, because the 6 is not ok to the left of the 5
   / \
  6   7
 

c.   5  -> TRUE
    / \
   2   7
  /
 1

d.   5  -> FALSE, the 6 is ok with the 2, but the 6 is not ok with the 5
    / \
   2   7
  / \
 1   6
```

对于前两种情况，只需将每个节点与其正下方的两个节点进行比较，便可以看到正确的答案。 

但是，第四种情况表明，检查BST质量的方式可能取决于相隔几层的节点-在这种情况下为5层和6层。

## 13 isBST（）-版本1

假设您有辅助函数minValue（）和maxValue（），它们从非空树中返回最小或最大int值（请参见上面的问题3）。 

编写一个isBST（）函数，如果树是二叉搜索树，则返回true，否则返回false。

 使用辅助函数，不要忘记检查树中的每个节点。 
 
 如果您的解决方案不是很有效，也可以。 （感谢Owen Astrachan提出此问题并将其与问题14进行比较的想法）

如果二叉树是二叉搜索树，则返回true。


## 14. isBST（）-版本2

由于版本1遍历树的某些部分多次，因此它运行缓慢。 

更好的解决方案只对每个节点检查一次。 

诀窍是编写一个实用程序辅助函数isBSTRecur（struct node * node，int min，int max）遍历树，跟踪变窄的最小和最大允许值，只查看每个节点一次。 

min和max的初始值应为INT_MIN和INT_MAX-从那里开始变窄。

```c
/*
 Returns true if the given tree is a binary search tree
 (efficient version).
*/
int isBST2(struct node* node) {
  return(isBSTRecur(node, INT_MIN, INT_MAX));
}

/*
 Returns true if the given tree is a BST and its
 values are >= min and <= max.
*/
int isBSTRecur(struct node* node, int min, int max) {
```

## 15. Tree-List 树状列表

Tree-List 问题是有史以来最大的递归指针问题之一，它也恰好使用二叉树。 

CLibarary＃109 http://cslibrary.stanford.edu/109/详细研究了Tree-List问题，并包括C和Java解决方案代码。 

该问题需要了解二进制树，链接列表，递归和指针。 这是一个很大的问题，但是很复杂。

# Java二叉树和解决方案

在Java中，递归的关键点与C或C++完全相同。

实际上，我只是通过复制C解决方案来创建Java解决方案，然后进行语法更改。

递归相同，但是外部结构略有不同。

在Java中，我们将有一个BinaryTree对象，其中包含一个根指针。

根指针指向内部Node类，其行为类似于C/C++版本中的node结构。 

Node类是私有的-仅用于BinaryTree内部的内部存储，并且不公开给客户端。

使用这种OOP结构，几乎每个操作都有两种方法：BinaryTree上的单行方法开始计算，而Node对象上的递归方法。

对于lookup（）操作，客户端使用BinaryTree.lookup（）方法来启动查找操作。

在BinaryTree类的内部，有一个私有的递归lookup（Node）方法，该方法实现了Node结构的递归。第二个私有的递归方法与上面的递归 C/C++函数基本相同-它采用Node参数，并使用递归迭代指针结构。




# 二叉树的序列化（serialize）和反序列化（deserialize）

## 概念

简单讲，序列化就是将结构化数据转化成可顺序传输的数据流；反序列化就是将顺序数据流还原成原来的数据结构。

前面几种遍历方法，虽然都可以将二叉树转换成顺序的数据流，但还不能称作序列化，因为没有办法还原二叉树结构。

以(1)为例，其常见四种遍历方法得到的数据流为：

```
/*  A simple binary tree four typical traversals
 *           A
 *          / \        in order   : D->B->A->E->C->F
 *         /   \       pre order  : A->B->D->C->E->F
 *        B     C      post order : D->B->E->F->C->A
 *       /     / \     level order: A->B->C->D->E->F
 *      /     /   \
 *     D     E     F
 *
 *          (1)
 */
```

单独使用无法将其还原成二叉树。

但是，仔细观察发现，先序遍历的第一个节点A为根节点；后序遍历的最后一个节点A也是根节点。

如果同时知道一个二叉树的先序和后序遍历顺序，是否可以还原树呢？很抱歉，虽然两种遍历的方法不一样，但其只能确定根节点的位置，其他节点无法确定。

那么，如果使用中序+先序遍历结果，是否可行呢？让我们试试。

根据先序遍历知道第一个节点A为根节点，接下来“B->D->C->E->F”是左右节点的顺序，虽然目前还无法判断到底哪个是左，哪个是右；

前面已知，中序遍历以根节点为分隔，左边是左子树，右边是右子树，于是在中序中找到A的位置，以此分隔，左部分“D->B”是左子树，右部分“E->C->F”是右子树；

请注意，对于任意一个节点来说，都是某个子树的根节点，即便是叶子节点，它也是一个空二叉树的根节点！由此引出，先序遍历的每个节点都曾充当父节点（某子树的根节点）。

于是，对于剩下的先序遍历数据流“B->D->C->E->F”来说，B也是剩下的某子树的根节点，究竟是哪个子树呢？

显然是左子树，因为先序遍历的顺序就是“根-左-右”。

因此，在左子树“D->B”中找到B，其为左子树的根；于是将“D->B”分成左子树“D”和右子树“”（空）。

根据递归的出栈，接下来处理先序遍历中的“D->C->E->F”，紧接着是“C->E->F”...最终，完成二叉树的还原。

部分步骤示意图：

```
// Using In order and Pre order to deserialize
/*
 *        A*               A              A             A
 *       / \    ====>     / \            / \           / \
 *      /   \            /   \          /   \         /   \
 *    D-B  E-C-F        B*  E-C-F      B   E-C-F     B    C*
 *                     / \            /             /    / \
 *                    /   \          /             /    /   \
 *                   D    NULL      D*             D   E     F
 *         root         root       root             root
 *          |             |          |               |
 *  IN: D-B-A-E-C-F     D-B          D             E-C-F
 *  PRE:A-B-D-C-E-F     B-D-C-E-F    D-C-E-F       C-E-F
 *      |               |            |             |
 *     root           root          root          root
 */
```

每次根据先序遍历结果确定当前的根节点（用 `*` 标记），然后在中序遍历结果中寻找该节点，并以此为分割点，分成左右子树；反复执行，直到先序遍历结束，二叉树还原完毕。

下面给出C风格的代码，仅供参考：

```c
// Using In order and Pre order to deserialize
TreeNode *deserialize(int pre[], int in[], int n, int begin, int end)
{
    static int id = 0;              // current position in PRE order
    if (begin==0 && end==n) id=0;   // reset id
    TreeNode *r = (TreeNode*)malloc(sizeof(TreeNode));
    int pos;                        // current root position in IN order
    for (pos=begin; pos<end && in[pos]!=pre[id]; ++pos);
    if (in[pos]!=pre[id]) exit(-1); // preorder or inorder is error
    r->val = pre[id++];
    r->left = deserialize(pre,in,n,begin,pos);
    r->right= deserialize(pre,in,n,pos+1,end);
    return r;
}
```

其中 pre[] 为先序遍历结果，in[] 为中序遍历结果，此处假设节点的值(val)为唯一（对于不唯一的，可以增加关键字字段）。

n 为节点总数，也即为数组的长度；start和end表示寻找中序遍历的区间范围 [start,end)。 

如果给定的 pre[] 和 in[] 绝对正确，那么第9行的错误处理将不会执行。对于一棵N节点的二叉树，直接调用deserialize(pre,in,n,0,n)则可还原该二叉树。

整个逆序列化的过程，实际上是“先序遍历”的过程，不妨看看10~12行代码。

同理，使用中序+后序也可还原二叉树，这里不再详述。

不妨算法其时间复杂度，对于先序数据流，其使用了静态的id作为遍历下标，故为O(n)；但是对于中序遍历数据流，其根据[start,end)区间进行遍历寻找，为O(nlogn)。

感兴趣的不妨尝试改进层序遍历，使其达到序列化和反序列化的要求（注意分层和空节点）。

## 需要

直观的输出树的信息。

## 核心问题

1、 如何判断每个节点应该在第几行输出，或者说输出的时候如何判断该换行？

2、 如何安排节点的位置，使左右孩子在其父节点的两边，以便直观地看出各个节点之间的关系？

3、 因为没有使用图形库，不能在任意位置输出，所以输出必须是一次性的，也就是在输出前就得确定图中所有字符应在的位置。

4、 通用性：

## 解决思路

### 第几行

```
324

71， 776

43， 159， 425， 817

389
```

可以发现和普通的层次遍历：324,  71, 776，43， 159， 425， 817， 389 的区别就是在每层的最后一个节点后换个行。

我们只需要在对树进行**层次遍历，然后在输出每层最后一个节点之后再输出一个换行符即可**。

如何知道每层的最后一个结点是哪个呢？

如果我们知道每一层一共有多少个节点，然后在输出的时候对已输出结点计数，就可以知道每层的最后一个结点是哪个。

对于任意的一颗二叉树，我们虽然不知道任意一层的结点总数，但是我们知道第0层一定只有一个结点，就是根节点，第1层结点总数就是根结点的孩子结点总数，第2层结点总数就是第1层所有节点的孩子总数，以此类堆就可以知道所有层的结点总数，然后实现按层换行。


下面是 java 代码：

```java
@Override
public void print() {
    TreeNode<V> node = root;
    Queue<TreeNode<V>> queue = new LinkedList<>();
    queue.add(node);
    int[] levelArray = new int[1000];
    levelArray[0] = 1;
    // 临时存放元素的列表
    List<V> tempList = new ArrayList<>();
    int level = 0;
    while (!queue.isEmpty()) {
        node = queue.poll();
        tempList.add(node.getData());
        if (node.getLeft() != null) {
            queue.add(node.getLeft());
            levelArray[level+1]++;
        }
        if (node.getRight() != null) {
            queue.add(node.getRight());
            levelArray[level+1]++;
        }
        // 判断是否为当前这行最后一个元素
        if(tempList.size() == levelArray[level]) {
            // 输出
            System.out.println(tempList);
            tempList.clear();
            level++;
        }
    }
}
```

测试

```java
@Test
public void printTest() {
    BinarySearchTree<Integer> tree = new BinarySearchTree<>();
    tree.add(5);
    tree.add(2);
    tree.add(7);
    tree.add(1);
    tree.add(3);
    tree.add(6);
    tree.add(9);

    tree.print();
}
```

输出如下：

```
[5]
[2, 7]
[1, 3, 6, 9]
```

## 如何确定每一个元素的位置？


发现各个结点的横坐标只要按照**中序遍历**的顺序就可以确定了。

```java
BinarySearchTree<Integer> tree = new BinarySearchTree<>();
tree.add(5);
tree.add(2);
tree.add(7);
tree.add(1);
tree.add(3);
tree.add(6);
tree.add(9);

System.out.println(tree.inOrder());
System.out.println(tree.levelOrder());
```

输出如下：

```
[1, 2, 3, 5, 6, 7, 9]
[5, 2, 7, 1, 3, 6, 9]
```

实际上 inOrder 的顺序就是元素的横坐标位置。

那么问题来了，如何将 1 中的元素和这个元素对应起来呢？


实际上我们可以这样思考：

画布上的任何一个元素，都是根据 (x, y) 坐标来确定的，这个做游戏的小伙伴应该非常熟悉。

我们通过层级遍历，确定了元素的 y 轴，中序遍历可以确定 x 轴。将二者结合起来就可以得到一个元素的具体位置。

我们对上面的代码稍作调整即可。

```java
package com.github.houbb.data.struct.core.util.tree.component;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
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
     * 当前层级 y 轴偏移量
     */
    private int level;

    /**
     * x 轴的偏移量
     */
    private int offset;

    //fluent setter & getter 

}
```

层级遍历调整：

```java
/**
 * 打印思路
 */
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

private String leftPad(int xoffset, int offset, V value) {
    int left = xoffset - offset;
    if(left <= 0) {
        return value.toString();
    }
    // 直接填充
    return CharUtil.repeat(' ', left)+value.toString();
}
```

测试效果：

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

如下：

```
   5
 2   7
1 3 6 9
```

这个看起来已经相对比较直观了。

不过依然存在一些问题：

（1）没有比较直观的 `/\` 符号链接，需要自行脑补。

（2）如果元素重复，可能导致位置错乱。这个是可以改进的。

# 小结

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

