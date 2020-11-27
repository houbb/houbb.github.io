---
layout: post
title:  Tree-02-AVL 自平衡二叉查找树
date:  2020-10-17 16:15:55 +0800
categories: [Data-Struct]
tags: [data-struct, tree, sf]
published: true
---

# AVL树

AVL树是根据它的发明者G.M. Adelson-Velsky和E.M. Landis命名的。

它是最先发明的自平衡二叉查找树（Self-balancing binary search tree），也被称为高度平衡树。

相比于"二叉查找树"，它的特点是：

**AVL树中任何节点的两个子树的高度最大差别为1。**

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/103710_25594b20_508704.png "屏幕截图.png")

## 平衡因子

某结点的左子树与右子树的高度(深度)差即为该结点的平衡因子（BF,Balance Factor）。

平衡二叉树上所有结点的平衡因子只可能是 -1，0 或 1。

如果某一结点的平衡因子绝对值大于1则说明此树不是平衡二叉树。

为了方便计算每一结点的平衡因子我们可以为每个节点赋予height这一属性，表示此节点的高度。

# 实现

## 节点定义

```java
private class Node{
	public E e;
	public Node left;
	public Node right;
	public int height;
	public Node(E e){
		this.e = e;
		this.left = null;
		this.right = null;
		this.height = 1;
	}
}
```

## 类定义

```java
/**
 * AVLTree是BST，所以节点值必须是可比较的
 */
public class AvlTree<E extends Comparable<E>>{

    private Node root;

	private int size;

	public AvlTree(){
		root=null;
		size=0;
	}

}
```


## 基础方法

```java
//获取某一结点的高度
private int getHeight(Node node){
	if(node==null){
		return 0;
	}
	return node.height;
}

public int getSize(){
	return size;
}

public boolean isEmpty(){
	return size == 0;
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
```

## 添加节点

往平衡二叉树中添加节点很可能会导致二叉树失去平衡，所以我们需要在每次插入节点后进行平衡的维护操作。

插入节点破坏平衡性有如下四种情况：

### LL（右旋）

LL的意思是向左子树（L）的左孩子（L）中插入新节点后导致不平衡，这种情况下需要右旋操作，而不是说LL的意思是右旋，后面的也是一样。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/111633_306a03a3_508704.png "屏幕截图.png")

我们将这种情况抽象出来，得到下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/112052_82241c1e_508704.png "屏幕截图.png")

我们需要对节点y进行平衡的维护。步骤如下图所示：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/112212_6dd6af5a_508704.png "屏幕截图.png")

```java
/**
 * 右旋转
 */
private Node rightRotate(Node y){
	Node x = y.left;
	Node t3 = x.right;
	x.right = y;
	y.left = t3;
	//更新height
	y.height = Math.max(getHeight(y.left),getHeight(y.right))+1;
	x.height = Math.max(getHeight(x.left),getHeight(x.right))+1;
	return x;
}
```

ps: 这里也需要考虑一下 root 节点的变更。

### RR（左旋）

这个和 LL 类似，只不过方向相反。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/112444_589e0f38_508704.png "屏幕截图.png")

我们将这种情况抽象出来，得到下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/112510_b4e11bca_508704.png "屏幕截图.png")

我们需要对节点y进行平衡的维护。步骤如下图所示：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/112527_6d0bc59e_508704.png "屏幕截图.png")

```java
/**
 * 左旋转
 */
private Node leftRotate(Node y){
	Node x = y.right;
	Node t2 = x.left;
	x.left = y;
	y.right = t2;
	//更新height
	y.height = Math.max(getHeight(y.left),getHeight(y.right))+1;
	x.height = Math.max(getHeight(x.left),getHeight(x.right))+1;
	return x;
}
```


### LR 

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/112746_cf5d444a_508704.png "屏幕截图.png")

我们将这种情况抽象出来，得到下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/112800_0c98b25f_508704.png "屏幕截图.png")

我们需要对节点y进行平衡的维护。步骤如下图所示：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/112817_6f04cda6_508704.png "屏幕截图.png")

第三个图中x和z反了，失误

### RL

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/113249_f70a793c_508704.png "屏幕截图.png")

我们将这种情况抽象出来，得到下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/132442_432aded1_508704.png "屏幕截图.png")

我们需要对节点y进行平衡的维护。

