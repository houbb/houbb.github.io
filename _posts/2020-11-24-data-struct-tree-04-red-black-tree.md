---
layout: post
title: Tree-04-图解红黑树 Red Black Tree 及 java 实现
date:  2020-10-17 16:15:55 +0800
categories: [Data-Struct]
tags: [data-struct, java, sh]
published: true
---

# Red Black Tree

红黑树（英语：Red–black tree）是一种自平衡二叉查找树，是在计算机科学中用到的一种数据结构，典型的用途是实现关联数组。

它是在1972年由鲁道夫·贝尔发明的，他称之为"对称二叉B树"，它现代的名字是在Leo J. Guibas和Robert Sedgewick于1978年写的一篇论文中获得的。

它是复杂的，但它的操作有着良好的最坏情况运行时间，并且在实践中是高效的：它可以在 `O(lg(n))` 时间内做查找，插入和删除，这里的 n 是树中元素的数目。

## 用途和好处

红黑树和AVL树一样都对插入时间、删除时间和查找时间提供了最好可能的最坏情况担保。

这不只是使它们在时间敏感的应用如实时应用（real time application）中有价值，而且使它们有在提供最坏情况担保的其他数据结构中作为建造板块的价值；

例如，在计算几何中使用的很多数据结构都可以基于红黑树。

红黑树在函数式编程中也特别有用，在这里它们是最常用的持久数据结构（persistent data structure）之一，它们用来构造关联数组和集合，每次插入、删除之后它们能保持为以前的版本。

除了 `O(lg(n))` 的时间之外，红黑树的持久版本对每次插入或删除需要 `O(lg(n))` 的空间。

红黑树相对于AVL树来说，**牺牲了部分平衡性以换取插入/删除操作时少量的旋转操作，整体来说性能要优于AVL树**。

## 性质

红黑树是每个节点都带有颜色属性的二叉查找树，颜色为红色或黑色。在二叉查找树强制一般要求以外，对于任何有效的红黑树我们增加了如下的额外要求：

1. 节点是红色或黑色。

2. 根是黑色。

3. 所有叶子都是黑色（叶子是NIL节点）。

4. 每个红色节点必须有两个黑色的子节点。（从每个叶子到根的所有路径上不能有两个连续的红色节点。）

5. 从任一节点到其每个叶子的所有简单路径都包含相同数目的黑色节点。

![red-black-image](https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Red-black_tree_example.svg/900px-Red-black_tree_example.svg.png)

## 约束的作用

这些约束确保了红黑树的关键特性：**从根到叶子的最长的可能路径不多于最短的可能路径的两倍长**。

结果是这个树大致上是平衡的。

因为操作比如插入、删除和查找某个值的最坏情况时间都要求与树的高度成比例，这个在高度上的理论上限允许红黑树在最坏情况下都是高效的，而不同于普通的二叉查找树。

要知道为什么这些性质确保了这个结果，注意到性质4导致了路径不能有两个毗连的红色节点就足够了。

最短的可能路径都是黑色节点，最长的可能路径有交替的红色和黑色节点。

因为根据性质5所有最长的路径都有相同数目的黑色节点，这就表明了没有路径能多于任何其他路径的两倍长。

在很多树数据结构的表示中，一个节点有可能只有一个子节点，而叶子节点包含数据。用这种范例表示红黑树是可能的，但是这会改变一些性质并使算法复杂。

为此，本文中我们使用"nil叶子"或"空（null）叶子"，如上图所示，它不包含数据而只充当树在此结束的指示。

这些节点在绘图中经常被省略，导致了这些树好像同上述原则相矛盾，而实际上不是这样。

与此有关的结论是所有节点都有两个子节点，尽管其中的一个或两个可能是空叶子。

# java 实现

## 节点定义

红黑实际上只是两种互斥的颜色，我们这里使用 boolean 变量表示。

```java
/**
 * 颜色标识
 * @since 0.0.5
 */
private static final boolean RED   = false;
private static final boolean BLACK = true;
/**
 * 内部节点
 *
 * @param <V> 泛型
 * @since 0.0.5
 */
private static class Node<V> {
    /**
     * 父亲节点
     * @since 0.0.5
     */
    private Node<V> parent;
    /**
     * 左节点
     * @since 0.0.5
     */
    private Node<V> left;
    /**
     * 右节点
     * @since 0.0.5
     */
    private Node<V> right;
    /**
     * 数据信息
     * @since 0.0.5
     */
    private V data;
    /**
     * 颜色
     */
    private boolean color;

    public Node(V data) {
        this(null, null, null, data, BLACK);
    }

    public Node(Node<V> parent, Node<V> left, Node<V> right, V data, boolean color) {
        this.parent = parent;
        this.left = left;
        this.right = right;
        this.data = data;
        this.color = color;
    }
}
```

## 类定义

```java
public class RedBlackTree<T extends Comparable<? super T>> implements ISortTree<T> {

    private static final Log log = LogFactory.getLog(RedBlackTree.class);

    /**
     * 根节点
     * @since 0.0.5
     */
    private Node<T> root;

    /**
     * 整棵树的大小
     * @since 0.0.5
     */
    private int size;

    /**
     * 构造器
     * 初始化一颗空树
     *
     * @since 0.0.5
     */
    public RedBlackTree() {
        this.root = null;
        this.size = 0;
    }

}
```

