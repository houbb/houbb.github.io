---
layout: post
title:  JCIP-12-环形队列
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, data-struct, sh]
published: true
excerpt: JCIP-12-环形队列
---


# Q

- 是什么？

- 优势？

- 使用场景？

- 无锁队列怎么实现？

# 1.环形队列是什么 

队列是一种常用的数据结构，这种结构保证了数据是按照“先进先出”的原则进行操作的，即最先进去的元素也是最先出来的元素.环形队列是一种特殊的队列结构，保证了元素也是先进先出的，但与一般队列的区别是，他们是环形的，即队列头部的上个元素是队列尾部，通常是容纳元素数固定的一个闭环。

# 2.环形队列的优点

1、 保证元素是先进先出的

是由队列的性质保证的，在环形队列中通过对队列的顺序访问保证。

2、元素空间可以重复利用

因为一般的环形队列都是一个元素数固定的一个闭环，可以在环形队列初始化的时候分配好确定的内存空间，当进队或出队时只需要返回指定元素内存空间的地址即可，这些内存空间可以重复利用，避免频繁内存分配和释放的开销。

3、为多线程数据通信提供了一种高效的机制。

在最典型的生产者消费者模型中，如果引入环形队列，那么生成者只需要生成“东西”然后放到环形队列中即可，而消费者只需要从环形队列里取“东西”并且消费即可，没有任何锁或者等待，巧妙的高效实现了多线程数据通信。

# 3.环形队列的工作场景

一般应用于需要高效且频繁进行多线程通信传递数据的场景，例如：linux捕包、发包等等，（linux系统中对PACKET_RX_RING和PACKET_TX_RING的支持实质就是内核实现的一种环形队列）

实际环形队列在工作时有3种情况：

## 3.1 入队速度=出队速度

这是环形队列的常态，即入队速度和出队速度大致一样，即使某个突然时刻入队速度陡然变高或者出队速度陡然变低，都能通过队列这个缓冲区把这些数据先存起来，等到能处理的时候再处理。

## 3.2 入队速度>出队速度

在这种情况下，队列“写入”的速度>“读取”的速度，想象当这种状态持续一段时间之后，队列中大多数全是写入但没读取的元素，当又一个新的元素产生时，可以把这个新元素drop掉或者放在另一个缓冲区保存起来，这种情况的出现不是个好事情，说明你需要对出队处理元素的算法或逻辑优化处理速度了。

## 3.3 入队速度<出队速度

在这种情况下，队列“读取”速度>“写入”速度，这种情况说明程序出队处理元素的速度很快，这是比较好的情况，唯一不足的是读取队列的时候可能经常会轮询队列是否有新的元素，造成cpu占用过高。

# 4. 无锁环形队列的实现

## 4.1 环形队列的存储结构

链表和线性表都是可以的，但几乎都用线性表实现，比链表快很多，原因也是显而易见的，因为访问链表需要挨个遍历。

## 4.2 读写index

有2个index很重要，一个是写入index，标示了当前可以写入元素的index，入队时使用。一个是读取index，标示了当前可以读取元素的index，出队时使用。

## 4.3 元素状态切换

有种很巧妙的方法，就是在队列中每个元素的头部加一个元素标示字段，标示这个元素是可读还是可写，而这个的关键就在于何时设置元素的可读可写状态，参照linux内核实现原理，当这个元素读取完之后，要设置可写状态，当这个元素写入完成之后，要设置可读状态。

# 环形队列实现

## 方法

```java
public boolean add(E e)：加入队列
public E next()：加入返回当前指针元素并把指针指向下一个元素
public E prev()：返回当前元素，并把指针指向上一个元素
remove(E e)：删除队列中某一个元素
```

## 代码

