---
layout: post
title:  锁专题（9） ConcurrentSkipListSet 源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, queue, data-struct, sf]
published: true
---

# ConcurrentSkipListSet 

![思维导图](https://p1.pstatp.com/origin/pgc-image/418d79bd83284dec8a7506953d9322dd)

## 简介

基于以下内容的可伸缩并发NavigableSet}实现：ConcurrentSkipListMap。

> [万字长文，ConcurrentSkipListMap源码详解](https://mp.toutiao.com/profile_v4/graphic/preview?pgc_id=6891264329896133127)

集合中的元素根据其可比自然顺序或在集合创建时提供的Comparator保持排序，具体取决于使用哪个构造函数。

## set 汇总

我们学习了大量的 jdk 的集合类，我们把 set 类汇总一下，便于大家对比记忆。

| Set	            |  有序性	    |  线程安全	    |  底层实现	    |  关键接口	    |  特点 |
|:----|:----|:----|:----|:----|:----|
| HashSet	| 无	| 否	| HashMap	| 无	| 简单 |  
| LinkedHashSet |	有 |	否	| LinkedHashMap	 | 无	| 插入顺序 | 
| TreeSet	| 有	| 否	| NavigableMap	| NavigableSet |	自然顺序 | 
| CopyOnWriteArraySet	 | 有	| 是	 | CopyOnWriteArrayList |	无 |	插入顺序，读写分离 | 
| ConcurrentSkipListSet |	有 |	是 |	ConcurrentNavigableMap	 | NavigableSet	| 自然顺序 |  


![table](https://p1.pstatp.com/origin/pgc-image/c8bb217133824acebf1f546c18ca9e78)

## 入门例子

我们首先使用 TreeSet 做一个多线程的测试。

```java
public class ConcurrentSkipListSetDemo {

    private static Set<String> set = new TreeSet<>();

    public static void main(String[] args) {
        new MyThread("a").start();
        new MyThread("b").start();
    }

    private static class MyThread extends Thread {
        MyThread(String name) {
            super(name);
        }
        @Override
        public void run() {
            int i = 0;
            while (i++ < 5) {
                // “线程名” + "序号"
                String val = Thread.currentThread().getName() + (i%6);
                set.add(val);

                // 遍历 set
                for(String s : set) {
                    System.out.print(s+", ");
                }
                System.out.println();
            }
        }
    }

}
```

TreeSet 不是线程安全的，执行实际上会报错：

```
a1, a1, b1, b1, 

a1, a1, a2, b1, b2, 
a1, a2, a3, b1, b2, 
a1, a2, a3, a4, b1, b2, 
a1, a2, a3, a4, a5, b1, b2, 
Exception in thread "b" java.util.ConcurrentModificationException
	at java.util.TreeMap$PrivateEntryIterator.nextEntry(TreeMap.java:1211)
```


我们将 TreeMap 替换为 `ConcurrentSkipListSet`，输出如下：

```
a1, b1, 
a1, b1, b2, 
a1, b1, b2, b3, 
a1, a1, b1, b2, b3, b1, b4, 
b2, a1, b3, b1, b2, b4, b3, b5, 
b4, a1, a2, b1, b2, b3, b4, b5, 
a1, a2, a3, b5, 
b1, b2, b3, b4, b5, 
a1, a2, a3, a4, b1, b2, b3, b4, b5, 
a1, a2, a3, a4, a5, b1, b2, b3, b4, b5, 
```


# 源码解读

![源码解读](https://p1.pstatp.com/origin/pgc-image/fce76c5e3d724915a8090e900eae790f)

## 类定义

```java
public class ConcurrentSkipListSet<E>
    extends AbstractSet<E>
    implements NavigableSet<E>, Cloneable, java.io.Serializable {

    }
```

实现了 NavigableSet 接口，并且继承自 AbstractSet 抽象集合类。

## 构造器

```java
/**
 * 内部变量，ConcurrentSkipListMap 实现
 *
 * @author 老马啸西风
 */
private final ConcurrentNavigableMap<E,Object> m;

public ConcurrentSkipListSet() {
    m = new ConcurrentSkipListMap<E,Object>();
}

public ConcurrentSkipListSet(Comparator<? super E> comparator) {
    m = new ConcurrentSkipListMap<E,Object>(comparator);
}

public ConcurrentSkipListSet(Collection<? extends E> c) {
    m = new ConcurrentSkipListMap<E,Object>();
    addAll(c);
}

public ConcurrentSkipListSet(SortedSet<E> s) {
    m = new ConcurrentSkipListMap<E,Object>(s.comparator());
    addAll(s);
}

ConcurrentSkipListSet(ConcurrentNavigableMap<E,Object> m) {
    this.m = m;
}
```

构造器都非常的简单，当然这里还预留了一个方法，可以使用指定的 ConcurrentNavigableMap 类来实现。

### addAll 方法

实际上 addAll() 的实现非常简单

```java
public boolean addAll(Collection<? extends E> c) {
    boolean modified = false;
    for (E e : c)
        if (add(e))
            modified = true;
    return modified;
}
```

直接遍历集合元素，单个执行 add 方法。

如果 add 成功，则设置 modified = true;

在 ConcurrentSkipListMap 的基础之上实现，实际上源码变得很清晰。

## 集合大小

```java
public int size() {
    return m.size();
}
```

## 是否为空

```java
public boolean isEmpty() {
    return m.isEmpty();
}
```

## 是否包含

```java
public boolean contains(Object o) {
    return m.containsKey(o);
}
```

## 添加一个元素

```java
public boolean add(E e) {
    return m.putIfAbsent(e, Boolean.TRUE) == null;
}
```

为了避免内容过于朴实无华，我们就勉为其难的阅读以下 map 的实现源码。

```java
public V putIfAbsent(K key, V value) {
    return putVal(key, value, true);
}
```

putVal 的完整实现如下：

```java
/** 
** 这个方法被定义为 final，可见作者不希望方法被重写。
** 
** @author 老马啸西风
*/
final V putVal(K key, V value, boolean onlyIfAbsent) {
    // 禁止元素为 null
    if (key == null || value == null) throw new NullPointerException();
    int hash = spread(key.hashCode());
    int binCount = 0;
    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh;

        // 如果 table 为空，首先进行初始化
        if (tab == null || (n = tab.length) == 0)
            tab = initTable();
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            // 通过 CAS 进行设置
            if (casTabAt(tab, i, null,
                         new Node<K,V>(hash, key, value, null)))
                break;                   // no lock when adding to empty bin
        }
        // 如果 map 处于 resize，则执行下面的方法。
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        else {
            V oldVal = null;

            // 使用悲观锁加锁
            synchronized (f) {
                if (tabAt(tab, i) == f) {
                    if (fh >= 0) {
                        binCount = 1;
                        for (Node<K,V> e = f;; ++binCount) {
                            K ek;
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                oldVal = e.val;
                                if (!onlyIfAbsent)
                                    e.val = value;
                                break;
                            }
                            Node<K,V> pred = e;
                            if ((e = e.next) == null) {
                                pred.next = new Node<K,V>(hash, key,
                                                          value, null);
                                break;
                            }
                        }
                    }
                    else if (f instanceof TreeBin) {
                        Node<K,V> p;
                        binCount = 2;
                        if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key,
                                                       value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                        }
                    }
                }
            }
            if (binCount != 0) {
                // 达到了阈值，则进行转换为树处理，默认阈值为 8.
                // 类似于 HashMap 中的链表超过 8 转红黑树。
                if (binCount >= TREEIFY_THRESHOLD)
                    treeifyBin(tab, i);
                if (oldVal != null)
                    return oldVal;
                break;
            }
        }
    }

    // 添加总数
    addCount(1L, binCount);
    return null;
}
```

其中 resizeStamp 是一个非常常用的方法：

```java
/**
 * 返回用于调整大小为n的表的标记位。
 * 向左移动RESIZE_STAMP_SHIFT时必须为负。
 */
static final int resizeStamp(int n) {
    return Integer.numberOfLeadingZeros(n) | (1 << (RESIZE_STAMP_BITS - 1));
}
```

### helpTransfer 方法

```java
/**
 * Helps transfer if a resize is in progress.
 * 如果正处于 resize 的过程中，则通过这个方法进行转换。
* @author 老马啸西风
 */
final Node<K,V>[] helpTransfer(Node<K,V>[] tab, Node<K,V> f) {
    Node<K,V>[] nextTab; int sc;
    if (tab != null && (f instanceof ForwardingNode) &&
        (nextTab = ((ForwardingNode<K,V>)f).nextTable) != null) {
        //返回用于调整大小为n的表的标记位。
        //向左移动RESIZE_STAMP_SHIFT时必须为负。
        int rs = resizeStamp(tab.length);
        while (nextTab == nextTable && table == tab &&
               (sc = sizeCtl) < 0) {
            if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                sc == rs + MAX_RESIZERS || transferIndex <= 0)
                break;

            // 这里是通过 CAS 进行设置值的    
            if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1)) {
                // 转换的方法也非常复杂，后面会解析。
                transfer(tab, nextTab);
                break;
            }
        }
        return nextTab;
    }
    return table;
}
```

### transfer 实现

transfer 这个方法也多次被调用，这里我们简单介绍一下。

友情提示：这个 transfer 方法实现**对阅读非常不友好**，可以跳过。

```java
/**
 * 将每个bin中的节点移动和/或复制到新表中。
 *
 * @author 老马啸西风
 */
private final void transfer(Node<K,V>[] tab, Node<K,V>[] nextTab) {
    int n = tab.length, stride;

    // 这里会根据 CPU 的核数，进行选择
    if ((stride = (NCPU > 1) ? (n >>> 3) / NCPU : n) < MIN_TRANSFER_STRIDE)
        stride = MIN_TRANSFER_STRIDE; // subdivide range

    // 如果 nexTab 为空，首先进行初始化    
    if (nextTab == null) {            // initiating
        try {
            @SuppressWarnings("unchecked")
            Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n << 1];
            nextTab = nt;
        } catch (Throwable ex) {      // try to cope with OOME
            sizeCtl = Integer.MAX_VALUE;
            return;
        }
        nextTable = nextTab;
        transferIndex = n;
    }
    int nextn = nextTab.length;
    ForwardingNode<K,V> fwd = new ForwardingNode<K,V>(nextTab);
    boolean advance = true;
    boolean finishing = false; // to ensure sweep before committing nextTab
    for (int i = 0, bound = 0;;) {
        Node<K,V> f; int fh;
        while (advance) {
            int nextIndex, nextBound;
            if (--i >= bound || finishing)
                advance = false;
            else if ((nextIndex = transferIndex) <= 0) {
                i = -1;
                advance = false;
            }
            //CAS 设置
            else if (U.compareAndSwapInt
                     (this, TRANSFERINDEX, nextIndex,
                      nextBound = (nextIndex > stride ?
                                   nextIndex - stride : 0))) {
                bound = nextBound;
                i = nextIndex - 1;
                advance = false;
            }
        }

        if (i < 0 || i >= n || i + n >= nextn) {
            int sc;

            // finishing 标识是否已经完成，如果完成就直接返回了。
            if (finishing) {
                nextTable = null;
                table = nextTab;
                sizeCtl = (n << 1) - (n >>> 1);
                return;
            }

            //CAS 设置值。
            if (U.compareAndSwapInt(this, SIZECTL, sc = sizeCtl, sc - 1)) {
                if ((sc - 2) != resizeStamp(n) << RESIZE_STAMP_SHIFT)
                    return;
                finishing = advance = true;
                i = n; // recheck before commit
            }
        }

        // 通过 UnSafe 获取，和设置对应的变量信息
        else if ((f = tabAt(tab, i)) == null)
            advance = casTabAt(tab, i, null, fwd);

        // 说明目前正在进行 resize 操作    
        else if ((fh = f.hash) == MOVED)
            advance = true; // already processed
        else {

            // 悲观锁保证线程安全
            synchronized (f) {
                if (tabAt(tab, i) == f) {
                    Node<K,V> ln, hn;
                    if (fh >= 0) {
                        int runBit = fh & n;
                        Node<K,V> lastRun = f;

                        // 遍历所有节点，更新对应的信息。
                        for (Node<K,V> p = f.next; p != null; p = p.next) {
                            int b = p.hash & n;
                            if (b != runBit) {
                                runBit = b;
                                lastRun = p;
                            }
                        }
                        if (runBit == 0) {
                            ln = lastRun;
                            hn = null;
                        }
                        else {
                            hn = lastRun;
                            ln = null;
                        }
                        for (Node<K,V> p = f; p != lastRun; p = p.next) {
                            int ph = p.hash; K pk = p.key; V pv = p.val;
                            if ((ph & n) == 0)
                                ln = new Node<K,V>(ph, pk, pv, ln);
                            else
                                hn = new Node<K,V>(ph, pk, pv, hn);
                        }
                        setTabAt(nextTab, i, ln);
                        setTabAt(nextTab, i + n, hn);
                        setTabAt(tab, i, fwd);
                        advance = true;
                    }
                    else if (f instanceof TreeBin) {
                        // 如果就是 TreeBin 的处理逻辑。
                        TreeBin<K,V> t = (TreeBin<K,V>)f;
                        TreeNode<K,V> lo = null, loTail = null;
                        TreeNode<K,V> hi = null, hiTail = null;
                        int lc = 0, hc = 0;
                        for (Node<K,V> e = t.first; e != null; e = e.next) {
                            int h = e.hash;
                            TreeNode<K,V> p = new TreeNode<K,V>
                                (h, e.key, e.val, null, null);
                            if ((h & n) == 0) {
                                if ((p.prev = loTail) == null)
                                    lo = p;
                                else
                                    loTail.next = p;
                                loTail = p;
                                ++lc;
                            }
                            else {
                                if ((p.prev = hiTail) == null)
                                    hi = p;
                                else
                                    hiTail.next = p;
                                hiTail = p;
                                ++hc;
                            }
                        }
                        ln = (lc <= UNTREEIFY_THRESHOLD) ? untreeify(lo) :
                            (hc != 0) ? new TreeBin<K,V>(lo) : t;
                        hn = (hc <= UNTREEIFY_THRESHOLD) ? untreeify(hi) :
                            (lc != 0) ? new TreeBin<K,V>(hi) : t;
                        setTabAt(nextTab, i, ln);
                        setTabAt(nextTab, i + n, hn);
                        setTabAt(tab, i, fwd);
                        advance = true;
                    }
                }
            }
        }
    }
}
```

### treeifyBin

```java
/**
 * 除非表太小，否则以给定的索引替换bin中所有链接的节点，在这种情况下，将调整大小。
 * @author 老马啸西风
 */
private final void treeifyBin(Node<K,V>[] tab, int index) {
    Node<K,V> b; int n, sc;
    if (tab != null) {
        if ((n = tab.length) < MIN_TREEIFY_CAPACITY)
            tryPresize(n << 1);
        else if ((b = tabAt(tab, index)) != null && b.hash >= 0) {

            // 悲观锁同步
            synchronized (b) {
                // UNSAFE 获取元素
                if (tabAt(tab, index) == b) {
                    TreeNode<K,V> hd = null, tl = null;
                    for (Node<K,V> e = b; e != null; e = e.next) {
                        TreeNode<K,V> p =
                            new TreeNode<K,V>(e.hash, e.key, e.val,
                                              null, null);
                        if ((p.prev = tl) == null)
                            hd = p;
                        else
                            tl.next = p;
                        tl = p;
                    }

                    //CAS 设置
                    setTabAt(tab, index, new TreeBin<K,V>(hd));
                }
            }
        }
    }
}
```

tryPresize 这个方法也值得展开一下，实现如下：

```java
/**
 * 尝试调整表的大小以容纳给定数量的元素。

 * 为什么不需要特别准确，个人理解这里应该是翻倍扩容。所以数据有一点误差，问题不大。
 *
 * @param size 元素数量（不需要完全准确）
 * @author 老马啸西风
 */
private final void tryPresize(int size) {
    int c = (size >= (MAXIMUM_CAPACITY >>> 1)) ? MAXIMUM_CAPACITY :
        tableSizeFor(size + (size >>> 1) + 1);
    int sc;
    while ((sc = sizeCtl) >= 0) {
        Node<K,V>[] tab = table; int n;
        if (tab == null || (n = tab.length) == 0) {
            n = (sc > c) ? sc : c;
            if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
                try {
                    if (table == tab) {
                        @SuppressWarnings("unchecked")
                        Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                        table = nt;
                        sc = n - (n >>> 2);
                    }
                } finally {
                    sizeCtl = sc;
                }
            }
        }
        else if (c <= sc || n >= MAXIMUM_CAPACITY)
            break;
        else if (tab == table) {
            int rs = resizeStamp(n);
            if (sc < 0) {
                Node<K,V>[] nt;
                if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                    sc == rs + MAX_RESIZERS || (nt = nextTable) == null ||
                    transferIndex <= 0)
                    break;
                if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1))
                    transfer(tab, nt);
            }
            else if (U.compareAndSwapInt(this, SIZECTL, sc,
                                         (rs << RESIZE_STAMP_SHIFT) + 2))
                transfer(tab, null);
        }
    }
}
```

### addCount 添加一个计数

```java
/**
 * 增加计数，如果表太小且尚未调整大小，则启动传输。
 *
 * 如果已经调整大小，则在工作可用时帮助执行转移。 转移后重新检查占用率，以查看是否已经需要其他调整大小，因为调整大小是滞后的。
 *
 * @param x the count to add
 * @param check if <0, don't check resize, if <= 1 only check if uncontended
 * @author 老马啸西风
 */
private final void addCount(long x, int check) {
    CounterCell[] as; long b, s;
    if ((as = counterCells) != null ||
        // CAS 更新变量信息
        !U.compareAndSwapLong(this, BASECOUNT, b = baseCount, s = b + x)) {
        CounterCell a; long v; int m;
        boolean uncontended = true;
        if (as == null || (m = as.length - 1) < 0 ||
            (a = as[ThreadLocalRandom.getProbe() & m]) == null ||
            !(uncontended =
              U.compareAndSwapLong(a, CELLVALUE, v = a.value, v + x))) {
            // 
            fullAddCount(x, uncontended);
            return;
        }
        if (check <= 1)
            return;
        s = sumCount();
    }
    if (check >= 0) {
        Node<K,V>[] tab, nt; int n, sc;
        while (s >= (long)(sc = sizeCtl) && (tab = table) != null &&
               (n = tab.length) < MAXIMUM_CAPACITY) {
            int rs = resizeStamp(n);
            if (sc < 0) {
                if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                    sc == rs + MAX_RESIZERS || (nt = nextTable) == null ||
                    transferIndex <= 0)
                    break;
                if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1))
                    transfer(tab, nt);
            }
            else if (U.compareAndSwapInt(this, SIZECTL, sc,
                                         (rs << RESIZE_STAMP_SHIFT) + 2))
                transfer(tab, null);
            s = sumCount();
        }
    }
}
```

这里主要还是通过 CAS 进行变量的增加。

#### fullAddCount

看这个源码，最核心的保证并发安全的方式是通过**循环+CAS**来保证的。

```java
// See LongAdder version for explanation
private final void fullAddCount(long x, boolean wasUncontended) {
    int h;

    // 使用 ThreadLocalRandom 进行本地变量初始化。
    if ((h = ThreadLocalRandom.getProbe()) == 0) {
        ThreadLocalRandom.localInit();      // force initialization
        h = ThreadLocalRandom.getProbe();
        wasUncontended = true;
    }

    boolean collide = false;                // True if last slot nonempty
    for (;;) {
        CounterCell[] as; CounterCell a; int n; long v;
        if ((as = counterCells) != null && (n = as.length) > 0) {
            if ((a = as[(n - 1) & h]) == null) {
                if (cellsBusy == 0) {            // Try to attach new Cell
                    CounterCell r = new CounterCell(x); // Optimistic create

                    // 通过 CAS 设置变量信息
                    if (cellsBusy == 0 &&
                        U.compareAndSwapInt(this, CELLSBUSY, 0, 1)) {
                        boolean created = false;
                        try {               // Recheck under lock
                            CounterCell[] rs; int m, j;
                            if ((rs = counterCells) != null &&
                                (m = rs.length) > 0 &&
                                rs[j = (m - 1) & h] == null) {
                                rs[j] = r;
                                created = true;
                            }
                        } finally {
                            cellsBusy = 0;
                        }

                        // 这里实际上是通过循环+CAS一直尝试创建，成功则跳出循环。
                        if (created)
                            break;
                        continue;           // Slot is now non-empty
                    }
                }
                collide = false;
            }
            else if (!wasUncontended)       // CAS already known to fail
                wasUncontended = true;      // Continue after rehash
            else if (U.compareAndSwapLong(a, CELLVALUE, v = a.value, v + x))
                break;
            else if (counterCells != as || n >= NCPU)
                collide = false;            // At max size or stale
            else if (!collide)
                collide = true;
            else if (cellsBusy == 0 &&
                     U.compareAndSwapInt(this, CELLSBUSY, 0, 1)) {
                try {
                    if (counterCells == as) {// Expand table unless stale
                        CounterCell[] rs = new CounterCell[n << 1];
                        for (int i = 0; i < n; ++i)
                            rs[i] = as[i];
                        counterCells = rs;
                    }
                } finally {
                    cellsBusy = 0;
                }
                collide = false;
                continue;                   // Retry with expanded table
            }
            h = ThreadLocalRandom.advanceProbe(h);
        }
        else if (cellsBusy == 0 && counterCells == as &&
                 U.compareAndSwapInt(this, CELLSBUSY, 0, 1)) {
            boolean init = false;
            try {                           // Initialize table
                if (counterCells == as) {
                    CounterCell[] rs = new CounterCell[2];
                    rs[h & 1] = new CounterCell(x);
                    counterCells = rs;
                    init = true;
                }
            } finally {
                cellsBusy = 0;
            }
            if (init)
                break;
        }
        else if (U.compareAndSwapLong(this, BASECOUNT, v = baseCount, v + x))
            break;                          // Fall back on using base
    }
}
```

#### sumCount 计算总数

这个方法相对比较简单，遍历集合，然后累加。

```java
final long sumCount() {
    CounterCell[] as = counterCells; CounterCell a;
    long sum = baseCount;
    if (as != null) {
        for (int i = 0; i < as.length; ++i) {
            if ((a = as[i]) != null)
                sum += a.value;
        }
    }
    return sum;
}
```

## 移除一个元素

```java
public boolean remove(Object o) {
    return m.remove(o, Boolean.TRUE);
}
```

这里参考 ConcurrentSkipListMap 的源码，此处不做展开。

## 清空

```java
public void clear() {
    m.clear();
}
```

# 小结

好家伙，ConcurrentSkipListSet 源码说简单是非常简单。说复杂，也可以说是非常复杂。

我们只是针对一个 put 方法进行展开，内容就已经非常多了。

阅读源码，才感觉知识储备太少了，读起来有些地方非常吃力。自己需要补的知识还是非常多的。

**知道自己无知是第一步，学习去弥补这个无知是第二步。**

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

[ConcurrentSkipListMap 源码分析 (基于Java 8)](https://www.jianshu.com/p/edc2fd149255)

[【JUC】JDK1.8源码分析之ConcurrentSkipListMap（二）](https://www.cnblogs.com/leesf456/p/5512817.html)

[死磕 java集合之ConcurrentSkipListMap源码分析](https://www.cnblogs.com/tong-yuan/p/ConcurrentSkipListMap.html)

* any list
{:toc}