## 自平衡策略

对于一棵红黑树的操作最基本的无外乎增删改查，其中查和改都不会改变树的结构，所以与普通平衡二叉树操作无异。

剩下的就是增删操作，插入和删除都会破坏树的结构，不过借助一定的平衡策略能够让树重新满足定义。

平衡策略可以简单概括为三种：左旋转、右旋转，以及变色。

在插入或删除结点之后，只要我们沿着结点到根的路径上执行这三种操作，就可以最终让树重新满足定义。

### 左旋转

这个实际上和 AVL 中的左旋类似：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1129/121508_54166f89_508704.png "rb-leftR.png")

java 实现如下：

```java
/**
 * 对红黑树的节点(x)进行左旋转
 * @param x 节点
 * @since 0.0.5
 */
private void leftRotate(Node<T> x) {
    // 设置x的右孩子为y
    Node<T> y = x.right;
    // 将 “y的左孩子” 设为 “x的右孩子”；
    // 如果y的左孩子非空，将 “x” 设为 “y的左孩子的父亲”
    x.right = y.left;
    if (y.left != null)
        y.left.parent = x;
    // 将 “x的父亲” 设为 “y的父亲”
    y.parent = x.parent;
    if (x.parent == null) {
        this.root = y;            // 如果 “x的父亲” 是空节点，则将y设为根节点
    } else {
        if (x.parent.left == x)
            x.parent.left = y;    // 如果 x是它父节点的左孩子，则将y设为“x的父节点的左孩子”
        else
            x.parent.right = y;    // 如果 x是它父节点的左孩子，则将y设为“x的父节点的左孩子”
    }
    // 将 “x” 设为 “y的左孩子”
    y.left = x;
    // 将 “x的父节点” 设为 “y”
    x.parent = y;
}
```

不过这里多了一个 parent 的处理，所以显得有些复杂。

### 右旋转

这个实际上和 AVL 中的右旋类似：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1129/122525_041834e1_508704.png "rb-rightR.png")

java 实现如下：

```java
/**
 * 对红黑树的节点(y)进行右旋转
 * @param y 节点
 * @since 0.0.5
 */
private void rightRotate(Node<T> y) {
    // 设置x是当前节点的左孩子。
    Node<T> x = y.left;
    // 将 “x的右孩子” 设为 “y的左孩子”；
    // 如果"x的右孩子"不为空的话，将 “y” 设为 “x的右孩子的父亲”
    y.left = x.right;
    if (x.right != null)
        x.right.parent = y;
    // 将 “y的父亲” 设为 “x的父亲”
    x.parent = y.parent;
    if (y.parent == null) {
        this.root = x;            // 如果 “y的父亲” 是空节点，则将x设为根节点
    } else {
        if (y == y.parent.right)
            y.parent.right = x;    // 如果 y是它父节点的右孩子，则将x设为“y的父节点的右孩子”
        else
            y.parent.left = x;    // (y是它父节点的左孩子) 将x设为“x的父节点的左孩子”
    }
    // 将 “y” 设为 “x的右孩子”
    x.right = y;
    // 将 “y的父节点” 设为 “x”
    y.parent = x;
}
```

### 变色

变色非常简单，就是粉转黑和黑转粉两种模式：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1129/123717_e00221e2_508704.png "rb-color.png")

java 实现如下：

```java
/**
 * 变色-直接取反即可
 * @param color 颜色
 * @return 变色后的颜色
 * @since 0.0.5
 */
private boolean changeColor(boolean color) {
    return !color;
}
```

## 添加

将一个节点插入到红黑树中，需要执行哪些步骤呢？首先，将红黑树当作一颗二叉查找树，将节点插入；然后，将节点着色为红色；最后，通过"旋转和重新着色"等一系列操作来修正该树，使之重新成为一颗红黑树。

详细描述如下：

第一步: 将红黑树当作一颗二叉查找树，将节点插入。

红黑树本身就是一颗二叉查找树，将节点插入后，该树仍然是一颗二叉查找树。也就意味着，树的键值仍然是有序的。此外，无论是左旋还是右旋，若旋转之前这棵树是二叉查找树，旋转之后它一定还是二叉查找树。这也就意味着，任何的旋转和重新着色操作，都不会改变它仍然是一颗二叉查找树的事实。

好吧？那接下来，我们就来想方设法的旋转以及重新着色，使这颗树重新成为红黑树！

第二步：将插入的节点着色为"红色"。

为什么着色成红色，而不是黑色呢？为什么呢？

在回答之前，我们需要重新温习一下红黑树的特性：

(1) 每个节点或者是黑色，或者是红色。

(2) 根节点是黑色。

(3) 每个叶子节点是黑色。 (注意：这里叶子节点，是指为空的叶子节点)

(4) 如果一个节点是红色的，则它的子节点必须是黑色的。

(5) 从一个节点到该节点的子孙节点的所有路径上包含相同数目的黑节点。

