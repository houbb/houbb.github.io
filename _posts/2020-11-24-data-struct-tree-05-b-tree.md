---
layout: post
title: Tree-05-多路查找树 BTree 及 java 实现
date:  2020-10-17 16:15:55 +0800
categories: [Data-Struct]
tags: [data-struct, java, sh]
published: true
---

# BTree 历史

在1970年，Bayer＆McCreight发表的论文《ORGANIZATION AND MAINTENANCE OF LARGE ORDERED INDICES》（大型有序索引的组织和维护）中提出了一种新的数据结构来维护大型索引，这种数据结构在论文中称为B-Tree。

## BTree 的优势

B 树是一种多路查找树，相比于二叉树来说，B 树更适合于建立存储设备中的文件索引。

因为对于存储设备的操作，除算法的时间复杂度外，查找一个数据所需要进行 I/O 操作的次数也是性能的重要影响因素。

对于传统的二叉树来说，其存储比较松散，树的深度较深，我们每次查找一个新节点，可能都需要进行一次 I/O 操作将其读入内存。

而 B 树因为数据存储比较集中，一个节点内存储的数据更多，树的深度较浅，遍历整个 B 树所需 I/O 操作的次数远小于二叉树，同时因为我们的存储设备普遍适配了局部性原理，对于一个连续存储的节点来说，完全读取它所需 I/O 操作的次数也是非常少的。

从算法时间复杂度上看，因为 B 树节点中的项都是有序存储的，我们在一个节点内寻找数据时，使用二分查找可以使时间复杂度落在 O(log2N) 内，与在二叉树中的查找相同。因此总的来看，B 树相比于二叉树更适用于在存储设备上维护文件索引。

另外，B 树是平衡的，其维护平衡性的思路非常典型。对于普通的二叉树，是自上向下生长的，而对于B树，是自下而上生长的。

我们的插入操作都只会将新项插入到叶子节点，叶子节点满后进行分裂，并将中间节点向上融合。整颗树高度的增加必然是由根节点的分裂带来的，而根节点的分裂不会破坏整颗树的平衡性，因为左右子树的高度均加一。

对于一棵完全的二叉排序树，其根节点必然是整个有序链表的中点。这对于 B 树也是相通的，每次的分裂和向上融合都是向上传递了本节点的中点，所有元素组成的链表中，中间部分会集中在 B 树的上层节点中，这也保证了整棵树的平衡性。

我们平时使用的红黑树就是 2-3树（B树的一种）的一个变种，通过为二叉树节点染色，模仿 2-3 树的节点合并/分裂等行为，为其在平衡性和性能上找到了一个妥协点。

# B树的定义

h：代表树的高度，k 是个自然数，一个B树要么是空的，要么满足以下条件：

1. 所有叶子节点到根节点的路径长度相同，即具有相同的高度；（树是平衡的）

2. 每个非叶子和根节点（即内部节点）至少有 k+1 个孩子节点，根至少有 2 个孩子；（这是关键的部分，因为节点都是分裂而来的，而每次分裂得到的节点至少有 k 个元素，也就有 k+1 个孩子；但根节点在分裂后可能只有一个元素，因为不需要向上融合，中间元素作为新的根节点，因此最少有两个孩子。而叶子节点没有孩子。）

3. 每个节点最多有 2k+1 个孩子节点。（规定了节点的最大容量）

4. 每个节点内的键都是递增的


# java 实现

## 节点定义

我们定义一个树的结构，首先定义其数据项及节点的数据结构：

