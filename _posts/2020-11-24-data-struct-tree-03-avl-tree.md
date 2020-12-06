---
layout: post
title:  Tree-03-图解 AVL 自平衡二叉查找树及 java 实现
date:  2020-10-17 16:15:55 +0800
categories: [Data-Struct]
tags: [data-struct, tree, sf]
published: true
---

![思维导图](https://p6-tt-ipv6.byteimg.com/origin/pgc-image/cca555274e614d54a34ea237b477d3cb)

# AVL树

AVL树是根据它的发明者G.M. Adelson-Velsky和E.M. Landis命名的。

它是最先发明的自平衡二叉查找树（Self-balancing binary search tree），也被称为高度平衡树。

相比于"二叉查找树"，它的特点是：**AVL树中任何节点的两个子树的高度最大差别为1。**

## 例子

AVL 平衡树

```
   5
 2   7
1 3 6 9
```

不平衡的树：

```
1
 2
  3
   4
    5
     6
      7
```

## 平衡因子

某结点的左子树与右子树的高度(深度)差即为该结点的平衡因子（BF,Balance Factor）。

平衡二叉树上所有结点的平衡因子只可能是 -1，0 或 1。

如果某一结点的平衡因子绝对值大于1则说明此树不是平衡二叉树。

为了方便计算每一结点的平衡因子我们可以为每个节点赋予height这一属性，表示此节点的高度。

# 实现

## 节点定义

```java
/**
 * 内部节点
 *
 * @param <V> 泛型
 * @since 0.0.5
 */
private static class Node<V> {
    /**
     * 左节点
     *
     * @since 0.0.5
     */
    private Node<V> left;
    /**
     * 右节点
     *
     * @since 0.0.5
     */
    private Node<V> right;
    /**
     * 数据信息
     *
     * @since 0.0.5
     */
    private V data;
    /**
     * 当前元素所在的高度
     *
     * @since 0.0.5
     */
    private int height;
    public Node(V data) {
        this.data = data;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}
```

经过老马的实战，感觉还是定义为内部类实现起来更加自然。

如果通过外部的 getter/setter 操作属性，代码会变得不那么直观。

## 类定义

这个和 BST 一样，我们继承自 ISortTree 接口。

所有的元素必须是 Comparable 的子类。

```java
/**
 * avl 平衡树
 *
 * @author 老马啸西风
 * @since 0.0.5
 */
public class AvlTree<V extends Comparable<? super V>> implements ISortTree<V> {
	/**
     * 根节点
     *
     * @since 0.0.5
     */
    private Node<V> root;

    /**
     * 整棵树的大小
     *
     * @since 0.0.5
     */
    private int size;


    /**
     * 构造器
     * <p>
     * 初始化一颗空树
     *
     * @since 0.0.5
     */
    public AvlTree() {
        this.root = null;
        this.size = 0;
    }
}
```


## 是否平衡

直接根据左右节点的高度计差值即可，这里新增了一个高度的概念，让实现变得非常简单。

```java
/**
 * 获取节点的平衡因子
 * @param node
 * @return
 */
private int getBalanceFactor(Node node){
	if(node==null){
		return 0;
	}
	return getHeight(node.left)-getHeight(node.right);
}

//判断树是否为平衡二叉树
public boolean isBalanced(){
	return isBalanced(root);
}

private boolean isBalanced(Node node){
	if(node==null){
		return true;
	}
	int balanceFactory = Math.abs(getBalanceFactor(node));
	if(balanceFactory>1){
		return false;
	}
	return isBalanced(node.left)&&isBalanced(node.right);
}

/**
 * 获取当前节点的高度
 *
 * @param node 节点
 * @return 高度
 * @since 0.0.5
 */
private int getHeight(Node<V> node) {
    if (node == null) {
        return 0;
    }
    return node.height;
}
```

## 添加节点

往平衡二叉树中添加节点很可能会导致二叉树失去平衡，所以我们需要在每次插入节点后进行平衡的维护操作。

记住：我们所做的一切都是为了**维持树的平衡**。

理解了下面的 4 个场景，也就理解了 AVL 树。

插入节点破坏平衡性有如下四种情况：

### LL（右旋）

LL的意思是向左子树（L）的左孩子（L）中插入新节点后导致不平衡，这种情况下需要右旋操作，而不是说LL的意思是右旋，后面的也是一样。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1128/183401_3927efc9_508704.png "avl-ll.png")

我们将这种情况抽象出来，得到下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1128/183444_8d97ac97_508704.png "avl-ll-右旋.png")

代码实现如下:

```java
/**
 * 右旋
 *
 * @since 0.0.5
 */
private Node<V> rightRotate(Node<V> y) {
    Node<V> x = y.left;
    Node<V> t3 = x.right;
    x.right = y;
    y.left = t3;
    //更新height
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;

	// 更新根节点
    if(y == root) {
        this.root = x;
    }
    return x;
}
```