将插入的节点着色为红色，不会违背"特性(5)"。少违背一条特性，就意味着我们需要处理的情况越少。

接下来，就要努力的让这棵树满足其它性质即可；满足了的话，它就又是一颗红黑树了。

第三步: 通过一系列的旋转或着色等操作，使之重新成为一颗红黑树。

第二步中，将插入节点着色为"红色"之后，不会违背"特性(5)"。

那它到底会违背哪些特性呢？

对于"特性(1)"，显然不会违背了。因为我们已经将它涂成红色了。

对于"特性(2)"，显然也不会违背。在第一步中，我们是将红黑树当作二叉查找树，然后执行的插入操作。而根据二叉查找数的特点，插入操作不会改变根节点。所以，根节点仍然是黑色。

对于"特性(3)"，显然不会违背了。这里的叶子节点是指的空叶子节点，插入非空节点并不会对它们造成影响。

对于"特性(4)"，是有可能违背的！

那接下来，想办法使之"满足特性(4)"，就可以将树重新构造成红黑树了。

### java 实现

这里的 1.1 是为了找到元素待插入的位置，1.2 执行插入。

2 设置元素为红色。

3 执行修正。

```java
/**
 * 将结点插入到红黑树中
 * @param node 节点
 * @since 0.0.5
 */
private void add(Node<T> node) {
    int cmp;
    Node<T> y = null;
    Node<T> x = this.root;
    // 1.1 将红黑树当作一颗二叉查找树，将节点添加到二叉查找树中。
    while (x != null) {
        y = x;
        cmp = node.data.compareTo(x.data);
        if (cmp < 0)
            x = x.left;
        else
            x = x.right;
    }
    // 1.2 找到合适的位置之后，插入新的节点
    node.parent = y;
    if (y != null) {
        cmp = node.data.compareTo(y.data);
        if (cmp < 0)
            y.left = node;
        else
            y.right = node;
    } else {
        this.root = node;
    }

    // 2. 设置节点的颜色为红色
    node.color = RED;

    // 3. 将它重新修正为一颗二叉查找树
    addFixUp(node);
}
```

## 新增修正场景

根据被插入节点的父节点的情况，可以将"当节点z被着色为红色节点，并插入二叉树"划分为三种情况来处理。

（1）情况说明：被插入的节点是根节点。

处理方法：直接把此节点涂为黑色。

（2）情况说明：被插入的节点的父节点是黑色。

处理方法：什么也不需要做。节点被插入后，仍然是红黑树。

（3）情况说明：被插入的节点的父节点是红色。

处理方法：那么，该情况与红黑树的“特性(5)”相冲突。这种情况下，被插入节点是一定存在非空祖父节点的；进一步的讲，被插入节点也一定存在叔叔节点(即使叔叔节点为空，我们也视之为存在，空节点本身就是黑色节点)。

理解这点之后，我们依据"叔叔节点的情况"，将这种情况进一步划分为 3 种情况。

上面三种情况(Case)处理问题的核心思路都是：**将红色的节点移到根节点；然后，将根节点设为黑色。**

下面对它们详细进行介绍。

### 场景1：叔叔是红色

- 现象说明

当前节点(即，被插入节点)的父节点是红色，且当前节点的祖父节点的另一个子节点（叔叔节点）也是红色。

- 处理策略

(01) 将“父节点”设为黑色。

(02) 将“叔叔节点”设为黑色。

(03) 将“祖父节点”设为“红色”。

(04) 将“祖父节点”设为“当前节点”(红色节点)；即，之后继续对“当前节点”进行操作。

下面谈谈为什么要这样处理。(建议理解的时候，通过下面的图进行对比)

“当前节点”和“父节点”都是红色，违背“特性(4)”。所以，将“父节点”设置“黑色”以解决这个问题。

但是，将“父节点”由“红色”变成“黑色”之后，违背了“特性(5)”：因为，包含“父节点”的分支的黑色节点的总数增加了1。  

解决这个问题的办法是：将“祖父节点”由“黑色”变成红色，同时，将“叔叔节点”由“红色”变成“黑色”。

关于这里，说明几点：第一，为什么“祖父节点”之前是黑色？

这个应该很容易想明白，因为在变换操作之前，该树是红黑树，“父节点”是红色，那么“祖父节点”一定是黑色。

第二，为什么将“祖父节点”由“黑色”变成红色，同时，将“叔叔节点”由“红色”变成“黑色”；能解决“包含‘父节点’的分支的黑色节点的总数增加了1”的问题。这个道理也很简单。“包含‘父节点’的分支的黑色节点的总数增加了1” 同时也意味着 “包含‘祖父节点’的分支的黑色节点的总数增加了1”，既然这样，我们通过将“祖父节点”由“黑色”变成“红色”以解决“包含‘祖父节点’的分支的黑色节点的总数增加了1”的问题； 但是，这样处理之后又会引起另一个问题“包含‘叔叔’节点的分支的黑色节点的总数减少了1”，现在我们已知“叔叔节点”是“红色”，将“叔叔节点”设为“黑色”就能解决这个问题。 所以，将“祖父节点”由“黑色”变成红色，同时，将“叔叔节点”由“红色”变成“黑色”；就解决了该问题。

