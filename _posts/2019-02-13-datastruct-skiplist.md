---
layout: post
title: 跳跃表(SkipList)
date:  2019-2-13 09:11:35 +0800
categories: [Data-Struct]
tags: [data-struct, index, sh]
published: true
excerpt: 跳跃表(SkipList)
---

# 什么是跳跃表

跳表由William Pugh发明。

他在论文 [《Skip lists: a probabilistic alternative to balanced trees》](https://15721.courses.cs.cmu.edu/spring2018/papers/08-oltpindexes1/pugh-skiplists-cacm1990.pdf)中详细介绍了跳表的数据结构和插入删除等操作。

```
跳表是一种可以用来代替平衡树的数据结构，跳表使用概率平衡而不是严格执行的平衡，因此，与等效树的等效算法相比，跳表中插入和删除的算法要简单得多，并且速度要快得多。
```

![Skip_list.svg.png](https://images.gitee.com/uploads/images/2020/1031/093429_fb08f237_508704.png)

## 为什么需要？

性能比较好。

实现相对于红黑树比较简单。

占用更少的内存。

# 论文解读

为了学习第一手的资料，我们先学习一下论文，然后再结合网上的文章，实现一个 java 版本的 skip-list。

## William Pugh

二叉树可用于表示抽象数据类型，例如字典和有序列表。

当元素以随机顺序插入时，它们可以很好地工作。某些操作序列（例如按顺序插入元素）产生了生成的数据结构，这些数据结构的性能非常差。

如果可以随机排列要插入的项目列表，则对于任何输入序列，树都将很好地工作。在大多数情况下，必须在线回答查询，因此随机排列输入是不切实际的。

平衡树算法会在执行操作时重新排列树，以保持一定的平衡条件并确保良好的性能。

skiplist是平衡树的一种**概率替代方案**。

通过咨询随机数生成器来平衡skiplist。尽管skiplist在最坏情况下的性能很差，但是没有任何输入序列会始终产生最坏情况的性能（就像枢轴元素随机选择时的快速排序一样）。

skiplist数据结构不太可能会严重失衡（例如，对于超过250个元素的字典，搜索所花费的时间超过预期时间的3倍的机会少于百万分之一）。类似于通过随机插入构建的搜索树，但不需要插入即可是随机的。

概率性地平衡数据结构比显式地保持平衡容易。

ps: 大部分程序员可以手写 skip-list，但是手写一个红黑树就要复杂的多。

对于许多应用程序，skiplist比树更自然地表示，这也导致**算法更简单**。

skiplist算法的简单性使其更易于实现，并且在平衡树和自调整树算法上提供了显着的恒定因子速度改进。

skiplist也非常**节省空间**。它们可以轻松配置为每个元素平均需要 4/3 个指针（甚至更少），并且不需要将平衡或优先级信息与每个节点一起存储。

## 算法核心思想

对于一个linked list来说，如果要查找某个元素，我们可能需要遍历整个链表。

如果list是有序的，并且每两个结点都有一个指针指向它之后两位的结点(Figure 1b)，那么我们可以通过查找不超过 `⌈n/2⌉+1` 个结点来完成查找。

如果每四个结点都有一个指针指向其之后四位的结点，那么只需要检查最多 `⌈n/4⌉+2` 个结点(Figure 1c)。

如果所有的第(2^i)个结点都有一个指针指向其2^i之后的结点(Figure 1d)，那么最大需要被检查的结点个数为 `⌈log_n2⌉`，代价仅仅是将需要的指针数量加倍。

这种数据结构的查询效率很高，但是对它的插入和删除几乎是不可实现的（impractical）。

接下来看下论文中的一张图：

![skip-list](https://images.gitee.com/uploads/images/2020/1101/180357_440c8fa3_508704.png)

因为这样的数据结构是基于链表的，并且额外的指针会跳过中间结点，所以作者称之为**跳表（Skip Lists）**。

## 结构

从图中可以看到， 跳跃表主要由以下部分构成：

表头（head）：负责维护跳跃表的节点指针。

跳跃表节点：保存着元素值，以及多个层。

层：保存着指向其他元素的指针。高层的指针越过的元素数量大于等于低层的指针，为了提高查找的效率，程序总是从高层先开始访问，然后随着元素值范围的缩小，慢慢降低层次。

表尾：全部由 NULL 组成，表示跳跃表的末尾。

# skip-list 算法过程

本节提供了在字典或符号表中搜索，插入和删除元素的算法。

搜索操作将返回与所需的键或失败的键关联的值的内容（如果键不存在）。

插入操作将指定的键与新值相关联（如果尚未存在，则插入该键）。 

Delete操作删除指定的密钥。

易于支持其他操作，例如“查找最小键”或“查找下一个键”。每个元素由一个节点表示，插入节点时，其级别是随机选择的，而不考虑元素的数量在数据结构中。

级别i节点具有i个前向指针，索引从1到i。

我们不需要在节点中存储节点的级别。级别以某个适当的常量MaxLevel进行上限。 

list 的级别是列表中当前的最大级别（如果列表为空，则为1）。

列表的标题具有从一级到MaxLevel的前向指针。

标头的前向指针在高于列表的当前最大级别的级别上指向NIL

## 初始化

分配元素NIL并为其提供比任何合法密钥更大的密钥。

所有skiplist的所有级别均以NIL终止。

初始化一个新列表，以使列表的级别等于1，并且列表标题的所有前向指针都指向NIL

## 搜索算法

我们通过遍历不超过包含要搜索元素的节点的前向指针来搜索元素（图2）。

如果在当前的前向指针级别上无法再取得任何进展，则搜索将向下移动到下一个级别。

当我们无法在1级进行更多处理时，我们必须紧靠在包含所需元素的节点之前（如果它在列表中）

![skiplist-02.PN](https://images.gitee.com/uploads/images/2020/1101/182141_b100dd4d_508704.png)

## 插入和删除算法

要插入或删除节点，我们只需进行搜索和拼接，如图3所示。

![skiplist-03](https://images.gitee.com/uploads/images/2020/1101/182508_d12b2311_508704.png)

图4给出了插入和删除的算法。 

保持向量更新，以便在搜索完成时（并且我们准备执行拼接），update [i]包含一个指向级别i或更高级别的最右边节点的指针，该指针位于插图位置的左侧 /删除。

如果插入生成的节点的级别大于列表的先前最大级别，则我们将更新列表的最大级别，并初始化更新向量的适当部分。

每次删除后，我们检查是否删除了列表的最大元素，如果删除了，请减小列表的最大级别。

![skiplist-04](https://images.gitee.com/uploads/images/2020/1101/182609_95d0ce54_508704.png)

## 选择一个随机级别

最初，我们讨论了概率分布，其中一半的具有i指针的节点也具有i + 1指针。

为了摆脱魔术常数，我们说具有i指针的节点的一小部分也具有i + 1指针。 （对于我们最初的讨论，p = 1/2）。

通过与图5中等效的算法随机生成级别。

生成级别时不参考列表中元素的数量。

![skiplist-05](https://images.gitee.com/uploads/images/2020/1101/182901_968c1b17_508704.png)

## 我们从什么级别开始搜索？定义L(n)

在用p = 1/2生成的16个元素的skiplist中，我们可能会遇到9个1级元素，3个2级元素，3个3级元素和1个14级元素（这是不太可能的，但是可以发生）。

 我们应该如何处理呢？

如果我们使用标准算法并从14级开始搜索，我们将做很多无用的工作。

我们应该从哪里开始搜索？

我们的分析表明，理想情况下，我们将在期望 1/p 个节点的级别L处开始搜索。

当 L = log_(1/p)n 时，会发生这种情况。

由于我们将经常引用此公式，因此我们将使用 L(n) 表示 log_(1/p)n。

对于决定如何处理列表中异常大的元素的情况，有许多解决方案。

### 别担心，要乐观些。

只需从列表中存在的最高级别开始搜索即可。

正如我们将在分析中看到的那样，n个元素列表中的最大级别明显大于 L(n) 的概率非常小。

从列表中的最高级别开始搜索不会给预期搜索时间增加一个很小的常数。

这是本文描述的算法中使用的方法

### 使用少于给定的数量。

尽管一个元素可能包含14个指针的空间，但我们不需要全部使用14个指针。

我们可以选择仅使用 L(n) 级。

有很多方法可以实现此目的，但是它们都使算法复杂化并且不能显着提高性能，因此不建议使用此方法。

### 修复随机性（dice）

如果我们生成的随机级别比列表中的当前最大级别大一倍以上，则只需将列表中当前的最大级别再加上一个作为新节点的级别即可。

在实践中，从直观上看，此更改似乎效果很好。 

但是，由于节点的级别不再是完全随机的，这完全破坏了我们分析结果算法的能力。

程序员可能应该随意实现它，而纯粹主义者则应避免这样做。

## 确定MaxLevel

由于我们可以安全地将级别限制为 L(n)，因此我们应该选择 MaxLevel = L(n)（其中N是skiplist中元素数量的上限）。

如果 p = 1/2，则使用 MaxLevel = 16适用于最多包含216个元素的数据结构。

ps: maxLevel 可以通过元素个数+P的值推导出来。

针对 P，作者的建议使用 p = 1/4。后面的算法分析部分有详细介绍，篇幅较长，感兴趣的同学可以在 java 实现之后阅读到。

# Java 实现版本

## 加深印象

我们无论看理论觉得自己会了，然而常常是眼高手低。

最好的方式就是自己写一遍，这样印象才能深刻。

## 节点定义

我们可以认为跳表就是一个加强版本的链表。

所有的链表都需要一个节点 Node，我们来定义一下：

```java
/**
 * 元素节点
 * @param <E> 元素泛型
 * @author 老马啸西风
 */
private static class SkipListNode<E> {
    /**
     * key 信息
     * <p>
     * 这个是什么？index 吗？
     *
     * @since 0.0.4
     */
    int key;
    /**
     * 存放的元素
     */
    E value;
    /**
     * 向前的指针
     * <p>
     * 跳表是多层的，这个向前的指针，最多和层数一样。
     *
     * @since 0.0.4
     */
    SkipListNode<E>[] forwards;

    @SuppressWarnings("all")
    public SkipListNode(int key, E value, int maxLevel) {
        this.key = key;
        this.value = value;
        this.forwards = new SkipListNode[maxLevel];
    }
    @Override
    public String toString() {
        return "SkipListNode{" +
                "key=" + key +
                ", value=" + value +
                ", forwards=" + Arrays.toString(forwards) +
                '}';
    }
}
```

事实证明，链表中使用 array 比使用 List 可以让代码变得简洁一些。

至少在阅读起来更加直，第一遍就是用 list 实现的，后来不全部重写了。

对比如下：

```java
newNode.forwards[i] = updates[i].forwards[i];   //数组

newNode.getForwards().get(i).set(i, updates.get(i).getForwards(i)); //列表
```

## 查询实现

查询的思想很简单：我们从最高层开始从左向右找（最上面一层可以最快定位到我们想找的元素大概位置），如果 next 元素大于指定的元素，就往下一层开始找。

任何一层，找到就直接返回对应的值。

找到最下面一层，还没有值，则说明元素不存在。

```java
/**
 * 执行查询
 * @param searchKey 查找的 key
 * @return 结果
 * @since 0.0.4
 * @author 老马啸西风
 */
public E search(final int searchKey) {
    // 从左边最上层开始向右
    SkipListNode<E> c = this.head;
    // 从已有的最上层开始遍历
    for(int i = currentLevel-1; i >= 0; i--) {
        while (c.forwards[i].key < searchKey) {
            // 当前节点在这一层直接向前
            c = c.forwards[i];
        }
        // 判断下一个元素是否满足条件
        if(c.forwards[i].key == searchKey) {
            return c.forwards[i].value;
        }
    }
    // 查询失败，元素不存在。
    return null;
}
```

ps: 网上的很多实现都是错误的。大部分都没有理解到 skiplist 查询的精髓。

## 插入

若key不存在，则插入该key与对应的value；若key存在，则更新value。

如果待插入的结点的层数高于跳表的当前层数currentLevel，则更新currentLevel。

选择待插入结点的层数randomLevel：

randomLevel只依赖于跳表的最高层数和概率值p。

算法在后面的代码中。

另一种实现方法为，如果生成的randomLevel大于当前跳表的层数currentLevel，那么将randomLevel设置为currentLevel+1，这样方便以后的查找，在工程上是可以接受的，但同时也破坏了算法的随机性。

```java
/**
 * 插入元素
 *
 *
 * @param searchKey 查询的 key
 * @param newValue 元素
 * @since 0.0.4
 * @author 老马啸西风
 */
@SuppressWarnings("all")
public void insert(int searchKey, E newValue) {
    SkipListNode<E>[] updates = new SkipListNode[maxLevel];
    SkipListNode<E> curNode = this.head;
    for (int i = currentLevel - 1; i >= 0; i--) {
        while (curNode.forwards[i].key < searchKey) {
            curNode = curNode.forwards[i];
        }
        // curNode.key < searchKey <= curNode.forward[i].key
        updates[i] = curNode;
    }
    // 获取第一个元素
    curNode = curNode.forwards[0];
    if (curNode.key == searchKey) {
        // 更新对应的值
        curNode.value = newValue;
    } else {
        // 插入新元素
        int randomLevel = getRandomLevel();
        // 如果层级高于当前层级，则更新 currentLevel
        if (this.currentLevel < randomLevel) {
            for (int i = currentLevel; i < randomLevel; i++) {
                updates[i] = this.head;
            }
            currentLevel = randomLevel;
        }
        // 构建新增的元素节点
        //head==>new  L-1
        //head==>pre==>new L-0
        SkipListNode<E> newNode = new SkipListNode<>(searchKey, newValue, randomLevel);
        for (int i = 0; i < randomLevel; i++) {
            newNode.forwards[i] = updates[i].forwards[i];
            updates[i].forwards[i] = newNode;
        }
    }
}
```

其中 getRandomLevel 是一个随机生成 level 的方法。

```java
/**
 * 获取随机的级别
 * @return 级别
 * @since 0.0.4
 */
private int getRandomLevel() {
    int lvl = 1;
    //Math.random() 返回一个介于 [0,1) 之间的数字
    while (lvl < this.maxLevel && Math.random() < this.p) {
        lvl++;
    }
    return lvl;
}
```

个人感觉 skiplist 非常巧妙的一点就是利用随机达到了和平衡树类似的平衡效果。

不过也正因为随机，每次的链表生成的都不同。

## 删除

删除特定的key与对应的value。

如果待删除的结点为跳表中层数最高的结点，那么删除之后，要更新currentLevel。

```java
/**
 * 删除一个元素
 * @param searchKey 查询的 key
 * @since 0.0.4
* @author 老马啸西风
 */
@SuppressWarnings("all")
public void delete(int searchKey) {
    SkipListNode<E>[] updates = new SkipListNode[maxLevel];
    SkipListNode<E> curNode = this.head;
    for (int i = currentLevel - 1; i >= 0; i--) {
        while (curNode.forwards[i].key < searchKey) {
            curNode = curNode.forwards[i];
        }
        // curNode.key < searchKey <= curNode.forward[i].key
        // 设置每一层对应的元素信息
        updates[i] = curNode;
    }
    // 最下面一层的第一个指向的元素
    curNode = curNode.forwards[0];
    if (curNode.key == searchKey) {
        for (int i = 0; i < currentLevel; i++) {
            if (updates[i].forwards[i] != curNode) {
                break;
            }
            updates[i].forwards[i] = curNode.forwards[i];
        }
        // 移除无用的层级
        while (currentLevel > 0 && this.head.forwards[currentLevel-1] ==  this.NIL) {
            currentLevel--;
        }
    }
}
```

## 输出跳表

为了便于测试，我们实现一个输出跳表的方法。

```java
/**
 * 打印 list
 * @since 0.0.4
 */
public void printList() {
    for (int i = currentLevel - 1; i >= 0; i--) {
        SkipListNode<E> curNode = this.head.forwards[i];
        System.out.print("HEAD->");
        while (curNode != NIL) {
            String line = String.format("(%s,%s)->", curNode.key, curNode.value);
            System.out.print(line);
            curNode = curNode.forwards[i];
        }
        System.out.println("NIL");
    }
}
```

## 测试

```java
public static void main(String[] args) {
    SkipList<String> list = new SkipList<>();
    list.insert(3, "耳朵听声音");
    list.insert(7, "镰刀来割草");
    list.insert(6, "口哨嘟嘟响");
    list.insert(4, "红旗迎风飘");
    list.insert(2, "小鸭水上漂");
    list.insert(9, "勺子能吃饭");
    list.insert(1, "铅笔细又长");
    list.insert(5, "秤钩来买菜");
    list.insert(8, "麻花扭一扭");
    list.printList();
    System.out.println("---------------");
    list.delete(3);
    list.delete(4);
    list.printList();
    System.out.println(list.search(8));
}
```

日志如下：

```
HEAD->(5,秤钩来买菜)->(6,口哨嘟嘟响)->NIL
HEAD->(1,铅笔细又长)->(2,小鸭水上漂)->(3,耳朵听声音)->(4,红旗迎风飘)->(5,秤钩来买菜)->(6,口哨嘟嘟响)->(7,镰刀来割草)->(8,麻花扭一扭)->(9,勺子能吃饭)->NIL
---------------
HEAD->(5,秤钩来买菜)->(6,口哨嘟嘟响)->NIL
HEAD->(1,铅笔细又长)->(2,小鸭水上漂)->(5,秤钩来买菜)->(6,口哨嘟嘟响)->(7,镰刀来割草)->(8,麻花扭一扭)->(9,勺子能吃饭)->NIL
麻花扭一扭
```

# skiplist 算法分析

执行搜索，删除和插入操作所需的时间由搜索适当元素所需的时间决定。

对于“插入”和“删除”操作，存在与插入或删除的节点级别成比例的额外费用。

查找元素所需的时间与搜索路径的长度成正比，这取决于在遍历列表时出现具有不同级别元素的模式。

## 概率论

skiplist 的结构仅由skiplist中的数字元素和查询随机数生成器的结果确定。

产生当前 skiplist 的操作顺序无关紧要。

我们假定对抗用户无法访问节点级别；否则，他可以通过删除所有非级别1的节点来创建运行时间最差的情况。

在相同数据结构上进行连续操作的运行时间差的可能性不是独立的； 对同一元素的两次成功搜索都将恰好同时发生。

稍后将对此进行更多说明。

## 预期搜寻费用分析

我们向后分析搜索路径，向上和向左移动。

尽管列表中的节点级别是已知的，并且在执行搜索时是固定的，但是我们的行为就像仅在回溯搜索路径时观察到节点级别时才确定该级别。

在攀登的任何特定点，我们都处于与图6中的情况a类似的情况-我们处于节点x的第i个前向指针，并且我们不知道x左侧的节点级别或该级别的知识 x的值，除了x的级别必须至少为i。

![skiplist-06](https://images.gitee.com/uploads/images/2020/1101/184235_0691d5f5_508704.png)

假定x不是标头（等效于假设列表无限向左扩展）。

如果x的水平等于i，那么我们处于情况b。

如果x的级别大于i，则我们处于情况c。

我们处于情况c的概率为p。

每次我们处于情况c时，我们都会爬上一个台阶。

令 C(k)=在无限列表中爬升k级的搜索路径的预期成本（即长度）。

![skiplist-ck](https://images.gitee.com/uploads/images/2020/1101/184131_06f849ce_508704.png)


我们假设列表是无限的，这是一个悲观的假设。

 当我们在向后爬升中撞向标头时，我们只是向上爬升，而没有执行任何向左移动。

这使我们在n个元素的列表中从级别1到级别 L(n) 爬升的路径的预期长度上具有 `(L(n)-1) / P` 的上限。

我们使用此分析直至 L(n) 级，并在其余的旅程中使用不同的分析技术。

剩下的向左移动次数受整个列表中级别L(n)或更高级别的元素的数量限制，其期望值为 1/P。


我们还从级别 L(n) 向上移动到列表中的最大级别。

列表的最大级别大于 k 的概率等于 `1–(1 – p^k)^n` ，最大为 `np^k`。

我们可以计算出预期的最大水平最多为 `L(n) + 1/(1-p)`。

综合我们的结果，我们发现总期望成本要从 `n≤ L(n)/p + 1/(1-p)`的n个元素列表中爬出，即 O(logn)

## 比较次数

我们的结果是分析搜索路径的“长度”。

所需的比较次数是一个加上搜索路径的长度（对搜索路径中的每个位置执行一次比较，搜索路径的“长度”是搜索路径中位置之间的跳数）。

## 概率分析

也可以分析搜索成本的概率分布。

概率分析稍微复杂一些（见方框）。

通过概率分析，我们可以计算出搜索的实际成本超出预期成本超过指定比率的概率的上限。

此分析的一些结果如图8所示。

![skiplist-08](https://images.gitee.com/uploads/images/2020/1101/185036_c07776a1_508704.png)

## 选择合适的 P

ps: skiplist 里面最重要的两个变量，maxLevel 和 P

表1 给出了p的不同值的相对时间和空间要求。

![skiplist-table1](https://images.gitee.com/uploads/images/2020/1101/185415_b90abc63_508704.png)

p减小也会增加运行时间的可变性。

如果 1/p 是2的幂，则很容易从随机比特流中生成随机级别（它需要 (log_2 1/p)/(1–p)  随机比特的平均值才能生成随机级别） ）。

由于某些恒定开销与 L(n)（而不是 L(n)/p ）有关，因此**选择 p = 1/4（而不是1/2）也会稍微改善算法速度的常数因子**。

我建议将1/4的值用于运行时间的可变性，这是主要考虑因素，在这种情况下，p应该为1/2。

## 操作顺序

一个操作序列的预期总时间等于该序列中每个操作的预期时间之和。 

因此，包含n个元素的数据结构中任何 msearch 序列的预期时间为 O(mlog n)。 

但是，搜索模式会影响执行整个操作序列的实际时间的概率分布。

如果我们在相同的数据结构中搜索相同的项目两次，则两次搜索将花费完全相同的时间。 

因此，总时间的方差将是单个搜索方差的四倍。 

如果两个元素的搜索时间是独立的，则总时间的方差等于各个搜索的方差之和，一遍又一遍地搜索同一元素将使方差最大化。


# 替代数据结构

平衡树（例如AVL树[Knu73] [Wir76]）和自调节树[ST85]可以用于与跳表相同的问题。

所有这三种技术的性能范围都相同。

这些方案中的选择涉及以下几个因素：实现算法的难度，恒定因素，边界类型（摊销，概率或最坏情况）以及查询分布不均匀的性能

## 实施难度

对于大多数应用程序，实施者通常都同意，跳表比平衡树算法或自我调整树算法要容易得多

## 恒定因素

常数因子可以在算法的实际应用中产生重大影响。

对于亚线性算法尤其如此。

例如，假设算法A和B都需要O（log n）时间来处理查询，但是B的速度是A的两倍：在时间A中，算法A花费了对大小为n的数据集进行查询的时间。 

算法B可以处理大小为n2的数据集的查询，对算法的常数因子有两个重要但在质上不同的贡献。

首先，该算法固有的复杂性为任何实现方式下了下限。

在执行搜索时，会不断重新调整自调整树；这给自调整树的任何实现施加了相当大的开销。跳表算法似乎具有非常低的固有常数因子开销：删除列表的删除算法的内部循环在68020上仅编译为6条指令。

其次，如果算法复杂，则会阻止程序员实施优化。例如，通常使用递归插入和删除过程来描述平衡树算法，因为这是描述算法的最简单直观的方法。

递归插入或删除过程会产生过程调用开销。

通过使用非递归插入和删除过程，可以消除一些开销。

但是，用于平衡树中插入和删除的非递归算法的复杂性令人生畏，这种复杂性阻止了大多数编程人员消除这些例程中的递归。

跳表算法已经是非递归算法了，它们非常简单，以至于程序员不会因执行优化而受阻。

表2比较了跳表和其他四种技术的实现性能。

![skiplist-table](https://images.gitee.com/uploads/images/2020/1101/190206_f3c43a77_508704.png)

所有实现都针对效率进行了优化。

AVL树算法由Contel的James Macropol编写，并基于[Wir76]中的算法。 

2-3树算法基于[AHU83]中提出的算法。

对其他几个现有的平衡树包进行了计时，发现它们比下面预示的结果要慢得多。

自调整树算法基于[ST85]中提出的算法。

该表中的时间反映了Sun-3/60在包含216个带有整数键的元素的数据结构中执行操作的CPU时间。

括号中的值表示与跳表时间相关的结果插入和删除的时间不包括内存管理时间（例如，在C程序中，对malloc和free的调用）。

请注意，跳表比其他方法执行更多的比较（跳过这里介绍的列表算法需要平均L（n）/ p + 1 /（1 – p）+ 1个比较）。

对于使用实数作为键的测试，跳表比非递归AVL树算法稍慢，并且在跳表中的搜索比在2-3树中搜索稍慢（使用跳表算法进行插入和删除仍比使用快。递归2-3树算法）。

如果比较非常昂贵，则可以更改算法，以便在搜索过程中每一次将搜索关键字与节点关键字进行比较时都可以。

 对于p = 1/2，这将在7/2 +3/2 log2n的预期比较数上产生一个上限。

[Pug89b]中讨论了此修改。

## 绩效约束类型

这三类算法具有不同的性能范围。

平衡树具有最坏情况的时间范围，自调整树具有摊销的时间范围，跳表具有概率的时间范围。

对于自调整树，单个操作可能会花费O（n）时间，但是时间范围始终会保持很长的操作序列。

对于跳表，尽管任何操作或操作序列花费的时间明显长于预期的可能性可以忽略不计，但其花费的时间可能比预期的长。

在某些实时应用中，必须确保操作会在一定时间内完成。

对于此类应用，可能不希望使用自调整树，因为它们在单个操作上花费的时间可能比预期要长得多（例如，单个搜索可能花费O（n）时间而不是O（log n）时间）。

对于实时系统，如果提供了足够的安全裕度，则可以使用跳转列表：在包含1000个元素的跳转列表中进行搜索所花费的时间超过预期时间的5倍的概率约为 10^18

## 查询分布不均匀

自调整树具有可调整为非均匀查询分布的属性。

由于在遇到统一的查询分布时，跳表要比自调整树快一个重要的常数，因此仅对于高度偏斜的分布，自调整树比跳表要快。

我们可以尝试设计自我调整跳表。

但是，似乎几乎没有实践动机来篡改跳表的简单性和快速性能。 

在期望高度偏斜分布的应用中，自调整树或由高速缓存增强的跳表可能会更可取[Pug90]。


## skiplist 的其他工作

我已经描述了一组算法，该算法允许多个处理器同时更新共享内存中的跳表[Pug89a]。

这些算法比并发平衡树算法简单得多。

它们允许在n个元素的跳表中有无限数量的读者和n个忙碌的作者，而锁争用很少。

使用跳表，很容易完成大多数（全部？）操作，您可能希望对平衡树进行各种操作，例如usesearch手指，合并跳表并允许进行排名操作（例如，确定列表的第k个元素跳表）[Pug89b]。汤姆·帕帕达基斯（Tom Papadakis），伊恩·蒙罗（Ian Munro）和帕特里西奥·波布莱特（Patricio Poblette）[PMP90]对Askip列表中的预期搜索时间进行了精确分析。

本文所述的上限接近确切的上限；他们用来进行精确分析的技术非常复杂和复杂。

他们的精确分析表明，对于p = 1/2和p = 1/4，本文给出的预期搜索成本上限比确切预期成本高2个比较。我已经调整了概率平衡的概念在数据结构和增量计算中都会遇到一些其他问题[PT88]。

我们可以基于将哈希函数应用于元素的结果来生成阳极水平（与使用随机数生成器相反）。

这导致一种方案，其中对于任何集合S，都有一个表示S的唯一数据结构，并且该数据结构很有可能近似平衡。

如果我们将此想法与应用性（即持久性）概率均衡数据结构和诸如hash-coning [All78]这样的方案结合使用，该方案允许对应用性数据结构进行恒定时间结构相等性测试，我们将获得许多有趣的属性，例如常量时间相等性测试的序列表示。

该方案还具有许多用于增量计算的应用程序。

由于跳表在应用上有些尴尬，因此使用了概率平衡树方案。

# 结论

从理论上讲，不需要跳表。

平衡树可以执行跳表可以完成的所有操作，并且具有良好的最坏情况时间范围（与跳表不同）。

但是，实现平衡树是一项艰巨的任务，因此，除了作为数据结构类中编程任务的一部分外，很少实现平衡树算法。

跳表是一种简单的数据结构，可用于大多数应用程序中的平衡树。

跳表算法非常易于实现，扩展和修改。

跳过者的速度与高度优化的平衡树算法一样快，并且比随意实施的平衡树算法要快得多。

--------------------------------------------------------------------------------------------------------

# C 实现过程

## 定义节点

```c
//每个节点的数据结构
typedef  struct nodeStructure  
{  
    int key;    
    int value;  
    struct nodeStructure *forward[1];  
}nodeStructure;  

//跳跃表的数据结构
typedef  struct skiplist  
{  
    int level;  
    nodeStructure *header;  
}skiplist;  
```

## 节点的创建

```c
nodeStructure* createNode(int level,int key,int value)  
{  
 
  nodeStructure *ns=(nodeStructure *)malloc(sizeof(nodeStructure)+level*sizeof(nodeStructure*));    
 
   ns->key=key;    
   ns->value=value;    
   return ns;    
}
```

## 列表的初始化

列表的初始化需要初始化头部，并使头部每层（根据事先定义的MAX_LEVEL）指向末尾（NULL）。

```c
skiplist* createSkiplist()  
{  
   skiplist *sl=(skiplist *)malloc(sizeof(skiplist));    
   sl->level=0;    
   sl->header=createNode(MAX_LEVEL-1,0,0);    
   for(int i=0;i<MAX_LEVEL;i++)    
   {    
       sl->header->forward[i]=NULL;    
   }  
   return sl;  
}
```

## 插入元素

插入元素的时候元素所占有的层数完全是随机的，通过随机算法产生

```c
int randomLevel()    
{  
    int k=1;  
    while (rand()%2)    
        k++;    
    k=(k<MAX_LEVEL)?k:MAX_LEVEL;  
    return k;    
}  
```

跳表的插入需要三个步骤，第一步需要查找到在每层待插入位置，然后需要随机产生一个层数，最后就是从高层至下插入，插入时算法和普通链表的插入完全相同。

```c
bool insert(skiplist *sl,int key,int value)  
{  
    nodeStructure *update[MAX_LEVEL];  
    nodeStructure *p, *q = NULL;  
    p=sl->header;  
    int k=sl->level;  
  
    //从最高层往下查找需要插入的位置  
    //填充update  
    for(int i=k-1; i >= 0; i--){  
        while((q=p->forward[i])&&(q->key<key))  
        {  
            p=q;  
        }  
        update[i]=p;  
    }  
  
    //不能插入相同的key  
    if(q&&q->key==key)  
    {  
        return false;  
    }  
 
    //产生一个随机层数K  
    //新建一个待插入节点q  
    //一层一层插入  
    k=randomLevel();  
    //更新跳表的level  
    if(k>(sl->level))  
    {  
        for(int i=sl->level; i < k; i++){  
            update[i] = sl->header;  
        }  
        sl->level=k;  
    }  
  
    q=createNode(k,key,value); 
    //逐层更新节点的指针，和普通列表插入一样  
    for(int i=0;i<k;i++)  
    {  
        q->forward[i]=update[i]->forward[i];  
        update[i]->forward[i]=q;  
    }  
    return true;  
}  
```

## 删除节点

删除节点操作和插入差不多，找到每层需要删除的位置，删除时和操作普通链表完全一样。不过需要注意的是，如果该节点的level是最大的，则需要更新跳表的level。

```c
bool deleteSL(skiplist *sl,int key)  
{  

   nodeStructure *update[MAX_LEVEL];   
   nodeStructure *p,*q=NULL;  
   p=sl->header;  
 
   //从最高层开始搜  
   int k=sl->level;  
   for(int i=k-1; i >= 0; i--){  
       while((q=p->forward[i])&&(q->key<key))  
       {  
           p=q;  
       }  
       update[i]=p;  
   }  
 
   if(q&&q->key==key)  
   {  
       //逐层删除，和普通列表删除一样  
       for(int i=0; i<sl->level; i++){    
           if(update[i]->forward[i]==q){    
               update[i]->forward[i]=q->forward[i];    
           }  
       }   
       free(q);  
       //如果删除的是最大层的节点，那么需要重新维护跳表的  
       for(int i=sl->level-1; i >= 0; i--){    
           if(sl->header->forward[i]==NULL){    
               sl->level--;    
           }    
       }    
       return true;  
   }  
   else  
       return false;  
}  
```

## 查找

跳表的优点就是查找比普通链表快，当然查找操作已经包含在在插入和删除过程，实现起来比较简单。

```c
int search(skiplist *sl,int key)  
{  
    nodeStructure *p,*q=NULL;  
    p=sl->header;  
    //从最高层开始搜  
    int k=sl->level;  
    for(int i=k-1; i >= 0; i--){  
        while((q=p->forward[i])&&(q->key<=key))  
        {  
            if(q->key==key)  
            {  
                return q->value;  
            }  
            p=q;  
        }  
    }  
    return NULL;  
}
```

# 索引

今天想说一说搜索引擎或者数据库中索引（主要是倒排索引）的字典结构，一个好的高效的字典结构直接影响到索引的效果，而索引的构建其实并不是完全追求速度，还有磁盘空间，内存空间等各个因素，所以在一个索引系统中，需要权衡各个关系，找到一种适合你当前业务的数据结构进行存储。

这样才能发挥索引最大的能效，一般情况下，对于索引来说（主要是倒排索引）的字典来说，有**跳跃表，B+树，前缀树，后缀树，自动状态机，哈希表**这么几种数据结构，其实只要是一个快速的查找型的数据结构就可以用来做索引的字典。

# 拓展阅读

[红黑树](https://houbb.github.io/2018/09/12/data-struct-red-black-tree)

[B+ Tree](https://houbb.github.io/2018/09/12/b-tree)

[Hash 算法](https://houbb.github.io/2018/05/30/hash)

TODO：自动状态机==》索引

# 参考资料 

https://en.wikipedia.org/wiki/Skip_list

[跳表SkipList](http://www.cnblogs.com/xuqiang/archive/2011/05/22/2053516.html)

https://segmentfault.com/a/1190000009546008

[跳跃表C实现](https://www.jianshu.com/p/1ff0db20ec58)

[Redis 跳跃表](https://redisbook.readthedocs.io/en/latest/internal-datastruct/skiplist.html)

https://zhuanlan.zhihu.com/p/26499803

http://www.cppblog.com/superKiki/archive/2010/10/18/130328.html

[java 实现](http://www.cnblogs.com/acfox/p/3688607.html)

https://blog.csdn.net/qq575787460/article/details/16371287

http://www.cnblogs.com/thrillerz/p/4505550.html

- 状态自动机

[字符串匹配算法之：有限状态自动机](https://blog.csdn.net/tyler_download/article/details/52549315)

[跳表 skiplist](https://segmentfault.com/a/1190000006024984)

[外文翻译] 跳表（Skip List）](https://www.cnblogs.com/hezhiqiangTS/p/11412777.html)

* any list
{:toc}