```java
/**
 * @Author Nxy
 * @Date 2020/2/23 14:06
 * @Description 内部类，B树中节点中的元素。K：键类型，V：值类型，可以是指向数据的索引，也可以是实体数据
 */
private class Entry<K, V> {
    private K key;
    private V value;
    public void setKey(K key) {
        this.key = key;
    }
    public K getKey() {
        return this.key;
    }
    public void setValue(V value) {
        this.value = value;
    }
    public V getValue() {
        return this.value;
    }
    @Override
    public String toString() {
        return "key: " + this.key + " , ";
    }
}
/**
 * @Author Nxy
 * @Date 2020/2/23 14:12
 * @Description 内部类，封装搜索结果
 */
private class SearchResult<V> {
    private boolean isExist;
    private V value;
    private int index;
    //构造方法，将查询结果封装入对象
    public SearchResult(boolean isExist, int index, V value) {
        this.isExist = isExist;
        this.index = index;
        this.value = value;
    }
    public boolean isExist() {
        return isExist;
    }
    public V getValue() {
        return value;
    }
    public int getIndex() {
        return index;
    }
}
/**
 * @Author Nxy
 * @Date 2020/2/23 14:28
 * @Description 树的节点
 */
public class Node<K, V> {
    //节点内的项
    private List<Entry<K, V>> entrys;
    //节点的孩子节点们
    private List<Node<K, V>> sons;
    //是否是叶子节点
    private boolean isLeaf;
    //键值比较函数对象，如果采用倒序或者其它排序方式，传入该对象
    private Comparator<K> kComparator;
    //比较两个key，如果没有传入自定义排序方式则采用默认的升序
    private int compare(K key1, K key2) {
        return this.kComparator == null ? ((Comparable<K>) key2).compareTo(key1) : kComparator.compare(key1, key2);
    }
    //普通构造函数
    Node() {
        this.entrys = new LinkedList<Entry<K, V>>();
        this.sons = new LinkedList<Node<K, V>>();
        this.isLeaf = false;
    }
    //自定义K排序方式的构造函数
    Node(Comparator<K> kComparator) {
        this();
        this.kComparator = kComparator;
    }
    public void setIsLeaf(boolean isLeaf) {
        this.isLeaf = isLeaf;
    }
    public boolean getIsLeaf() {
        return this.isLeaf;
    }
    //返回本节点的项数
    public int nodeSize() {
        return this.entrys.size();
    }
    /**
     * @Author Nxy
     * @Date 2020/2/23 15:19
     * @Param key:待查找元素的key值
     * @Return 查找结果封装入 SearchResult
     * @Exception
     * @Description 在本节点内查找元素, 本质就是一个有序数组的二分查找
     */
    public SearchResult<V> search(K key) {
        int begin = 0;
        int end = this.nodeSize() - 1;
          if (end == 0) {
              return new SearchResult<V>(false, 0, null);
          }
        int mid = (begin + end) / 2;
        boolean isExist = false;
        int index = 0;
        V value = null;
        //二分查找
        while (begin < end) {
            mid = (begin + end) / 2;
            Entry midEntry = this.entrys.get(mid);
            int compareRe = compare((K) midEntry.getKey(), key);
            //找到了
            if (compareRe == 0) {
                break;
            } else {
                if (compareRe > 0) {
                    //在中点右边
                    begin = mid + 1;
                } else {
                    end = mid - 1;
                }
            }
        }
        //二分查找结束，判断结果;三个元素以上才是正经二分，只有两个或一个元素属于边界条件要着重考虑
        if (begin < end) {
            //找到了
            isExist = true;
            index = mid;
            value = this.entrys.get(mid).getValue();
        } else if (begin == end) {
            K midKey = this.entrys.get(begin).getKey();
            int comRe = compare(midKey, key);
            if (comRe == 0) {
                isExist = true;
                index = begin;
                value = this.entrys.get(mid).getValue();
            } else if (comRe > 0) {
                isExist = false;
                index = begin + 1;
                value = null;
            } else {
                isExist = false;
                index = begin;
                value = null;
            }
        } else {
            isExist = false;
            index = begin;
            value = null;
        }
        return new SearchResult<V>(isExist, index, value);
    }
    //删除给定索引位置的项
    public Entry<K, V> removeEntry(int index) {
        Entry<K, V> re = this.entrys.get(index);
        this.entrys.remove(index);
        return re;
    }
    //得到index处的项
    public Entry<K, V> entryAt(int index) {
        return this.entrys.get(index);
    }
    //将新项插入指定位置
    private void insertEntry(Entry<K, V> entry, int index) {
        this.entrys.add(index, entry);
    }
    //节点内插入项
    private boolean insertEntry(Entry<K, V> entry) {
        SearchResult<V> result = search(entry.getKey());
        if (result.isExist()) {
            return false;
        } else {
            insertEntry(entry, result.getIndex());
            return true;
        }
    }
    //更新项，如果项存在，更新其值并返回原值，否则直接插入
    public V putEntry(Entry<K, V> entry) {
        SearchResult<V> re = search(entry.getKey());
        if (re.isExist) {
            Entry oldEntry = this.entrys.get(re.getIndex());
            V oldValue = (V) oldEntry.getValue();
            oldEntry.setValue(entry.getValue());
            return oldValue;
        } else {
            insertEntry(entry);
            return null;
        }
    }
    //获得指定索引的子节点
    public Node childAt(int index) {
        return this.sons.get(index);
    }
    //删除给定索引的子节点
    public void removeChild(int index) {
        this.sons.remove(index);
    }
    //将新的子节点插入到指定位置
    public void insertChild(Node<K, V> child, int index) {
        this.sons.add(index, child);
    }
}
```

## 定义树

然后定义树的数据结构：

```java
public class Btree{  
    //度数T，不传入则默认为 2-3 树
    private Integer DEFAULT_T = 2;
    //根节点
    private Node<K, V> root;
    //度数
    private int t = DEFAULT_T;

    //非根节点的最小项数，体现的是除了根节点，其余节点都是分裂而来的！
    private int nodeMinSize = t - 1;
    //节点的最大项数
    private int nodeMaxSize = 2 * t - 1;
    //比较函数对象
    private Comparator<K> kComparator;
}
```

# B树的操作

对于一棵树常用的操作无非是增删改查，其余诸如旋转之类的调整树结构的操作封装在增删改查内部。我们看一下 B 树增删改查的逻辑。

## B 树的查找

查找是 B 树最简单的操作：

1. 在节点内进行二分查找，如果找到则返回。未找到返回其在节点内插入时的索引。

2. 根据索引递归的查找子节点，直到查找到叶子节点仍未找到则表明数据不在树中。

实现如下：

```java
//在以root为根的树内搜索key项
private V search(Node<K, V> root, K key) {
    SearchResult<V> re = root.search(key);
    if (re.isExist) {
        return re.value;
    } else {
        //回归条件
        if (root.isLeaf) {
            return null;
        }
        int index = re.index;
        //递归搜索子节点
        return (V) search(root.childAt(index), key);
    }
}
public V search(K key) {
    return search(this.root, key);
}
```

## B树的插入

然后是 B 树的插入操作，插入操作需要考虑节点的分裂与向上融合，整个的过程如下：

1. 首先判断根节点是否已满，满则先进行分裂得到新的根节点。

2. 从根节点向下寻找，找到待插入数据在叶子节点的位置。

3. 向下寻找时，每经过一个节点，都检查插入位置子节点的大小是否为 `2*t-1` ，因为我们插入节点可能造成下层节点的向上融合，上层节点如果大小为 `2*t-1`，融合新元素后将会有数据超过最大值的危险。

寻找路径上，只要有节点的大小为 `2*t-1`，则先进行分裂，再继续向下查找。

4. 直到查找到叶子节点，直接插入。（当然也有其它实现方式，比如每次插入后检查插入的节点是否需要分裂，沿着搜索路径回溯着向上融合）

我们先将分裂和向上融合的放法定义出来：

