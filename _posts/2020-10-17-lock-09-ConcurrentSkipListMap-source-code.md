---
layout: post
title:  锁专题（9） ConcurrentSkipListMap 源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, queue, data-struct, sf]
published: true
---

# ConcurrentSkipListMap 

## 简介





### 思考题


# 源码解析

下面让我们一起学习下 ConcurrentSkipListMap 的源码实现。


温馨提示：建议首先学习一下 skiplist 相关知识，参见 [java 实现跳表（skiplist）及论文解读](https://www.toutiao.com/item/6890519326613307908/)

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
    public boolean isEmpty() {
        return m.isEmpty();
    }
    public int size() {
        return m.size();
    }
    public boolean contains(Object o) {
        return m.containsValue(o);
    }
    public void clear() {
        m.clear();
    }
    public Object[] toArray()     { return toList(this).toArray();  }
    public <T> T[] toArray(T[] a) { return toList(this).toArray(a); }
    @SuppressWarnings("unchecked")
    public Spliterator<E> spliterator() {
        if (m instanceof ConcurrentSkipListMap)
            return ((ConcurrentSkipListMap<?,E>)m).valueSpliterator();
        else
            return (Spliterator<E>)((SubMap<?,E>)m).valueIterator();
    }
}
```

KeySet/ValueSet 也都是类似的实现，此处不做展开。


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

### 无参

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

### 有参构造器

我们选择一个比较经典的构造器讲解，其他的也都不难。

```java
public ConcurrentSkipListMap(SortedMap<K, ? extends V> m) {
    // 使用 m 对应的吧比较器
    this.comparator = m.comparator();
    // 初始化
    initialize();

    // 从 SortedMap 中初始化
    buildFromSorted(m);
}
```

buildFromSorted 的实现还是挺多的，无妨，我们慢慢看。

```java
/**
 * @author 老马啸西风
 */
private void buildFromSorted(SortedMap<K, ? extends V> map) {
    if (map == null)
        throw new NullPointerException();

    // 
    HeadIndex<K,V> h = head;
    Node<K,V> basepred = h.node;

    // Track the current rightmost node at each level. Uses an
    // ArrayList to avoid committing to initial or maximum level.
    ArrayList<Index<K,V>> preds = new ArrayList<Index<K,V>>();
    // initialize
    for (int i = 0; i <= h.level; ++i)
        preds.add(null);
    Index<K,V> q = h;
    for (int i = h.level; i > 0; --i) {
        preds.set(i, q);
        q = q.down;
    }
    Iterator<? extends Map.Entry<? extends K, ? extends V>> it =
        map.entrySet().iterator();
    while (it.hasNext()) {
        Map.Entry<? extends K, ? extends V> e = it.next();
        int rnd = ThreadLocalRandom.current().nextInt();
        int j = 0;
        if ((rnd & 0x80000001) == 0) {
            do {
                ++j;
            } while (((rnd >>>= 1) & 1) != 0);
            if (j > h.level) j = h.level + 1;
        }
        K k = e.getKey();
        V v = e.getValue();
        if (k == null || v == null)
            throw new NullPointerException();
        Node<K,V> z = new Node<K,V>(k, v, null);
        basepred.next = z;
        basepred = z;
        if (j > 0) {
            Index<K,V> idx = null;
            for (int i = 1; i <= j; ++i) {
                idx = new Index<K,V>(z, idx, null);
                if (i > h.level)
                    h = new HeadIndex<K,V>(h.node, h, idx, i);
                if (i < preds.size()) {
                    preds.get(i).right = idx;
                    preds.set(i, idx);
                } else
                    preds.add(idx);
            }
        }
    }
    head = h;
}
```

TODO...



# 小结

DelayQueue 我也一直听闻很久，不过平时没有自己使用过。现在发现 DelayQueue 执行定时延期执行，还是非常好用的。

本文从 DelayQeueu 的入门使用开始，逐步深入介绍了源码实现原理。

不知道文章开头的思考题你有自己的答案了吗？

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

[DelayQueue 的使用](https://blog.csdn.net/hsqingwei/article/details/88850835)

[Java延时队列DelayQueue的使用](https://my.oschina.net/lujianing/blog/705894)

* any list
{:toc}