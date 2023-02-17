---
layout: post
title: JUC-03-LongAdder
date:  2019-1-20 14:10:12 +0800
categories: [Concurrency]
tags: [thread, concurrency, juc, sh]
published: true
---

# LongAdder

LongAdder中会维护一个或多个变量，这些变量共同组成一个long型的“和”。当多个线程同时更新（特指“add”）值时，为了减少竞争，可能会动态地增加这组变量的数量。“sum”方法（等效于longValue方法）返回这组变量的“和”值。

当我们的场景是为了统计技术，而不是为了更细粒度的同步控制时，并且是在多线程更新的场景时，LongAdder类比AtomicLon                              g更好用。 在小并发的环境下，论更新的效率，两者都差不多。但是高并发的场景下，LongAdder有着明显更高的吞吐量，但是有着更高的空间复杂度。

从上面的java doc来看，LongAdder有两大方法，add和sum。

其更适合使用在多线程统计计数的场景下，在这个限定的场景下比AtomicLong要高效一些。

# 设计概览

前面提到AtomicLong在线程碰撞不频繁时效率较高，但是如果线程碰撞频繁，长时间的自旋会浪费大量资源。对于一个计数器来说，绝大部分情况下并不关心当前值是多少，只要少量按需get即可。所以，引入了LongAdder。

LongAdder在JDK1.8新增加，继承的是Striped64，这个类是Number的子类，用于表示64位的动态条带。 

Striped64内部含有一个cells数组，用于存储线程使用的计数器。

并且Striped64在构造时是不会初始化数组的。Cell是一个线程间共享的计数器。

在多线程环境下，我们计数qps、某段时间调用错误量这类计算时，想到的是AtomicInteger/AtomicLong，在多线程情况下，这些能减少锁带来的性能损耗；但是在大并发，竞争很激烈的情况下，出现CAS不成功的情况也会带来性能上的开销。

## 核心解决问题

LongAdder类主要为解决这个问题，分散计数值写入时的压力；主要原理就是利用分段写人，减少竞争。

比如qps值为10, 它可以分解为2+3+4+1，这几个值分布在不同的段中单独计数；当qps加1时，可以在任意一个段中加1即可，每个段绑定某个线程，每次更新值由任一段对应的线程来执行。这样就很好的分散了线程之间的竞争。
当要计算总量时，累加每个段中的值即可。

Hystrix项目中的HystrixRollingNumber类中使用了LongAdder类。HystrixRollingNumber类内部实现了无锁环形数组，来做限流计数这样的统计计数；后续再记录下该类。

在小并发下，LongAdder与AtomicLong更新效率差不多，但在高并发的场景下，LongAdder有着更高的吞吐量。 

LongAdder实现比较复杂的，明显的空间换时间。

## 高效原因

总结下LongAdder减少冲突的方法以及在求和场景下比AtomicLong更高效的原因：

1. 开始和AtomicLong一样，都会先采用cas方式更新值

2. 在初次cas方式失败的情况下(通常证明多个线程同时想更新这个值)，尝试将这个值分隔成多个cell（sum的时候求和就好），让这些竞争的线程只管更新自己所属的cell，这样就将竞争压力分散了。

# 核心方法源码分析

## 疑问

AtomicLong的实现方式是内部有个value 变量，当多线程并发自增，自减时，均通过cas 指令从机器指令级别操作保证并发的原子性。

那 LongAdder 如何做到比 CAS 还要快呢？

## add()

LongAdder有两大方法，add和sum。

其更适合使用在多线程统计计数的场景下，在这个限定的场景下比AtomicLong要高效一些，下面我们来分析下为啥在这种场景下LongAdder会更高效。