```java
/**
 * @Author Nxy
 * @Date 2020/2/23 20:49
 * @Param 分裂满子结点，fatherNode：待分裂节点的父节点，splitNode:待分裂节点，index:待分裂节点在父节点中的索引
 * @Return
 * @Exception
 * @Description 满子节点的分裂过程：从中间节点断开，后半部分形成新结点插入父节点。若分裂节点不是叶子节点，将子节点一并分裂到新节点
 */
private void splitNode(Node<K, V> fatherNode, Node<K, V> splitNode, int index) {
    //分裂产生的新节点
    Node<K, V> newNode = new Node<K, V>(this.kComparator);
    //如果原节点为叶子节点，那么新节点也是
    newNode.setIsLeaf(splitNode.isLeaf);
    //将 t到2*t-2 项迁移到新节点
    for (int i = t; i < this.nodeMaxSize; i++) {
        newNode.entrys.add(splitNode.entrys.get(i));
    }
    //中间节点向上融合到父节点的 index+1
    Entry<K, V> midEntry = splitNode.entrys.get(t - 1);
    for (int i = this.nodeMaxSize - 1; i >= t - 1; i--) {
        //删除原节点中已迁移的项,删除时注意从尾部向前删除
        splitNode.entrys.remove(i);
    }
    //如果分裂的节点不是叶子节点，子节点一并跟随分裂
    if (!splitNode.getIsLeaf()) {
        for (int i = t; i < this.nodeMaxSize + 1; i++) {
            newNode.sons.add(splitNode.sons.get(i));
        }
        //删除时注意从尾部向前删除
        for (int i = this.nodeMaxSize; i >= t; i--) {
            splitNode.sons.remove(i);
        }
    }
    //父节点插入分裂的中间元素，分裂出的新节点加入父节点的 sons
    fatherNode.insertEntry(midEntry);
    fatherNode.insertChild(newNode, index + 1);
}
```

然后定义插入方法：

```java
/**
 * @Author Nxy
 * @Date 2020/2/23 23:53
 * @Param root：当前节点，entry:待插入元素
 * @Return
 * @Exception
 * @Description 插入一个非满节点：一路向下寻找插入位置。
 * 在寻找的路径上，如果碰到大小为2t-1的节点，分裂并向上融合。
 * 每次插入都从叶子节点插入，通过分裂将插入动作向上反馈，直到融合到根节点，只有由根节点的分裂
 * 才能增加整棵树的高度，从而维持树的平衡。
 * 树在一开始就是平衡的（只有根），整棵树的高度增加必须由根节点的分裂引发，从而高度增加后还是平衡的
 * 因为没次检查子节点前如果子节点满了会先分裂，所以除根节点外，其余节点被其子节点向上融合均不会导致节点满
 * 仅插入一个元素的情况下，每个节点最多经历一次子节点的分裂
 */
private boolean insertNotFull(Node<K, V> root, Entry<K, V> entry) {
    if (root.getIsLeaf()) {
        //到达叶子节点，直接插入
        return root.insertEntry(entry);
    }
    SearchResult<V> re = root.search(entry.getKey());
    if (re.isExist) {
        //已存在key，直接返回
        return false;
    }
    int index = re.getIndex();
    Node<K, V> searchChild = root.childAt(index);
    //待查询子节点已满，分裂后再判断该搜索哪个子节点
    if (searchChild.nodeSize() == 2 * t - 1) {
        splitNode(root, searchChild, index);
        if (root.compare(root.entryAt(index).getKey(), entry.getKey()) > 0) {
            searchChild = root.childAt(index + 1);
        }
    }
    return insertNotFull(searchChild, entry);
}
//插入一个新节点
public boolean insertNode(Entry<K, V> entry) {
    //根节点满了，先分裂根节点
    if (root.nodeSize() == 2 * t - 1) {
        Node<K, V> newRoot = new Node<K, V>();
        newRoot.setIsLeaf(false);
        newRoot.insertChild(root, 0);
        splitNode(newRoot, root, 0);
        this.root = newRoot;
    }
    return insertNotFull(root, entry);
}
```

## 树的删除

删除比较麻烦，因为为了保证删除后树的结构依然符合定义，我们需要考虑非常多的情况。

过程如下：

在本节点内查找删除项，找到了：

如果本节点叶子节点，直接删除。

如果不是叶子节点，则为了保证树结构，不可直接删除，继续判断：

1. 尝试与子节点互换元素以维护树的结构

（首先是尝试将该数据项与子节点中的数据项互换）

如果该数据项的左子节点有大于等于 t 个元素，则将左子节点最后一个元素与删除元素互换位置。

左子节点元素个数少于 t ，检查右子节点，如果右子节点元素数大于等于 t ，将右子节点第一个元素与待删除元素互换位置。

2. 尝试与左右子节点合并

方案 1 没起作用，说明待删除元素的左右子节点元素个数都小于 t ，那么将其与待删除元素合并为一个大节点，长度将小于等于 2t-1 ，依然符合 B 树的定义。

那么我们将待删除元素合并为左子节点最后一个元素，右子节点携带其子元素一并合并入左子节点中。递归的对合并后节点进行处理。

在本节点内未找到待删除元素，去子节点继续寻找：

如果本节点为叶子节点，无子节点，直接返回待删除节点不在树中。

否则判断子节点是否可删除元素，如果子节点元素个数大于等于 t：

1. 直接递归的处理子节点。

如果子节点元素个数小于 t ，不可删除项：

2. 尝试让子节点的左右兄弟节点旋转来匀出一个元素给子节点

如果左兄弟可以匀出元素，左兄弟最后一个元素 - 本节点以子节点为右子节点的元素 - 子节点 进行右旋，同时将左兄弟最后一个元素的其右子树加到子节点儿子列表的开头。

如果右兄弟可以匀出元素，右兄弟第一个元素 - 本节点以子节点为左子节点的元素-子节点进行左旋，同时将右兄弟第一个子元素加到子节点儿子列表的结尾。

3. 尝试合并子节点与其左/右兄弟节点

如果子节点有左兄弟节点，本节点中将以子节点为右子节点的元素 - 子节点合并入子节点的左兄弟，子节点的孩子列表追加到左子元素孩子列表的结尾。

如果子节点有右兄弟节点，本节点中以子节点为左子节点的元素 - 右兄弟节点合并入子节点，右兄弟节点的孩子列表追加到本节点孩子列表的结尾。

