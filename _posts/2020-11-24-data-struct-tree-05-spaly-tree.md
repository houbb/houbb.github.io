---
layout: post
title: Tree-05-伸展树 Splay Tree 及 java 实现
date:  2020-10-17 16:15:55 +0800
categories: [Data-Struct]
tags: [data-struct, java, sh]
published: true
---

# 伸展树

伸展树（英语：Splay Tree）是一种能够自我平衡的二叉查找树，它能在均摊 `O(log n)` 的时间内完成基于伸展（Splay）操作的插入、查找、修改和删除操作。

它是由丹尼尔·斯立特（Daniel Sleator）和罗伯特·塔扬在1985年发明的。

## 核心思想

考虑到局部性原理（刚被访问的内容下次可能仍会被访问，查找次数多的内容可能下一次会被访问），为了使整个查找时间更小，被查频率高的那些节点应当经常处于靠近树根的位置。

ps: 这个思想实际上非常的简单，也非常的实用。我们以前实现的 LFU 的思想是类似的。

## 操作方案

每次查找节点之后对树进行重构，把被查找的节点搬移到树根，这种自调整形式的二叉查找树就是伸展树。每次对伸展树进行操作后，它均会通过旋转的方法把被访问节点旋转到树根的位置。

它的优势在于不需要记录用于平衡树的冗余信息。

为了将当前被访问节点旋转到树根，我们通常将节点自底向上旋转，直至该节点成为树根为止。

“旋转”的巧妙之处就是在不打乱数列中数据大小关系（指中序遍历结果是全序的）情况下，所有基本操作的平摊复杂度仍为O（log n）。

# 优缺点

## 优点

伸展树的自我平衡使其拥有良好的性能，因为频繁访问的节点会被移动到更靠近根节点，进而获得更快的访问速度。

可靠的性能——它的平均效率不输于其他平衡树。

存储所需的内存少——伸展树无需记录额外的什么值来维护树的信息，相对于其他平衡树，内存占用要小。

编程实现起来，也比红黑树要容易很多。

## 缺点

伸展树最显著的缺点是它有可能会变成一条链。

例如，在以非递减顺序访问全部n个之后就会出现这种情况。此时树的高度对应于最坏情况的时间效率，操作的实际时间效率可能很低。

然而均摊的最坏情况是对数级的——`O(log n)`。

**即使以“只读”方式（例如通过查找操作）访问伸展树，其结构也可能会发生变化。**

这使得伸展树在多线程环境下会变得很复杂。具体而言，如果允许多个线程同时执行查找操作，则需要额外的维护和操作。这也使得它们不适合在纯粹的函数式编程中普遍使用，尽管用于实现优先级队列的方式不多。

# 操作

## 伸展(splay)

当一个节点x被访问过后，伸展操作会将x移动到根节点。

为了进行伸展操作，我们会进行一系列的旋转，每次旋转会使x离根节点更近。

通过每次访问节点后的伸展操作，最近访问的节点都会离根节点更近，且伸展树也会大致平衡，这样我们就可以得到期望均摊时间复杂度的下界——均摊 `O(log n)`。

每次旋转操作由三个因素决定：

1. x 是其父节点p的左儿子还是右儿子；

2. p 是否为根；

3. p 是其父节点g（x的祖父节点）的左儿子还是右儿子。

在每次旋转操作后，设置g的儿子为x是很重要的。

如果g为空，那么x显然就是根节点了。

共有三种旋转操作，每种都有左旋（Zig）和右旋（Zag）两种情况。

为了简单起见，对每种旋转操作只展示一种情况。

这些旋转操作是：

Zig：当p为根节点时进行。Zig通常只在伸展操作的最后一步进行。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1202/211553_c95b43f8_508704.png "屏幕截图.png")

Zig-zig和Zag-zag：当p不为根节点且x和p都为左儿子或都为右儿子时进行。

下图为x和p都为左儿子时的情况（即Zig-zig），需先将p右旋到g的位置，再将x右旋到p的位置。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1202/212218_09c9b649_508704.png "屏幕截图.png")

Zig-zag和Zag-zig：当p不为根节点且x为左儿子而p为右儿子时进行，反之亦然。

下图为前述情况（即Zig-zag），需先将x左旋到p到的位置，再将x右旋到g的位置。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1202/212243_b4ad31f0_508704.png "屏幕截图.png")

## 连接(join)	

