---
layout: post
title:  JCIP-07-CopyOnWriteArrayList 详解 
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [java, concurrency, lock, sh]
published: true
excerpt: JCIP-07-CopyOnWriteArrayList 详解 
---

# 问题

- 是什么？

- 有什么优缺点？

- 为什么性能高？原理是什么？

- 源码阅读

- 设计的启发

# CopyOnWriteArrayList

## 官方定义

[CopyOnWriteArrayList](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CopyOnWriteArrayList.html)是ArrayList的线程安全变体，其中通过创建底层数组的新副本来实现所有可变操作（添加，设置等）。

这通常成本太高，但是当遍历操作大大超过突变时，它可能比替代方法更有效，并且当您不能或不想同步遍历但需要排除并发线程之间的干扰时非常有用。

“快照”样式迭代器方法在创建迭代器时使用对数组状态的引用。

这个数组在迭代器的生命周期中永远不会改变，所以干扰是不可能的，并且保证迭代器不会抛出ConcurrentModificationException。自迭代器创建以来，迭代器不会反映列表的添加，删除或更改。不支持对迭代器本身进行元素更改操作（删除，设置和添加）。这些方法抛出UnsupportedOperationException。

允许所有元素，包括null。

内存一致性效果：与其他并发集合一样，在将对象放入CopyOnWriteArrayList之前，线程中的操作发生在从另一个线程中的CopyOnWriteArrayList访问或删除该元素之后的操作之前。


# 使用例子

网上这种代码大同小异。

## ArrayList 版本

下面来看一个列子：两个线程一个线程循环读取，一个线程修改list的值。

```java
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CopyOnWriteArrayListDemo {
	/**
	 * 读线程
	 * @author wangjie
	 *
	 */
	private static class ReadTask implements Runnable {
		List<String> list;

		public ReadTask(List<String> list) {
			this.list = list;
		}

		public void run() {
			for (String str : list) {
				System.out.println(str);
			}
		}
	}
	/**
	 * 写线程
	 * @author wangjie
	 *
	 */
	private static class WriteTask implements Runnable {
		List<String> list;
		int index;

		public WriteTask(List<String> list, int index) {
			this.list = list;
			this.index = index;
		}

		public void run() {
			list.remove(index);
			list.add(index, "write_" + index);
		}
	}

	public void run() {
		final int NUM = 10;
		List<String> list = new ArrayList<String>();
		for (int i = 0; i < NUM; i++) {
			list.add("main_" + i);
		}
		ExecutorService executorService = Executors.newFixedThreadPool(NUM);
		for (int i = 0; i < NUM; i++) {
			executorService.execute(new ReadTask(list));
			executorService.execute(new WriteTask(list, i));
		}
		executorService.shutdown();
	}

	public static void main(String[] args) {
		new CopyOnWriteArrayListDemo().run();
	}
}
```

这个运行结果会报错。

因为我们在读取的时候，对列表进行了修改。

## CopyOnWriteArrayList 版本

直接列表创建替换即可：

```java
List<String> list = new CopyOnWriteArrayList<String>();
```

则运行结果正常。

# CopyOnWriteArrayList 的一些问题

## 优点

1. 保证多线程的并发读写的线程安全

## 缺点

### 内存消耗

有数组拷贝自然有内存问题。如果实际应用数据比较多，而且比较大的情况下，占用内存会比较大，这个可以用ConcurrentHashMap来代替。

- 如何避免

内存占用问题。因为CopyOnWrite的写时复制机制，所以在进行写操作的时候，内存里会同时驻扎两个对象的内存，旧的对象和新写入的对象（注意:在复制的时候只是复制容器里的引用，只是在写的时候会创建新对象添加到新容器里，而旧容器的对象还在使用，所以有两份对象内存）。如果这些对象占用的内存比较大，比如说200M左右，那么再写入100M数据进去，内存就会占用300M，那么这个时候很有可能造成频繁的Yong GC和Full GC。之前我们系统中使用了一个服务由于每晚使用CopyOnWrite机制更新大对象，造成了每晚15秒的Full GC，应用响应时间也随之变长。

针对内存占用问题，可以通过压缩容器中的元素的方法来减少大对象的内存消耗，比如，如果元素全是10进制的数字，可以考虑把它压缩成36进制或64进制。或者不使用CopyOnWrite容器，而使用其他的并发容器，如ConcurrentHashMap。