以上便是删除的逻辑过程，看起来情况比较多，但并不复杂。核心便是在删除时，为了不破坏树的结构，我们必须将删除元素交换到叶子节点后才能删除。而在交换过程中，不能使删除路径上节点的元素数小于 t-1（包括叶子节点）。

下面是实现：

```java
private Entry<K, V> delete(Node<K, V> root, Entry<K, V> entry) {
    SearchResult<V> re = root.search(entry.getKey());
    if (re.isExist()) {
        //回归条件，如果是叶子节点中的元素，直接删除
        if (root.getIsLeaf()) {
            return root.removeEntry(re.getIndex());
        }
        //如果不是叶子节点，判断应将待删除节点交换到左子节点还是右子节点
        Node<K, V> leftChild = root.childAt(re.getIndex());
        //如果左子节点包含多于 t-1 个项，转移到左子节点删除
        if (leftChild.nodeSize() >= t) {
            //删除过程为，将待删除项与其左子节点最后一项互换，并递归互换下去，直到将待删除节点换到叶子节点后删除
            root.removeEntry(re.getIndex());
            root.insertEntry(leftChild.entryAt(leftChild.nodeSize() - 1), re.getIndex());
            leftChild.removeEntry(leftChild.nodeSize() - 1);
            leftChild.insertEntry(entry);
            return delete(leftChild, entry);
        }
        //左子节点不可删除项，则同样逻辑检查右子节点
        Node<K, V> rightChild = root.childAt(re.getIndex() + 1);
        if (rightChild.nodeSize() >= t) {
            root.removeEntry(re.getIndex());
            root.insertEntry(rightChild.entryAt(0), re.getIndex());
            rightChild.removeEntry(0);
            rightChild.insertEntry(entry);
            return delete(rightChild, entry);
        }
        //如果左右子节点均不能删除项，将左右子节点合并，并将删除项放到新节点的合并连接处
        Entry<K, V> deletedEntry = root.removeEntry(re.getIndex());
        leftChild.insertEntry(deletedEntry);
        root.removeChild(re.getIndex() + 1);
        //左右子节点合并
        for (int i = 0; i < rightChild.nodeSize(); i++) {
            leftChild.insertEntry(rightChild.entryAt(i));
        }
        //右子节点存在子节点，则子节点也合并入左子节点子节点集合
        if (!rightChild.getIsLeaf()) {
            for (int i = 0; i < rightChild.sons.size(); i++) {
                leftChild.insertChild(rightChild.childAt(i), leftChild.sons.size());
            }
        }
        //合并后继续向左递归
        return delete(leftChild, entry);
    } else {//删除节点不在本节点
        //回归条件，搜索到叶节点依然没找到，待删除节点不在树中
        if (root.getIsLeaf()) {
            for (int i = 0; i < root.nodeSize(); i++) {
                System.out.print("++++++++++++++++++++");
                System.out.print(root.entryAt(i).getKey() + "，");
                System.out.print("++++++++++++++++++++");
            }
            throw new RuntimeException(entry.key + " is not in this tree!");
        }
        Node<K, V> searchChild = root.childAt(re.index);
        //子节点可删除项，递归删除
        if (searchChild.nodeSize() >= t) {
            return delete(searchChild, entry);
        }
        //待旋转节点，子节点项数小于等于 t-1 ，不能删除项，准备左旋或右旋为其补充项数
        Node<K, V> siblingNode = null;
        int siblingIndex = -1;
        //存在右兄弟
        if (re.getIndex() < root.nodeSize() - 1) {
            Node<K, V> rightBrother = root.childAt(re.getIndex() + 1);
            if (rightBrother.nodeSize() >= t) {
                siblingNode = rightBrother;
                siblingIndex = re.getIndex() + 1;
            }
        }
        //不存在右兄弟则尝试左兄嘚
        if (siblingNode == null) {
            if (re.getIndex() > 0) {
                //尝试左兄弟节点
                Node<K, V> leftBrothr = root.childAt(re.getIndex() - 1);
                if (leftBrothr.nodeSize() >= t) {
                    siblingNode = leftBrothr;
                    siblingIndex = re.getIndex() - 1;
                }
            }
        }
        //至少有一个兄弟可以匀出项来
        if (siblingNode != null) {
            //是左兄嘚
            if (siblingIndex < re.getIndex()) {
                //左节点最后一项右旋
                searchChild.insertEntry(root.entryAt(siblingIndex), 0);
                root.removeEntry(siblingIndex);
                root.insertEntry(siblingNode.entryAt(siblingNode.nodeSize() - 1), siblingIndex);
                siblingNode.removeEntry(siblingNode.nodeSize() - 1);
                //子节点跟着右旋
                if (!siblingNode.getIsLeaf()) {
                    searchChild.insertChild(siblingNode.childAt(siblingNode.sons.size() - 1), 0);
                    siblingNode.removeChild(siblingNode.sons.size() - 1);
                }
            } else {
                //是右兄嘚
                searchChild.insertEntry(root.entryAt(re.getIndex()), searchChild.nodeSize() - 1);
                root.removeEntry(re.getIndex());
                root.insertEntry(siblingNode.entryAt(0), re.getIndex());
                siblingNode.removeEntry(0);
                if (!siblingNode.getIsLeaf()) {
                    searchChild.insertChild(siblingNode.childAt(0), searchChild.sons.size());
                    siblingNode.removeChild(0);
                }
            }
            return delete(searchChild, entry);
        }
        //左右兄嘚都匀不出项来，直接由左右兄嘚节点与父项合并为一个节点
        if (re.getIndex() <= root.nodeSize() - 1) {
            Node<K, V> rightSon = root.childAt(re.getIndex() + 1);
            searchChild.insertEntry(root.entryAt(re.getIndex()), searchChild.nodeSize());
            root.removeEntry(re.getIndex());
            root.removeChild(re.getIndex() + 1);
            for (int i = 0; i < rightSon.nodeSize(); i++) {
                searchChild.insertEntry(rightSon.entryAt(i));
            }
            if (!rightSon.getIsLeaf()) {
                for (int j = 0; j < rightSon.sons.size(); j++) {
                    searchChild.insertChild(rightSon.childAt(j), searchChild.sons.size());
                }
            }
            if (root == this.root) {
                this.root = searchChild;
            }
        } else {
            //没有右兄弟，试试左兄嘚
            Node<K, V> leftSon = root.childAt(re.getIndex() - 1);
            searchChild.insertEntry(root.entryAt(re.getIndex() - 1), 0);
            root.removeChild(re.getIndex() - 1);
            root.removeEntry(re.getIndex() - 1);
            for (int i = 0; i < leftSon.nodeSize(); i++) {
                searchChild.insertEntry(leftSon.entryAt(i));
            }
            if (!leftSon.getIsLeaf()) {
                for (int i = leftSon.sons.size() - 1; i >= 0; i--) {
                    searchChild.insertChild(leftSon.childAt(i), 0);
                }
            }
            if (root == this.root) {
                this.root = searchChild;
            }
        }
        return delete(searchChild, entry);
    }
}
```