给出两棵树S和T，且S的所有元素都比T的元素要小。

下面的步骤可以把它们连接成一棵树：

1. 伸展S中最大的节点。现在这个节点变为S的根节点，且没有右儿子。

2. 令T的根节点变为其右儿子。

## 	分割(split)	

给出一棵树和一个元素x，返回两棵树：一棵中所有的元素均小于等于x，另一棵中所有的元素大于x。下面的步骤可以完成这个操作：

- 伸展x。这样的话x成为了这棵树的根所以它的左子树包含了所有比x小的元素，右子树包含了所有比x大的元素。

- 把 x 的右子树从树中分割出来。

## 	插入(insert)	

插入操作是一个比较复杂的过程，具体步骤如下: 我们假定要插入的值为k。

1. 如果当前树为空，则直接插入根。

2. 如果当前节点的权值等于k则增加当前节点的大小并更新节点和父亲的信息，将当前节点进行splay操作。

3. 否则按照二叉查找树的性质向下找，找到空节点就插入即可，当然在最后还要进行一次splay操作。

# C 语言实现图解

## 节点结构定义

```c++
typedef struct SplayNode *Tree;
typedef int ElementType;
struct SplayNode
{
    Tree parent; //该结点的父节点，方便操作
    ElementType val; //结点值
    Tree lchild;
    Tree rchild;
    SplayNode(int val=0) //默认构造函数
    {
        parent=NULL;
        lchild=rchild=NULL;
        this->val=val;
    }
};
```

## 旋转操作

### 单 R 型

