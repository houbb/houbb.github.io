---
layout: post
title:  锁专题（9） ConcurrentSkipListMap 源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, queue, data-struct, sf]
published: true
---

# ConcurrentSkipListMap 

![思维导图](http://p9-tt-ipv6.byteimg.com/large/pgc-image/47be0d4098074f78a0d2ab7f32ba2442)

## 简介

可伸缩的并发ConcurrentNavigableMap 实现。

根据可比较的自然顺序或根据在创建 map 时提供的Comparator对 map 进行排序，具体取决于所使用的构造函数。

## 入门例子

```java
ConcurrentSkipListMap<String, Integer> map = new ConcurrentSkipListMap<String, Integer>();
map.put("one", 1);
map.put("two", 2);
for (String key : map.keySet()) {
    System.out.print("[" + key + "," + map.get(key) + "] ");
}
System.out.println("\n\n开始删除元素 1");
map.remove("one");
for (String key : map.keySet()) {
    System.out.print("[" + key + "," + map.get(key) + "] ");
}
```

日志如下：

```
[one,1] [two,2] 

开始删除元素 1
[two,2] 
```

我们可以将其当做普通的 map 使用，不过是线程安全的，而且查询性能非常优秀。

# 源码解析

下面让我们一起学习下 ConcurrentSkipListMap 的源码实现。

温馨提示：建议首先学习一下 skiplist 相关知识，参见 [java 实现跳表（skiplist）及论文解读](https://www.toutiao.com/item/6890519326613307908/)

本节内容较多，建议先收藏，再细细品味。

## jdk 版本

```
java version "1.8.0_192"
Java(TM) SE Runtime Environment (build 1.8.0_192-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.192-b12, mixed mode)
```

## 类定义

```java
public class ConcurrentSkipListMap<K,V> extends AbstractMap<K,V>
    implements ConcurrentNavigableMap<K,V>, Cloneable, Serializable {}
```

延迟队列继承自 AbstractMap 类，并且实现了 ConcurrentNavigableMap 接口。

- ConcurrentNavigableMap.java

接口的定义如下：

```java
public interface ConcurrentNavigableMap<K,V>
    extends ConcurrentMap<K,V>, NavigableMap<K,V>{}
```

ConcurrentMap 接口我们在 ConcurrentHashMap 中已经提到过。

NavigableMap 这个接口倒是挺新奇的，以前没怎么接触过。

```java
public interface NavigableMap<K,V> extends SortedMap<K,V> {}
```

这个继承自 SortedMap，我们可以预见到实现过程中肯定会有 Comparator 相关实现。

## 算法笔记

李大狗总是喜欢把算法笔记写在源码里，但是却不出现在文档里。

这部分正是精髓所在，让我们一起学习一下。


此类实现了树状二维链接的跳过列表，其中索引级别在与保存数据的基本节点不同的节点中表示。

采用此方法而不是通常的基于数组的结构有两个原因：

1）基于数组的实现似乎遇到更多的复杂性和开销

2）对于遍历索引列表，我们可以使用比基础列表便宜的算法。

这是一张具有2级索引的可能列表的一些基础知识：

```
Head nodes          Index nodes
+-+    right        +-+                      +-+
|2|---------------->| |--------------------->| |->null
+-+                 +-+                      +-+
 | down              |                        |
 v                   v                        v
+-+            +-+  +-+       +-+            +-+       +-+
|1|----------->| |->| |------>| |----------->| |------>| |->null
+-+            +-+  +-+       +-+            +-+       +-+
 v              |    |         |              |         |
Nodes  next     v    v         v              v         v
+-+  +-+  +-+  +-+  +-+  +-+  +-+  +-+  +-+  +-+  +-+  +-+
| |->|A|->|B|->|C|->|D|->|E|->|F|->|G|->|H|->|I|->|J|->|K|->null
+-+  +-+  +-+  +-+  +-+  +-+  +-+  +-+  +-+  +-+  +-+  +-+
```

基本列表使用HM链接有序集算法的变体。

这张图其实和我原来说的 skiplist 就是类似的，为了防止有些同学看的不习惯，我们补一张常规结构图：

![数据结构](https://images.gitee.com/uploads/images/2020/1103/223611_74e1ee32_508704.png)


请参见蒂姆·哈里斯（Tim Harris），“非阻塞链表的实用实现”，http：//www.cl.cam.ac.uk/~tlh20/publications.html和Maged Michael“高性能动态无锁哈希表和基于列表的集” http://www.research.ibm.com/people/m/michael/pubs.htm。

这些列表中的基本思想是在删除时标记已删除节点的“下一个”指针，以避免与并发插入发生冲突，并且在遍历以跟踪三元组（前驱，节点，后继）时进行标记，以检测何时以及如何取消链接这些已删除的节点。


节点不使用标记位来标记列表删除（使用AtomicMarkedReference可能会很慢并且占用大量空间），而是使用直接CAS'able的下一个指针。

在删除时，它们没有标记指针，而是拼接在另一个节点中，该节点可以被认为代表标记的指针（通过使用否则为不可能的字段值来指示）。

使用普通节点的行为大致类似于标记指针的“盒装”实现，但是仅在删除节点时才使用新节点，而不是对每个链接都使用。

这需要更少的空间并支持更快的遍历。

即使JVM更好地支持带标记的引用，使用此技术的遍历仍可能会更快，因为任何搜索只需要比其他要求（检查尾随标记）提前读取一个节点，而不是在每次读取时都对标记位或其他内容进行屏蔽。


这种方法保留了更改删除节点的下一个指针的HM算法所需的基本属性，以使它的任何其他CAS都将失败，但是通过更改指针以指向另一个节点而不是通过标记来实现该思想。

尽管可以通过将标记节点定义为不包含键/值字段来进一步压缩空间，但这不值得额外的类型测试开销。

删除标记在遍历期间很少遇到，通常会很快被垃圾收集。 （请注意，这种技术在没有垃圾收集的系统中无法很好地工作。）


除了使用删除标记外，列表还使用值字段的空值来表示删除，其样式类似于典型的延迟删除方案。

如果节点的值为null，则即使仍可访问，也将其在逻辑上被删除并忽略。

这样可以保持对并发替换与删除操作的适当控制-如果删除操作使字段为空，则尝试替换必须失败，并且删除操作必须返回该字段中保留的最后一个非空值。 

（注意：此处将Null而不是一些特殊的标记用于值字段，因为它恰好与Map API的要求相吻合，即如果没有映射，则get方法将返回null，这使节点**即使删除也能保持并发可读性**。在这里使用其他任何标记值充其量都是混乱的。）


以下是最初删除具有前身b和后继f的节点n的事件序列：

```
      +------+       +------+      +------+
 ...  |   b  |------>|   n  |----->|   f  | ...
      +------+       +------+      +------+
```

（1）CAS n的值字段从非null到null。 从这一点开始，没有遇到节点的公共操作都认为此映射存在。 但是，其他正在进行的插入和删除操作仍可能会修改n的下一个指针。

（2）CAS n的下一个指针指向新的标记节点。 从这一点开始，不能将其他节点附加到n上。 这样可以避免基于CAS的链接列表中的删除错误。

```
     +------+       +------+      +------+       +------+
...  |   b  |------>|   n  |----->|marker|------>|   f  | ...
     +------+       +------+      +------+       +------+
```

（3）CAS b在n及其标记上的下一个指针。 从这一点开始，没有新的遍历将遇到n，并且最终可以对其进行GC。


```
      +------+                                    +------+
 ...  |   b  |----------------------------------->|   f  | ...
      +------+                                    +------+
```

步骤1的失败会导致失败重试，原因是与其他操作的竞态失败（lost race）。

步骤2-3可能会失败，因为在遍历具有空值的节点时注意到了其他某个线程，并通过标记和/或取消链接来帮助了其他线程。

这种帮助可以确保没有线程在等待删除线程的进展时被阻塞。

使用标记节点会使辅助代码稍微复杂化，因为遍历必须跟踪多达四个节点（b，n，marker，f）的一致读取，而不仅仅是（b，n，f），尽管标记的下一个字段是不变，一旦下一个字段被CAS指向标记，它就再也不会改变，因此需要较少的照顾。


跳过列表为该方案添加了索引，因此基本级别遍历开始于被查找，插入或删除的位置附近-通常，基本级别遍历仅遍历几个节点。

除了需要确保基本遍历从没有（在结构上）删除的前任（此处为b）开始，否则不会改变基本算法，否则在处理删除后重试。


使用CAS链接和取消链接，将索引级别维护为具有可变下一个字段的列表。

索引列表操作中允许使用竞争，这些操作可能（很少）无法链接到新的索引节点或删除一个索引节点。 （我们当然不能对数据节点执行此操作。）

但是，即使发生这种情况，索引列表仍然保持排序，因此可以正确地用作索引。

这可能会影响性能，但是由于跳过列表无论如何都是概率性的，因此最终结果是在争用情况下，有效的 `p` 值可能低于其标称值。

而且竞赛窗口要保持足够小，以至于在实践中，即使有很多争论，这些失败也是很少见的。

ps: 事实胜于雄辩，很少失败就是很少失败。

其他数据结构做得到吗？

![其他数据结构做得到吗?](https://images.gitee.com/uploads/images/2020/1102/224854_d4cfb829_508704.png)


由于建立索引，重试（针对基本列表和索引列表）相对代价较低，这一事实允许对重试逻辑进行一些较小的简化。

在大多数“帮助”（helping-out）案例之后执行遍历重启。

这并非总是严格必要的，但是隐式的退避往往有助于减少其他下游出现故障的CAS，足以抵消重启成本。

这会使最坏的情况恶化，但似乎甚至可以改善竞争激烈的情况。


与大多数跳过列表实现不同，这里的索引插入和删除要求在基本级操作之后进行单独的遍历遍历，以添加或删除索引节点。

这增加了单线程开销，但是通过缩小干扰窗口来提高竞争性多线程性能，并允许删除以确保从公共删除操作返回后所有索引节点都将不可访问，从而避免了不必要的垃圾保留。

这在这里比在其他一些数据结构中更重要，因为我们不能使引用用户密钥的节点字段无效，因为它们可能仍被其他正在进行的遍历读取。


索引使用跳过列表参数，该参数在使用稀疏索引时保持良好的搜索性能：硬连线参数k = 1，p = 0.5（请参阅方法doPut）意味着大约四分之一的节点具有索引。

在那些做到这一点的人中，一半有一个级别，四分之一有两个级别，依此类推（请参阅Pugh的跳过列表食谱，第3.4节）。

map 的预期总空间需求比java.util.TreeMap的当前实现略少。



更改索引级别（即树状结构的高度）也使用CAS。

头索引的初始级别/高度为1。

创建高度大于当前级别的索引会通过在新的最顶部磁头上进行CAS来为磁头索引添加一个级别。

为了**在大量删除后保持良好的性能，如果最顶层未显示为空，则删除方法会尝试尝试减小高度**。

ps: 这个其实和跳表的实现是一致的。降低无用的高度，提升性能。

这可能会遇到一些竞争（races），在这些竞争中有可能（但很少有）降低和“降低”某个级别，就像它即将包含一个索引（那样就永远不会遇到）。

这不会对结构造成损害，并且在实践中似乎比允许不受限制的级别增长更好。


所有这些的代码比您想要的更为冗长。

大多数操作需要定位元素（或插入元素的位置）。

不能很好地做到这一点的代码，因为后续使用需要快照前驱和/或后继和/或值字段，这些快照不能一次全部返回，至少不能不创建另一个对象来保存它们-对于基本的内部搜索操作而言，创建这样的小对象是一个特别糟糕的主意，因为它增加了GC的开销。 （这是我希望Java具有宏的少数几次。）

ps: 哈哈哈，来自大佬的吐槽。不过 C 的宏有时候确实很好用。


处理所有重试条件的控制逻辑有时会有些曲折。大多数搜索分为2部分。 

findPredecessor（）仅搜索索引节点，返回键的基本级别的前任。

findNode（）完成基本级别的搜索。

即使有这个因素，也有相当数量的重复代码来处理变体。



为了在线程之间不产生干扰的情况下产生随机值，我们使用JDK内部线程本地随机支持（通过“secondary seed”，以避免干扰用户级别的 `ThreadLocalRandom`。）


此类的先前版本使用比较器与可比较器将不可比较的键及其比较器包装在一起，以模拟可比较 key。

但是，JVM现在似乎可以更好地处理将比较器与可比较的选择注入搜索循环的过程。

静态方法 `cpr(comparator, x, y)` 用于所有比较，只要比较器参数在循环外部设置（因此有时作为参数传递给内部方法），以避免字段重新读取，该方法就可以正常工作。

有关与此算法共享至少两个功能的算法的说明，请参见Mikhail Fomitchev的论文（http://www.cs.yorku.ca/~mikhail/），Keir Fraser的论文（http://www.cl.cam .ac.uk / users / kaf24 /）和Hakan Sundell的论文（http://www.cs.chalmers.se/~phs/）。


ps: 好家伙，一言不合又是 2 篇论文，看来李大狗看了不少论文。


考虑到使用树状索引节点，您可能想知道为什么它不使用某种搜索树，而是支持更快的搜索操作。

原因是，**没有用于搜索树的有效的无锁插入和删除算法**。

索引节点“向下”链接的不变性（与真实树中可变的“左”字段相对）使仅使用CAS操作就可以做到这一点。


### 局部变量的符号指南

```
节点：b，n，f表示前任节点，节点，后继节点
索引：q，r，d用于索引节点，右，向下。
               t代表另一个索引节点
头：h
级别：j
键：k，键
值：v，值
比较：c
```

这明明风格，老 C 语言了。


好了，经过冗长的算法笔记的熏陶，相信大家和我一样基本云里雾里。

还是直接看代码来的实在。





## 内部变量

```java
/**
 * 用于标识基本级别标头的特殊值
 * @author 老马啸西风
 */
private static final Object BASE_HEADER = new Object();

/**
 * 跳表的最高头索引。
 */
private transient volatile HeadIndex<K,V> head;

/**
 * 比较器用于维护此映射中的顺序，如果使用自然顺序，则为null。 （非私有可简化嵌套类的访问。）
 */
final Comparator<? super K> comparator;

/** 
* 惰性初始化的 keySet
*/
private transient KeySet<K> keySet;

/** 
* 惰性初始化的 entrySet
*/
private transient EntrySet<K,V> entrySet;

/** 
* 惰性初始化的 values 集合
*/
private transient Values<V> values;

/** 
* 惰性初始化的降序 keySet
*/
private transient ConcurrentNavigableMap<K,V> descendingMap;
```

这里的内部类还是挺多的，汇总如下图：

![内部类](https://images.gitee.com/uploads/images/2020/1103/223646_22109238_508704.png)

这里的大部分类大家应该都不陌生，不过这个 `Values` 我倒是第一次见。

看了下就是一个简易版本的集合：

```java
static final class Values<E> extends AbstractCollection<E> {
    final ConcurrentNavigableMap<?, E> m;
    Values(ConcurrentNavigableMap<?, E> map) {
        m = map;
    }
    @SuppressWarnings("unchecked")
    public Iterator<E> iterator() {
        if (m instanceof ConcurrentSkipListMap)
            return ((ConcurrentSkipListMap<?,E>)m).valueIterator();
        else
            return ((SubMap<?,E>)m).valueIterator();
    }
    //...
}
```

KeySet/ValueSet 也都是类似的实现，此处不做展开。

### HeadIndex 介绍

```java
/**
 * Nodes heading each level keep track of their level.
 */
static final class HeadIndex<K,V> extends Index<K,V> {
    final int level;
    HeadIndex(Node<K,V> node, Index<K,V> down, Index<K,V> right, int level) {
        super(node, down, right);
        this.level = level;
    }
}
```


## Node 节点信息

Node 为了保障 CAS，设计的比普通的节点要复杂的多。

```java
/**
* 节点保存键和值，并按排序顺序单独链接，可能与某些中间的标记节点链接。
* 该列表以可作为head.node访问的虚拟节点为首。
* 值字段仅声明为对象，因为它为标记和标头节点采用特殊的非V值。
*/
static final class Node<K,V> {
    //final 可以保障元素不可变，并且符合 happens-before 语义
    final K key;

    // 使用 volatile 修饰，保障 happens-before 语义以及线程间可见性。
    volatile Object value;
    volatile Node<K,V> next;
}
```

### 构造器

构造器相对比较简单：

```java
Node(K key, Object value, Node<K,V> next) {
    this.key = key;
    this.value = value;
    this.next = next;
}

Node(Node<K,V> next) {
    this.key = null;
    this.value = this;
    this.next = next;
}
```

### CAS 方法

这里的判断多处用到乐观锁比较：

```java
boolean casValue(Object cmp, Object val) {
    return UNSAFE.compareAndSwapObject(this, valueOffset, cmp, val);
}

boolean casNext(Node<K,V> cmp, Node<K,V> val) {
    return UNSAFE.compareAndSwapObject(this, nextOffset, cmp, val);
}
```

### 状态判断方法

```java
/**
** 判断一节节点是否为 marker，这个 marker 就是作者算法笔记中提到的。
**
*/
boolean isMarker() {
    return value == this;
}

/**
** 是否为 base-level 的头结点
*/
boolean isBaseHeader() {
    return value == BASE_HEADER;
}

/**
** 给一个节点添加删除标识 marker
*/
boolean appendMarker(Node<K,V> f) {
    return casNext(f, new Node<K,V>(f));
}
```


对应的删除方法：

```java
void helpDelete(Node<K,V> b, Node<K,V> f) {
    /*
     * 重新检查链接，然后在每个调用中仅执行一个帮助阶段，这将使CAS对帮助线程的干扰降到最低。
     */
    if (f == next && this == b.next) {
        if (f == null || f.value != f) // not already marked
            casNext(f, new Node<K,V>(f));
        else
            b.casNext(this, f.next);
    }
}
```

## 索引信息

索引节点代表跳过列表的级别。 

请注意，即使Node和Index都具有前向字段，但它们具有不同的类型并且以不同的方式处理，因此无法通过将字段放在共享的抽象类中来很好地捕获。

```java
static class Index<K,V> {
        final Node<K,V> node;
        final Index<K,V> down;
        volatile Index<K,V> right;

        /**
         * Creates index node with given values.
         */
        Index(Node<K,V> node, Index<K,V> down, Index<K,V> right) {
            this.node = node;
            this.down = down;
            this.right = right;
        }
}
```

这里 jdk 是提供了两个方向，一个是向右，一个是向下。

### 基本方法

基于 UNSAFE 的 cas 方法：

```java
final boolean casRight(Index<K,V> cmp, Index<K,V> val) {
    return UNSAFE.compareAndSwapObject(this, rightOffset, cmp, val);
}
```

判断一个节点的索引是否已经被删除：

```java
final boolean indexesDeletedNode() {
    return node.value == null;
}
```

### 连接和解除连接

尝试通过 CAS 将 newSucc 连接到 succ 的后面。

```java
final boolean link(Index<K,V> succ, Index<K,V> newSucc) {
    Node<K,V> n = node;
    newSucc.right = succ;
    return n.value != null && casRight(succ, newSucc);
}
```

尝试访问CAS右侧字段以跳过明显的 successor suc.

如果已知已删除此节点，则失败（强制调用者进行遍历）。

```java
final boolean unlink(Index<K,V> succ) {
    return node.value != null && casRight(succ, succ.right);
}
```

## 构造器

我们来看一下对应的构造器：

```java
public ConcurrentSkipListMap() {
    this.comparator = null;
    initialize();
}
```

默认使用自然排序，然后调用初始化方法:

```java
private void initialize() {
    keySet = null;
    entrySet = null;
    values = null;
    descendingMap = null;
    head = new HeadIndex<K,V>(new Node<K,V>(null, BASE_HEADER, null),
                              null, null, 1);
}
```

默认对内部属性初始化，基本都是 null。简单粗暴。

HeadIndex 没什么特别, 只是增加一个 level 属性用来标示索引层级; 注意所有的 HeadIndex 都指向同一个 Base_header 节点;

接下来我们看一下最核心的三个方法：doPut()/doGet()/doRemove()

# doPut() 存入元素

## 流程

老实说，阅读源码挺简单的，就是令人头秃。

doPut 的大体流程和 skiplist 应该是类似的，区别是这里考虑了并发，情况变得更加复杂。

（1）根据给定的key从跳表的左上方往右或者往下查找到Node链表的前驱Node结点，这个查找过程会删除一些已经标记为删除的结点。

（2）找到前驱结点后，开始往后插入查找插入的位置（因为找到前驱结点后，可能有另外一个线程在此前驱结点后插入了一个结点，所以步骤 1 得到的前驱现在可能不是要插入的结点的前驱，所以需要往后查找）。

（3）随机生成一个种子，判断是否需要增加层级，并且在各层级中插入对应的 Index 结点。

友情提示： doPut 的内容较多，不感兴趣的伙伴可以跳过，知道大概流程即可。

## 源码

```java
/**
 * 主要的插入方法。如果不存在则添加元素，或者如果存在且onlyIfAbsent为false则替换值。

 * @param key the key
 * @param value the value that must be associated with key
 * @param onlyIfAbsent if should not insert if already present
 * @return the old value, or null if newly inserted
 */
private V doPut(K key, V value, boolean onlyIfAbsent) {
    // 待添加的节点
    Node<K,V> z;             // added node
    // 禁止元素为 null
    if (key == null)
        throw new NullPointerException();
    // 获取元素为 null
    Comparator<? super K> cmp = comparator;

    // 外循环
    outer: for (;;) {

        // 发现元素的前继节点，这个也是比较核心的方法。
        // 若没发生条件竞争, 最终 key 在 b 与 n 之间 (找到的b在 base_level 上)
        for (Node<K,V> b = findPredecessor(key, cmp), n = b.next;;) {

            // 如果前继节点.next 不为 null
            if (n != null) {
                Object v; int c;
                Node<K,V> f = n.next;
                if (n != b.next)               // 条件竞争(另外一个线程在b之后插入节点, 或直接删除节点n), 然后重新尝试。
                    break;

                // 节点n已经删除, 则调用 helpDelete 进行删除。然后重新尝试。
                if ((v = n.value) == null) {   // n is deleted
                    n.helpDelete(b, f);
                    break;
                }

                // 节点 b 被删除, 重来。
                if (b.value == null || v == n) // b is deleted
                    break;

                // 使用比较器比较，key > n.key, 则继续向后走。    
                if ((c = cpr(cmp, key, n.key)) > 0) {
                    // b 成为 n, b 成为 n.next
                    b = n;
                    n = f;
                    continue;
                }

                // 二者相等
                if (c == 0) {
                    // 存在时不执行插入 || CAS 成功
                    if (onlyIfAbsent || n.casValue(v, value)) {
                        // 返回设置成功的值
                        @SuppressWarnings("unchecked") V vv = (V)v;
                        return vv;
                    }
                    break; // cas 竞争条件失败 重来
                }
                // else c < 0; fall through
            }

            z = new Node<K,V>(key, value, n);

            // n = nul 时，说明 b 是链表的最后一个节点。key 直接插到 b 之后 
            if (!b.casNext(n, z))
                break;         // cas 竞争条件失败 重来


            break outer;  // 这里跳出之后，表示这个循环结束。
        }
    }

    // 随机数
    // 这里就像李大狗说的，使用的是 ThreadLocalRandom 
    int rnd = ThreadLocalRandom.nextSecondarySeed();

    // 这个应该就是类似于 skiplist 的随机是否需要增加层数。
    // 这个是 & 运算，概率应该是 0.5
    if ((rnd & 0x80000001) == 0) { // test highest and lowest bits
        
        // 这段代码是返回层数的。
        // 直接说结果：50%的几率返回0，25%的几率返回1，12.5%的几率返回2...最大返回31。
        int level = 1, max;
        while (((rnd >>>= 1) & 1) != 0)
            ++level;

        Index<K,V> idx = null;
        HeadIndex<K,V> h = head;
        if (level <= (max = h.level)) {
            for (int i = 1; i <= level; ++i)
                // 添加 z 对应的 index 数据, 并将它们组成一个上下的链表(index层是上下左右都是链表)
                // 大家可以回头看下算法笔记。
                // 实际上一个节点，主要是右，下两个方向
                idx = new Index<K,V>(z, idx, null);
        }


        else { // try to grow by one level
            // 这个场景只增加了一层，为什么只增加一层呢？
            level = max + 1; // hold in array and later pick the one to use
            @SuppressWarnings("unchecked")Index<K,V>[] idxs =
                (Index<K,V>[])new Index<?,?>[level+1];
            for (int i = 1; i <= level; ++i)
                idxs[i] = idx = new Index<K,V>(z, idx, null);

            for (;;) {
                h = head;
                int oldLevel = h.level;
                // 说明被线程已经增加了，直接跳出循环。
                if (level <= oldLevel) // lost race to add level
                    break;
                HeadIndex<K,V> newh = h;

                // oldBase = head.node，实际上就是 BASE_HEADER
                Node<K,V> oldbase = h.node;

                // 增加一层的 HeadIndex (level = max + 1)
                for (int j = oldLevel+1; j <= level; ++j)
                    newh = new HeadIndex<K,V>(oldbase, newh, idxs[j], j);

                // 通过 CAS 进行设置值，且成功的话    
                if (casHead(h, newh)) {
                    h = newh;
                    idx = idxs[level = oldLevel];
                    break;
                }
            }
        }


        // find insertion points and splice in
        splice: for (int insertionLevel = level;;) {
            int j = h.level;

            // 
            for (Index<K,V> q = h, r = q.right, t = idx;;) {
                if (q == null || t == null)
                    break splice;
                if (r != null) {
                    Node<K,V> n = r.node;
                    // compare before deletion check avoids needing recheck
                    int c = cpr(cmp, key, n.key);
                    if (n.value == null) {
                        if (!q.unlink(r)) // 清空掉 value == null 的节点。
                            break;
                        r = q.right;    // 向右遍历
                        continue;
                    }

                    if (c > 0) {
                        q = r;
                        r = r.right;  // 向右遍历
                        continue;
                    }
                }


                if (j == insertionLevel) {
                    // 将 t 加到 q 与 r 中间, 若条件竞争失败的话就重试
                    if (!q.link(r, t))
                        break; // restart

                    //  若这时 node 被删除, 则开始通过 findPredecessor 清理 index 层, findNode 清理 node 层, 之后直接 break 出去, doPut调用结束    
                    if (t.node.value == null) {
                        findNode(key);
                        break splice;
                    }

                    //index 层添加OK， -- 为下层插入 index 做准备
                    if (--insertionLevel == 0)
                        break splice;
                }

                // 这里实际上还是比较晦涩的。
                if (--j >= insertionLevel && j < level)
                    t = t.down;

                /** 到这里时, 其实有两种情况
                 *  1) 还没有一次index 层的数据插入
                 *  2) 已经进行 index 层的数据插入, 现在为下一层的插入做准备
                 */
                q = q.down;
                r = q.right;
            }
        }
    }
    return null;
}
```

### findPredecessor 找到前继节点

这个方法我们在 skiplist 中其实也有。

就是从左往右，从上往下找。

```java
/**
 * 找到最底层的节点，key 严格小于给定的 key。
 * 或者返回 base-level 的 header 节点，如果元素不存在。
 *
 * 同时在遍历的过程中，还会把删除的节点进行 unlink 操作。
 * 调用者依靠清除索引删除节点的这种副作用。
 *
 * 
 * @author 老马啸西风
 */
private Node<K,V> findPredecessor(Object key, Comparator<? super K> cmp) {
    // 禁止 key 为 null
    if (key == null)
        throw new NullPointerException(); // don't postpone errors
    for (;;) {

        // 这个流程和 skiplist 一样的
        // 从最高层索引，从左到右，从上到下寻找。
        // 最高层，只因为可以快速定位到元素的大概位置，从上到下，是为了精确地找到 base-level 的元素信息。
        for (Index<K,V> q = head, r = q.right, d;;) {
            if (r != null) {
                Node<K,V> n = r.node;
                K k = n.key;

                // value 为 null，说明被删除了。
                // 执行 unlink 操作，如果失败，则进行重试.
                if (n.value == null) {
                    if (!q.unlink(r))
                        break;           // restart

                    // r 变为 q.right 右边元素，继续执行    
                    r = q.right;         // reread r
                    continue;
                }

                // 比较器比较 key > k，则继续向右。
                if (cpr(cmp, key, k) > 0) {
                    q = r;
                    r = r.right;
                    continue;
                }
            }

            // 到这里说明当前层级已经到最右了
            // 两种情况：一是r==null，二是c<0
            // 再从下一级开始找

            // 如果没有下一级了，就返回这个索引对应的数据节点
            // 元素位于最右边，且无法继续向下，只能返回这个节点，作为前继节点。
            if ((d = q.down) == null)
                return q.node;

            // 向下，向右    
            q = d;
            r = d.right;
        }
    }
}
```

### findNode 查找节点

除了查找前继节点，上面还有一个查询 Node 的方法，也值得我们注意。

返回保持键的节点；如果没有，则返回null，清除沿途看到的所有已删除节点。反复遍历基本级别，以查找从findPredecessor返回的前任者开始的键，并在遇到时处理基本级别的删除。

实际上上面调用的时候，也正是利用这种清除无效节点的副作用（side effect）。


在以下情况下，重新启动将以节点n为中心进行遍历：

（1）在读取n的下一个字段之后，不再假定n是前任b的当前后继者，这意味着我们没有一致的3节点快照，因此无法取消链接遇到的任何后续已删除节点。

（2）n的value字段为null，表示n被删除，在这种情况下，我们在重试之前帮助进行正在进行的结构删除。

即使在某些情况下这种取消链接不需要重新启动，也不会在此处进行分类，因为这样做通常不会超过重新启动的成本。

（3）n是标记，或者n的前任值字段为null，表示（除其他可能性外）findPredecessor返回了已删除的节点。

我们无法取消链接该节点，因为我们不知道它的前任节点，因此请依赖另一个调用findPredecessor的通知并返回一些更早的前任节点，它将执行此操作。

仅在循环开始时才需要严格执行此检查（并且根本不需要严格进行b.value检查），但每次迭代均需执行此检查，以帮助避免调用者与其他线程的争用，因为它们将无法更改链接，因此无论如何都会重试。

doPut，doRemove和findNear中的遍历循环都包含相同的三种检查。

专门的版本出现在findFirst和findLast及其变体。

他们不容易共享代码，因为每个人都使用执行顺序执行的本地人读取字段。


```java
/**
 * @author 老马啸西风
 */
private Node<K,V> findNode(Object key) {
    if (key == null)
        throw new NullPointerException(); // don't postpone errors
    Comparator<? super K> cmp = comparator;
    outer: for (;;) {
        // 查找前继节点
        // 前继节点的查询过程中，就会清空已经删除的节点
        for (Node<K,V> b = findPredecessor(key, cmp), n = b.next;;) {
            Object v; int c;
            if (n == null)
                break outer;
            Node<K,V> f = n.next;

            // 元素被其他线程修改
            if (n != b.next)                // inconsistent read
                break;

            // n 值已经被删除，则清空对应的元素。    
            if ((v = n.value) == null) {    // n is deleted
                n.helpDelete(b, f);
                break;
            }

            // b 节点被删除，重试。
            if (b.value == null || v == n)  // b is deleted
                break;

            // 找到对应节点    
            if ((c = cpr(cmp, key, n.key)) == 0)
                return n;

            // 未找到    
            if (c < 0)
                break outer;

            // 向 next 继续遍历    
            b = n;
            n = f;
        }
    }
    return null;
}
```

## 插入的例子

为了让大家更好的理解这些源码，我们和大家一起看一个例子。

这个是网上别人画的图，非常便于大家理解。

总结起来，一共就是三大步：

（1）插入目标节点到数据节点链表中；

（2）建立竖直的down链表；

（3）建立横向的right链表；

初始状态如下：

![初始状态](https://images.gitee.com/uploads/images/2020/1103/231108_b023147f_508704.png)

### （1）插入节点

假如，我们现在要插入一个元素9。

（1）寻找目标节点之前最近的一个索引对应的数据节点，在这里也就是找到了5这个数据节点；

（2）从5开始向后遍历，找到目标节点的位置，也就是在8和12之间；

（3）插入9这个元素

![第一步](https://images.gitee.com/uploads/images/2020/1103/231250_8f598ce3_508704.png)

### （2）构建垂直 down 链表

然后，计算其索引层级，这里是随机的。

我们假设是3，也就是level=3。

（1）建立竖直的down索引链表；

（2）超过了现有高度2，还要再增加head索引链的高度；

![第二步](https://images.gitee.com/uploads/images/2020/1103/231429_43bf129c_508704.png)

### （3）补全水平 right 链表

（1）从第3层的head往右找当前层级目标索引的位置；

（2）找到就把目标索引和它前面索引的right指针连上，这里前一个正好是head；

（3）然后前一个索引向下移，这里就是head下移；

（4）再往右找目标索引的位置；

（5）找到了就把right指针连上，这里前一个是3的索引；

（6）然后3的索引下移；

（7）再往右找目标索引的位置；

（8）找到了就把right指针连上，这里前一个是5的索引；

（9）然后5下移，到底了。整个插入过程结束；

![最后一步](https://images.gitee.com/uploads/images/2020/1103/231542_c0558c61_508704.png)

# doRemove() 移除元素

## 源码

```java
/**
 *
 *
 * 
 * @param key the key
 * @param value if non-null, the value that must be
 * associated with key
 * @return the node, or null if not found
 * @author 老马啸西风
 */
final V doRemove(Object key, Object value) {
    if (key == null)
        throw new NullPointerException();
    Comparator<? super K> cmp = comparator;
    outer: for (;;) {
        // 查询前继节点
        for (Node<K,V> b = findPredecessor(key, cmp), n = b.next;;) {
            Object v; int c;

            // 如果 n 为 null，中断循环。
            if (n == null)
                break outer;

            // 如果被其他线程修改，重试。    
            Node<K,V> f = n.next;
            if (n != b.next)                    // inconsistent read
                break;

            //n 被删除，删除后，执行重试。    
            if ((v = n.value) == null) {        // n is deleted
                n.helpDelete(b, f);
                break;
            }

            // b 被删除，重试。
            if (b.value == null || v == n)      // b is deleted
                break;

            // key n.key 说明无满足元素，直接返回 null    
            if ((c = cpr(cmp, key, n.key)) < 0)
                break outer;

            // 如果大于，则继续向右遍历。    
            if (c > 0) {
                b = n;
                n = f;
                continue;
            }

            // 不进行删除，不满足删除的条件
            if (value != null && !value.equals(v))
                break outer;

            // 执行 CAS 删除，如果失败，重试。    
            if (!n.casValue(v, null))
                break;

            // 追加 marker 节点失败，或者 next 节点设置失败，重试查询 key。（副作用就是清空被删除的节点）    
            if (!n.appendMarker(f) || !b.casNext(n, f))
                // 对 key 对应的index 进行删除
                findNode(key);                  // retry via findNode
            else {
                // 找到前继节点
                // 删除的时候，如果最高层没有索引元素了，则考虑降低层数，提升查询效率。
                findPredecessor(key, cmp);      // clean index
                if (head.right == null)
                    tryReduceLevel();
            }
            @SuppressWarnings("unchecked") V vv = (V)v;
            return vv;
        }
    }
    return null;
}
```

### 尝试降低层数

如果没有节点，则可能降低层数。

此方法可能（很少）犯错误，在这种情况下，即使级别即将包含索引节点，级别也可能消失。

这会影响性能，而不是正确性。

为了最大程度地减少错误并减少滞后，仅当最上面的三个级别为空时，才将级别降低一。

另外，如果在CAS后删除的级别看起来非空，我们会尝试在没有人注意到我们的错误之前将其重新更改为空！ 

（此技巧非常有效，因为除非当前线程在第一个CAS之前立即停顿，否则该方法几乎不会出错，在这种情况下，它不太可能在之后立即再次停顿，因此可以恢复。）

我们忍受了所有这些，而不仅仅是让级别增长，因为否则，即使是经过大量插入和移除的小 map 也将具有很多级别，这比偶尔减少不必要的速度要慢得多。

```java
private void tryReduceLevel() {
    HeadIndex<K,V> h = head;
    HeadIndex<K,V> d;
    HeadIndex<K,V> e;
    if (h.level > 3 &&
        (d = (HeadIndex<K,V>)h.down) != null &&
        (e = (HeadIndex<K,V>)d.down) != null &&
        e.right == null &&
        d.right == null &&
        h.right == null &&
        casHead(h, d) && // try to set
        h.right != null) // recheck
        casHead(d, h);   // try to backout
}
```


### marker 节点有什么用？

#### 没有 marker 节点的世界

如图 demo1(没有maker节点进行删除插入操作):

有三个链接在一起的Node (node 有三个属性 key, value, next, 且所有操作都是 cas)

```
+------+ +------+ +------+
... | A |------>| B |----->| C | ...
+------+ +------+ +------+
```

我们假定有 2 个线程：

| Thread 1	| Thread 2 |
|:---|:---|
| - | 	if B.value == null 判断B的value是否为null |
| B.value = null | - |
| A.casNext(B, B.next) | - |
| - | Node D = new Node(C); B.casNext(C, D); |


步骤:


1. Thread 2 准备在B的后面插入一个节点 D, 它先判断 B.value == null, 发现 B 没被删除(假设 value = null 是删除)

2. Thread1 对 B 节点进行删除 B.value = null

3. Thread 1 直接设置 A的next是 B 的next (A.casNext(B, B.next)) 成功将节点 B 删除

4. 这时 Thread 2 new 一个节点 D, 直接设置 B.casNext(C, D) 成功

5. 最终效果, 因为节点B被删除掉, 所以节点D也没有插入进去(没插进去指不能从以A节点为head, 通过 next() 方法获取到节点D)

原因: 若队列在删除的过程中没有引入 maker 节点, 有可能导致刚刚插入的节点无缘无故的消失

下面是一个例子:

原本: 有3各节点 A, B, C 组成的队列

A -> B -> C (A.next = B, B.next = C)

现在有两个线程 (thread1, thread2) 进行操作, thread1 进行删除节点B, thread2 在节点B后插入节点D

进行操作前: 

```
+------+       +------+      +------+
|   A  |------>|   B  |----->|   C  | 
+------+       +------+      +------+
```

进行操作后: 

D 插入到节点B之后成功了, 可是队列的 头结点是 A, 通过A.next().next().next()..... 方法

无法访问到节点D(D节点已经丢失了)

```
            +------+      +------+
            |   B  |----->|   D  | 
            +------+      +------+
                              |
                              V
+------+                   +------+
|   A  |------>----->----->|   C  | 
+------+                   +------+
```


#### 有 marker 节点的世界

如图 demo2(有 marker 节点):

有三个链接在一起的Node (node 有三个属性 key, value, next, 且所有操作都是 cas)

```
+------+ +------+ +------+
... | A |------>| B |----->| C | ...
+------+ +------+ +------+
```

我们假定有 2 个线程：

| Thread 1	| Thread 2 |
|:---|:---|
| - | 	if B.value == null 判断B的value是否为null |
| B.value = null | - |
| A.casNext(B, B.next) | - |
| - | Node D = new Node(C); B.casNext(C, D); |

步骤：

1. Thread 2 准备在B的后面插入一个节点 D, 它先判断 B.value == null, 发现 B 没被删除(假设 value = null 是删除)

2. Thread1 对 B 节点进行删除 B.value = null

3. Thread 1 在B的后面追加一个 MarkerNode M 

4. Thread 1 将 B 与 M 一起删除

5. 这时你会发现 Thread 2 的 B.casNext(C, D) 发生的可能 :

1) 在Thread 1 设置 marker 节点前操作, 则B.casNext(C, D) 成功, B 与 marker 也一起删除

2) 在Thread 1 设置maker之后, 删除 b与marker之前, 则B.casNext(C, D) 操作失败(b.next 变成maker了), 所以在代码中加个 loop 循环尝试

3) 在Thread 1 删除 B, marker 之后, 则B.casNext(C, D) 失败(b.next变成maker, B.casNext(C,D) 操作失败, 在 loop 中重新进行尝试插入)

6. 最终结论 maker 节点的存在致使 非阻塞链表能实现中间节点的删除和插入同时安全进行(反过来就是若没有marker节点, 有可能刚刚插入的数据就丢掉了)


# doGet() 获取元素

## 整体流程

1. 寻找 key 的前继节点 b (这时b.next = null || b.next > key, 则说明不存key对应的 Node)

2. 接着就判断 b, b.next 与 key之间的关系(其中有些 helpDelete操作)


## 源码

```java
/**
 * 获取 key 对应的值
 * @param key the key
 * @return the value, or null if absent
 *
 * @author 老马啸西风
 */
private V doGet(Object key) {
    if (key == null)
        throw new NullPointerException();
    Comparator<? super K> cmp = comparator;
    outer: for (;;) {
        // 获取前继节点
        for (Node<K,V> b = findPredecessor(key, cmp), n = b.next;;) {
            Object v; int c;

            // b.next 为 null,直接返回 null
            if (n == null)
                break outer;

            // 被其他线程修改，重试    
            Node<K,V> f = n.next;
            if (n != b.next)                // inconsistent read
                break;

            // n 被删除，重试    
            if ((v = n.value) == null) {    // n is deleted
                n.helpDelete(b, f);
                break;
            }

            // b 被删除，重试
            if (b.value == null || v == n)  // b is deleted
                break;

            // 找到元素，返回    
            if ((c = cpr(cmp, key, n.key)) == 0) {
                @SuppressWarnings("unchecked") V vv = (V)v;
                return vv;
            }

            // 未找到，跳出循环。
            if (c < 0)
                break outer;

            // b = b.next
            // n = n.next 
            // 向右继续查找    
            b = n;
            n = f;
        }
    }
    return null;
}
```

# 小结

好家伙，这个源码看的太累了，特别是这个 doPut 方法。

不过看完之后还是收获颇丰，下一节我们学习一下 ConcurrentSkipListSet。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

[ConcurrentSkipListMap 源码分析 (基于Java 8)](https://www.jianshu.com/p/edc2fd149255)

[【JUC】JDK1.8源码分析之ConcurrentSkipListMap（二）](https://www.cnblogs.com/leesf456/p/5512817.html)

[死磕 java集合之ConcurrentSkipListMap源码分析](https://www.cnblogs.com/tong-yuan/p/ConcurrentSkipListMap.html)

* any list
{:toc}