# 完整实现

```java
import java.util.*;

/**
 * @Author Nxy
 * @Date 2020/2/23 14:04
 * @Description B树实现
 */
public class BTree<K, V> {

    /**
     * @Author Nxy
     * @Date 2020/2/23 14:06
     * @Description 内部类，B树中节点中的元素。K：键类型，V：值类型，可以是指向数据的索引，也可以是实体数据
     */
    private class Entry<K, V> {
        private K key;
        private V value;

        public void setKey(K key) {
            this.key = key;
        }

        public K getKey() {
            return this.key;
        }

        public void setValue(V value) {
            this.value = value;
        }

        public V getValue() {
            return this.value;
        }

        @Override
        public String toString() {
            return "key: " + this.key + " , ";
        }
    }

    /**
     * @Author Nxy
     * @Date 2020/2/23 14:12
     * @Description 内部类，封装搜索结果
     */
    private class SearchResult<V> {
        private boolean isExist;
        private V value;
        private int index;

        //构造方法，将查询结果封装入对象
        public SearchResult(boolean isExist, int index, V value) {
            this.isExist = isExist;
            this.index = index;
            this.value = value;
        }

        public boolean isExist() {
            return isExist;
        }

        public V getValue() {
            return value;
        }

        public int getIndex() {
            return index;
        }
    }

    /**
     * @Author Nxy
     * @Date 2020/2/23 14:28
     * @Description 树的节点
     */
    public class Node<K, V> {
        //节点内的项
        private List<Entry<K, V>> entrys;
        //节点的孩子节点们
        private List<Node<K, V>> sons;
        //是否是叶子节点
        private boolean isLeaf;
        //键值比较函数对象，如果采用倒序或者其它排序方式，传入该对象
        private Comparator<K> kComparator;

        //比较两个key，如果没有传入自定义排序方式则采用默认的升序
        private int compare(K key1, K key2) {
            return this.kComparator == null ? ((Comparable<K>) key2).compareTo(key1) : kComparator.compare(key1, key2);
        }

        //普通构造函数
        Node() {
            this.entrys = new LinkedList<Entry<K, V>>();
            this.sons = new LinkedList<Node<K, V>>();
            this.isLeaf = false;
        }

        //自定义K排序方式的构造函数
        Node(Comparator<K> kComparator) {
            this();
            this.kComparator = kComparator;
        }

        public void setIsLeaf(boolean isLeaf) {
            this.isLeaf = isLeaf;
        }

        public boolean getIsLeaf() {
            return this.isLeaf;
        }

        //返回本节点的项数
        public int nodeSize() {
            return this.entrys.size();
        }

        /**
         * @Author Nxy
         * @Date 2020/2/23 15:19
         * @Param key:待查找元素的key值
         * @Return 查找结果封装入 SearchResult
         * @Exception
         * @Description 在本节点内查找元素, 本质就是一个有序数组的二分查找
         */
        public SearchResult<V> search(K key) {
            int begin = 0;
            int end = this.nodeSize() - 1;
//            if (end == 0) {
//                return new SearchResult<V>(false, 0, null);
//            }
            int mid = (begin + end) / 2;
            boolean isExist = false;
            int index = 0;
            V value = null;
            //二分查找
            while (begin < end) {
                mid = (begin + end) / 2;
                Entry midEntry = this.entrys.get(mid);
                int compareRe = compare((K) midEntry.getKey(), key);
                //找到了
                if (compareRe == 0) {
                    break;
                } else {
                    if (compareRe > 0) {
                        //在中点右边
                        begin = mid + 1;
                    } else {
                        end = mid - 1;
                    }
                }
            }
            //二分查找结束，判断结果;三个元素以上才是正经二分，只有两个或一个元素属于边界条件要着重考虑
            if (begin < end) {
                //找到了
                isExist = true;
                index = mid;
                value = this.entrys.get(mid).getValue();
            } else if (begin == end) {
                K midKey = this.entrys.get(begin).getKey();
                int comRe = compare(midKey, key);
                if (comRe == 0) {
                    isExist = true;
                    index = begin;
                    value = this.entrys.get(mid).getValue();
                } else if (comRe > 0) {
                    isExist = false;
                    index = begin + 1;
                    value = null;
                } else {
                    isExist = false;
                    index = begin;
                    value = null;
                }
            } else {
                isExist = false;
                index = begin;
                value = null;
            }
            return new SearchResult<V>(isExist, index, value);
        }

        //删除给定索引位置的项
        public Entry<K, V> removeEntry(int index) {
            Entry<K, V> re = this.entrys.get(index);
            this.entrys.remove(index);
            return re;
        }

        //得到index处的项
        public Entry<K, V> entryAt(int index) {
            return this.entrys.get(index);
        }

        //将新项插入指定位置
        private void insertEntry(Entry<K, V> entry, int index) {
            this.entrys.add(index, entry);
        }

        //节点内插入项
        private boolean insertEntry(Entry<K, V> entry) {
            SearchResult<V> result = search(entry.getKey());
            if (result.isExist()) {
                return false;
            } else {
                insertEntry(entry, result.getIndex());
                return true;
            }
        }

        //更新项，如果项存在，更新其值并返回原值，否则直接插入
        public V putEntry(Entry<K, V> entry) {
            SearchResult<V> re = search(entry.getKey());
            if (re.isExist) {
                Entry oldEntry = this.entrys.get(re.getIndex());
                V oldValue = (V) oldEntry.getValue();
                oldEntry.setValue(entry.getValue());
                return oldValue;
            } else {
                insertEntry(entry);
                return null;
            }
        }

        //获得指定索引的子节点
        public Node childAt(int index) {
            return this.sons.get(index);
        }

        //删除给定索引的子节点
        public void removeChild(int index) {
            this.sons.remove(index);
        }

        //将新的子节点插入到指定位置
        public void insertChild(Node<K, V> child, int index) {
            this.sons.add(index, child);
        }
    }

    //度数T，不传入则默认为 2-3 树
    private Integer DEFAULT_T = 2;
    //根节点
    private Node<K, V> root;

    private int t = DEFAULT_T;

    //非根节点的最小项数，体现的是除了根节点，其余节点都是分裂而来的！
    private int nodeMinSize = t - 1;
    //节点的最大项数
    private int nodeMaxSize = 2 * t - 1;
    //比较函数对象
    private Comparator<K> kComparator;

    //构造一棵自然排序的B树
    BTree() {
        Node<K, V> root = new Node<K, V>();
        this.root = root;
        root.setIsLeaf(true);
    }

    //构造一棵度为 t 的B树
    BTree(int t) {
        this();
        this.t = t;
        nodeMinSize = t - 1;
        nodeMaxSize = 2 * t - 1;
    }

    //构造一棵按给定排序方式排序，且度为 t 的B树
    BTree(Comparator<K> com, int t) {
        this(t);
        this.kComparator = com;
    }

    //在以root为根的树内搜索key项
    private V search(Node<K, V> root, K key) {
        SearchResult<V> re = root.search(key);
        if (re.isExist) {
            return re.value;
        } else {
            //回归条件
            if (root.isLeaf) {
                return null;
            }
            int index = re.index;
            //递归搜索子节点
            return (V) search(root.childAt(index), key);
        }
    }

    public V search(K key) {
        return search(this.root, key);
    }

    /**
     * @Author Nxy
     * @Date 2020/2/23 20:49
     * @Param 分裂满子结点，fatherNode：待分裂节点的父节点，splitNode:待分裂节点，index:待分裂节点在父节点中的索引
     * @Return
     * @Exception
     * @Description 满子节点的分裂过程：从中间节点断开，后半部分形成新结点插入父节点。若分裂节点不是叶子节点，将子节点一并分裂到新节点
     */
    private void splitNode(Node<K, V> fatherNode, Node<K, V> splitNode, int index) {
        //分裂产生的新节点
        Node<K, V> newNode = new Node<K, V>(this.kComparator);
        //如果原节点为叶子节点，那么新节点也是
        newNode.setIsLeaf(splitNode.isLeaf);
        //将 t到2*t-2 项迁移到新节点
        for (int i = t; i < this.nodeMaxSize; i++) {
            newNode.entrys.add(splitNode.entrys.get(i));
        }
        //中间节点向上融合到父节点的 index+1
        Entry<K, V> midEntry = splitNode.entrys.get(t - 1);
        for (int i = this.nodeMaxSize - 1; i >= t - 1; i--) {
            //删除原节点中已迁移的项,删除时注意从尾部向前删除
            splitNode.entrys.remove(i);
        }
        //如果分裂的节点不是叶子节点，子节点一并跟随分裂
        if (!splitNode.getIsLeaf()) {
            for (int i = t; i < this.nodeMaxSize + 1; i++) {
                newNode.sons.add(splitNode.sons.get(i));
            }
            //删除时注意从尾部向前删除
            for (int i = this.nodeMaxSize; i >= t; i--) {
                splitNode.sons.remove(i);
            }
        }
        //父节点插入分裂的中间元素，分裂出的新节点加入父节点的 sons
        fatherNode.insertEntry(midEntry);
        fatherNode.insertChild(newNode, index + 1);
    }

    /**
     * @Author Nxy
     * @Date 2020/2/23 23:53
     * @Param root：当前节点，entry:待插入元素
     * @Return
     * @Exception
     * @Description 插入一个非满节点：一路向下寻找插入位置。
     * 在寻找的路径上，如果碰到大小为2t-1的节点，分裂并向上融合。
     * 每次插入都从叶子节点插入，通过分裂将插入动作向上反馈，直到融合到根节点，只有由根节点的分裂
     * 才能增加整棵树的高度，从而维持树的平衡。
     * 树在一开始就是平衡的（只有根），整棵树的高度增加必须由根节点的分裂引发，从而高度增加后还是平衡的
     * 因为没次检查子节点前如果子节点满了会先分裂，所以除根节点外，其余节点被其子节点向上融合均不会导致节点满
     * 仅插入一个元素的情况下，每个节点最多经历一次子节点的分裂
     */
    private boolean insertNotFull(Node<K, V> root, Entry<K, V> entry) {
        if (root.getIsLeaf()) {
            //到达叶子节点，直接插入
            return root.insertEntry(entry);
        }
        SearchResult<V> re = root.search(entry.getKey());
        if (re.isExist) {
            //已存在key，直接返回
            return false;
        }
        int index = re.getIndex();
        Node<K, V> searchChild = root.childAt(index);
        //待查询子节点已满，分裂后再判断该搜索哪个子节点
        if (searchChild.nodeSize() == 2 * t - 1) {
            splitNode(root, searchChild, index);
            if (root.compare(root.entryAt(index).getKey(), entry.getKey()) > 0) {
                searchChild = root.childAt(index + 1);
            }
        }
        return insertNotFull(searchChild, entry);
    }

    //插入一个新节点
    public boolean insertNode(Entry<K, V> entry) {
        //根节点满了，先分裂根节点
        if (root.nodeSize() == 2 * t - 1) {
            Node<K, V> newRoot = new Node<K, V>();
            newRoot.setIsLeaf(false);
            newRoot.insertChild(root, 0);
            splitNode(newRoot, root, 0);
            this.root = newRoot;
        }
        return insertNotFull(root, entry);
    }

    /**
     * @Author Nxy
     * @Date 2020/2/24 14:00
     * @Param
     * @Return
     * @Exception
     * @Description 如果Key已存在，更新value，否则直接插入entry
     */
    private V putNotFull(Node<K, V> root, Entry<K, V> entry) {
        assert root.nodeSize() < nodeMaxSize;
        if (root.isLeaf) {
            return root.putEntry(entry);
        }
        SearchResult<V> re = root.search(entry.getKey());
        if (re.isExist) {
            //如果存在，则更新
            root.entryAt(re.index).setValue(entry.getValue());
            return re.value;
        }
        //如果不存在，继续向下搜素，先判断子节点是否需要分裂
        Node<K, V> searchChild = root.childAt(re.index);
        if (searchChild.nodeSize() == 2 * t - 1) {
            splitNode(root, searchChild, re.index);
            if (root.compare(entry.getKey(), root.entryAt(re.index).getKey()) > 0) {
                searchChild = root.childAt(re.index + 1);
            }
        }
        return putNotFull(searchChild, entry);
    }

    // 如果树中已存在 key 则更新并返回原 value，否则插入并返回null
    public V put(Entry<K, V> entry) {
        //如果根节点已满，先分裂根节点
        if (this.root.nodeSize() == nodeMaxSize) {
            Node<K, V> newRoot = new Node<K, V>(kComparator);
            newRoot.setIsLeaf(false);
            newRoot.insertChild(root, 0);
            splitNode(newRoot, root, 0);
            this.root = newRoot;
        }
        return putNotFull(root, entry);
    }

    private Entry<K, V> delete(Node<K, V> root, Entry<K, V> entry) {
        SearchResult<V> re = root.search(entry.getKey());
        if (re.isExist()) {
            //回归条件，如果是叶子节点中的元素，直接删除
            if (root.getIsLeaf()) {
                return root.removeEntry(re.getIndex());
            }
            //如果不是叶子节点，判断应将待删除节点交换到左子节点还是右子节点
            Node<K, V> leftChild = root.childAt(re.getIndex());
            //如果左子节点包含多于 t-1 个项，转移到左子节点删除
            if (leftChild.nodeSize() >= t) {
                //删除过程为，将待删除项与其左子节点最后一项互换，并递归互换下去，直到将待删除节点换到叶子节点后删除
                root.removeEntry(re.getIndex());
                root.insertEntry(leftChild.entryAt(leftChild.nodeSize() - 1), re.getIndex());
                leftChild.removeEntry(leftChild.nodeSize() - 1);
                leftChild.insertEntry(entry);
                return delete(leftChild, entry);
            }
            //左子节点不可删除项，则同样逻辑检查右子节点
            Node<K, V> rightChild = root.childAt(re.getIndex() + 1);
            if (rightChild.nodeSize() >= t) {
                root.removeEntry(re.getIndex());
                root.insertEntry(rightChild.entryAt(0), re.getIndex());
                rightChild.removeEntry(0);
                rightChild.insertEntry(entry);
                return delete(rightChild, entry);
            }
            //如果左右子节点均不能删除项，将左右子节点合并，并将删除项放到新节点的合并连接处
            Entry<K, V> deletedEntry = root.removeEntry(re.getIndex());
            leftChild.insertEntry(deletedEntry);
            root.removeChild(re.getIndex() + 1);
            //左右子节点合并
            for (int i = 0; i < rightChild.nodeSize(); i++) {
                leftChild.insertEntry(rightChild.entryAt(i));
            }
            //右子节点存在子节点，则子节点也合并入左子节点子节点集合
            if (!rightChild.getIsLeaf()) {
                for (int i = 0; i < rightChild.sons.size(); i++) {
                    leftChild.insertChild(rightChild.childAt(i), leftChild.sons.size());
                }
            }
            //合并后继续向左递归
            return delete(leftChild, entry);
        } else {//删除节点不在本节点
            //回归条件，搜索到叶节点依然没找到，待删除节点不在树中
            if (root.getIsLeaf()) {
                for (int i = 0; i < root.nodeSize(); i++) {
                    System.out.print("++++++++++++++++++++");
                    System.out.print(root.entryAt(i).getKey() + "，");
                    System.out.print("++++++++++++++++++++");
                }
                throw new RuntimeException(entry.key + " is not in this tree!");
            }
            Node<K, V> searchChild = root.childAt(re.index);
            //子节点可删除项，递归删除
            if (searchChild.nodeSize() >= t) {
                return delete(searchChild, entry);
            }
            //待旋转节点，子节点项数小于等于 t-1 ，不能删除项，准备左旋或右旋为其补充项数
            Node<K, V> siblingNode = null;
            int siblingIndex = -1;
            //存在右兄弟
            if (re.getIndex() < root.nodeSize() - 1) {
                Node<K, V> rightBrother = root.childAt(re.getIndex() + 1);
                if (rightBrother.nodeSize() >= t) {
                    siblingNode = rightBrother;
                    siblingIndex = re.getIndex() + 1;
                }
            }
            //不存在右兄弟则尝试左兄嘚
            if (siblingNode == null) {
                if (re.getIndex() > 0) {
                    //尝试左兄弟节点
                    Node<K, V> leftBrothr = root.childAt(re.getIndex() - 1);
                    if (leftBrothr.nodeSize() >= t) {
                        siblingNode = leftBrothr;
                        siblingIndex = re.getIndex() - 1;
                    }
                }
            }
            //至少有一个兄弟可以匀出项来
            if (siblingNode != null) {
                //是左兄嘚
                if (siblingIndex < re.getIndex()) {
                    //左节点最后一项右旋
                    searchChild.insertEntry(root.entryAt(siblingIndex), 0);
                    root.removeEntry(siblingIndex);
                    root.insertEntry(siblingNode.entryAt(siblingNode.nodeSize() - 1), siblingIndex);
                    siblingNode.removeEntry(siblingNode.nodeSize() - 1);
                    //子节点跟着右旋
                    if (!siblingNode.getIsLeaf()) {
                        searchChild.insertChild(siblingNode.childAt(siblingNode.sons.size() - 1), 0);
                        siblingNode.removeChild(siblingNode.sons.size() - 1);
                    }
                } else {
                    //是右兄嘚
                    searchChild.insertEntry(root.entryAt(re.getIndex()), searchChild.nodeSize() - 1);
                    root.removeEntry(re.getIndex());
                    root.insertEntry(siblingNode.entryAt(0), re.getIndex());
                    siblingNode.removeEntry(0);
                    if (!siblingNode.getIsLeaf()) {
                        searchChild.insertChild(siblingNode.childAt(0), searchChild.sons.size());
                        siblingNode.removeChild(0);
                    }
                }
                return delete(searchChild, entry);
            }
            //左右兄嘚都匀不出项来，直接由左右兄嘚节点与父项合并为一个节点
            if (re.getIndex() <= root.nodeSize() - 1) {
                Node<K, V> rightSon = root.childAt(re.getIndex() + 1);
                searchChild.insertEntry(root.entryAt(re.getIndex()), searchChild.nodeSize());
                root.removeEntry(re.getIndex());
                root.removeChild(re.getIndex() + 1);
                for (int i = 0; i < rightSon.nodeSize(); i++) {
                    searchChild.insertEntry(rightSon.entryAt(i));
                }
                if (!rightSon.getIsLeaf()) {
                    for (int j = 0; j < rightSon.sons.size(); j++) {
                        searchChild.insertChild(rightSon.childAt(j), searchChild.sons.size());
                    }
                }
                if (root == this.root) {
                    this.root = searchChild;
                }
            } else {
                //没有右兄弟，试试左兄嘚
                Node<K, V> leftSon = root.childAt(re.getIndex() - 1);
                searchChild.insertEntry(root.entryAt(re.getIndex() - 1), 0);
                root.removeChild(re.getIndex() - 1);
                root.removeEntry(re.getIndex() - 1);
                for (int i = 0; i < leftSon.nodeSize(); i++) {
                    searchChild.insertEntry(leftSon.entryAt(i));
                }
                if (!leftSon.getIsLeaf()) {
                    for (int i = leftSon.sons.size() - 1; i >= 0; i--) {
                        searchChild.insertChild(leftSon.childAt(i), 0);
                    }
                }
                if (root == this.root) {
                    this.root = searchChild;
                }
            }
//            if (root == this.root && root.nodeSize() == 0) {
//                root = searchChild;
//            }
            return delete(searchChild, entry);
        }
    }

    public Entry<K, V> delete(K key) {
        Entry<K, V> en = new Entry<K, V>();
        en.setKey(key);
        return delete(root, en);
    }

    /**
     * @Author Nxy
     * @Date 2020/2/25 14:18
     * @Description 借助队列打印B树
     */
    public void output() {
        Queue<Node<K, V>> queue = new LinkedList<Node<K, V>>();
        queue.offer(this.root);
        while (!queue.isEmpty()) {
            Node<K, V> node = queue.poll();
            for (int i = 0; i < node.nodeSize(); ++i) {
                System.out.print(node.entryAt(i) + " ");
            }
            System.out.println();
            if (!node.getIsLeaf()) {
                for (int i = 0; i <= node.sons.size() - 1; ++i) {
                    queue.offer(node.childAt(i));
                }
            }
        }
    }

    public static void main(String[] args) {
        Random random = new Random();
        BTree<Integer, Integer> btree = new BTree<Integer, Integer>(3);
        List<Integer> save = new ArrayList<Integer>(30);
//        save.add(8290);
//        save.add(7887);
//        save.add(9460);
//        save.add(9928);
//        save.add(6127);
//        save.add(5891);
//        save.add(1592);
//        save.add(14);
//        save.add(8681);
//        save.add(4843);
//        save.add(1051);

        for (int i = 0; i < 20; ++i) {
            int r = random.nextInt(10000);
            save.add(r);
            System.out.print(r + "  ");
            BTree.Entry en = btree.new Entry<Integer, Integer>();
            en.setKey(r);
            en.setValue(r);
//            BTree.Entry en = btree.new Entry<Integer, Integer>();
//            en.setKey(save.get(i));
            btree.insertNode(en);
        }

        System.out.println("----------------------");
        btree.output();
        System.out.println("----------------------");
        btree.delete(save.get(0));
        btree.output();
    }

}
```

# 参考资料

https://zh.wikipedia.org/wiki/B%E6%A0%91

[索引原理-BTree讲解](https://www.jianshu.com/p/6b90a185a795)

[B树Java代码实现以及测试](https://www.cnblogs.com/jing99/p/11736003.html)

[B-Tree/BTree 的Java实现](https://www.jianshu.com/p/d2d1181aa93d)

[B树详细图解与Java完整实现](https://blog.csdn.net/jimo_lonely/article/details/82716142)

[B树基本知识及其Java实现](http://blog.sina.com.cn/s/blog_3fe961ae0101i86y.html)

https://zhuanlan.zhihu.com/p/24309634

[自己写的java实现的多路搜索树 B-Tree](https://www.cnblogs.com/wglspark/p/5146612.html)

https://github.com/ypfssm/B-Tree/tree/master/src/com

[从B树、B+树、B*树谈到R 树](https://blog.csdn.net/v_JULY_v/article/details/6530142/)

[B树的 JAVA 实现](https://my.oschina.net/u/4377703/blog/4259106)

[关于索引以及 B-Tree 的实现](https://cloud.tencent.com/developer/article/1636042)

* any list
{:toc}