```java
public void add(long x) {
    Cell[] as; long b, v; HashCode hc; Cell a; int n;
    //首先判断cells是否还没被初始化，并且尝试对value值进行cas操作
    if ((as = cells) != null || !casBase(b = base, b + x)) {
        boolean uncontended = true;
        //查看当前线程中HashCode中存储的随机值
        int h = (hc = threadHashCode.get()).code;
        //此处有多个判断条件，依次是
        //1.cell[]数组还未初始化
        //2.cell[]数组虽然初始化了但是数组长度为0
        //3.该线程所对应的cell为null，其中要注意的是，当n为2的n次幂时，（(n - 1) & h）等效于h%n
        //4.尝试对该线程对应的cell单元进行cas更新（加上x)
        if (as == null || (n = as.length) < 1 ||
            (a = as[(n - 1) & h]) == null ||
            !(uncontended = a.cas(v = a.value, v + x)))
            //在以上条件都失效的情况下，重试update
            retryUpdate(x, hc, uncontended);
    }
}
//一个ThreadLocal类
static final class ThreadHashCode extends ThreadLocal<HashCode> {
    public HashCode initialValue() { return new HashCode(); }
}

static final ThreadHashCode threadHashCode = new ThreadHashCode();
//每个HashCode在初始化时会产生并保存一个非0的随机数
static final class HashCode {
    static final Random rng = new Random();
    int code;
    HashCode() {
        int h = rng.nextInt(); // Avoid zero to allow xorShift rehash
        code = (h == 0) ? 1 : h;
    }
}

//尝试使用casBase对value值进行update，baseOffset是value相对于LongAdder对象初始位置的内存偏移量
final boolean casBase(long cmp, long val) {
    return UNSAFE.compareAndSwapLong(this, baseOffset, cmp, val);
}
```

### 精妙的地方

拿到该线程相关的HashCode对象后，获取它的code变量，`as[(n - 1) & h]` 这句话相当于对h取模，只不过比起取摸，因为是与的运算所以效率更高。

计算出一个在Cells 数组中当先线程的HashCode对应的 索引位置，并将该位置的Cell 对象拿出来更新cas 更新它的value值。

当然，如果as 为null 并且更新失败，才会进入retryUpdate方法。

- 为什么高效

看到这里我想应该有很多人明白为什么LongAdder会比AtomicLong更高效了。

没错，唯一会制约AtomicLong高效的原因是高并发，高并发意味着CAS的失败几率更高，重试次数更多，越多线程重试，CAS失败几率又越高，变成恶性循环，AtomicLong效率降低。 

那怎么解决？ 

LongAdder给了我们一个非常容易想到的解决方案: 减少并发，将单一value的更新压力分担到多个value中去，降低单个value的 “热度”，分段更新！！！   

这样，线程数再多也会分担到多个value上去更新，只需要增加value就可以降低 value的 “热度”  AtomicLong中的 恶性循环不就解决了吗？ cells 就是这个 “段” cell中的value 就是存放更新值的，这样，当我需要总数时，把cells 中的value都累加一下不就可以了么。
类似于 concurrentHashMap 的思路。


- caseBase() 方法

```java
//尝试使用casBase对value值进行update，baseOffset是value相对于LongAdder对象初始位置的内存偏移量
final boolean casBase(long cmp, long val) {
    return UNSAFE.compareAndSwapLong(this, baseOffset, cmp, val);
}
```

当然，聪明之处远远不仅仅这里，在看看add方法中的代码，casBase方法可不可以不要，直接分段更新,上来就计算索引位置，然后更新value？

答案是不好，不是不行。

因为，casBase操作等价于AtomicLong中的cas操作，要知道，LongAdder这样的处理方式是有坏处的，分段操作必然带来空间上的浪费，可以空间换时间，但是，能不换就不换，看空间时间都节约~！ 

所以，casBase操作保证了在低并发时，不会立即进入分支做分段更新操作，因为低并发时，casBase操作基本都会成功，只有并发高到一定程度了，才会进入分支，所以，Doug Lead对该类的说明是：低并发时LongAdder和AtomicLong性能差不多，高并发时LongAdder更高效！