![输入图片说明](https://images.gitee.com/uploads/images/2020/1202/214928_d44befa9_508704.png "屏幕截图.png")

什么叫单R型呢，在上图中，我们查找的元素是9,其父节点是7，并且7是根结点，查找结点是其父节点的右孩子，而且把9变成根结点只需一次左旋转即可（即将9提升一层），这样的情况我们叫单R型，经过一次左旋转后结点9替代了原来的根结点7，变成新的根结点（注意这里因为图简单，9最终变成了根结点，在树复杂的情况，一般不会一次就变成了根结点，但肯定会变成原子树的根，这也就是程序中说的当前子树中的新根）。

为了后面更加轻松，这里把单左旋代码贴出，可以对比图示和代码分析分析，便于理解

```c++
//单左旋操作
//参数:根，旋转结点(旋转中心)
//返回:当前子树中的新根
Tree left_single_rotate(Tree &root,Tree node)
{
    if (node==NULL)
        return NULL;
    Tree parent=node->parent; //其父结点
    Tree grandparent=parent->parent; //其祖父结点
    parent->rchild=node->lchild; //设置其父节点的右孩子
    if (node->lchild) //如果有左孩子则更新node结点左孩子的父节点信息
        node->lchild->parent=parent;
    node->lchild=parent; //更新node结点的左孩子信息
    parent->parent=node; //更新原父节点的信息
    node->parent=grandparent;
    
    if (grandparent) //更新祖父孩子结点的信息
    {
        
        if (grandparent->lchild==parent)
            grandparent->lchild=node;
        else
            grandparent->rchild=node;
    }
    else //不存在祖父节点，则原父节点为根，那么旋转后node为根
        root=node;
    return node;
}
```

### 单 L 型

![输入图片说明](https://images.gitee.com/uploads/images/2020/1202/215225_d3358fcf_508704.png "屏幕截图.png")

单L型和单R型是对称的，也就是说查找结点3是其父节点的左子树，并且其父节点是根结点，这样一次右旋转后3就是根结点了。

```c++
//单右旋操作
//参数:根，旋转结点(旋转中心)
//返回:当前子树中的新根
Tree right_single_rotate(Tree &root,Tree node)
{
    if (node==NULL)
        return NULL;
    Tree parent,grandparent;
    parent=node->parent;
    grandparent=parent->parent;
    parent->lchild=node->rchild;
    if (node->rchild)
        node->rchild->parent=parent;
    node->rchild=parent;
    parent->parent=node;
    node->parent=grandparent;
    if (grandparent)
    {
        if (grandparent->lchild==parent)
            grandparent->lchild=node;
        else
            grandparent->rchild=node;
    }
    else
        root=node;
    return node;
 
}
```

### RR 型

![输入图片说明](https://images.gitee.com/uploads/images/2020/1202/215306_31ad1306_508704.png "屏幕截图.png")

所谓RR型，简单点说就是两次R型，两次左旋转，这种情况是查找结点有父节点，同时也有祖父结点，并且三则在同右侧，这种就是RR型，针对这种情况，先把查找结点的父节点旋转一次，即提升一层，然后再以查找结点再次旋转，这样查找结点就到了根结点了，都是左旋转，只是旋转对象不一样罢了。

```c++
//两次单左旋操作
//参数：根，最后将变成子树根结点的结点
void left_double_rotate(Tree &root,Tree node)
{
    left_single_rotate(root,node->parent);
    left_single_rotate(root,node);
}
```

### LL 型

![输入图片说明](https://images.gitee.com/uploads/images/2020/1202/215405_eb60efef_508704.png "屏幕截图.png")

```c++
//两次单右旋操作
//参数：根，最后将变成子树根结点的结点
void right_double_rotate(Tree &root,Tree node)
{
    right_single_rotate(root,node->parent); //先提升其父节点
    right_single_rotate(root,node);         //最后提升自己
}
```

LL型和RR型是对称的，经过一次双右旋结果如上图，但是这样就结束了吗？

回想一下，伸展树的旋转操作目的是干什么，不是为了把查找结点推送至树根么，是的，但是现在这种情况结点9还不是树根，但是这种情况不是我们前面讲过的单R型吗？

所以再来次左旋就可以了，也就是下面这个样子：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1202/215455_c7ee7d74_508704.png "屏幕截图.png")

### RL 型

![输入图片说明](https://images.gitee.com/uploads/images/2020/1202/215513_f0332192_508704.png "屏幕截图.png")

```c++
//双旋操作（RL型），于AVL树类似
//参数：根，最后将变成子树根结点的结点
void RL_rotate(Tree&root,Tree node)
{
    right_single_rotate(root,node); //先右后左
    left_single_rotate(root,node);
}
```

这个和AVL树中的RL是一样的，旋转完成后，还需要一步左旋：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1202/215538_3fcf9842_508704.png "屏幕截图.png")

### LR 型

![输入图片说明](https://images.gitee.com/uploads/images/2020/1202/215554_3afd3ca9_508704.png "屏幕截图.png")

```c++
//双旋操作（LR型），于AVL树类似
//参数：根，最后将变成子树根结点的结点
void LR_rotate(Tree &root,Tree node)
{
    left_single_rotate(root,node); //先左
    right_single_rotate(root,node);//后右
}
```

OK，到这里伸展树的几种情况就介绍完了，怎么这么多旋转方式，其实大可不必这样，这个只是我学习的时候自己总结的，和网上的也打不相同，主要是自己理解了它的旋转方式后，就好了，至于命名这些都影响不大，我这里把它们分为这几种的方式，主要是为了封装成函数，方便我的调用，这样逻辑更清楚一下，自己懂了以后就可以根据自己理解来组织代码了。

## 伸展树的操作

伸展树的操作和AVL树一样无非就是查，插，删，下面我们分别来介绍它们。

### (1) 先看看查找函数search：

```c++
//查找函数，带调整功能
//参数:根结点，需要查找的val
//返回:true or false
bool search(Tree &root,ElementType val)
{
    
    Tree parent=NULL;
    Tree *temp=NULL;
    temp=search_val(root,val, parent);
    if (*temp && *temp!=root)
    {
        SplayTree(root,*temp);
        return true;
    }
    return false;
}
```


查找函数中里面有另一个具体的查找函数，我们先不管它，先梳理逻辑，首先我们通过内部的查找函数，查找值为val的结点，找到后返回结点给temp，如果查找成功，并且当前结点不是根结点，那么我们将进行树的调整，将结点temp推到树根，否则直接退出，这就是search的功能，简单明了。

```c++
//具体的查找函数
//参数:根，需要查找的val,父节点指针
//成功:返回其结点
//失败：返回其引用,方便后面的插入操作
Tree *search_val(Tree &root,ElementType val,Tree &parent)
{
    if (root==NULL)
        return &root;
    if (root->val>val)
        return search_val(root->lchild,val,parent=root);
    else if(root->val<val)
        return search_val(root->rchild,val,parent=root);
    return &root;
}
```

这里我们有必要介绍一下内部的查找函数，因为这是一个通用的接口，后面都会用到它，这个查找函数，如果查找成功则返回结点的引用，否则返回它该插入地方的引用，也就是其最后的parent的某个孩子，parent是查找成功或失败结点的父节点，也是引用类型。

OK，这就是我们的查找函数，这里没有强化它的查找功能，只是方便我们后面的插入和删除工作。

### 插入

```c++
//插入函数
//参数：根，需要插入的val
//返回:true or false
bool insert(Tree &root,ElementType val)
{
    Tree *temp=NULL;
    Tree parent=NULL;
    //先查找，如果成功则无需插入，否则返回该结点的引用。
    temp=search_val(root,val,parent);
    
    if (*temp==NULL) //需要插入数据
    {
        Tree node=new SplayNode(val);
        *temp=node; //因为是引用型，所以这里直接赋值，简化了很多了。
        node->parent=parent; //设置父节点。
        return true;
    }
    return false;
}
```

可以看到这个插入函数也是很短的，注意观察，里面有我们熟悉的东西，没错就是前面所讲的内部查找函数，这里对插入结点，我们先进行查找，如果查找成功就不进行插入，否则返回该插入地址的引用，这样我们直接让 `*temp=node`，便完成了插入工作，简化了很多工作，然后设置父节点信息，插入成功。 

### 伸展

当我们查找一个val后，我们需要对树进行伸展，下面就是我们的伸展函数

```c++
//Splay调整操作
void SplayTree(Tree &root,Tree node)
{
    while (root->lchild!=node && root->rchild!=node && root!=node) //当前结点不是根，或者不是其根的左右孩子，则根据情况进行旋转操作
        up(root, node);
    if (root->lchild==node) //当前结点为根的左孩子，只需进行一次单右旋
        root=right_single_rotate(root, node);
    else if(root->rchild==node) //当前结点为根的右孩子，只需进行一次单左旋
        root=left_single_rotate(root, node);
}
```

可以看到，里面有个up函数，在这个函数外，还有单独的if判断结构，这两个if就是判断特殊情况的，也就是我们只需进行一个单旋便可以晋级为根结点的情况，这个很简单，结合一下图就可以看出来了。

OK，看看我们的up函数

```c++
//根据情况，选择不同的旋转方式
void up(Tree &root,Tree node)
{
    Tree parent,grandparent;
    int i,j;
    parent=node->parent;
    grandparent=parent->parent;
    i=grandparent->lchild==parent ? -1:1;
    j=parent->lchild==node ?-1:1;
    if (i==-1 && j==-1) //AVL树中的LL型
        right_double_rotate(root, node);
    else if(i==-1 && j==1) //AVL树中的LR型
        LR_rotate(root, node);
    else if(i==1 && j==-1) //AVL树中的RL型
        RL_rotate(root, node);
    else                    //AVL树中的RR型
        left_double_rotate(root, node);
}
```

up顾名思义就是往上，也就是把查找结点往上推送，在这个函数里面我们判断了旋转类型，是LL型，还是RR型，还是LR型，亦或是RL型，然后再调用我们前面展示过的旋转函数。

只需旋转函数最好结合图然后再看代码，这样很容易理解，不要只看代码。

到这里我们的查找和插入，以及伸展过程我们都展示了，这里很重要一个函数就是查找函数，还有就是几种旋转方式。

### 删除

```c++
//删除操作
void remove(Tree &root,ElementType val)
{
    Tree parent=NULL;
    Tree *temp;
    Tree *replace;
    Tree replace2;
    temp=search_val(root,val, parent); //先进行查找操作
    if(*temp) //如果查找到了
    {
        if (*temp!=root) //判断是否是根结点，不是根结点，则需要调整至根结点
            SplayTree(root, *temp);
        
        //调至根结点或者本来就是根结点后进行删除，先查看是否有替代元素
        if (root->rchild)
        {
            //有替代元素
            replace=Find_Min(root->rchild); //找到替换元素
            root->val=(*replace)->val;  //替换
            if ((*replace)->lchild==NULL) //左子树为空
            {
                replace2=*replace;
                *replace=(*replace)->rchild; //重接其右孩子
                delete replace2;
                
            }
            else if((*replace)->rchild==NULL) //右子树为空
            {
                replace2=*replace;
                *replace=(*replace)->lchild; //重接其左孩子
                delete replace2;
            }
        }
        else
        {
            //无替代元素，则根直接移向左子树，不管左子树是否为空都可以处理
            replace2=root;
            root=root->lchild;
            delete replace2;
        }
    }
}
```

在删除函数中，我们首先进行了查找，查找失败就退出，查找成功后，我们便把它推送到根结点，然后再用我们BST删除方式，找替代元素，这样化繁为简，只是这里统一采用引用方式，要简单很多。

下面是这是我们的熟悉的找替代元素的函数:

```c++
//操作当前子树的最小结点
//返回:其最小结点的引用
Tree *Find_Min(Tree &root)
{
    if (root->lchild)
        return Find_Min(root->lchild);
    return &root;
}
```

OK，到这里我们的伸展树就介绍完了，在这里可以看到我们伸展树里面的函数和AVL树里面的函数差别很大，在AVL树里面，我们即采用了引用(部分),同时又可以通过返回值来设置，再加上手生，写得有点杂乱，这里的伸展树，我就统一采用引用方式，能不返回值就返回值，这样可以简化很多操作，加之伸展树本来就比AVL树简单，不同判断平衡因子，因此写起来就更加简单了。

## 完整的 C 实现

```c++
#include <stdio.h>
#include <stdlib.h>
#include <iostream>
using namespace std;
typedef struct SplayNode *Tree;
typedef int ElementType;
struct SplayNode
{
    Tree parent; //该结点的父节点，方便操作
    ElementType val; //结点值
    Tree lchild;
    Tree rchild;
    SplayNode(int val=0) //默认构造函数
    {
        parent=NULL;
        lchild=rchild=NULL;
        this->val=val;
    }
};
 
bool search(Tree &,ElementType);
Tree *search_val(Tree&,ElementType,Tree&);
bool insert(Tree &,ElementType);
Tree left_single_rotate(Tree&,Tree);
Tree right_single_rotate(Tree &,Tree );
void LR_rotate(Tree&,Tree );
void RL_rotate(Tree&,Tree );
void right_double_rotate(Tree&,Tree );
void left_double_rotate(Tree&,Tree );
void SplayTree(Tree &,Tree);
void up(Tree &,Tree );
Tree *Find_Min(Tree &);
void remove(Tree &,ElementType);
 
//查找函数，带调整功能
//参数:根结点，需要查找的val
//返回:true or false
bool search(Tree &root,ElementType val)
{
    
    Tree parent=NULL;
    Tree *temp=NULL;
    temp=search_val(root,val, parent);
    if (*temp && *temp!=root)
    {
        SplayTree(root,*temp);
        return true;
    }
    return false;
}
 
//具体的查找函数
//参数:根，需要查找的val,父节点指针
//成功:返回其结点
//失败：返回其引用,方便后面的插入操作
Tree *search_val(Tree &root,ElementType val,Tree &parent)
{
    if (root==NULL)
        return &root;
    if (root->val>val)
        return search_val(root->lchild,val,parent=root);
    else if(root->val<val)
        return search_val(root->rchild,val,parent=root);
    return &root;
}
 
//插入函数
//参数：根，需要插入的val
//返回:true or false
bool insert(Tree &root,ElementType val)
{
    Tree *temp=NULL;
    Tree parent=NULL;
    //先查找，如果成功则无需插入，否则返回该结点的引用。
    temp=search_val(root,val,parent);
    
    if (*temp==NULL) //需要插入数据
    {
        Tree node=new SplayNode(val);
        *temp=node; //因为是引用型，所以这里直接赋值，简化了很多了。
        node->parent=parent; //设置父节点。
        return true;
    }
    return false;
}
//单左旋操作
//参数:根，旋转结点(旋转中心)
//返回:当前子树中的新根
Tree left_single_rotate(Tree &root,Tree node)
{
    if (node==NULL)
        return NULL;
    Tree parent=node->parent; //其父结点
    Tree grandparent=parent->parent; //其祖父结点
    parent->rchild=node->lchild; //设置其父节点的右孩子
    if (node->lchild) //如果有左孩子则更新node结点左孩子的父节点信息
        node->lchild->parent=parent;
    node->lchild=parent; //更新node结点的左孩子信息
    parent->parent=node; //更新原父节点的信息
    node->parent=grandparent;
    
    if (grandparent) //更新祖父孩子结点的信息
    {
        
        if (grandparent->lchild==parent)
            grandparent->lchild=node;
        else
            grandparent->rchild=node;
    }
    else //不存在祖父节点，则原父节点为根，那么旋转后node为根
        root=node;
    return node;
}
//单右旋操作
//参数:根，旋转结点(旋转中心)
//返回:当前子树中的新根
Tree right_single_rotate(Tree &root,Tree node)
{
    if (node==NULL)
        return NULL;
    Tree parent,grandparent;
    parent=node->parent;
    grandparent=parent->parent;
    parent->lchild=node->rchild;
    if (node->rchild)
        node->rchild->parent=parent;
    node->rchild=parent;
    parent->parent=node;
    node->parent=grandparent;
    if (grandparent)
    {
        if (grandparent->lchild==parent)
            grandparent->lchild=node;
        else
            grandparent->rchild=node;
    }
    else
        root=node;
    return node;
 
}
//双旋操作（LR型），于AVL树类似
//参数：根，最后将变成子树根结点的结点
void LR_rotate(Tree &root,Tree node)
{
    left_single_rotate(root,node); //先左
    right_single_rotate(root,node);//后右
}
//双旋操作（RL型），于AVL树类似
//参数：根，最后将变成子树根结点的结点
void RL_rotate(Tree&root,Tree node)
{
    right_single_rotate(root,node); //先右后左
    left_single_rotate(root,node);
}
 
//两次单右旋操作
//参数：根，最后将变成子树根结点的结点
void right_double_rotate(Tree &root,Tree node)
{
    right_single_rotate(root,node->parent); //先提升其父节点
    right_single_rotate(root,node);         //最后提升自己
}
//两次单左旋操作
//参数：根，最后将变成子树根结点的结点
void left_double_rotate(Tree &root,Tree node)
{
    left_single_rotate(root,node->parent);
    left_single_rotate(root,node);
}
//Splay调整操作
void SplayTree(Tree &root,Tree node)
{
    while (root->lchild!=node && root->rchild!=node && root!=node) //当前结点不是根，或者不是其根的左右孩子，则根据情况进行旋转操作
        up(root, node);
    if (root->lchild==node) //当前结点为根的左孩子，只需进行一次单右旋
        root=right_single_rotate(root, node);
    else if(root->rchild==node) //当前结点为根的右孩子，只需进行一次单左旋
        root=left_single_rotate(root, node);
}
 
//根据情况，选择不同的旋转方式
void up(Tree &root,Tree node)
{
    Tree parent,grandparent;
    int i,j;
    parent=node->parent;
    grandparent=parent->parent;
    i=grandparent->lchild==parent ? -1:1;
    j=parent->lchild==node ?-1:1;
    if (i==-1 && j==-1) //AVL树中的LL型
        right_double_rotate(root, node);
    else if(i==-1 && j==1) //AVL树中的LR型
        LR_rotate(root, node);
    else if(i==1 && j==-1) //AVL树中的RL型
        RL_rotate(root, node);
    else                    //AVL树中的RR型
        left_double_rotate(root, node);
}
 
//操作当前子树的最小结点
//返回:其最小结点的引用
Tree *Find_Min(Tree &root)
{
    if (root->lchild)
        return Find_Min(root->lchild);
    return &root;
}
 
//删除操作
void remove(Tree &root,ElementType val)
{
    Tree parent=NULL;
    Tree *temp;
    Tree *replace;
    Tree replace2;
    temp=search_val(root,val, parent); //先进行查找操作
    if(*temp) //如果查找到了
    {
        if (*temp!=root) //判断是否是根结点，不是根结点，则需要调整至根结点
            SplayTree(root, *temp);
        
        //调制根结点或者本来就是根结点后进行删除，先查看是否有替代元素
        if (root->rchild)
        {
            //有替代元素
            replace=Find_Min(root->rchild); //找到替换元素
            root->val=(*replace)->val;  //替换
            if ((*replace)->lchild==NULL) //左子树为空
            {
                replace2=*replace;
                *replace=(*replace)->rchild; //重接其右孩子
                delete replace2;
                
            }
            else if((*replace)->rchild==NULL) //右子树为空
            {
                replace2=*replace;
                *replace=(*replace)->lchild; //重接其左孩子
                delete replace2;
            }
        }
        else
        {
            //无替代元素，则根直接移向左子树，不管左子树是否为空都可以处理
            replace2=root;
            root=root->lchild;
            delete replace2;
        }
    }
}
 
//前序
void PreOrder(Tree root)
{
    if (root==NULL)
        return;
    printf("%d ",root->val);
    PreOrder(root->lchild);
    PreOrder(root->rchild);
}
//中序
void InOrder(Tree root)
{
    if (root==NULL)
        return;
    InOrder(root->lchild);
    printf("%d ",root->val);
    InOrder(root->rchild);
}
int main()
{
    Tree root=NULL;
    insert(root, 11);
    insert(root, 7);
    insert(root, 18);
    insert(root, 3);
    insert(root, 9);
    insert(root, 16);
    insert(root, 26);
    insert(root, 14);
    insert(root, 15);
    
    search(root,14);
    printf("查找14:\n");
    printf("前序:");
    PreOrder(root);
    printf("\n");
    printf("中序:");
    InOrder(root);
    printf("\n");
    
//    remove(root,16);
//    remove(root,26);
//    remove(root,11);
    remove(root,16);
    printf("删除16:\n");
    printf("前序:");
    PreOrder(root);
    printf("\n");
    printf("中序:");
    InOrder(root);
    printf("\n");
    return 0;
}
```

# java 实现版本

```java
public class SplayTree<T extends Comparable<T>> {

    class SplayTreeNode<T extends Comparable<T>>{
        SplayTreeNode<T> left;
        SplayTreeNode<T> right;
        T data;
        SplayTreeNode(SplayTreeNode<T> left, SplayTreeNode<T> right, T data){
            this.left = left;
            this.right = right;
            this.data = data;
        }

        SplayTreeNode(){
            this(null, null, null);
        }

        SplayTreeNode(T data){
            this(null, null, data);
        }
    }

    private SplayTreeNode<T> root;
    private Comparator<T> cmp;

    public SplayTree(){
        root = null;
    }

    public SplayTree(Comparator<T> cmp){
        this.cmp = cmp;
    }

    private int mCompare(T a, T b){
        if (cmp != null){
            return cmp.compare(a,b);
        }
        return a.compareTo(b);
    }

    public SplayTreeNode<T> insert(T data){
        root = insert(root, data);
        //进行伸展
        root = splay(root, data);
        return root;
    }

    private SplayTreeNode<T> insert(SplayTreeNode<T> tree, T data){
        if (tree == null){
            return new SplayTreeNode<T>(data);
        }
        int result = mCompare(data, tree.data);
        if (result < 0){
            tree.left = insert(tree.left, data);
        } else if (result > 0){
            tree.right = insert(tree.right, data);
        } else {
            System.out.println("已经存在该值");
            return null;
        }
        return tree;
    }

    private SplayTreeNode<T> insert(SplayTreeNode<T> rootTree, SplayTreeNode<T> tempNode){
        if (rootTree == null){
            return tempNode;
        } else {
            int result = mCompare(tempNode.data, rootTree.data);
            if (result < 0){
                rootTree.left = insert(rootTree.left, tempNode);
            } else if (result > 0){
                rootTree.right = insert(rootTree.right, tempNode);
            }
        }
        return rootTree;
    }

    public SplayTreeNode<T> search(T data){
        return search(root, data);
    }

    private SplayTreeNode<T> search(SplayTreeNode<T> tree, T data){
        if (tree == null){
            return null;
        }
        int result = mCompare(data, tree.data);
        if (result < 0){
            return search(tree.left, data);
        } else if (result > 0){
            return search(tree.right, data);
        } else {
            //找到目标节点，进行伸展，使其成为根节点
            root = splay(root, data);
            return tree;
        }
    }

    public T getRoot(){
        return root != null ? root.data : null;
    }

    public T findMax(){
        return findMax(root).data;
    }

    private SplayTreeNode<T> findMax(SplayTreeNode<T> tree){
        if (tree == null){
            return null;
        }
        while (tree.right != null){
            tree = tree.right;
        }
        return tree;
    }


    /**
     * 删除时，进行伸展：
     * a. 找到删除的节点
     * b. 对删除的节点进行旋转，使其成为根节点
     * c. 删除该节点后，问题是如何将左右子树进行拼接？
     * (1) 若左子树不为空，则找到左子树中的最大值，因为左子树的最大值节点没有右子树
     * (1.1) 将选中的最大值节点进行旋转，使其成为根节点
     * (1.2) 将原来的右子树拼接过来
     * (2) 若左子树为空，则右子树直接成为完整的树
     * @param data
     * @return
     */
    public SplayTreeNode<T> remove(T data){
        SplayTreeNode<T> newRoot, removeRoot;
        if (root == null){
            return null;
        }
        //找到要删除的节点
        removeRoot = search(root, data);
        //若没找到，则返回空
        if (removeRoot == null){
            return null;
        }
        //对要删除的节点旋转成为根节点
        root = splay(root, data);
        //左边不为空
        if (root.left != null){
            //找到左子树的最大节点值作为根节点，因为其没有右孩子存在
            newRoot = splay(root.left, findMax(root.left).data);
            //右子树直接赋值
            newRoot.right = root.right;
        }
        //否则直接赋值右子树
        else {
            newRoot = root.right;
        }
        //更新树
        root = newRoot;
        //返回删除的节点
        return removeRoot;
    }

    /**
     * 使用自底向上的方法实现伸展
     * @param tree 节点
     * @param data 目标值
     * @return 返回目标节点
     */
    public SplayTreeNode<T> splay(SplayTreeNode<T> tree, T data){
        //若树为空，则返回
        if (tree == null){
            return null;
        }
        //进行比较
        int result = mCompare(data, tree.data);
        //小于0，说明目标节点在左子树
        if (result < 0){
            //在左子树中进行查找
            tree.left = splay(tree.left, data);
            //表示找到了目标节点，tree为目标节点的父节点，进行右旋
            tree = rotationRight(tree);
        }
        // 大于0，说明目标节点在右子树
        else if (result > 0){
            //在右子树树种进行查找
            tree.right = splay(tree.right, data);
            //表示找到了目标节点，tree为目标节点的父节点，进行左旋
            tree = rotationLeft(tree);
        } else {
            //找到目标节点，返回
            return tree;
        }
        return tree;
    }

    /**
     * 进行左旋转
     * @param root 传入目标节点的父节点
     * @return 返回以目标节点为根节点的部分树
     */
    private SplayTreeNode<T> rotationLeft(SplayTreeNode<T> root) {
        SplayTreeNode<T> newRoot = root.right;//A
        root.right = newRoot.left;//B
        newRoot.left = root;//C
        return newRoot;
    }

    /**
     * 进行右旋
     * @param tree
     * @return
     */
    private SplayTreeNode<T> rotationRight(SplayTreeNode<T> tree) {
        SplayTreeNode<T> newRoot = tree.left;//A
        tree.left = newRoot.right;//B
        newRoot.right = tree;//C
        return newRoot;
    }

    public void inOrder(){
        inOrder(root);
    }

    private void inOrder(SplayTreeNode<T> tree){
        if (tree != null){
            inOrder(tree.left);
            System.out.print(tree.data + " ");
            inOrder(tree.right);
        }
    }

}
```

## 测试代码

```java
public class SplayTreeTest {

    public static void main(String[] args){
        int arr[] = {8,4,30,2,6,9,38,1,3,5,7,33,39,31,34};
        SplayTree<Integer> splayTree = new SplayTree<Integer>();
        //进行插入
        for (int anArr : arr) {
            splayTree.insert(anArr);
        }
        //打印树
        System.out.println("root:" + splayTree.getRoot());
        printArr(splayTree);

        //进行搜索节点33
        splayTree.search(33);
        System.out.println("root:" + splayTree.getRoot());
        printArr(splayTree);

        //进行删除节点8
        splayTree.remove(8);
        System.out.println("root:" + splayTree.getRoot());
        printArr(splayTree);
    }

    private static void printArr(SplayTree<Integer> splayTree){
        System.out.println("当前树的中序遍历如下：");
        splayTree.inOrder();
        System.out.println();
    }
    
}
```

# 参考资料

[wiki-伸展树](https://zh.m.wikipedia.org/zh-hans/%E4%BC%B8%E5%B1%95%E6%A0%91)

[纸上谈兵: 伸展树 (splay tree)](https://www.cnblogs.com/vamei/archive/2013/03/24/2976545.html)

[伸展树(Splay tree)图解与实现](https://blog.csdn.net/u014634338/article/details/49586689)

[伸展树(splay tree)的可视化](https://dirtysalt.github.io/html/splay-tree-visualization.html)

[【蒟蒻数据结构】伸展树Splay](https://www.jvruo.com/archives/390/)

[伸展树的 java 实现](https://www.jianshu.com/p/dcdf9028ec1a)

[伸展树(Splay tree)的基本操作与应用](https://my.oschina.net/u/4337072/blog/3272786)

[伸展树（SplayTree）指针版](https://zhuanlan.zhihu.com/p/77452737)

* any list
{:toc}