---
layout: post
title:  锁专题（9） LinkedBlockingQueue 使用入门及源码解析
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, source-code, sf]
published: true
---

# LinkedBlockingQueue

## 简介

基于链接节点的可选绑定的双端队列。

可选的容量绑定构造函数参数是一种防止过度扩展的方法。

容量（如果未指定）等于 Integer＃MAX_VALUE。 

除非每次插入都会使双端队列超出容量，否则将在每次插入时动态创建链接节点。

## 核心方法

在使用之前，让我们一起看一个简单的例子。

### 添加元素

| 方法 | 说明 | 是否阻塞 |
|:---|:---|:----|
| offer(E) | 尝试设置，成功返回 true; 失败返回 false | 否 |
| offer(E, timeout, TimeUnit) | 指定时间内尝试设置，未成功返回失败 | 是 |
| put(E) | 阻塞线程，直到设置成功。 | 是 |

### 移除元素

| 方法 | 说明 | 是否阻塞 |
|:---|:---|:----|
| poll(time) | 指定时间内获取队头的元素，失败返回 null | 是 |
| poll(timeout, TimeUnit) | 指定时间内获取队头的元素，失败返回 null | 是 |
| take() | 阻塞线程，直到获取成功。 | 是 |
| drainTo() | 一次性从 BlockingQueue 获取所有可用的数据对象，可以提升获取效率。 | 是 |

## 例子



# LinkedBlockingQueue 源码

## jdk 版本

```
java version "1.8.0_191"
Java(TM) SE Runtime Environment (build 1.8.0_191-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.191-b12, mixed mode)
```

## 算法简介

“两个锁队列”算法的一种变体。 putLock设置了看跌期权（和卖出价）的入口，并具有等待看跌期权的相关条件。

对于takeLock同样。 

他们俩都依赖的“ count”字段作为原子进行维护，以避免在大多数情况下都需要获得两个锁。

同样，为了最大程度地减少获取putLock的需求，反之亦然，使用了级联通知。

当认沽权通知其至少启用了一个卖空时，它将向买受人发出信号。

如果自信号发出后输入了更多项目，则该接收者又会发信号通知其他人。

并对称地用于信令放置。 

诸如remove（Object）和迭代器之类的操作均获得这两个锁。


提供作者和读者之间的可见性，如下所示：

每当将元素放入队列时，都会获取putLock并更新计数。

后续的读取器通过获取putLock（通过fullyLock）或通过获取takeLock，然后读取 `n = count.get();` 来保证对排队的节点的可见性。 

这样就可以看到前n个项目。


为了实现弱一致性的迭代器，看来我们需要使所有节点都可以从先前的出队节点GC到达。

这将导致两个问题：

- 允许恶意的Iterator导致无限的内存保留

- 如果某个节点在使用期间处于使用期，则导致旧节点到新节点的跨代链接，这导致了一代代GC难以处理，从而导致重复的主要集合。

但是，只有未删除的节点可以从出队节点到达，并且可达性不必一定是GC理解的那种。

我们使用链接刚刚退出队列的Node的技巧。

这样的自链接意味着前进到head.next。

## 内部变量

### 基本节点

```java
/**
 * Linked list node class
 * 单向的链表节点。
 */
static class Node<E> {
    E item;
    /**
     * One of:
     * - the real successor Node
     * - this Node, meaning the successor is head.next
     * - null, meaning there is no successor (this is the last node)
     */
    Node<E> next;
    Node(E x) { item = x; }
}

/** The capacity bound, or Integer.MAX_VALUE if none 
** 队列的容量大小
*/
private final int capacity;

/** Current number of elements 
** aotmic 变量，用于统计元素个数
*/
private final AtomicInteger count = new AtomicInteger();

/**
 * Head of linked list.
 * Invariant: head.item == null
 * 头节点
 */
transient Node<E> head;

/**
 * Tail of linked list.
 * Invariant: last.next == null
 * 尾巴节点
 */
private transient Node<E> last;
```

### 并发控制

```java
/** Lock held by take, poll, etc */
private final ReentrantLock takeLock = new ReentrantLock();
/** Wait queue for waiting takes */
private final Condition notEmpty = takeLock.newCondition();
/** Lock held by put, offer, etc */
private final ReentrantLock putLock = new ReentrantLock();
/** Wait queue for waiting puts */
private final Condition notFull = putLock.newCondition();
```

## 类定义

实现了 BlockingQueue 接口，继承自 AbstractQueue 抽象类。

```java
public class LinkedBlockingQueue<E> extends AbstractQueue<E>
        implements BlockingQueue<E>, java.io.Serializable {
    private static final long serialVersionUID = -6903933977591709194L;
}
```












# 参考资料

jdk 源码

[BlockingQueue应用场景](https://blog.csdn.net/luzhensmart/article/details/81712583)

* any list
{:toc}