---
layout: post
title:  锁专题（9） PriorityBlockingQueue 优先级阻塞队列源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, queue, data-struct, sf]
published: flase
---

# PriorityBlockingQueue 

![PriorityBlockingQueue](https://p1.pstatp.com/origin/pgc-image/0fca8edfb8954b8ab292cf7d44d7d2b3)

## 简介

一个无界BlockingQueue，它使用与类PriorityQueue相同的排序规则，并提供阻塞检索操作。

尽管此队列在逻辑上是不受限制的，但是尝试添加可能由于资源耗尽 OutOfMemoryError而失败。

限制如下：

（1）此类不允许使用null元素。

（2）依赖于Comparable的优先级队列也不允许插入不可比较的对象。

## 使用入门

### 定义可比较对象

```java
private static class User implements Comparable<User> {
    private final int order;
    private final String name;
    private User(int order, String name) {
        this.order = order;
        this.name = name;
    }
    @Override
    public int compareTo(User o) {
        return this.order - o.order;
    }
    @Override
    public String toString() {
        return "User{" +
                "order=" + order +
                ", name='" + name + '\'' +
                '}';
    }
}
```

### 写入和获取方法

我们声明使用 PriorityBlockingQueue，然后实现对应的设置和获取方法。

```java
private PriorityBlockingQueue<User> queue = new PriorityBlockingQueue<>();

public void put(final User user) throws InterruptedException {
    System.out.println("设置开始");
    queue.put(user);
    System.out.println("设置完成: " + user);
}

public void take() throws InterruptedException {
    TimeUnit.SECONDS.sleep(1);
    System.out.println("获取开始");
    User take = queue.take();
    System.out.println("获取成功: " + take);
}
```

### 测试代码

定义 1 个写入线程和 1 个读取线程。

这里为了更好的演示优先级，使用随机数生成优先级。

```java
public static void main(String[] args) {
    final PriorityBlockingQueueDemo queueTest = new PriorityBlockingQueueDemo();
    // 写入线程
    new Thread(new Runnable() {
        @Override
        public void run() {
            try {
                for(int i = 0; i < 5; i++) {
                    int order = ThreadLocalRandom.current().nextInt(10);
                    User user = new User(order, i+"-user");
                    queueTest.put(user);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }).start();
    // 读取线程
    new Thread(new Runnable() {
        @Override
        public void run() {
            try {
                while (true) {
                    queueTest.take();
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }).start();
}
```

日志如下：

```
设置开始
设置完成: User{order=4, name='0-user'}
设置开始
设置完成: User{order=6, name='1-user'}
设置开始
设置完成: User{order=7, name='2-user'}
设置开始
设置完成: User{order=6, name='3-user'}
设置开始
设置完成: User{order=9, name='4-user'}

获取开始
获取成功: User{order=4, name='0-user'}
获取开始
获取成功: User{order=6, name='1-user'}
获取开始
获取成功: User{order=6, name='3-user'}
获取开始
获取成功: User{order=7, name='2-user'}
获取开始
获取成功: User{order=9, name='4-user'}
获取开始
```

可以看到一开始我们随机设置对应的元素信息。

然后后面会根据优先级获取到对应的元素。

# 源码实现

## 类定义

```java
public class PriorityBlockingQueue<E> extends AbstractQueue<E>
    implements BlockingQueue<E>, java.io.Serializable {
    private static final long serialVersionUID = 5595510919245408276L;
}
```

实现了阻塞队列接口，继承自 AbstractQueue。

## 算法笔记

该实现使用基于数组的二叉堆（binary heap），公共操作受单个锁保护。

但是，调整大小期间的分配使用简单的自旋锁（仅在不持有主锁的情况下使用），以允许获取与分配同时进行。

这避免了等待的消费者的重复推迟和后续元素的建立。

在分配过程中需要回退锁的需求使得不可能像在此类的早期版本中那样简单地将委托的java.util.PriorityQueue操作包装在锁中。

为了保持互操作性，在序列化过程中仍然使用普通的PriorityQueue，它维护兼容性，但代价是瞬时增加一倍的开销。

> [二叉堆介绍](https://houbb.github.io/2019/01/18/jcip-11-binary-heap)

## 基本属性

```java
/**
 * 默认容量
 */
private static final int DEFAULT_INITIAL_CAPACITY = 11;

/**
 * 最大数组的大小
 */
private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

/**
 * 存储队列元素
 */
private transient Object[] queue;
/**
 * 优先级队列中的元素个数
 */
private transient int size;
/**
 *  比较器
 */
private transient Comparator<? super E> comparator;

/**
 * 最基本的优先级队列
 */
private PriorityQueue<E> q;
```

## 并发控制

```java
/**
 * 可重入锁
 */
private final ReentrantLock lock;
/**
 * notEmpty 的条件
 */
private final Condition notEmpty;
/**
 * Spinlock for allocation, acquired via CAS.
 * 自旋锁
 */
private transient volatile int allocationSpinLock;
```

## 构造器

```java
public PriorityBlockingQueue(int initialCapacity) {
    this(initialCapacity, null);
}

public PriorityBlockingQueue(int initialCapacity,
                             Comparator<? super E> comparator) {
    if (initialCapacity < 1)
        throw new IllegalArgumentException();
    this.lock = new ReentrantLock();
    this.notEmpty = lock.newCondition();
    this.comparator = comparator;
    this.queue = new Object[initialCapacity];
}
```

最基本的 2 个构造器，主要是对内部变量的初始化。

当然，还可以根据集合进行队列的初始化：

```java
public PriorityBlockingQueue(Collection<? extends E> c) {
    this.lock = new ReentrantLock();
    this.notEmpty = lock.newCondition();

    boolean heapify = true; // true if not known to be in heap order
    boolean screen = true;  // true if must screen for nulls
    
    // 如果为 SortedSet，则说明不需要 heapify
    if (c instanceof SortedSet<?>) {
        SortedSet<? extends E> ss = (SortedSet<? extends E>) c;
        this.comparator = (Comparator<? super E>) ss.comparator();
        heapify = false;
    }
    // 如果就是优先级阻塞队列，则进行转换的处理就行
    else if (c instanceof PriorityBlockingQueue<?>) {
        PriorityBlockingQueue<? extends E> pq =
            (PriorityBlockingQueue<? extends E>) c;
        this.comparator = (Comparator<? super E>) pq.comparator();
        screen = false;
        if (pq.getClass() == PriorityBlockingQueue.class) // exact match
            heapify = false;
    }

    // 数组及其长度
    Object[] a = c.toArray();
    int n = a.length;

    // 实现数组的转换处理
    // If c.toArray incorrectly doesn't return Object[], copy it.
    if (a.getClass() != Object[].class)
        a = Arrays.copyOf(a, n, Object[].class);
    if (screen && (n == 1 || this.comparator != null)) {

        // 这里添加了元素不能为 null 的校验
        for (int i = 0; i < n; ++i)
            if (a[i] == null)
                throw new NullPointerException();
    }
    this.queue = a;
    this.size = n;

    // 执行 heapify 处理
    if (heapify)
        heapify();
}
```

## heapify 实现

```java
/**
 * Establishes the heap invariant (described above) in the entire tree,
 * assuming nothing about the order of the elements prior to the call.
 */
private void heapify() {
    Object[] array = queue;
    int n = size;

    // 这里使用位移运算，找到一半的位置。
    int half = (n >>> 1) - 1;

    // 通过是否有比较器，选择不同的实现方法。
    Comparator<? super E> cmp = comparator;
    if (cmp == null) {
        for (int i = half; i >= 0; i--)
            siftDownComparable(i, (E) array[i], array, n);
    }
    else {
        for (int i = half; i >= 0; i--)
            siftDownUsingComparator(i, (E) array[i], array, n, cmp);
    }
}
```

### siftDownComparable

```java
/**
 * Inserts item x at position k, maintaining heap invariant by
 * demoting x down the tree repeatedly until it is less than or
 * equal to its children or is a leaf.
 *
 * 在 k 位置插入元素 x。然后调整x的位置，直到它小于等于子节点。
 * 
 * @param k the position to fill
 * @param x the item to insert
 * @param array the heap array
 * @param n heap size
 */
private static <T> void siftDownComparable(int k, T x, 
                                           Object[] array,
                                           int n) {
    if (n > 0) {
        Comparable<? super T> key = (Comparable<? super T>)x;

        // 获取数组的中间位置
        int half = n >>> 1;           // loop while a non-leaf

        // 如果不是叶子节点，就一直执行循环。
        // k其实是half的父节点下标，若k >= half，则表明k在数组中已经没有子节点
        while (k < half) {
            // k 的左子节点下标
            int child = (k << 1) + 1; // assume left child is least
            Object c = array[child];
            // k 右左子节点下标
            int right = child + 1;

            // 如果 right < n, 且 c 大于 right 位置的元素
            // 更新 c 为 array[right]
            // 目的：找到左右节点的最小值
            if (right < n &&
                ((Comparable<? super T>) c).compareTo((T) array[right]) > 0)
                c = array[child = right];

             // key <= c 说明已经按照升序排序，跳出循环    
            if (key.compareTo((T) c) <= 0)
                break;

            // 否则，将子节点的值放在父节点上    
            array[k] = c;

            // 将child当作下次比较的k
            k = child;
        }

        // 将值key放置合适的位置上
        array[k] = key;
    }
}
```

### siftDownUsingComparator

使用比较器构造二叉堆。

```java
private static <T> void siftDownUsingComparator(int k, T x, Object[] array,
                                                int n,
                                                Comparator<? super T> cmp) {
    if (n > 0) {
        int half = n >>> 1;
        while (k < half) {
            int child = (k << 1) + 1;
            Object c = array[child];
            int right = child + 1;
            if (right < n && cmp.compare((T) c, (T) array[right]) > 0)
                c = array[child = right];
            if (cmp.compare(x, (T) c) <= 0)
                break;
            array[k] = c;
            k = child;
        }
        array[k] = x;
    }
}
```

其实和上面的流程是一样的，只不过一个使用默认的 Comaprator 强转，一个通过用户指定的比较器进行比较。

## 放入元素

```java
public void put(E e) {
    offer(e); // never need to block
}

public boolean add(E e) {
    return offer(e);
}
```

这两个方法实际上调用的都是 offer：

```java
/**
 * Inserts the specified element into this priority queue.
 * As the queue is unbounded, this method will never return {@code false}.
 *
 * 插入元素到优先级队列。
 * 因为队列是无界的，所以返回的结果一定是 true。
 *
 * @author 老马啸西风
 */
public boolean offer(E e) {
    // 禁止元素为 null
    if (e == null)
        throw new NullPointerException();

    // 并发锁获取
    final ReentrantLock lock = this.lock;
    lock.lock();
    int n, cap;
    Object[] array;

    // 这个判断写的可真秀
    // 实际上主要做了两件事：
    //1. 给变量 n 和 cap 进行初始化赋值
    //2. size 是否已经 >= queue 的长度，如果是，尝试扩容。
    while ((n = size) >= (cap = (array = queue).length))
        tryGrow(array, cap);
    try {
        // 根据是否有比较器选择不同的 shitUp 方法
        Comparator<? super E> cmp = comparator;
        if (cmp == null)
            siftUpComparable(n, e, array);
        else
            siftUpUsingComparator(n, e, array, cmp);

        //size 增加1    
        size = n + 1;
        // notEmpty 等待线程唤醒
        notEmpty.signal();
    } finally {
        // 释放锁
        lock.unlock();
    }

    // 最后永远返回 true
    return true;
}
```


### 尝试扩容

阅读过 ArrayList 源码的伙伴应该对扩容并不陌生。

```java
/**
 * Tries to grow array to accommodate at least one more element
 * (but normally expand by about 50%), giving up (allowing retry)
 * on contention (which we expect to be rare). Call only while
 * holding lock.
 *
 * 
 * 尝试增加数组以容纳至少一个新元素（但通常会扩大约50％），放弃（允许重试）争用（我们希望这种情况很少见）。
 * 仅在保持锁定状态下调用。
 * 
 * 一般可以扩容都是翻倍，我们来看下什么情况只加了1个？
 * 
 * @author 老马啸西风
 */
private void tryGrow(Object[] array, int oldCap) {
    // 首先释放锁，然后重新获取锁？
    // 为什么要这么做呢？
    // 个人理解是持有锁的线程首先释放持有的锁，这样不会阻塞其他线程的插入等变更操作。
    // 扩容是通过 CAS+allocationSpinLockOffset 来控制并发的，这样可以做到扩容不影响操作，提升性能。
    lock.unlock(); // must release and then re-acquire main lock
    Object[] newArray = null;

    // 如果当前没有其他线程持有扩容自旋锁 && CAS 设置 allocationSpinLockOffset 成功
    if (allocationSpinLock == 0 &&
        UNSAFE.compareAndSwapInt(this, allocationSpinLockOffset,
                                 0, 1)) {
        try {
            // 计算新扩容的容量大小
            // 如果原来容量 < 64，这里扩容只增加了 2 个.
            // 老马觉得这个地方实际有待商榷，我们正常使用可能也就是几百以内。
            // 这种扩容，优点是避免内存的浪费，缺点是可能导致前期频繁扩容。
            int newCap = oldCap + ((oldCap < 64) ?
                                   (oldCap + 2) : // grow faster if small
                                   (oldCap >> 1));

            // 如果越界了，怎么办呢？                       
            if (newCap - MAX_ARRAY_SIZE > 0) {    // possible overflow
                // 老惨了，一次+1。
                // 还越界，只能 OOM 伺候了。
                int minCap = oldCap + 1;
                if (minCap < 0 || minCap > MAX_ARRAY_SIZE)
                    throw new OutOfMemoryError();

                // 如果没越界，则设置为最大值（Interger 的最大值）    
                newCap = MAX_ARRAY_SIZE;
            }

            // 如果扩容的容量大于原始容量 && queue == array
            // queue == array 是为了避免已经被操作过吗？
            if (newCap > oldCap && queue == array)
                newArray = new Object[newCap];
        } finally {
            // 最后记得释放扩容自旋锁
            allocationSpinLock = 0;
        }
    }

    // 如果当前线程扩容失败，则让渡给其他线程进行扩容
    if (newArray == null) // back off if another thread is allocating
        Thread.yield();

    // 最后一步执行加锁
    // 这里就是扩容成功，然后将 array 中的元素拷贝到 newArray。    
    lock.lock();
    if (newArray != null && queue == array) {
        queue = newArray;
        System.arraycopy(array, 0, newArray, 0, oldCap);
    }
}
```

这个扩容写的非常巧妙，我愿称之为最强！

开辟 newArray 的时候，实际上并没有进行原始队列的修改，所以没必要加锁。只需要保证扩容之间的并发问题就行了。

当最后数组开辟成功，再执行加锁，保证只有一个线程执行扩容，并且阻塞修改操作。

这一波很细，锁的粒度越细，一般性能是越高的。

### 并发 UNSAFE

这里的并发控制，不但使用到了可重入锁，还用到了 UNSAFE 进行 CAS 比较。

```java
// Unsafe mechanics
private static final sun.misc.Unsafe UNSAFE;
private static final long allocationSpinLockOffset;
static {
    try {
        UNSAFE = sun.misc.Unsafe.getUnsafe();
        Class<?> k = PriorityBlockingQueue.class;
        allocationSpinLockOffset = UNSAFE.objectFieldOffset
            (k.getDeclaredField("allocationSpinLock"));
    } catch (Exception e) {
        throw new Error(e);
    }
}
```

# 移除元素

## remove(E)

```java
/**
 * 移除一个元素
 * @author 老马啸西风
 */
public boolean remove(Object o) {
    // 首先获取可重入锁进行加锁
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 遍历元素的下标
        int i = indexOf(o);

        // 元素不存在，直接返回 false
        if (i == -1)
            return false;

        // 移除指定下标的元素    
        removeAt(i);
        return true;
    } finally {
        // 释放锁
        lock.unlock();
    }
}
```

indexOf 因为是数组，比较简单，此处不再展开。

我们一起看一下 removeAt 方法

```java
/**
 * Removes the ith element from queue.
 *
 * 移除队列中指定位置的元素
 * 
 * @author 老马啸西风
 */
private void removeAt(int i) {
    // 保存 queue 到 array 中
    Object[] array = queue;
    int n = size - 1;

    // 如果是最后一个元素，直接设置 为 null 即可。
    if (n == i) // removed last element
        array[i] = null;
    else {
        E moved = (E) array[n];
        array[n] = null;
        Comparator<? super E> cmp = comparator;

        // 根据比较器，选择不同的 siftDown 实现
        if (cmp == null)
            siftDownComparable(i, moved, array, n);
        else
            siftDownUsingComparator(i, moved, array, n, cmp);

        //     
        if (array[i] == moved) {
            if (cmp == null)
                siftUpComparable(i, moved, array);
            else
                siftUpUsingComparator(i, moved, array, cmp);
        }
    }

    // 更新 size
    size = n;
}
```

### siftUpComparable

为了简化并加快强制和比较，Comparable 版本和 Comparator 版本分为不同的方法，这些方法在其他方面是相同的。 （类似于siftDown。）

ps: 用实现的冗余，带来判断的简化，进而是性能的提升。

这些方法是静态的，以堆状态作为参数，以根据可能的比较器异常简化使用。

```java
/**
 * 将x放到位置k，然后调整x的位置，直到它大于等于父节点。或者是 root节点。
 *
 * @param k the position to fill
 * @param x the item to insert
 * @param array the heap array
 * 
 * @author 老马啸西风
 */
private static <T> void siftUpComparable(int k, T x, Object[] array) {
    Comparable<? super T> key = (Comparable<? super T>) x;

    // k是否达到二叉树的顶点
    while (k > 0) {
        // 获取父节点的下表
        int parent = (k - 1) >>> 1;
        // 获取父元素
        Object e = array[parent];

        // 如果 key 大于等于父元素，循环结束
        if (key.compareTo((T) e) >= 0)
            break;

        // 将parent节点的值放在子节点上    
        array[k] = e;
        // 将parent当作下次比较的k
        k = parent;
    }

    // 设置对应的值
    array[k] = key;
}
```

siftUpUsingComparator与siftUpComparable的唯一不同点在于，siftUpUsingComparator使用自定义的比较器来比较元素，其余操作相同。

## take

另一个 take 实现，在没有获取到元素之前，会一直进入等待模式。

```java
public E take() throws InterruptedException {
    // 获取可重入锁执行加锁
    // 这个加锁时可中断的
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    E result;
    try {
        // 如果出队结果为空，则执行 notEmpty 进入等待。
        while ( (result = dequeue()) == null)
            notEmpty.await();
    } finally {
        // 最后记得释放锁
        lock.unlock();
    }
    return result;
}
```

### dequeue 出队列

```java
/**
 * Mechanics for poll().  Call only while holding lock.
 */
private E dequeue() {
    // 获取 -1 后的元素数量
    int n = size - 1;
    // 其实这里也可以看出来为什么禁止元素为  null，这会导致阻塞等待的混淆，无法区分是没有数据，还是真的元素就是 null
    // 当前个人理解可以通过增加一个变量来实现，但是这回增加复杂度，有些得不偿失。
    if (n < 0)
        return null;
    else {
        Object[] array = queue;
        E result = (E) array[0];
        E x = (E) array[n];
        array[n] = null;
        Comparator<? super E> cmp = comparator;

        // 根据是否有比较器，选择不同的 siftDown 方法。
        if (cmp == null)
            siftDownComparable(0, x, array, n);
        else
            siftDownUsingComparator(0, x, array, n, cmp);

        // 更新 size    
        size = n;
        return result;
    }
}
```

# 小结

二叉堆是非常有用的数据结构，也是面试中比较常见的问题，可谓是排序必备。

阅读完整个源码，感觉就是 jdk 的设计确实有很多过人之处，特别是扩容的设计，令我叹服。

**优秀的人设计实现源码，而我阅读源码还嫌麻烦吃力。要学的东西还很多！**

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

jdk 源码

[DelayQueue 的使用](https://blog.csdn.net/hsqingwei/article/details/88850835)

[Java延时队列DelayQueue的使用](https://my.oschina.net/lujianing/blog/705894)

[Java并发编程之PriorityBlockingQueue阻塞队列详解](https://blog.csdn.net/qq_38293564/article/details/80586040)

* any list
{:toc}