步骤如下图所示：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1127/132500_40c20330_508704.png "屏幕截图.png")

第二个图中y的左孩子为T1，第三个图中x和z反了，孩子也错了，应该是从左至右T1，T2，T3，T4，失误。。。

```java
// 向二分搜索树中添加新的元素(key, value)
public void add(E e){
	root = add(root, e);
}

// 向以node为根的二分搜索树中插入元素(key, value)，递归算法
// 返回插入新节点后二分搜索树的根
private Node add(Node node, E e){
	if(node == null){
		size ++;
		return new Node(e);
	}
	if(e.compareTo(node.e) < 0)
		node.left = add(node.left, e);
	else if(e.compareTo(node.e) > 0)
		node.right = add(node.right, e);
	//更新height
	node.height = 1+Math.max(getHeight(node.left),getHeight(node.right));
	//计算平衡因子
	int balanceFactor = getBalanceFactor(node);
	if(balanceFactor > 1 && getBalanceFactor(node.left)>0) {
		//右旋LL
		return rightRotate(node);
	}
	if(balanceFactor < -1 && getBalanceFactor(node.right)<0) {
		//左旋RR
		return leftRotate(node);
	}
	//LR
	if(balanceFactor > 1 && getBalanceFactor(node.left) < 0){
		node.left = leftRotate(node.left);
		return rightRotate(node);
	}
	//RL
	if(balanceFactor < -1 && getBalanceFactor(node.right) > 0){
		node.right = rightRotate(node.right);
		return leftRotate(node);
	}
	return node;
}
```

## 删除操作

在删除AVL树节点前需要知道二分搜索树的节点删除操作，和二分搜索树删除节点不同的是我们删除AVL树的节点后需要进行平衡的维护操作。

```java
public E remove(E e){
	Node node = getNode(root, e);
	if(node != null){
		root = remove(root, e);
		return node.e;
	}
	return null;
}

private Node remove(Node node, E e){

	if( node == null )
		return null;
	Node retNode;
	if( e.compareTo(node.e) < 0 ){
		node.left = remove(node.left , e);
		retNode = node;
	}
	else if(e.compareTo(node.e) > 0 ){
		node.right = remove(node.right, e);
		retNode = node;
	}
	else{   // e.compareTo(node.e) == 0
		// 待删除节点左子树为空的情况
		if(node.left == null){
			Node rightNode = node.right;
			node.right = null;
			size --;
			retNode = rightNode;
		}
		// 待删除节点右子树为空的情况
		else if(node.right == null){
			Node leftNode = node.left;
			node.left = null;
			size --;
			retNode = leftNode;
		}else {
			// 待删除节点左右子树均不为空的情况
			// 找到比待删除节点大的最小节点, 即待删除节点右子树的最小节点
			// 用这个节点顶替待删除节点的位置
			Node successor = minimum(node.right);
			successor.right = remove(node.right, successor.e);
			successor.left = node.left;

			node.left = node.right = null;

			retNode = successor;
		}
	}
	if(retNode==null)
		return null;
	//维护平衡
	//更新height
	retNode.height = 1+Math.max(getHeight(retNode.left),getHeight(retNode.right));
	//计算平衡因子
	int balanceFactor = getBalanceFactor(retNode);
	if(balanceFactor > 1 && getBalanceFactor(retNode.left)>=0) {
		//右旋LL
		return rightRotate(retNode);
	}
	if(balanceFactor < -1 && getBalanceFactor(retNode.right)<=0) {
		//左旋RR
		return leftRotate(retNode);
	}
	//LR
	if(balanceFactor > 1 && getBalanceFactor(retNode.left) < 0){
		node.left = leftRotate(retNode.left);
		return rightRotate(retNode);
	}
	//RL
	if(balanceFactor < -1 && getBalanceFactor(retNode.right) > 0){
		node.right = rightRotate(retNode.right);
		return leftRotate(retNode);
	}
	return retNode;
}
```

# 小结

# 参考资料

[详细图文——AVL树](https://blog.csdn.net/qq_25343557/article/details/89110319)

[AVL树(一)之 图文解析 和 C 语言的实现](https://www.cnblogs.com/skywang12345/p/3576969.html)

[图解数据结构树之AVL树](https://www.cnblogs.com/zhuwbox/p/3636783.html)

[数据结构之AVL树](http://dongxicheng.org/structure/avl/)

* any list
{:toc}

