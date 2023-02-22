---
layout: post
title: Tree-08-多路查找树 BTree 及 java 实现
date:  2020-10-17 16:15:55 +0800
categories: [Data-Struct]
tags: [data-struct, java, sh]
published: true
---

# BTree 历史

在1970年，Bayer＆McCreight发表的论文《ORGANIZATION AND MAINTENANCE OF LARGE ORDERED INDICES》（大型有序索引的组织和维护）中提出了一种新的数据结构来维护大型索引，这种数据结构在论文中称为B Tree。

## B树的定义

h：代表树的高度，k 是个自然数，一个B树要么是空的，要么满足以下条件：

1. 所有叶子节点到根节点的路径长度相同，即具有相同的高度；（树是平衡的）

2. 每个非叶子和根节点（即内部节点）至少有 k+1 个孩子节点，根至少有 2 个孩子；（这是关键的部分，因为节点都是分裂而来的，而每次分裂得到的节点至少有 k 个元素，也就有 k+1 个孩子；但根节点在分裂后可能只有一个元素，因为不需要向上融合，中间元素作为新的根节点，因此最少有两个孩子。而叶子节点没有孩子。）

3. 每个节点最多有 2k+1 个孩子节点。（规定了节点的最大容量）

4. 每个节点内的键都是递增的


## 描述

为了描述B Tree，首先定义一条数据记录为一个二元组[key, data]，key为记录的键值，对于不同数据记录，key是互不相同的；data为数据记录除key外的数据。那么B Tree是满足下列条件的数据结构：

d为大于1的一个正整数，称为B Tree的度。

h为一个正整数，称为B Tree的高度。

每个非叶子节点由n-1个key和n个指针组成，其中d<=n<=2d。

每个叶子节点最少包含一个key和两个指针，最多包含2d-1个key和2d个指针，叶节点的指针均为null 。

所有叶节点具有相同的深度，等于树高h。

key和指针互相间隔，节点两端是指针。

一个节点中的key从左到右非递减排列。

所有节点组成树结构。

每个指针要么为null，要么指向另外一个节点。

如果某个指针在节点node最左边且不为null，则其指向节点的所有key小于v(key1)，其中v(key1)为node的第一个key的值。

如果某个指针在节点node最右边且不为null，则其指向节点的所有key大于v(keym)，其中v(keym)为node的最后一个key的值。

如果某个指针在节点node的左右相邻key分别是keyi和keyi+1且不为null，则其指向节点的所有key小于v(keyi+1)且大于v(keyi)。

图2是一个d=2的B Tree示意图。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/210213_2f36c9a1_508704.png "屏幕截图.png")

由于B-Tree的特性，在B-Tree中按key检索数据的算法非常直观：首先从根节点进行二分查找，如果找到则返回对应节点的data，否则对相应区间的指针指向的节点递归进行查找，直到找到节点或找到null指针，前者查找成功，后者查找失败。


## BTree 的优势

B 树是一种多路查找树，相比于二叉树来说，B 树更适合于建立存储设备中的文件索引。

因为对于存储设备的操作，除算法的时间复杂度外，查找一个数据所需要进行 I/O 操作的次数也是性能的重要影响因素。

对于传统的二叉树来说，其存储比较松散，树的深度较深，我们每次查找一个新节点，可能都需要进行一次 I/O 操作将其读入内存。

**而 B 树因为数据存储比较集中，一个节点内存储的数据更多，树的深度较浅，遍历整个 B 树所需 I/O 操作的次数远小于二叉树，同时因为我们的存储设备普遍适配了局部性原理，对于一个连续存储的节点来说，完全读取它所需 I/O 操作的次数也是非常少的。**

从算法时间复杂度上看，因为 B 树节点中的项都是有序存储的，我们在一个节点内寻找数据时，使用二分查找可以使时间复杂度落在 O(log2N) 内，与在二叉树中的查找相同。因此总的来看，B 树相比于二叉树更适用于在存储设备上维护文件索引。

另外，B 树是平衡的，其维护平衡性的思路非常典型。对于普通的二叉树，是自上向下生长的，而对于B树，是自下而上生长的。

我们的插入操作都只会将新项插入到叶子节点，叶子节点满后进行分裂，并将中间节点向上融合。整颗树高度的增加必然是由根节点的分裂带来的，而根节点的分裂不会破坏整颗树的平衡性，因为左右子树的高度均加一。