### 数据一致性

CopyOnWrite容器只能保证数据的最终一致性，不能保证数据的实时一致性。所以如果你希望写入的的数据，马上能读到，请不要使用CopyOnWrite容器

# 使用场景

CopyOnWrite并发容器用于读多写少的并发场景。

比如白名单，黑名单，商品类目的访问和更新场景，假如我们有一个搜索网站，用户在这个网站的搜索框中，输入关键字搜索内容，但是某些关键字不允许被搜索。这些不能被搜索的关键字会被放在一个黑名单当中，黑名单每天晚上更新一次。当用户搜索时，会检查当前关键字在不在黑名单当中，如果在，则提示不能搜索。

实现代码如下：

```java
/**
 * 黑名单服务
 *
 * @author fangtengfei
 *
 */
public class BlackListServiceImpl {
    private static CopyOnWriteMap<String, Boolean> blackListMap = new CopyOnWriteMap<String, Boolean>(
            1000);
    public static boolean isBlackList(String id) {
        return blackListMap.get(id) == null ? false : true;
    }
    public static void addBlackList(String id) {
        blackListMap.put(id, Boolean.TRUE);
    }
    /**
     * 批量添加黑名单
     *
     * @param ids
     */
    public static void addBlackList(Map<String,Boolean> ids) {
        blackListMap.putAll(ids);
    }
}
```

代码很简单，但是使用CopyOnWriteMap需要注意两件事情：

1. 减少扩容开销。根据实际需要，初始化CopyOnWriteMap的大小，避免写时CopyOnWriteMap扩容的开销。

2. 使用批量添加。因为每次添加，容器每次都会进行复制，所以减少添加次数，可以减少容器的复制次数。如使用上面代码里的addBlackList方法。

# 为什么没有并发列表？

问：JDK 5在java.util.concurrent里引入了ConcurrentHashMap，在需要支持高并发的场景，我们可以使用它代替HashMap。但是为什么没有ArrayList的并发实现呢？难道在多线程场景下我们只有Vector这一种线程安全的数组实现可以选择么？为什么在java.util.concurrent 没有一个类可以代替Vector呢？

- 别人的理解

ConcurrentHashMap的出现更多的在于保证并发，从它采用了锁分段技术和弱一致性的Map迭代器去避免并发瓶颈可知。(jdk7 及其以前)

而ArrayList中很多操作很难避免锁整表，就如contains()、随机取get()等，进行查询搜索时都是要整张表操作的，那多线程时数据的实时一致性就只能通过锁来保证，这就限制了并发。

- 个人的理解

这里说的并不确切。

如果没有数组的长度变化，那么可以通过下标进行分段，不同的范围进行锁。但是这种有个问题，如果数组出现删除，增加就会不行。

说到底，还是性能和安全的平衡。

- 比较中肯的回答

在java.util.concurrent包中没有加入并发的ArrayList实现的主要原因是：很难去开发一个通用并且没有并发瓶颈的线程安全的List。

像ConcurrentHashMap这样的类的真正价值（The real point / value of classes）并不是它们保证了线程安全。而在于它们在保证线程安全的同时不存在并发瓶颈。举个例子，ConcurrentHashMap采用了锁分段技术和弱一致性的Map迭代器去规避并发瓶颈。

所以问题在于，像“Array List”这样的数据结构，你不知道如何去规避并发的瓶颈。拿contains() 这样一个操作来说，当你进行搜索的时候如何避免锁住整个list？

另一方面，Queue 和Deque (基于Linked List)有并发的实现是因为他们的接口相比List的接口有更多的限制，这些限制使得实现并发成为可能。

CopyOnWriteArrayList是一个有趣的例子，它规避了只读操作（如get/contains）并发的瓶颈，但是它为了做到这点，在修改操作中做了很多工作和修改可见性规则。 此外，修改操作还会锁住整个List，因此这也是一个并发瓶颈。所以从理论上来说，CopyOnWriteArrayList并不算是一个通用的并发List。

# CopyOnWriteArrayList 源码

## 读取

读的时候不需要加锁，如果读的时候有多个线程正在向ArrayList添加数据，读还是会读到旧的数据，因为写的时候不会锁住旧的ArrayList。

