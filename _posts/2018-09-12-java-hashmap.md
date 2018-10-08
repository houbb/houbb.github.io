---
layout: post
title: HashMap 源码解析
date:  2018-09-12 11:44:23 +0800
categories: [Java]
tags: [source-code, hash, cache, data-struct, java, TODO, sf]
published: true
excerpt: HashMap 源码解析
---

# HashMap 源码

HashMap 是平时使用到非常多的一个集合类，感觉有必要深入学习一下。

首先尝试自己阅读一遍源码。

## java 版本

```sh
$ java -version
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
```

## 对于当前类的官方说明

基于哈希表实现的映射接口。这个实现提供了所有可选的映射操作，并允许空值和空键。(HashMap类大致相当于Hashtable，但它是非同步的，并且允许为空。)这个类不保证映射的顺序;特别地，它不能保证顺序会随时间保持不变。
这个实现为基本操作(get和put)提供了恒定时间的性能，假设哈希函数将元素适当地分散在各个桶中。对集合视图的迭代需要与HashMap实例的“容量”(桶数)及其大小(键-值映射数)成比例的时间。因此，如果迭代性能很重要，那么不要将初始容量设置得太高(或者负载系数太低)，这是非常重要的。

HashMap实例有两个影响其性能的参数: **初始容量和负载因子**。

容量是哈希表中的桶数，初始容量只是创建哈希表时的容量。负载因子是在哈希表的容量自动增加之前，哈希表被允许达到的最大容量的度量。当哈希表中的条目数量超过负载因子和当前容量的乘积时，哈希表就会被重新哈希(也就是说，重新构建内部数据结构)，这样哈希表的桶数大约是原来的两倍。

一般来说，默认的负载因子(`0.75`)在时间和空间成本之间提供了很好的权衡。

较高的值减少了空间开销，但增加了查找成本(反映在HashMap类的大多数操作中，包括get和put)。在设置映射的初始容量时，应该考虑映射中的期望条目数及其负载因子，以最小化重哈希操作的数量。如果初始容量大于条目的最大数量除以负载因子，就不会发生重哈希操作。

如果要将许多映射存储在HashMap实例中，那么使用足够大的容量创建映射将使映射存储的效率更高，而不是让它根据需要执行自动重哈希以增长表。

注意，使用具有相同hashCode()的多个键确实可以降低任何散列表的性能。为了改善影响，当键具有可比性时，这个类可以使用键之间的比较顺序来帮助断开连接。