- 在add方法中，如果cells不会为空后，casBase方法一直都没有用了？

因此，我想可不可以调换add方法中的判断顺序，比如，先做casBase的判断，结果是 不调换可能更好，调换后每次都要CAS一下，在高并发时，失败几率非常高，并且是恶性循环，比起一次判断，后者的开销明显小很多，还没有副作用。因此，不调换可能会更好。

## retryUpdate()

retryUpdate在上述四个条件都失败的情况下尝试再次update，我们猜测在四个条件都失败的情况下在retryUpdate中肯定都对应四个条件失败的处理方法，并且update一定要成功，所以肯定有相应的循环+cas的方式出现。

```java
final void retryUpdate(long x, HashCode hc, boolean wasUncontended) {
    int h = hc.code;
    boolean collide = false;                // True if last slot nonempty
    //我们猜测的for循环
    for (;;) {
        Cell[] as; Cell a; int n; long v;
        //这个if分支处理上述四个条件中的3和4，此时cells数组已经初始化了并且长度大于0
        if ((as = cells) != null && (n = as.length) > 0) {
            //该分支处理四个条件中的3分支，线程对应的cell为null
            if ((a = as[(n - 1) & h]) == null) {
                //如果busy锁没被占有
                if (busy == 0) {            // Try to attach new Cell
                    //新建一个cell
                    Cell r = new Cell(x);   // Optimistically create
                    //double check busy,并且尝试锁busy（乐观锁）
                    if (busy == 0 && casBusy()) {
                        boolean created = false;
                        try {               // Recheck under lock
                            Cell[] rs; int m, j;
                            if ((rs = cells) != null &&
                                (m = rs.length) > 0 &&
                                rs[j = (m - 1) & h] == null) {
                                //再次确认线程hashcode所对应的cell为null，将新建的cell赋值
                                rs[j] = r;
                                created = true;
                            }
                        } finally {
                        //解锁
                            busy = 0;
                        }
                        if (created)
                            break;
                        //如果失败，再次尝试
                        continue;           // Slot is now non-empty
                    }
                }
                collide = false;
            }
            //处理四个条件中的条件4，置为true后交给循环重试
            else if (!wasUncontended)       // CAS already known to fail
                wasUncontended = true;      // Continue after rehash
            //尝试给线程对应的cell update
            else if (a.cas(v = a.value, fn(v, x)))
                break;
            else if (n >= NCPU || cells != as)
                collide = false;            // At max size or stale
            else if (!collide)
                collide = true;
            //在以上办法都不管用的情况下尝试扩大cell
            else if (busy == 0 && casBusy()) {
                try {
                    if (cells == as) {      // Expand table unless stale
                    //扩大一倍，将前N个拷贝过去
                        Cell[] rs = new Cell[n << 1];
                        for (int i = 0; i < n; ++i)
                            rs[i] = as[i];
                        cells = rs;
                    }
                } finally {
                    busy = 0;
                }
                collide = false;
                continue;                   // Retry with expanded table
            }
            //rehash下，走到这一步基本是因为多个线程的竞争太激烈了，所以在扩展cell后rehash h，等待下次循环处理好这次更新
            h ^= h << 13;                   // Rehash
            h ^= h >>> 17;
            h ^= h << 5;
        }
        //主要针对上述四个条件中的1.2，此时cells还未进行第一次初始化，其中casBusy的理解参照下面busy的      注释，如果casBusy能成功才进入这个分支
        else if (busy == 0 && cells == as && casBusy()) {
            boolean init = false;
            try {                           // Initialize table
                if (cells == as) {
                    //创建数量为2的cell数组，2很重要，因为每次都是n<<1进行扩大一倍的，所以n永远是2的幂
                    Cell[] rs = new Cell[2];
                    //需要注意的是h&1 = h%2，将线程对应的cell初始值设置为x
                    rs[h & 1] = new Cell(x);
                    cells = rs;
                    init = true;
                }
            } finally {
            //释放busy锁
                busy = 0;
            }
            if (init)
                break;
        }
        //busy锁不成功或者忙，则再重试一次casBase对value直接累加
        else if (casBase(v = base, fn(v, x)))
            break;                          // Fall back on using base
    }
    hc.code = h;                            // Record index for next time
}

/**
 * Spinlock (locked via CAS) used when resizing and/or creating Cells.
 通过cas实现的自旋锁，用于扩大或者初始化cells
 */
transient volatile int busy;
```