对于一棵完全的二叉排序树，其根节点必然是整个有序链表的中点。这对于 B 树也是相通的，每次的分裂和向上融合都是向上传递了本节点的中点，所有元素组成的链表中，中间部分会集中在 B 树的上层节点中，这也保证了整棵树的平衡性。

我们平时使用的红黑树就是 2-3树（B树的一种）的一个变种，通过为二叉树节点染色，模仿 2-3 树的节点合并/分裂等行为，为其在平衡性和性能上找到了一个妥协点。

# 例子

B Tree中的每个结点根据实际情况可以包含大量的关键字信息和分支(当然是不能超过磁盘块的大小，根据磁盘驱动(disk drives)的不同，一般块的大小在1k~4k左右)；

这样树的深度降低了，这就意味着查找一个元素只要很少结点从外存磁盘中读入内存，很快访问到要查找的数据。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/193629_59b655cd_508704.png "屏幕截图.png")

为了简单，这里用少量数据构造一棵3叉树的形式。上面的图中比如根结点，其中17表示一个磁盘文件的文件名；小红方块表示这个17文件的内容在硬盘中的存储位置；p1表示指向17左子树的指针。

## 结构定义

文件的结构定义可以如下：

```c++
typedef struct {
    /*文件数*/

    int  file_num;

    /*文件名(key)*/

    char * file_name[max_file_num];

    /*指向子节点的指针*/

     BTNode * BTptr[max_file_num+1];

     /*文件在硬盘中的存储位置*/

     FILE_HARD_ADDR offset[max_file_num];

}BTNode;
```

假如每个盘块可以正好存放一个B Tree的结点（正好存放2个文件名）。

那么一个BTNode结点就代表一个盘块，而子树指针就是存放另外一个盘块的地址。

## 元素的查找

模拟查找文件29的过程：

(1) 根据根结点指针找到文件目录的根磁盘块1，将其中的信息导入内存。【磁盘IO操作1次】

(2) 此时内存中有两个文件名17，35和三个存储其他磁盘页面地址的数据。根据算法我们发现17<29<35，因此我们找到指针p2。

(3) 根据p2指针，我们定位到磁盘块3，并将其中的信息导入内存。【磁盘IO操作2次】

(4) 此时内存中有两个文件名26，30和三个存储其他磁盘页面地址的数据。根据算法我们发现26<29<30，因此我们找到指针p2。

(5) 根据p2指针，我们定位到磁盘块8，并将其中的信息导入内存。【磁盘IO操作3次】

(6) 此时内存中有两个文件名28，29。根据算法我们查找到文件29，并定位了该文件内存的磁盘地址。

分析上面的过程，发现需要3次磁盘IO操作和3次内存查找操作。关于内存中的文件名查找，由于是一个有序表结构，可以利用折半查找提高效率。至于3次磁盘IO操作时影响整个B Tree查找效率的决定因素。

当然，如果我们使用平衡二叉树的磁盘存储结构来进行查找，磁盘IO操作最少4次，最多5次。

而且文件越多，B Tree 比平衡二叉树所用的磁盘IO操作次数将越少，效率也越高。

上面仅仅介绍了对于B Tree这种结构的查找过程，还有树节点的插入与删除过程，以及相关的算法和代码的实现，将在以后的深入学习中给出相应的实例。

## 实战演练

下面以一棵5阶B Tree实例进行讲解(如下图所示)：

其满足上述条件：除根结点和叶子结点外，其它每个结点至少有 ceil(5/2) =3个孩子（至少2个关键字）；当然最多5个孩子（最多4个关键字）。

下图中关键字为大写字母，顺序为字母升序。

### 结构定义

```c++
typedef struct{
   int Count;         // 当前节点中关键元素数目

   ItemType Key[4];   // 存储关键字元素的数组

   long Branch[5];    // 伪指针数组，(记录数目)方便判断合并和分裂的情况

} NodeType;
```

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/194316_91807fb4_508704.png "屏幕截图.png")

### 插入（insert）操作

插入一个元素时，首先在B Tree中是否存在，如果不存在，即在叶子结点处结束，然后在叶子结点中插入该新的元素。