注意，这个实现不是同步的。如果多个线程并发地访问散列映射，并且至少有一个线程在结构上修改了映射，那么它必须在外部同步。(结构修改是添加或删除一个或多个映射的任何操作;仅更改与实例已经包含的键关联的值并不是结构修改。这通常是通过对自然封装映射的对象进行同步来完成的。

如果不存在这样的对象，则应该使用集合“包装” Collections.synchronizedMap 方法。这最好在创建时完成，以防止意外的对映射的非同步访问:

```java
Map m = Collections.synchronizedMap(new HashMap(...));
```

这个类的所有“集合视图方法”返回的迭代器都是快速失败的:如果在创建迭代器之后的任何时候对映射进行结构上的修改，除了通过迭代器自己的remove方法，迭代器将抛出ConcurrentModificationException。因此，在并发修改的情况下，迭代器会快速而干净地失败，而不是在未来的不确定时间内冒着任意的、不确定的行为的风险。

注意，迭代器的快速故障行为不能得到保证，因为一般来说，在存在非同步并发修改的情况下，不可能做出任何硬性保证。快速失败迭代器以最佳的方式抛出ConcurrentModificationException。因此，编写依赖于此异常的程序来保证其正确性是错误的:迭代器的快速故障行为应该仅用于检测错误。

## 其他基础信息

1. 这个类是Java集合框架的成员。

2. @since 1.2

3. java.util 包下

# 源码初探

## 接口

```java
public class HashMap<K,V> extends AbstractMap<K,V>
    implements Map<K,V>, Cloneable, Serializable {}
```

当前类实现了三个接口，我们主要关心 `Map` 接口即可。

继承了一个抽象类 `AbstractMap`，这个暂时放在本节后面学习。

# 常量定义

## 默认初始化容量

```java
/**
 * The default initial capacity - MUST be a power of two.
 */
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16
```

- 为什么不直接使用 16？

看了下 statckoverflow，感觉比较靠谱的解释是：

1. 为了避免使用魔法数字，使得常量定义本身就具有自我解释的含义。

2. 强调这个数必须是 2 的幂。

- 为什么要是 2 的幂？

它是这样设计的，因为它允许使用快速位和操作将每个键的哈希代码包装到表的容量范围内，正如您在访问表的方法中看到的:

```java
final Node<K,V> getNode(int hash, Object key) {
    Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (first = tab[(n - 1) & hash]) != null) { /// <-- bitwise 'AND' here
        ...
```

## 最大容量

隐式指定较高值时使用的最大容量。

由任何带有参数的构造函数。

必须是2的幂且小于 1<<30。

```java
/**
* The maximum capacity, used if a higher value is implicitly specified
* by either of the constructors with arguments.
* MUST be a power of two <= 1<<30.
*/
static final int MAXIMUM_CAPACITY = 1 << 30;
```

- 为什么是 1 << 30？

当然了 interger 的最大容量为 `2^31-1`

除此之外，2**31是20亿，每个哈希条目需要一个对象作为条目本身，一个对象作为键，一个对象作为值。

在为应用程序中的其他内容分配空间之前，最小对象大小通常为24字节左右，因此这将是1440亿字节。

可以肯定地说，最大容量限制只是理论上的。

感觉实际内存也没这么大！

## 负载因子

当负载因子较大时，去给table数组扩容的可能性就会少，所以相对占用内存较少（空间上较少），但是每条entry链上的元素会相对较多，查询的时间也会增长（时间上较多）。

反之就是，负载因子较少的时候，给table数组扩容的可能性就高，那么内存空间占用就多，但是entry链上的元素就会相对较少，查出的时间也会减少。

所以才有了负载因子是时间和空间上的一种折中的说法。

所以设置负载因子的时候要考虑自己追求的是时间还是空间上的少。


```java
/**
 * The load factor used when none specified in constructor.
 */
static final float DEFAULT_LOAD_FACTOR = 0.75f;
```

- 为什么是 0.75，不是 0.8 或者 0.6

其实 hashmap 源码中有解释。

```
Because TreeNodes are about twice the size of regular nodes, we
use them only when bins contain enough nodes to warrant use
(see TREEIFY_THRESHOLD). And when they become too small (due to
removal or resizing) they are converted back to plain bins.  In
usages with well-distributed user hashCodes, tree bins are
rarely used.  Ideally, under random hashCodes, the frequency of
nodes in bins follows a Poisson distribution
(http://en.wikipedia.org/wiki/Poisson_distribution) with a
parameter of about 0.5 on average for the default resizing
threshold of 0.75, although with a large variance because of
resizing granularity. Ignoring variance, the expected
occurrences of list size k are (exp(-0.5) * pow(0.5, k) /
factorial(k)). The first values are:

0:    0.60653066
1:    0.30326533
2:    0.07581633
3:    0.01263606
4:    0.00157952
5:    0.00015795
6:    0.00001316
7:    0.00000094
8:    0.00000006
more: less than 1 in ten million
```

简单翻译一下就是在理想情况下,使用随机哈希码,节点出现的频率在hash桶中遵循泊松分布，同时给出了桶中元素个数和概率的对照表。

从上面的表中可以看到当桶中元素到达8个的时候，概率已经变得非常小，也就是说用0.75作为加载因子，每个碰撞位置的链表长度超过８个是几乎不可能的。

[Poisson distribution —— 泊松分布](http://www.ruanyifeng.com/blog/2015/06/poisson-distribution.html#comment-356111) 

## 阈值


```java
/**
 * The bin count threshold for using a tree rather than list for a
 * bin.  Bins are converted to trees when adding an element to a
 * bin with at least this many nodes. The value must be greater
 * than 2 and should be at least 8 to mesh with assumptions in
 * tree removal about conversion back to plain bins upon
 * shrinkage.
 */
static final int TREEIFY_THRESHOLD = 8;

/**
 * The bin count threshold for untreeifying a (split) bin during a
 * resize operation. Should be less than TREEIFY_THRESHOLD, and at
 * most 6 to mesh with shrinkage detection under removal.
 */
static final int UNTREEIFY_THRESHOLD = 6;

/**
 * The smallest table capacity for which bins may be treeified.
 * (Otherwise the table is resized if too many nodes in a bin.)
 * Should be at least 4 * TREEIFY_THRESHOLD to avoid conflicts
 * between resizing and treeification thresholds.
 */
static final int MIN_TREEIFY_CAPACITY = 64;
```

### TREEIFY_THRESHOLD

使用红黑树而不是列表的bin count阈值。

当向具有至少这么多节点的bin中添加元素时，bin被转换为树。这个值必须大于2，并且应该至少为8，以便与树删除中关于收缩后转换回普通容器的假设相匹配。

### UNTREEIFY_THRESHOLD

在调整大小操作期间取消(分割)存储库的存储计数阈值。

应小于TREEIFY_THRESHOLD，并最多6个网格与收缩检测下去除。

### MIN_TREEIFY_CAPACITY

最小的表容量，可为容器进行树状排列。(否则，如果在一个bin中有太多节点，表将被调整大小。)

至少为 `4 * TREEIFY_THRESHOLD`，以避免调整大小和树化阈值之间的冲突。

# Node

## 源码

- Node.java

基础 hash 结点定义。

```java
/**
 * Basic hash bin node, used for most entries.  (See below for
 * TreeNode subclass, and in LinkedHashMap for its Entry subclass.)
 */
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    V value;
    Node<K,V> next;
    Node(int hash, K key, V value, Node<K,V> next) {
        this.hash = hash;
        this.key = key;
        this.value = value;
        this.next = next;
    }
    public final K getKey()        { return key; }
    public final V getValue()      { return value; }
    public final String toString() { return key + "=" + value; }
    public final int hashCode() {
        return Objects.hashCode(key) ^ Objects.hashCode(value);
    }
    public final V setValue(V newValue) {
        V oldValue = value;
        value = newValue;
        return oldValue;
    }
    public final boolean equals(Object o) {
        // 快速判断
        if (o == this)
            return true;

        // 类型判断    
        if (o instanceof Map.Entry) {
            Map.Entry<?,?> e = (Map.Entry<?,?>)o;
            if (Objects.equals(key, e.getKey()) &&
                Objects.equals(value, e.getValue()))
                return true;
        }
        return false;
    }
}
```

## 个人理解

四个核心元素：

```java
final int hash; // hash 值
final K key;    // key
V value;    // value 值
Node<K,V> next; // 下一个元素结点
```

### hash 值的算法

hash 算法如下。

直接 key/value 的异或(`^`)。

```java
Objects.hashCode(key) ^ Objects.hashCode(value);
```

其中 hashCode() 方法如下：

```java
public static int hashCode(Object o) {
    return o != null ? o.hashCode() : 0;
}
```

最后还是会调用对象本身的 hashCode() 算法。一般我们自己会定义。

# 静态工具类

## hash

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

### 为什么这么设计？

- jdk8 自带解释

计算key.hashCode()，并将(XORs)的高比特位分散到低比特位。

因为表使用的是power-of-two掩蔽，所以只在当前掩码上方以位为单位变化的哈希总是会发生冲突。

(已知的例子中有一组浮点键，它们在小表中保存连续的整数。)

因此，我们应用了一种转换，将高比特的影响向下传播。

比特传播的速度、效用和质量之间存在权衡。

因为许多常见的散列集已经合理分布(所以不要受益于传播),因为我们用树来处理大型的碰撞在垃圾箱,我们只是XOR一些改变以最便宜的方式来减少系统lossage,以及将最高位的影响,否则永远不会因为指数计算中使用的表。

- 知乎的解释

这段代码叫**扰动函数**。

HashMap扩容之前的数组初始大小才16。所以这个散列值是不能直接拿来用的。

用之前还要先做对数组的长度取模运算，得到的余数才能用来访问数组下标。

`putVal` 函数源码

```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
        //...    
}
```

其中这一句 `tab[i = (n - 1) & hash])` 

这一步就是在寻找桶的过程，就是上图总数组，根据容量取如果容量是16 对hash值取低16位，那么下标范围就在容量大小范围内了。

这里也就解释了为什么 hashmap 的大小需要为 2 的正整数幂，因为这样（数组长度-1）正好相当于一个“低位掩码”。

比如大小 16，则 (16-1) = 15 = 00000000 00000000 00001111(二进制);

```
    10100101 11000100 00100101
&	00000000 00000000 00001111
-------------------------------
    00000000 00000000 00000101    //高位全部归零，只保留末四位
```

但是问题是，散列值分布再松散，要是只取最后几位的话，碰撞也会很严重。

扰动函数的价值如下：

![扰动函数的价值](https://pic3.zhimg.com/80/4acf898694b8fb53498542dc0c5f765a_hd.png)

右位移16位，正好是32bit的一半，自己的高半区和低半区做异或，就是为了混合原始哈希码的高位和低位，以此来加大低位的随机性。

而且混合后的低位掺杂了高位的部分特征，这样高位的信息也被变相保留下来。

[优化哈希的原理介绍](http://vanillajava.blogspot.com/2015/09/an-introduction-to-optimising-hashing.html)

## comparable class

- comparableClassFor()

获取对象 x 的类，如果这个类实现了 `class C implements Comparable<C>` 接口。

ps: 这个方法很有借鉴意义，可以做简单的拓展。我们可以获取任意接口泛型中的类型。

```java
static Class<?> comparableClassFor(Object x) {
    if (x instanceof Comparable) {
        Class<?> c; Type[] ts, as; Type t; ParameterizedType p;
        if ((c = x.getClass()) == String.class) // bypass checks
            return c;
        if ((ts = c.getGenericInterfaces()) != null) {
            for (int i = 0; i < ts.length; ++i) {
                if (((t = ts[i]) instanceof ParameterizedType) &&
                    ((p = (ParameterizedType)t).getRawType() ==
                     Comparable.class) &&
                    (as = p.getActualTypeArguments()) != null &&
                    as.length == 1 && as[0] == c) // type arg is c
                    return c;
            }
        }
    }
    return null;
}
```

## compareComparables()

获取两个可比较对象的比较结果。

```java
@SuppressWarnings({"rawtypes","unchecked"}) // for cast to Comparable
static int compareComparables(Class<?> kc, Object k, Object x) {
    return (x == null || x.getClass() != kc ? 0 :
            ((Comparable)k).compareTo(x));
}
```

## tableSizeFor

获取 2 的幂

```java
static final int tableSizeFor(int cap) {
    int n = cap - 1;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```

- 被调用处

```java
public HashMap(int initialCapacity, float loadFactor) {
    // check...
    this.loadFactor = loadFactor;
    this.threshold = tableSizeFor(initialCapacity);
}
```

- 感想

emmm....为什么要这么写？性能吗？

### 简单分析

当在实例化HashMap实例时，如果给定了initialCapacity，由于HashMap的capacity都是2的幂，因此这个方法用于找到大于等于initialCapacity的最小的2的幂（initialCapacity如果就是2的幂，则返回的还是这个数）。 

- 为什么要 -1

`int n = cap - 1;`

首先，为什么要对cap做减1操作。int n = cap - 1; 
这是为了防止，cap已经是2的幂。如果cap已经是2的幂， 又没有执行这个减1操作，则执行完后面的几条无符号右移操作之后，返回的capacity将是这个cap的2倍。如果不懂，要看完后面的几个无符号右移之后再回来看看。 

下面看看这几个无符号右移操作： 

如果n这时为0了（经过了cap-1之后），则经过后面的几次无符号右移依然是0，最后返回的capacity是1（最后有个n+1的操作）。 

这里只讨论n不等于0的情况。 

- 第一次位运算

`n |= n >>> 1;`

由于n不等于0，则n的二进制表示中总会有一bit为1，这时考虑最高位的1。

通过无符号右移1位，则将最高位的1右移了1位，再做或操作，使得n的二进制表示中与最高位的1紧邻的右边一位也为1，如000011xxxxxx。 

其他依次类推

### 实例

比如 initialCapacity = 10;

```
表达式                       二进制
------------------------------------------------------    

initialCapacity = 10;
int n = 9;                  0000 1001
------------------------------------------------------    


n |= n >>> 1;               0000 1001
                            0000 0100   (右移1位) 或运算
                          = 0000 1101
------------------------------------------------------    

n |= n >>> 2;               0000 1101
                            0000 0011   (右移2位) 或运算
                          = 0000 1111
------------------------------------------------------    

n |= n >>> 4;               0000 1111
                            0000 0000   (右移4位) 或运算
                          = 0000 1111
------------------------------------------------------  

n |= n >>> 8;               0000 1111
                            0000 0000   (右移8位) 或运算
                          = 0000 1111
------------------------------------------------------  

n |= n >>> 16;              0000 1111
                            0000 0000   (右移16位) 或运算
                          = 0000 1111
------------------------------------------------------  

n = n+1;                    0001 0000    结果：2^4 = 16;      
```

# 未完待续

...

# 拓展阅读

[位运算]()

[java transient 关键字]()

# 参考资料

## 基础知识

TODO: java 位运算

[oracle jdk8 doc](https://docs.oracle.com/javase/8/docs/api/)

## 常量定义

[why-use-14-instead-of-16](https://stackoverflow.com/questions/36039911/why-use-14-instead-of-16)

[why-is-the-maximum-capacity-of-a-java-hashmap-130-and-not-131](https://stackoverflow.com/questions/21638080/why-is-the-maximum-capacity-of-a-java-hashmap-130-and-not-131)

- 负载因子

https://www.cnblogs.com/a294098789/p/5323032.html

https://blog.csdn.net/wenyiqingnianiii/article/details/52204136

[泊松分布和指数分布：10分钟教程](http://www.ruanyifeng.com/blog/2015/06/poisson-distribution.html#comment-356111)

## 静态工具方法

- hash

[why-return-h-key-hashcode-h-16-other-than-key-hashcode](https://stackoverflow.com/questions/45125497/why-return-h-key-hashcode-h-16-other-than-key-hashcode)

[JDK 源码中 HashMap 的 hash 方法原理是什么？](https://www.zhihu.com/question/20733617)

[hash 的生成策略](https://www.jianshu.com/p/d846f4ed8ad8)

- tableSizeFor

[Java8 HashMap之tableSizeFor](https://www.cnblogs.com/loading4/p/6239441.html)

[]()

* any list
{:toc}