从以上分析来看，retryUpdate非常的复杂，所做的努力就是为了尽量减少多个线程更新同一个值value，能用简单的方式解决的绝对不采用开销更大的方法(resize cell也是走投无路的时候)

回过头来总结分析下LongAdder减少冲突的方法以及在求和场景下比AtomicLong更高效的原因

1. 首先和AtomicLong一样，都会先采用cas方式更新值

2. 在初次cas方式失败的情况下(通常证明多个线程同时想更新这个值)，尝试将这个值分隔成多个cell（sum的时候求和就好），让这些竞争的线程只管更新自己所属的cell（因为在rehash之前，每个线程中存储的hashcode不会变，所以每次都应该会找到同一个cell），这样就将竞争压力分散了

## sum方法

```java
public long sum() {
    long sum = base;
    Cell[] as = cells;
    if (as != null) {
        int n = as.length;
        for (int i = 0; i < n; ++i) {
            Cell a = as[i];
            if (a != null)
                sum += a.value;
        }
    }
    return sum;
}
```

sum方法就简单多了，将cell数组中的value求和就好

# 性能

在单线程的情况下，AtomicLong稍微快一点，在2个线程的时候，AtomicLong比LongAdder慢近4倍，而在线程数和机器CPU核数一致的情况下，AtomicLong比LongAdder慢近5倍。

让人印象更深刻的是，直到线程数超过CPU的物理核数（在这个例子中是4）之前，LongAdder的性能一直是个常量。

## 一个周期内的指令

周期内的指令衡量标准是：”CPU运行指令的时间” 对比 “CPU等待加载内存或者处理高速缓存加载或匹配数据的时间”。在这个例子中，我们看到Atomic在多线程的情况下IPC（周期内的指令）指标非常的差，而LongAdder维持着一个更健康的IPC（周期内的指令）指标. 从4线程到8线程之间的下降可能是因为CPU有4个核,每个核中有2个硬件线程, 而硬件线程在这个情况下没有实际上的帮助。

## 空闲时间

处理器上的执行流水线主要分为2个部分：负责获取和解码操作的前端，和负责执行指令的后端。获取的操作没有什么值得讨论的，所以我们跳过前端。

后端揭示了更多幕后的情况，AtomicLong的实现在后端留下了比LongAdder几乎一倍的周期闲置。AtomicLong的IPC较低和它的高闲置时间是直接相关的：CPU内核花费了大量时间来决定它们中间的谁去控制包含AtomicLong的缓存线。

> [java-8-performance-improvements-longadder-vs-atomiclong/](http://blog.palominolabs.com/2014/02/10/java-8-performance-improvements-longadder-vs-atomiclong/)

# 总结

核心思想：用空间换时间，采用类似于 ConcurrentHashMap 的分段思想。

适合场景：高并发，如果并发不高，没有必要使用此类。适用于统计计数的场景。

# 拓展阅读

# 参考资料

[jdk8](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/atomic/LongAdder.html)

[LongAdder类学习小结](https://yq.aliyun.com/articles/68190)

[Java8 性能提升：LongAdder vs AtomicLong](http://www.importnew.com/9560.html)

[浅析LongAdder](https://www.jianshu.com/p/22d38d5c8c2a)

[java多线程--AtomicLong和LongAdder](http://blog.csdn.net/wangxiaotongfan/article/details/51745506?locationNum=1&fps=1)

* any list
{:toc}