注意：如果叶子结点空间足够，这里需要向右移动该叶子结点中大于新插入关键字的元素，如果空间满了以致没有足够的空间去添加新的元素，则将该结点进行“分裂”，将一半数量的关键字元素分裂到新的其相邻右结点中，中间关键字元素上移到父结点中（当然，如果父结点空间满了，也同样需要“分裂”操作），而且当结点中关键元素向右移动了，相关的指针也需要向右移。

如果在根结点插入新元素，空间满了，则进行分裂操作，这样原来的根结点中的中间关键字元素向上移动到新的根结点中，因此导致树的高度增加一层。

咱们通过一个实例来逐步讲解下。

插入以下字符字母到空的5阶B Tree中：C N G A H E K Q M F W L T Z D P R X Y S，5序意味着一个结点最多有5个孩子和4个关键字，除根结点外其他结点至少有2个关键字，首先，结点空间足够，4个字母插入相同的结点中，如下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/194522_2d01e11e_508704.png "屏幕截图.png")

当咱们试着插入H时，结点发现空间不够，以致将其分裂成2个结点，移动中间元素G上移到新的根结点中，在实现过程中，咱们把A和C留在当前结点中，而H和N放置新的其右邻居结点中。如下图：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/194600_03188e3c_508704.png "屏幕截图.png")

当咱们插入E,K,Q时，不需要任何分裂操作

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/194626_59cf9fd0_508704.png "屏幕截图.png")

插入 M 需要一次分裂，注意 M 恰好是中间关键字元素，以致向上移到父节点中

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/194650_b06c0c67_508704.png "屏幕截图.png")

插入F,W,L,T不需要任何分裂操作

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/194709_f8f3953e_508704.png "屏幕截图.png")

插入Z时，最右的叶子结点空间满了，需要进行分裂操作，中间元素T上移到父节点中，注意通过上移中间元素，树最终还是保持平衡，分裂结果的结点存在2个关键字元素。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/194737_894b843c_508704.png "屏幕截图.png")

插入D时，导致最左边的叶子结点被分裂，D恰好也是中间元素，上移到父节点中，然后字母P,R,X,Y陆续插入不需要任何分裂操作。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/194821_9b981f53_508704.png "屏幕截图.png")

最后，当插入S时，含有N,P,Q,R的结点需要分裂，把中间元素Q上移到父节点中，但是情况来了，父节点中空间已经满了，所以也要进行分裂，将父节点中的中间元素M上移到新形成的根结点中，注意以前在父节点中的第三个指针在修改后包括D和G节点中。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/194855_ce89af7a_508704.png "屏幕截图.png")

这样具体插入操作的完成。

### 删除

下面介绍删除操作，删除操作相对于插入操作要考虑的情况多点。

首先查找B Tree中需删除的元素,如果该元素在B Tree中存在，则将该元素在其结点中进行删除，如果删除该元素后，首先判断该元素是否有左右孩子结点，如果有，则上移孩子结点中的某相近元素到父节点中，然后是移动之后的情况；如果没有，直接删除后，移动之后的情况.。

删除元素，移动相应元素之后，如果某结点中元素数目小于ceil(m/2)-1，则需要看其某相邻兄弟结点是否丰满（结点中元素个数大于ceil(m/2)-1），如果丰满，则向父节点借一个元素来满足条件；如果其相邻兄弟都刚脱贫，即借了之后其结点数目小于ceil(m/2)-1，则该结点与其相邻的某一兄弟结点进行“合并”成一个结点，以此来满足条件。那咱们通过下面实例来详细了解吧。

以上述插入操作构造的一棵5阶B Tree为例，依次删除H,T,R,E。

首先删除元素H，当然首先查找H，H在一个叶子结点中，且该叶子结点元素数目3大于最小元素数目ceil(m/2)-1=2，则操作很简单，咱们只需要移动K至原来H的位置，移动L至K的位置（也就是结点中删除元素后面的元素向前移动）
 
![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/195011_9e5b2d8e_508704.png "屏幕截图.png")

下一步，删除T,因为T没有在叶子结点中，而是在中间结点中找到，咱们发现他的继承者W(字母升序的下个元素)，将W上移到T的位置，然后将原包含W的孩子结点中的W进行删除，这里恰好删除W后，该孩子结点中元素个数大于2，无需进行合并操作。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/201221_d24584df_508704.png "屏幕截图.png")