ps: 经过老马自测，更新根节点是必须的，否则会导致后续遍历 root 节点错乱。

### RR（左旋）

这个和 LL 类似，只不过方向相反。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1128/183535_c6934fe4_508704.png "avl-rr.png")

我们将这种情况抽象出来，得到下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1128/183617_c30cb306_508704.png "avl-rr-左旋.png")

代码实现如下：

```java
/**
 * 左旋
 *
 * @since 0.0.5
 */
private Node<V> leftRotate(Node<V> y) {
    Node<V> x = y.right;
    Node<V> t3 = x.left;
    x.left = y;
    y.right = t3;
    //更新height
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;

	// 更新根节点
    if(y == root) {
        this.root = x;
    }
    return x;
}
```

### LR 

场景如下：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1128/183648_4465a6ca_508704.png "avl-lr.png")

我们将这种情况抽象出来，得到下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1128/183712_1e4df464_508704.png "avl-lr-左旋-右旋.png")

### RL

场景如下：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1128/183846_c1f5c4e8_508704.png "avl-rl.png")

我们将这种情况抽象出来，得到下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1128/183905_34f5326c_508704.png "avl-rl-右旋-左旋.png")

### 完整的添加实现

各位小伙伴，可以将下面的代码对照上面的四种场景进行理解。

```java
@Override
public void add(V data) {
    this.root = add(root, data);
}

/**
 * 插入元素
 *
 * @param node 节点
 * @param v    待插入元素
 * @return 结果
 * @since 0.0.5
 */
private Node<V> add(Node<V> node, V v) {
    if (node == null) {
        size++;
        return new Node<>(v);
    }
    if (v.compareTo(node.data) < 0) {
        node.left = add(node.left, v);
    } else if (v.compareTo(node.data) > 0) {
        node.right = add(node.right, v);
    }
    //更新height
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    //计算平衡因子
    int balanceFactor = getBalanceFactor(node);
    if (balanceFactor > 1 && getBalanceFactor(node.left) > 0) {
        //右旋LL
        return rightRotate(node);
    }
    if (balanceFactor < -1 && getBalanceFactor(node.right) < 0) {
        //左旋RR
        return leftRotate(node);
    }
    //LR
    if (balanceFactor > 1 && getBalanceFactor(node.left) < 0) {
        node.left = leftRotate(node.left);
        return rightRotate(node);
    }
    //RL
    if (balanceFactor < -1 && getBalanceFactor(node.right) > 0) {
        node.right = rightRotate(node.right);
        return leftRotate(node);
    }
    return node;
}
```

## 删除操作

在删除AVL树节点前需要知道二分搜索树的节点删除操作，和二分搜索树删除节点不同的是我们删除AVL树的节点后需要进行平衡的维护操作。

```java
@Override
public boolean remove(V data) {
    Node<V> node = getNode(root, data);
    if (node != null) {
        root = remove(root, data);
        return true;
    }
    return false;
}
/**
 * 返回以node为根节点的二分搜索树中，key所在的节点
 *
 * @param node 节点
 * @param v    元素
 * @return 结果
 * @since 0.0.5
 */
private Node<V> getNode(Node<V> node, V v) {
    if (node == null) {
        return null;
    }
    if (v.equals(node.data)) {
        return node;
    } else if (v.compareTo(node.data) < 0) {
        return getNode(node.left, v);
    } else {
        return getNode(node.right, v);
    }
}
/**
 * 返回以node为根的二分搜索树的最小值所在的节点
 * <p>
 * ps: 实际上就是最左子树
 *
 * @param node 节点
 * @return 结果
 * @since 0.0.5
 */
private Node<V> getMiniNode(Node<V> node) {
    if (node.left == null) {
        return node;
    }
    return getMiniNode(node.left);
}
/**
 * 删除一个元素
 *
 * @param node 节点
 * @param v    元素
 * @return 结果
 */
private Node<V> remove(Node<V> node, V v) {
    if (node == null) {
        return null;
    }
    Node<V> retNode;
    if (v.compareTo(node.data) < 0) {
        node.left = remove(node.left, v);
        retNode = node;
    } else if (v.compareTo(node.data) > 0) {
        node.right = remove(node.right, v);
        retNode = node;
    } else {   // e.compareTo(node.e) == 0
        // 待删除节点左子树为空的情况
        if (node.left == null) {
            Node<V> rightNode = node.right;
            node.right = null;
            size--;
            retNode = rightNode;
        }
        // 待删除节点右子树为空的情况
        else if (node.right == null) {
            Node<V> leftNode = node.left;
            node.left = null;
            size--;
            retNode = leftNode;
        } else {
            // 待删除节点左右子树均不为空的情况
            // 找到比待删除节点大的最小节点, 即待删除节点右子树的最小节点
            // 用这个节点顶替待删除节点的位置
            Node<V> successor = getMiniNode(node.right);
            successor.right = remove(node.right, successor.data);
            successor.left = node.left;
            node.left = node.right = null;
            retNode = successor;
        }
    }
    if (retNode == null) {
        return null;
    }
    //维护平衡
    //更新height
    retNode.height = 1 + Math.max(getHeight(retNode.left), getHeight(retNode.right));
    //计算平衡因子
    int balanceFactor = getBalanceFactor(retNode);
    if (balanceFactor > 1 && getBalanceFactor(retNode.left) >= 0) {
        //右旋LL
        return rightRotate(retNode);
    }
    if (balanceFactor < -1 && getBalanceFactor(retNode.right) <= 0) {
        //左旋RR
        return leftRotate(retNode);
    }
    //LR
    if (balanceFactor > 1 && getBalanceFactor(retNode.left) < 0) {
        node.left = leftRotate(retNode.left);
        return rightRotate(retNode);
    }
    //RL
    if (balanceFactor < -1 && getBalanceFactor(retNode.right) > 0) {
        node.right = rightRotate(retNode.right);
        return leftRotate(retNode);
    }
    return node;
}
```