按照上面的步骤处理之后：当前节点、父节点、叔叔节点之间都不会违背红黑树特性，但祖父节点却不一定。若此时，祖父节点是根节点，直接将祖父节点设为“黑色”，那就完全解决这个问题了；若祖父节点不是根节点，那我们需要将“祖父节点”设为“新的当前节点”，接着对“新的当前节点”进行分析。

- 示意图

![输入图片说明](https://images.gitee.com/uploads/images/2020/1129/133424_374712ec_508704.png "屏幕截图.png")

### 场景2：叔叔是黑色，且当前节点是右孩子

- 现象说明

当前节点(即，被插入节点)的父节点是红色，叔叔节点是黑色，且当前节点是其父节点的右孩子

- 处理策略

(01) 将“父节点”作为“新的当前节点”。

(02) 以“新的当前节点”为支点进行左旋。

下面谈谈为什么要这样处理。(建议理解的时候，通过下面的图进行对比)

首先，将“父节点”作为“新的当前节点”；接着，以“新的当前节点”为支点进行左旋。 为了便于理解，我们先说明第(02)步，再说明第(01)步；为了便于说明，我们设置“父节点”的代号为F(Father)，“当前节点”的代号为S(Son)。

为什么要“以F为支点进行左旋”呢？

根据已知条件可知：S是F的右孩子。而之前我们说过，我们处理红黑树的核心思想：将红色的节点移到根节点；然后，将根节点设为黑色。既然是“将红色的节点移到根节点”，那就是说要不断的将破坏红黑树特性的红色节点上移(即向根方向移动)。 而S又是一个右孩子，因此，我们可以通过“左旋”来将S上移！

按照上面的步骤(以F为支点进行左旋)处理之后：若S变成了根节点，那么直接将其设为“黑色”，就完全解决问题了；若S不是根节点，那我们需要执行步骤(01)，即“将F设为‘新的当前节点’”。那为什么不继续以S为新的当前节点继续处理，而需要以F为新的当前节点来进行处理呢？

这是因为“左旋”之后，F变成了S的“子节点”，即S变成了F的父节点；而我们处理问题的时候，需要从下至上(由叶到根)方向进行处理；也就是说，必须先解决“孩子”的问题，再解决“父亲”的问题；所以，我们执行步骤(01)：将“父节点”作为“新的当前节点”。

- 示意图

![输入图片说明](https://images.gitee.com/uploads/images/2020/1129/134128_c6b7838f_508704.png "屏幕截图.png")

### 场景3：叔叔是黑色，且当前节点是左孩子

- 现象说明

当前节点(即，被插入节点)的父节点是红色，叔叔节点是黑色，且当前节点是其父节点的左孩子

- 处理策略

(01) 将“父节点”设为“黑色”。

(02) 将“祖父节点”设为“红色”。

(03) 以“祖父节点”为支点进行右旋。

下面谈谈为什么要这样处理。(建议理解的时候，通过下面的图进行对比)

为了便于说明，我们设置“当前节点”为S(Original Son)，“兄弟节点”为B(Brother)，“叔叔节点”为U(Uncle)，“父节点”为F(Father)，祖父节点为G(Grand-Father)。

S和F都是红色，违背了红黑树的“特性(4)”，我们可以将F由“红色”变为“黑色”，就解决了“违背‘特性(4)’”的问题；但却引起了其它问题：违背特性(5)，因为将F由红色改为黑色之后，所有经过F的分支的黑色节点的个数增加了1。

那我们如何解决“所有经过F分支的黑色节点的个数增加了1”的问题呢？ 

我们可以通过“将G由黑色变成红色”，同时“以G为支点进行右旋”来解决。

- 示意图

![输入图片说明](https://images.gitee.com/uploads/images/2020/1129/134644_cb158bdf_508704.png "屏幕截图.png")

提示：上面的进行Case 3处理之后，再将节点"120"当作当前节点，就变成了Case 2的情况。

## 新增修正实现

java 实现如下：

```java
/**
 * 红黑树插入修正函数
 *
 * 在向红黑树中插入节点之后(失去平衡)，再调用该函数；目的是将它重新塑造成一颗红黑树。
 * @param node 插入节点
 * @since 0.0.5
 */
private void addFixUp(Node<T> node) {
    Node<T> parent, gparent;
    // 若“父节点存在，并且父节点的颜色是红色”
    while (((parent = parentOf(node))!=null) && isRed(parent)) {
        gparent = parentOf(parent);
        //若“父节点”是“祖父节点的左孩子”
        if (parent == gparent.left) {
            // Case 1条件：叔叔节点是红色
            Node<T> uncle = gparent.right;
            if ((uncle!=null) && isRed(uncle)) {
                setBlack(uncle);
                setBlack(parent);
                setRed(gparent);
                node = gparent;
                continue;
            }
            // Case 2条件：叔叔是黑色，且当前节点是右孩子
            if (parent.right == node) {
                Node<T> tmp;
                leftRotate(parent);
                tmp = parent;
                parent = node;
                node = tmp;
            }
            // Case 3条件：叔叔是黑色，且当前节点是左孩子。
            setBlack(parent);
            setRed(gparent);
            rightRotate(gparent);
        } else {    //若“z的父节点”是“z的祖父节点的右孩子”
            // Case 1条件：叔叔节点是红色
            Node<T> uncle = gparent.left;
            if ((uncle!=null) && isRed(uncle)) {
                setBlack(uncle);
                setBlack(parent);
                setRed(gparent);
                node = gparent;
                continue;
            }
            // Case 2条件：叔叔是黑色，且当前节点是左孩子
            if (parent.left == node) {
                Node<T> tmp;
                rightRotate(parent);
                tmp = parent;
                parent = node;
                node = tmp;
            }
            // Case 3条件：叔叔是黑色，且当前节点是右孩子。
            setBlack(parent);
            setRed(gparent);
            leftRotate(gparent);
        }
    }
    // 将根节点设为黑色
    setBlack(this.root);
}
```

用到的几个简单的方法如下：

```java
private Node<T> parentOf(Node<T> node) {
    return node!=null ? node.parent : null;
}
private boolean colorOf(Node<T> node) {
    return node!=null ? node.color : BLACK;
}
private boolean isRed(Node<T> node) {
    return (node != null) && (node.color == RED);
}
private boolean isBlack(Node<T> node) {
    return !isRed(node);
}
private void setBlack(Node<T> node) {
    if (node!=null)
        node.color = BLACK;
}
private void setRed(Node<T> node) {
    if (node!=null)
        node.color = RED;
}
private void setParent(Node<T> node, Node<T> parent) {
    if (node!=null)
        node.parent = parent;
}
private void setColor(Node<T> node, boolean color) {
    if (node!=null)
        node.color = color;
}
```

## 删除元素

将红黑树内的某一个节点删除。

需要执行的操作依次是：首先，将红黑树当作一颗二叉查找树，将该节点从二叉查找树中删除；然后，通过"旋转和重新着色"等一系列来修正该树，使之重新成为一棵红黑树。

详细描述如下：

第一步：将红黑树当作一颗二叉查找树，将节点删除。

这和"删除常规二叉查找树中删除节点的方法是一样的"。

分 3 种情况：

（1）被删除节点没有儿子，即为叶节点。那么，直接将该节点删除就OK了。

（2）被删除节点只有一个儿子。那么，直接删除该节点，并用该节点的唯一子节点顶替它的位置。

（3）被删除节点有两个儿子。那么，先找出它的后继节点；然后把“它的后继节点的内容”复制给“该节点的内容”；之后，删除“它的后继节点”。在这里，后继节点相当于替身，在将后继节点的内容复制给"被删除节点"之后，再将后继节点删除。这样就巧妙的将问题转换为"删除后继节点"的情况了，下面就考虑后继节点。 在"被删除节点"有两个非空子节点的情况下，它的后继节点不可能是双子非空。既然"的后继节点"不可能双子都非空，就意味着"该节点的后继节点"要么没有儿子，要么只有一个儿子。若没有儿子，则按"情况（1）"进行处理；若只有一个儿子，则按"情况（2）"进行处理。

第二步：通过"旋转和重新着色"等一系列来修正该树，使之重新成为一棵红黑树。

因为"第一步"中删除节点之后，可能会违背红黑树的特性。所以需要通过"旋转和重新着色"来修正该树，使之重新成为一棵红黑树。

### java 实现

我们首先查找需要删除的节点，如果存在，才执行删除操作。

```java
@Override
public boolean remove(T data) {
    Node<T> node = search(root, data);
    if(node == null) {
        return false;
    }

    remove(node);
    return true;
}
```

查询节点的实现如下：

```java
/**
 * (递归实现)查找"红黑树x"中键值为key的节点
 * @param x 节点
 * @param key 数据
 * @return 结果
 * @since 0.0.5
 */
private Node<T> search(Node<T> x, T key) {
    if (x==null)
        return x;
    int cmp = key.compareTo(x.data);
    if (cmp < 0)
        return search(x.left, key);
    else if (cmp > 0)
        return search(x.right, key);
    else
        return x;
}
```

删除的实现如下，分别对应删除的 3 种场景。

```java
/**
 * 删除结点(node)
 * @param node 节点
 * @since 0.0.5
 */
private void remove(Node<T> node) {
    Node<T> child, parent;
    boolean color;
    // 被删除节点的"左右孩子都不为空"的情况。
    if ( (node.left!=null) && (node.right!=null) ) {
        // 被删节点的后继节点。(称为"取代节点")
        // 用它来取代"被删节点"的位置，然后再将"被删节点"去掉。
        Node<T> replace = node;
        // 获取后继节点
        replace = replace.right;
        while (replace.left != null)
            replace = replace.left;
        // "node节点"不是根节点(只有根节点不存在父节点)
        if (parentOf(node)!=null) {
            if (parentOf(node).left == node)
                parentOf(node).left = replace;
            else
                parentOf(node).right = replace;
        } else {
            // "node节点"是根节点，更新根节点。
            this.root = replace;
        }
        // child是"取代节点"的右孩子，也是需要"调整的节点"。
        // "取代节点"肯定不存在左孩子！因为它是一个后继节点。
        child = replace.right;
        parent = parentOf(replace);
        // 保存"取代节点"的颜色
        color = colorOf(replace);
        // "被删除节点"是"它的后继节点的父节点"
        if (parent == node) {
            parent = replace;
        } else {
            // child不为空
            if (child!=null)
                setParent(child, parent);
            parent.left = child;
            replace.right = node.right;
            setParent(node.right, replace);
        }
        replace.parent = node.parent;
        replace.color = node.color;
        replace.left = node.left;
        node.left.parent = replace;
        if (color == BLACK)
            removeFixUp(child, parent);
        node = null;
        return ;
    }
    if (node.left !=null) {
        child = node.left;
    } else {
        child = node.right;
    }
    parent = node.parent;
    // 保存"取代节点"的颜色
    color = node.color;
    if (child!=null)
        child.parent = parent;
    // "node节点"不是根节点
    if (parent!=null) {
        if (parent.left == node)
            parent.left = child;
        else
            parent.right = child;
    } else {
        this.root = child;
    }
    if (color == BLACK)
        removeFixUp(child, parent);
    node = null;
}
```

## 删除修正

这里涉及到删除之后的修正，较为麻烦一点。

在分析之前，我们再次温习一下红黑树的几个特性：

(1) 每个节点或者是黑色，或者是红色。

(2) 根节点是黑色。

(3) 每个叶子节点是黑色。(注意：这里叶子节点，是指为空的叶子节点)

(4) 如果一个节点是红色的，则它的子节点必须是黑色的。

(5) 从一个节点到该节点的子孙节点的所有路径上包含相同数目的黑节点。


前面我们将"删除红黑树中的节点"大致分为两步，在第一步中"将红黑树当作一颗二叉查找树，将节点删除"后，可能违反"特性(2)、(4)、(5)"三个特性。

第二步需要解决上面的三个问题，进而保持红黑树的全部特性。

为了便于分析，我们假设"x包含一个额外的黑色"(x原本的颜色还存在)，这样就不会违反"特性(5)"。

为什么呢？

通过RB-DELETE算法，我们知道：删除节点y之后，x占据了原来节点y的位置。 既然删除y(y是黑色)，意味着减少一个黑色节点；那么，再在该位置上增加一个黑色即可。这样，当我们假设"x包含一个额外的黑色"，就正好弥补了"删除y所丢失的黑色节点"，也就不会违反"特性(5)"。 

因此，假设"x包含一个额外的黑色"(x原本的颜色还存在)，这样就不会违反"特性(5)"。

现在，x不仅包含它原本的颜色属性，x还包含一个额外的黑色。即x的颜色属性是"红+黑"或"黑+黑"，它违反了"特性(1)"。

现在，我们面临的问题，由解决"违反了特性(2)、(4)、(5)三个特性"转换成了"解决违反特性(1)、(2)、(4)三个特性"。RB-DELETE-FIXUP需要做的就是通过算法恢复红黑树的特性(1)、(2)、(4)。RB-DELETE-FIXUP的思想是：将x所包含的额外的黑色不断沿树上移(向根方向移动)，直到出现下面的姿态：

a) x指向一个"红+黑"节点。此时，将x设为一个"黑"节点即可。

b) x指向根。此时，将x设为一个"黑"节点即可。

c) 非前面两种姿态。