下一步删除R，R在叶子结点中,但是该结点中元素数目为2，删除导致只有1个元素，已经小于最小元素数目ceil(5/2)-1=2,如果其某个相邻兄弟结点中比较丰满（元素个数大于ceil(5/2)-1=2），则可以向父结点借一个元素，然后将最丰满的相邻兄弟结点中上移最后或最前一个元素到父节点中，在这个实例中，右相邻兄弟结点中比较丰满（3个元素大于2），所以先向父节点借一个元素W下移到该叶子结点中，代替原来S的位置，S前移；然后X在相邻右兄弟结点中上移到父结点中，最后在相邻右兄弟结点中删除X，后面元素前移。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/201252_0f919887_508704.png "屏幕截图.png")

最后一步删除E，删除后会导致很多问题，因为E所在的结点数目刚好达标，刚好满足最小元素个数（ceil(5/2)-1=2）,而相邻的兄弟结点也是同样的情况，删除一个元素都不能满足条件，所以需要该节点与某相邻兄弟结点进行合并操作；

首先移动父结点中的元素（该元素在两个需要合并的两个结点元素之间）下移到其子结点中，然后将这两个结点进行合并成一个结点。

所以在该实例中，咱们首先将父节点中的元素D下移到已经删除E而只有F的结点中，然后将含有D和F的结点和含有A,C的相邻兄弟结点进行合并成一个结点。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/201403_fc5144de_508704.png "屏幕截图.png")

也许你认为这样删除操作已经结束了，其实不然，在看看上图，对于这种特殊情况，你立即会发现父节点只包含一个元素G，没达标，这是不能够接受的。

如果这个问题结点的相邻兄弟比较丰满，则可以向父结点借一个元素。

假设这时右兄弟结点（含有Q,X）有一个以上的元素（Q右边还有元素），然后咱们将M下移到元素很少的子结点中，将Q上移到M的位置，这时，Q的左子树将变成M的右子树，也就是含有N，P结点被依附在M的右指针上。

所以在这个实例中，咱们没有办法去借一个元素，只能与兄弟结点进行合并成一个结点，而根结点中的唯一元素M下移到子结点，这样，树的高度减少一层。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/201541_56418128_508704.png "屏幕截图.png")

### 删除的场景 2

为了进一步详细讨论删除的情况。

再举另外一个实例：

这里是一棵不同的5阶B Tree，那咱们试着删除C

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/201735_db5a59f3_508704.png "屏幕截图.png")

于是将删除元素C的右子结点中的D元素上移到C的位置，但是出现上移元素后，只有一个元素的结点的情况。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/201750_9a85504b_508704.png "屏幕截图.png")

又因为含有E的结点，其相邻兄弟结点才刚脱贫（最少元素个数为2），不可能向父节点借元素，所以只能进行合并操作，于是这里将含有A,B的左兄弟结点和含有E的结点进行合并成一个结点。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/201835_ecc0eda1_508704.png "屏幕截图.png")

这样又出现只含有一个元素F结点的情况，这时，其相邻的兄弟结点是丰满的（元素个数为3 > 最小元素个数2），这样就可以想父结点借元素了，把父结点中的J下移到该结点中，相应的如果结点中J后有元素则前移，然后相邻兄弟结点中的第一个元素（或者最后一个元素）上移到父节点中，后面的元素（或者前面的元素）前移（或者后移）；注意含有K，L的结点以前依附在M的左边，现在变为依附在J的右边。

这样每个结点都满足B Tree结构性质。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/201916_15f8d32d_508704.png "屏幕截图.png")


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

[B Tree/BTree 的Java实现](https://www.jianshu.com/p/d2d1181aa93d)

[B树详细图解与Java完整实现](https://blog.csdn.net/jimo_lonely/article/details/82716142)

[B树基本知识及其Java实现](http://blog.sina.com.cn/s/blog_3fe961ae0101i86y.html)

https://zhuanlan.zhihu.com/p/24309634

[自己写的java实现的多路搜索树 B Tree](https://www.cnblogs.com/wglspark/p/5146612.html)

https://github.com/ypfssm/B Tree/tree/master/src/com

[从B树、B+树、B*树谈到R 树](https://blog.csdn.net/v_JULY_v/article/details/6530142/)

[B树的 JAVA 实现](https://my.oschina.net/u/4377703/blog/4259106)

[关于索引以及 B Tree 的实现](https://cloud.tencent.com/developer/article/1636042)

* any list
{:toc}