# 测试

## 准备工作

为了便于大家直观的理解，我们在左旋/右旋执行前后，输出一下树的信息。

```java
/**
 * 右旋
 *
 * @since 0.0.5
 */
private Node<V> rightRotate(Node<V> y) {
    System.out.println("右旋执行前：");
    print();

    Node<V> x = y.left;
    Node<V> t3 = x.right;
    y.left = t3;
    x.right = y;
    //更新height
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    // 更新根节点
    if(y == root) {
        this.root = x;
    }

    System.out.println("右旋执行后：");
    print();
    return x;
}

/**
 * 左旋
 *
 * @since 0.0.5
 */
private Node<V> leftRotate(Node<V> y) {
    System.out.println("左旋执行前：");
    print();

    Node<V> x = y.right;
    Node<V> t3 = x.left;
    x.left = y;
    y.right = t3;
    //更新height
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    // 更新根节点
    if(y == root) {
        this.root = x;
    }

    System.out.println("左旋执行后：");
    print();
    return x;
}
```

## 测试

### ll-右旋场景

```java
/**
 * ll-右旋测试
 */
@Test
public void llTest() {
    AvlTree<Integer> avlTree = new AvlTree<>();
    avlTree.add(3);
    avlTree.add(2);
    avlTree.add(1);
}
```

日志如下：

```
右旋执行前：
  3
 2
1
右旋执行后：
 2
1 3
```

### rr-左旋测试

```java
/**
 * rr-左旋测试
 */
@Test
public void rrTest() {
    AvlTree<Integer> avlTree = new AvlTree<>();
    avlTree.add(1);
    avlTree.add(2);
    avlTree.add(3);
}
```

日志如下：

```
左旋执行前：
1
 2
  3
左旋执行后：
 2
1 3
```

### LR-左旋右旋测试

```java
/**
 * lr-左旋+右旋测试
 */
@Test
public void lrTest() {
    AvlTree<Integer> avlTree = new AvlTree<>();
    avlTree.add(3);
    avlTree.add(1);
    avlTree.add(2);
}
```

日志如下：

```
左旋执行前：
  3
1
 2
左旋执行后：
 3
1
2
右旋执行前：
  3
 2
1
右旋执行后：
 2
1 3
```

可以看到这里首先执行了左旋，让其编程 ll 的形式。

### RL-右旋左旋测试

```java
/**
 * rl-右旋+左旋测试
 */
@Test
public void rlTest() {
    AvlTree<Integer> avlTree = new AvlTree<>();
    avlTree.add(1);
    avlTree.add(3);
    avlTree.add(2);
}
```

日志如下：

```
右旋执行前：
1
  3
 2
右旋执行后：
1
 3
  2
左旋执行前：
1
 2
  3
左旋执行后：
 2
1 3
```

首先执行右旋变成 rr，然后执行左旋。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

当然实现平衡树的方法有很多种，下一节我们一起学习一下大名鼎鼎的红黑树。

# 参考资料

[详细图文——AVL树](https://blog.csdn.net/qq_25343557/article/details/89110319)

[AVL树(一)之 图文解析 和 C 语言的实现](https://www.cnblogs.com/skywang12345/p/3576969.html)

[图解数据结构树之AVL树](https://www.cnblogs.com/zhuwbox/p/3636783.html)

[数据结构之AVL树](http://dongxicheng.org/structure/avl/)

* any list
{:toc}