将上面的姿态，可以概括为3种情况。

（1）情况说明：x是“红+黑”节点。

处理方法：直接把x设为黑色，结束。此时红黑树性质全部恢复。

（2）情况说明：x是“黑+黑”节点，且x是根。

处理方法：什么都不做，结束。此时红黑树性质全部恢复。

（3）情况说明：x是“黑+黑”节点，且x不是根。

处理方法：这种情况又可以划分为4种子情况。

### 场景1：x是"黑+黑"节点，x的兄弟节点是红色

- 现象说明

x是"黑+黑"节点，x的兄弟节点是红色。(此时x的父节点和x的兄弟节点的子节点都是黑节点)。

- 处理策略

(01) 将x的兄弟节点设为“黑色”。

(02) 将x的父节点设为“红色”。

(03) 对x的父节点进行左旋。

(04) 左旋后，重新设置x的兄弟节点。

下面谈谈为什么要这样处理。(建议理解的时候，通过下面的图进行对比)

这样做的目的是将“Case 1”转换为“Case 2”、“Case 3”或“Case 4”，从而进行进一步的处理。对x的父节点进行左旋；左旋后，为了保持红黑树特性，就需要在左旋前“将x的兄弟节点设为黑色”，同时“将x的父节点设为红色”；左旋后，由于x的兄弟节点发生了变化，需要更新x的兄弟节点，从而进行后续处理。

