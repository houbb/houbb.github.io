---
layout: post
title:  Java Concurrency-09-synchronized 背后的锁 objectMonitor 介绍s
date:  2018-07-25 15:34:17 +0800
categories: [Java]
tags: [thread, concurrency, thread, source-code, lock]
published: true
---


# 一、前言

synchronized保证线程同步的作用相信大家都已经非常熟悉了，可以把任意一个对象当作锁。

synchronized 关键字无论是修饰代码块，还是修饰实例方法和静态方法，本质上都是作用于对象上。

当用 synchronized 修饰代码块时，编译后的字节码会有 monitorenter 和 monitorexit 指令，分别对应的是获得锁和解锁。

当用 synchronized 修饰方法时，会给方法加上标记 ACC_SYNCHRONIZED，这样 JVM 就知道这个方法是一个同步方法，于是在进入同步方法的时候就会进行执行竞争锁的操作，只有拿到锁才能继续执行。

# 二、对象锁长什么样（对象的内存布局）

![对象](https://img-blog.csdnimg.cn/img_convert/109b8ad0355a0cb46f50fada250d4357.png)

## Mark Word 简介 

在不同的锁状态下，Mark word会存储不同的信息，这也是为了节约内存常用的设计。

当锁状态为重量级锁（锁标识位=10）时，Mark word中会记录指向Monitor对象的指针，这个Monitor对象也称为管程或监视器锁。

![mark-word](https://img-blog.csdnimg.cn/img_convert/681bba56f62caae7814caf5b5f8786d7.webp?x-oss-process=image/format,png)

# 二、Monitor

每个对象都存在着一个 Monitor对象与之关联。

执行 monitorenter 指令就是线程试图去获取 Monitor 的所有权，抢到了就是成功获取锁了；执行 monitorexit 指令则是释放了Monitor的所有权。

# 三、ObjectMonitor类

在HotSpot虚拟机中，Monitor是基于C++的ObjectMonitor类实现的，其主要数据结构如下（hotspot源码ObjectMonitor.hpp）：

```c
ObjectMonitor：

ObjectMonitor() {
    _header = NULL; //对象头 markOop
    _count = 0;
    _waiters = 0,
    _recursions = 0; // 锁的重入次数
    _object = NULL; //存储锁对象
    _owner = NULL; // 标识拥有该monitor的线程（当前获取锁的线程）
    _WaitSet = NULL; // 等待线程（调用wait）组成的双向循环链表，_WaitSet是第一个节点
    _WaitSetLock = 0;
    _Responsible = NULL ;
    _succ = NULL ;
    _cxq = NULL ; //多线程竞争锁会先存到这个单向链表中 （FILO栈结构）
    FreeNext = NULL ;
    _EntryList = NULL ; //存放在进入或重新进入时被阻塞(blocked)的线程 (也是存竞争锁失败的线程)
    _SpinFreq = 0;
    _SpinClock = 0;
    OwnerIsThread = 0;
    _previous_owner_tid = 0;
}
```

_owner：指向持有ObjectMonitor对象的线程
_WaitSet（双向链表）：存放处于wait状态的线程队列，即调用wait()方法的线程
_EntryList（双向链表）：存放处于等待锁block状态的线程队列
_count：约为_WaitSet 和 _EntryList 的节点数之和
_cxq（单向链表）: 多个线程争抢锁，会先存入这个单向链表
_recursions: 记录重入次数


## ObjectMonitor 的基本工作机制

![基本工作机制](https://img-blog.csdnimg.cn/img_convert/8ae41f1606eee45a6f439e982488f74b.png)

上图简略展示了ObjectMonitor的基本工作机制：

（1）当多个线程同时访问一段同步代码时，首先会进入 _EntryList 队列中。

（2）当某个线程获取到对象的Monitor后进入临界区域，并把Monitor中的 _owner 变量设置为当前线程，同时Monitor中的计数器 _count 加1。即获得对象锁。

（3）若持有Monitor的线程调用 wait() 方法，将释放当前持有的Monitor，_owner变量恢复为null，_count自减1，同时该线程进入 _WaitSet 集合中等待被唤醒。

（4）在_WaitSet 集合中的线程会被再次放到_EntryList 队列中，重新竞争获取锁。

（5）若当前线程执行完毕也将释放Monitor并复位变量的值，以便其他线程进入获取锁。

线程争抢锁的过程要比上面展示得更加复杂。

除了_EntryList 这个双向链表用来保存竞争的线程，ObjectMonitor中还有另外一个单向链表 _cxq，由两个队列来共同管理并发的线程。

![抢占锁](https://img-blog.csdnimg.cn/img_convert/3488c6b9abe7db86f5e4da7d8a2813d6.webp?x-oss-process=image/format,png)

## ObjectMonitor的并发管理逻辑

ObjectMonitor::enter() 和 ObjectMonitor::exit() 分别是ObjectMonitor获取锁和释放锁的方法。

线程解锁后还会唤醒之前等待的线程，根据策略选择直接唤醒_cxq队列中的头部线程去竞争，或者将_cxq队列中的线程加入_EntryList，然后再唤醒_EntryList队列中的线程去竞争。

在获取锁时，是将当前线程插入到cxq的头部，而释放锁时，默认策略（QMode=0）是：如果EntryList为空，则将cxq中的元素按原有顺序插入到EntryList，并唤醒第一个线程，也就是当EntryList为空时，是后来的线程先获取锁。

_EntryList不为空，直接从_EntryList中唤醒线程。

### ObjectMonitor::enter()

![enter](https://img-blog.csdnimg.cn/img_convert/009c5b7e0939d92cd1b9a3350ad5d716.png)

ObjectMonitor::enter()竞争锁的流程

下面我们看一下ObjectMonitor::enter()方法竞争锁的流程：

首先尝试通过 CAS 把 ObjectMonitor 中的 _owner 设置为当前线程，设置成功就表示获取锁成功。通过 _recursions 的自增来表示重入。

如果没有CAS成功，那么就开始启动自适应自旋，自旋还不行的话，就包装成 ObjectWaiter 对象加入到 _cxq 单向链表之中。关于自旋锁和自适应自旋，可以参考前文《Java面试必考问题：什么是自旋锁 》。

加入_cxq链表后，再次尝试是否可以CAS拿到锁，再次失败就要阻塞(block)，底层调用了pthread_mutex_lock。

### ObjectMonitor::exit() 方法

线程执行 Object.wait()方法时，会将当前线程加入到 _waitSet 这个双向链表中，然后再运行ObjectMonitor::exit() 方法来释放锁。

可重入锁就是根据 _recursions 来判断的，重入一次就执行 _recursions++，解锁一次就执行 _recursions--，如果 _recursions 减到 0 ，就说明需要释放锁了。

线程解锁后还会唤醒之前等待的线程。

当线程执行 Object.notify()：方法时，从 _waitSet 头部拿线程节点，然后根据策略（QMode指定）决定将线程节点放在哪里，包括_cxq 或 _EntryList 的头部或者尾部，然后唤醒队列中的线程。

![ObjectMonitor::exit](https://img-blog.csdnimg.cn/img_convert/c95d5efa18e204f1493421a00e00fd11.webp?x-oss-process=image/format,png)


# 参考资料

https://blog.csdn.net/m0_66328098/article/details/132003472

[聊聊Java关键字synchronized](https://blog.csdn.net/shark_chili3007/article/details/122906963)

[synchronized原理(一) -- Java对象头及Monitor](https://blog.csdn.net/q_coder/article/details/123843145)

* any list
{:toc}