```java
public class CircularQueue<E> {
    private int size;

    //指针
    private Node<E> node;

    private Node<E> first;
    private Node<E> last;

    private final int MODE_NEXT = 0;
    private final int MODE_PREV = 1;
    private int lastMode = MODE_NEXT; //最后一次操作，0为next，1为prev



    public CircularQueue() {

    }

    /**
     * 加入队列
     * @param e
     */
    public boolean add(E e){
        final Node<E> l = last;
        final Node<E> newNode = new Node<>(l, e, first);
        last = newNode;

        if (node == null) node = newNode; //指针
        if (l == null) {
            first = newNode;
            first.prev = first;
        }
        else {
            l.next = newNode;
            first.prev = l.next;
        }

        size++;
        return true;
    }

    /**
     * 返回当前指针元素并把指针指向下一个元素
     * @return
     */
        public E next() {
        if (node == null) {
            return null;
        }
        E e = node.item;
        node = node.next;

        lastMode = MODE_NEXT;
        return e;
    }

    /**
     * 返回当前元素，并把指针指向上一个元素
     * @return
     */
    public E prev() {
        if (node == null) {
            return  null;
        }
        E e = node.item;
        node = node.prev;

        lastMode = MODE_PREV;
        return e;
    }

    /**
     * 删除队列中某一个元素
     * @param e
     * @return
     */
    public boolean remove(E e) {
        if (e == null) {
            for (Node<E> x = first; x != null; x = x.next) {
                if (x.item == null) {
                    unlink(x);
                    return true;
                }
            }
        } else {
            for (Node<E> x = first; x != null; x = x.next) {
                if (e.equals(x.item)) {
                    unlink(x);
                    return true;
                }
            }
        }

        size--;
        return true;
    }

    public E peek(){
        return node.item;
    }

    /**
     * 删除节点
     */
    E unlink(Node<E> x) {
        final E element = x.item;
        final Node<E> next = x.next;
        final Node<E> prev = x.prev;

        if (prev == x || next == x) {
            this.first = null;
            this.last = null;
            this.node = null;
        }

        next.prev = prev;
        prev.next = next;

        if ((element==null&&this.node.item==null) || (element.equals(this.node.item))) {
            this.node = lastMode==MODE_NEXT ? this.node.next : this.node.prev;
        }

        x.item = null;
        x = null;
        size--;
        return element;
    }

    public int size() {
        return size;
    }


    /**
     * 节点类
     * @param <E>
     */
    private static class Node<E> {
        E item;
        Node<E> next;
        Node<E> prev;

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }

}
```

## 并发安全的环形队列

如果在高并发的情况下需要实现线程同步的环形队列，只需要继承上面的类，为需要同步的方法加锁即可：

```java
public class CircularBlockingQueue<E> extends CircularQueue<E> {
    /** 对添加，删除，指针移动操作加锁 */
    protected final ReentrantLock putLock = new ReentrantLock();

    private QueueListener listener;

    public CircularBlockingQueue() {
        super();
    }

    public CircularBlockingQueue(QueueListener listener) {
        super();
        this.listener = listener;
    }

    public void setListener(QueueListener listener) {
        this.listener = listener;
    }

    @Override
    public boolean add(E e) {
        final ReentrantLock putLock = this.putLock;
        try {
            putLock.lockInterruptibly();
            super.add(e);

            if (listener != null) listener.afterAdd(e);

            return true;
        } catch (InterruptedException exp) {
            exp.printStackTrace();
            return false;
        } finally {
            putLock.unlock();
        }

    }

    @Override
    public E next() {
        final ReentrantLock putLock = this.putLock;
        try {
            putLock.lockInterruptibly();
            return super.next();
        } catch (InterruptedException e) {
            e.printStackTrace();
            return null;
        } finally {
            putLock.unlock();
        }

    }

    @Override
    public E prev() {
        final ReentrantLock putLock = this.putLock;
        try {
            putLock.lockInterruptibly();
            return super.prev();
        } catch (InterruptedException e) {
            e.printStackTrace();
            return null;
        } finally {
            putLock.unlock();
        }
    }

    @Override
    public boolean remove(E e) {
        final ReentrantLock putLock = this.putLock;
        try {
            putLock.lockInterruptibly();

            if (listener != null) listener.afterAdd(e);

            return super.remove(e);
        } catch (InterruptedException exp) {
            exp.printStackTrace();
            return false;
        } finally {
            putLock.unlock();
        }
    }


    /**
     * 监听器监听插入，删除，等操作之后需要实现的功能
     */
    interface QueueListener<E> {
        void afterAdd(E e);
        void afterRemove(E e);
    }

}
```

# 

# 参考资料

《java 并发编程的艺术》

- 环形队列

[Java实现环形队列](https://blog.csdn.net/u014520745/article/details/63809753)

http://www.cnblogs.com/skywang12345/p/3610382.html

[无锁环形队列的一种高效实现](https://www.cnblogs.com/dodng/p/4367791.html)

* any list
{:toc}