- 示意图

![输入图片说明](https://images.gitee.com/uploads/images/2020/1129/142211_8ba4429a_508704.png "屏幕截图.png")

### 场景2： x是"黑+黑"节点，x的兄弟节点是黑色，x的兄弟节点的两个孩子都是黑色

- 现象说明

x是“黑+黑”节点，x的兄弟节点是黑色，x的兄弟节点的两个孩子都是黑色。

- 处理策略

(01) 将x的兄弟节点设为“红色”。

(02) 设置“x的父节点”为“新的x节点”。

下面谈谈为什么要这样处理。(建议理解的时候，通过下面的图进行对比)

这个情况的处理思想：是将“x中多余的一个黑色属性上移(往根方向移动)”。 

x是“黑+黑”节点，我们将x由“黑+黑”节点 变成 “黑”节点，多余的一个“黑”属性移到x的父节点中，即x的父节点多出了一个黑属性(若x的父节点原先是“黑”，则此时变成了“黑+黑”；若x的父节点原先时“红”，则此时变成了“红+黑”)。 

此时，需要注意的是：所有经过x的分支中黑节点个数没变化；但是，所有经过x的兄弟节点的分支中黑色节点的个数增加了1(因为x的父节点多了一个黑色属性)！

为了解决这个问题，我们需要将“所有经过x的兄弟节点的分支中黑色节点的个数减1”即可，那么就可以通过“将x的兄弟节点由黑色变成红色”来实现。

经过上面的步骤(将x的兄弟节点设为红色)，多余的一个颜色属性(黑色)已经跑到x的父节点中。我们需要将x的父节点设为“新的x节点”进行处理。

若“新的x节点”是“黑+红”，直接将“新的x节点”设为黑色，即可完全解决该问题；若“新的x节点”是“黑+黑”，则需要对“新的x节点”进行进一步处理。

- 示意图

![输入图片说明](https://images.gitee.com/uploads/images/2020/1129/142449_8f155ce8_508704.png "屏幕截图.png")

### 场景3：x是“黑+黑”节点，x的兄弟节点是黑色；x的兄弟节点的左孩子是红色，右孩子是黑色的

- 现象说明

x是“黑+黑”节点，x的兄弟节点是黑色；x的兄弟节点的左孩子是红色，右孩子是黑色的。

- 处理策略

(01) 将x兄弟节点的左孩子设为“黑色”。

(02) 将x兄弟节点设为“红色”。

(03) 对x的兄弟节点进行右旋。

(04) 右旋后，重新设置x的兄弟节点。

下面谈谈为什么要这样处理。(建议理解的时候，通过下面的图进行对比)

我们处理“Case 3”的目的是为了将“Case 3”进行转换，转换成“Case 4”,从而进行进一步的处理。转换的方式是对x的兄弟节点进行右旋；为了保证右旋后，它仍然是红黑树，就需要在右旋前“将x的兄弟节点的左孩子设为黑色”，同时“将x的兄弟节点设为红色”；右旋后，由于x的兄弟节点发生了变化，需要更新x的兄弟节点，从而进行后续处理。

- 示意图

![输入图片说明](https://images.gitee.com/uploads/images/2020/1129/142657_45594bf3_508704.png "屏幕截图.png")

### 场景4：x是“黑+黑”节点，x的兄弟节点是黑色；x的兄弟节点的右孩子是红色的，x的兄弟节点的左孩子任意颜色

- 现象说明

x是“黑+黑”节点，x的兄弟节点是黑色；x的兄弟节点的右孩子是红色的，x的兄弟节点的左孩子任意颜色。

- 处理策略

(01) 将x父节点颜色 赋值给 x的兄弟节点。

(02) 将x父节点设为“黑色”。

(03) 将x兄弟节点的右子节设为“黑色”。

(04) 对x的父节点进行左旋。

(05) 设置“x”为“根节点”。

- 为什么？

下面谈谈为什么要这样处理。(建议理解的时候，通过下面的图进行对比)

我们处理“Case 4”的目的是：去掉x中额外的黑色，将x变成单独的黑色。处理的方式是“：进行颜色修改，然后对x的父节点进行左旋。下面，我们来分析是如何实现的。
为了便于说明，我们设置“当前节点”为S(Original Son)，“兄弟节点”为B(Brother)，“兄弟节点的左孩子”为BLS(Brother's Left Son)，“兄弟节点的右孩子”为BRS(Brother's Right Son)，“父节点”为F(Father)。

我们要对F进行左旋。但在左旋前，我们需要调换F和B的颜色，并设置BRS为黑色。为什么需要这里处理呢？因为左旋后，F和BLS是父子关系，而我们已知BL是红色，如果F是红色，则违背了“特性(4)”；为了解决这一问题，我们将“F设置为黑色”。 但是，F设置为黑色之后，为了保证满足“特性(5)”，即为了保证左旋之后：

第一，“同时经过根节点和S的分支的黑色节点个数不变”。

若满足“第一”，只需要S丢弃它多余的颜色即可。因为S的颜色是“黑+黑”，而左旋后“同时经过根节点和S的分支的黑色节点个数”增加了1；现在，只需将S由“黑+黑”变成单独的“黑”节点，即可满足“第一”。

第二，“同时经过根节点和BLS的分支的黑色节点数不变”。

若满足“第二”，只需要将“F的原始颜色”赋值给B即可。之前，我们已经将“F设置为黑色”(即，将B的颜色"黑色"，赋值给了F)。至此，我们算是调换了F和B的颜色。

第三，“同时经过根节点和BRS的分支的黑色节点数不变”。

在“第二”已经满足的情况下，若要满足“第三”，只需要将BRS设置为“黑色”即可。

经过，上面的处理之后。红黑树的特性全部得到的满足！接着，我们将x设为根节点，就可以跳出while循环(参考伪代码)；即完成了全部处理。

至此，我们就完成了Case 4的处理。

理解Case 4的核心，是了解如何“去掉当前节点额外的黑色”。

- 示意图

![输入图片说明](https://images.gitee.com/uploads/images/2020/1129/142955_1aa2ff6e_508704.png "屏幕截图.png")

### java 实现

删除修正的实现如下：

```java
/**
 * 红黑树删除修正函数
 * @param node 节点
 * @param parent 父节点
 * @since 0.0.5
 */
private void removeFixUp(Node<T> node, Node<T> parent) {
    Node<T> other;
    while ((node==null || isBlack(node)) && (node != this.root)) {
        if (parent.left == node) {
            other = parent.right;
            if (isRed(other)) {
                // Case 1: x的兄弟w是红色的  
                setBlack(other);
                setRed(parent);
                leftRotate(parent);
                other = parent.right;
            }
            if ((other.left==null || isBlack(other.left)) &&
                    (other.right==null || isBlack(other.right))) {
                // Case 2: x的兄弟w是黑色，且w的俩个孩子也都是黑色的  
                setRed(other);
                node = parent;
                parent = parentOf(node);
            } else {
                if (other.right==null || isBlack(other.right)) {
                    // Case 3: x的兄弟w是黑色的，并且w的左孩子是红色，右孩子为黑色。  
                    setBlack(other.left);
                    setRed(other);
                    rightRotate(other);
                    other = parent.right;
                }
                // Case 4: x的兄弟w是黑色的；并且w的右孩子是红色的，左孩子任意颜色。
                setColor(other, colorOf(parent));
                setBlack(parent);
                setBlack(other.right);
                leftRotate(parent);
                node = this.root;
                break;
            }
        } else {
            other = parent.left;
            if (isRed(other)) {
                // Case 1: x的兄弟w是红色的  
                setBlack(other);
                setRed(parent);
                rightRotate(parent);
                other = parent.left;
            }
            if ((other.left==null || isBlack(other.left)) &&
                    (other.right==null || isBlack(other.right))) {
                // Case 2: x的兄弟w是黑色，且w的俩个孩子也都是黑色的  
                setRed(other);
                node = parent;
                parent = parentOf(node);
            } else {
                if (other.left==null || isBlack(other.left)) {
                    // Case 3: x的兄弟w是黑色的，并且w的左孩子是红色，右孩子为黑色。  
                    setBlack(other.right);
                    setRed(other);
                    leftRotate(other);
                    other = parent.left;
                }
                // Case 4: x的兄弟w是黑色的；并且w的右孩子是红色的，左孩子任意颜色。
                setColor(other, colorOf(parent));
                setBlack(parent);
                setBlack(other.left);
                rightRotate(parent);
                node = this.root;
                break;
            }
        }
    }
    if (node!=null)
        setBlack(node);
}
```

# 测试代码

## 测试

```java
public class RedBlackTreeTest {

    private static final int a[] = {10, 40, 30, 60, 90, 70, 20, 50, 80};

    @Test
    public void helloTest() {
        ISortTree<Integer> tree = new RedBlackTree<>();

        for (int i = 0; i < a.length; i++) {
            tree.add(a[i]);
        }

        System.out.println("树的详细信息");
        tree.print();

        // 删除
        tree.remove(10);
        System.out.println("删除 10 之后的详细信息：");
        tree.print();
    }

}
```

### 日志

```
树的详细信息
30(B) is root
10(B) is 30's   left child
20(R) is 10's  right child
60(R) is 30's  right child
40(B) is 60's   left child
50(R) is 40's  right child
80(B) is 60's  right child
70(R) is 80's   left child
90(R) is 80's  right child
删除 10 之后的详细信息：
30(B) is root
20(B) is 30's   left child
60(R) is 30's  right child
40(B) is 60's   left child
50(R) is 40's  right child
80(B) is 60's  right child
70(R) is 80's   left child
90(R) is 80's  right child
```

# 参考资料

[红黑树(一)之 原理和算法详细介绍](https://www.cnblogs.com/skywang12345/p/3245399.html)

[红黑树(五)之 Java的实现](https://www.cnblogs.com/skywang12345/p/3624343.html)

[红黑树](https://zh.wikipedia.org/wiki/%E7%BA%A2%E9%BB%91%E6%A0%91)

[JAVA学习-红黑树详解](https://www.jianshu.com/p/4cd37000f4e3)

[红黑树深入剖析及Java实现](https://tech.meituan.com/redblack_tree.html)

[那些年，面试被虐过的红黑树](https://my.oschina.net/wangzhenchao/blog/1785932)

* any list
{:toc}