```java
@SuppressWarnings("unchecked")
private E get(Object[] a, int index) {
    return (E) a[index];
}

/**
 * {@inheritDoc}
 *
 * @throws IndexOutOfBoundsException {@inheritDoc}
 */
public E get(int index) {
    return get(getArray(), index);
}
```

## 添加

添加和设置非常类似。

都使用了 ReentrantLock 保证操作的线程安全性，然后复制整个数组。

复制的意义是让读的时候没有锁，提升读取的性能。

```java
public boolean add(E e) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        Object[] elements = getArray();
        int len = elements.length;
        Object[] newElements = Arrays.copyOf(elements, len + 1);
        newElements[len] = e;
        setArray(newElements);
        return true;
    } finally {
        lock.unlock();
    }
}
```

## 设置

利用了数组的拷贝。

```java
public E set(int index, E element) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        Object[] elements = getArray();
        E oldValue = get(elements, index);
        if (oldValue != element) {
            int len = elements.length;
            Object[] newElements = Arrays.copyOf(elements, len);
            newElements[index] = element;
            setArray(newElements);
        } else {
            // Not quite a no-op; ensures volatile write semantics
            setArray(elements);
        }
        return oldValue;
    } finally {
        lock.unlock();
    }
}
```


# 个人启发

## 思想的通用性

这种读写分离的思想是通用的。

比如：CopyOnWriteSet

## 实践出真知

这个工具包都出来几十年了，还是用的人很少。

要学以致用，站在巨人的肩膀上，

# 自己实现一个 copyOnWriteMap

```java
public class CopyOnWriteMap<K, V> implements Map<K, V>, Cloneable {
private volatile Map<K, V> internalMap;
    /** The lock protecting all mutators */
    transient final ReentrantLock lock = new ReentrantLock();
     
    public CopyOnWriteMap() {
        internalMap = new HashMap<K, V>();
    }
    @Override
    public int size() {
        return internalMap.size();
    }
    @Override
    public boolean isEmpty() {
        return internalMap.isEmpty();
    }
    @Override
    public boolean containsKey(Object key) {
        return internalMap.containsKey(key);
    }
    @Override
    public boolean containsValue(Object value) {
        return internalMap.containsValue(value);
    }
    @Override
    public V get(Object key) {
        return internalMap.get(key);
    }
    @Override
    public V put(K key, V value) {
       final ReentrantLock lock = this.lock;
       lock.lock();
       try {
       Map<K, V> newMap=new HashMap<K, V>(internalMap);
       V val = newMap.put(key, value);
       internalMap=null;
       internalMap = newMap;
       return val;
    } catch (Exception e) {
    }finally {
                lock.unlock();
            }
        return null;
    }
    @Override
    public V remove(Object key) {
        final ReentrantLock lock = this.lock;
        lock.lock();
    try {
        Map<K, V> newMap = new HashMap<K, V>(internalMap);
        V val = newMap.remove(key);
        internalMap = null;
        internalMap = newMap;
        return val;
    } finally {
        lock.unlock();
    }
    }
    @Override
    public void putAll(Map<? extends K, ? extends V> m) {
        final ReentrantLock lock = this.lock;
        lock.lock();
    try {
        Map<K, V> newMap = new HashMap<K, V>(internalMap);
        newMap.putAll(m);
        internalMap = null;
            internalMap = newMap;
    } finally {
    lock.unlock();
    }
    }
    @Override
    public void clear() {
        internalMap.clear();
    }
    @Override
    public Set<K> keySet() {
        return internalMap.keySet();
    }
    @Override
    public Collection<V> values() {
        return internalMap.values();
    }
    @Override
    public Set<java.util.Map.Entry<K, V>> entrySet() {
        return internalMap.entrySet();
    }
    public static void main(String[] args) {
        CopyOnWriteMap<String, String> copyOnWriteMap=new CopyOnWriteMap<String, String>();
        copyOnWriteMap.put("test1", "Java中的Copy-On-Write容器");
        System.out.println(copyOnWriteMap.size());
        System.out.println(copyOnWriteMap.get("test1"));
    }
}
```


# 参考资料

《java 并发编程的艺术》

https://my.oschina.net/jielucky/blog/167198

https://blog.csdn.net/maoyuanming0806/article/details/79143692

https://yq.aliyun.com/articles/25507

http://www.dczou.com/viemall/227.html

* any list
{:toc}