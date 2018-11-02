---
layout: post
title: JCIP-02-Problem
date:  2018-10-09 21:10:55 +0800
categories: [Concurrency]
tags: [java, concurrency, sh]
published: true
excerpt: java 并发的难题
---

# 多线程一定快吗

## 不一定

多线程存在上下文的环境切换。

## 如何减少上下文切换次数

减少上下文切换的方法有无锁并发编程、CAS算法、使用最少线程和使用协程。

- 无锁并发编程。

多线程竞争锁时，会引起上下文切换，所以多线程处理数据时，可以用一些办法来避免使用锁，如将数据的ID按照Hash算法取模分段，不同的线程处理不同段的数据。

- CAS算法。

Java的Atomic包使用CAS算法来更新数据，而不需要加锁。

- 使用最少线程。

避免创建不需要的线程，比如任务很少，但是创建了很多线程来处理，这样会造成大量线程都处于等待状态。

- 协程

在单线程里实现多任务的调度，并在单线程里维持多个任务间的切换。

# 减少上下文切换实战

## 上下文切换

上下文切换又分为2种：让步式上下文切换和抢占式上下文切换。

前者是指执行线程主动释放CPU，与锁竞争严重程度成正比，可通过减少锁竞争来避免；

后者是指线程因分配的时间片用尽而被迫放弃CPU或者被其他优先级更高的线程所抢占，一般由于线程数大于CPU可用核心数引起，可通过调整线程数，适当减少线程数来避免。

## 线程数量多增加的是内存占用，跟调度开销有什么直接关系吗

```java
Integer[] array = new Integer[0];

public synchronized void addElement(Integer i) {
    while(array[0] != null) {
      this.wait();
    }
    array[0] = i;
}

public synchronized void removeElement() {
    while(array[0] == null) {
      this.wait();
    }
    array[0] = null;
    this.notifyAll();
}
```

假设执行顺序这样的：

```
线程1，addElement，成功
线程2～101，addElement，waiting
线程102，removeElement，成功
线程2～101，会逐一变成runnable，但是只有一个能够成功，另外99个又会变成waiting
```

每一次从waiting到runnable都是一次context switch，从runnable 到 waiting也会产生context switch。

在这个例子里，一共发生了100+99次。如果要想把线程2～101全部都执行完毕，那么就要产生100+99+...+2+1次context switch。

## 减少等待线程

### 第一步

用jstack命令dump线程信息，看看pid为3117的进程里的线程都在做什么。

```
sudo -u admin /opt/ifeve/java/bin/jstack 31177 > /home/tengfei.fangtf/dump17
```

### 第二步

统计所有线程分别处于什么状态，发现300多个线程处于 WAITING（onobjectmonitor）状态。

```
[tengfei.fangtf@ifeve ~]$ grep java.lang.Thread.State dump17 | awk '{print $2$3$4$5}'
| sort | uniq -c
39 RUNNABLE
21 TIMED_WAITING(onobjectmonitor)
6 TIMED_WAITING(parking)
51 TIMED_WAITING(sleeping)
305 WAITING(onobjectmonitor)
3 WAITING(parking)
```

### 第三步

打开dump文件查看处于WAITING（onobjectmonitor）的线程在做什么。发现这些线程基本全是JBOSS的工作线程，在await。

说明JBOSS线程池里线程接收到的任务太少，大量线程都闲着。

```
"http-0.0.0.0-7001-97" daemon prio=10 tid=0x000000004f6a8000 nid=0x555e in
Object.wait() [0x0000000052423000]
java.lang.Thread.State: WAITING (on object monitor)
at java.lang.Object.wait(Native Method)
- waiting on <0x00000007969b2280> (a org.apache.tomcat.util.net.AprEndpoint$Worker)
at java.lang.Object.wait(Object.java:485)
at org.apache.tomcat.util.net.AprEndpoint$Worker.await(AprEndpoint.java:1464)
- locked <0x00000007969b2280> (a org.apache.tomcat.util.net.AprEndpoint$Worker)
at org.apache.tomcat.util.net.AprEndpoint$Worker.run(AprEndpoint.java:1489)
at java.lang.Thread.run(Thread.java:662)
```

### 第四步

减少JBOSS的工作线程数，找到JBOSS的线程池配置信息，将maxThreads降到100。

```xml
<maxThreads="250" maxHttpHeaderSize="8192"
emptySessionPath="false" minSpareThreads="40" maxSpareThreads="75"
maxPostSize="512000" protocol="HTTP/1.1"
enableLookups="false" redirectPort="8443" acceptCount="200" bufferSize="16384"
connectionTimeout="15000" disableUploadTimeout="false" useBodyEncodingForURI= "true">
```

### 第五步

重启JBOSS，再dump线程信息，然后统计WAITING（onobjectmonitor）的线程，发现减少了175个。

WAITING的线程少了，系统上下文切换的次数就会少，因为每一次从WAITTING到RUNNABLE都会进行一次上下文的切换。读者也可以使用vmstat命令测试一下。

```
[tengfei.fangtf@ifeve ~]$ grep java.lang.Thread.State dump17 | awk '{print $2$3$4$5}'
| sort | uniq -c
44 RUNNABLE
22 TIMED_WAITING(onobjectmonitor)
9 TIMED_WAITING(parking)
36 TIMED_WAITING(sleeping)
130 WAITING(onobjectmonitor)1 WAITING(parking)
```

# 资源限制的挑战

## 什么是资源限制？ 

资源限制是指在进行并发编程时，程序的执行速度受限于计算机硬件资源或软件资源的限制。比如服务器的带宽只有2M，某个资源的下载速度是1M每秒，系统启动十个线程下载资源，下载速度不会变成10M每秒，所以在进行并发编程时，要考虑到这些资源的限制。硬件资源限制有带宽的上传下载速度，硬盘读写速度和CPU的处理速度。软件资源限制有数据库的连接数和Sorket连接数等。

## 资源限制引发的问题 

并发编程将代码执行速度加速的原则是将代码中串行执行的部分变成并发执行，但是如果某段串行的代码并发执行，但是因为受限于资源的限制，仍然在串行执行，这时候程序不仅不会执行加快，反而会更慢，因为增加了上下文切换和资源调度的时间。例如，之前看到一段程序使用多线程在办公网并发的下载和处理数据时，导致CPU利用率100％，任务几个小时都不能运行完成，后来修改成单线程，一个小时就执行完成了。

## 如何解决资源限制的问题？ 

对于硬件资源限制，可以考虑使用集群并行执行程序，既然单机的资源有限制，那么就让程序在多机上运行，比如使用ODPS，hadoop或者自己搭建服务器集群，不同的机器处理不同的数据，比如将数据ID％机器数，得到一个机器编号，然后由对应编号的机器处理这笔数据。

对于软件资源限制，可以考虑使用资源池将资源复用，比如使用连接池将数据库和Sorket连接复用，或者调用对方webservice接口获取数据时，只建立一个连接。

## 在资源限制情况下进行并发编程 

那么如何在资源限制的情况下，让程序执行的更快呢？根据不同的资源限制调整程序的并发度，比如下载文件程序依赖于两个资源，带宽和硬盘读写速度。有数据库操作时，要数据库连接数，如果SQL语句执行非常快，而线程的数量比数据库连接数大很多，则某些线程会被阻塞住，等待数据库连接。

# 参考资料

- 竞态条件

《java 并发编程实战》

《Java并发编程的艺术》

[如何减少上下文切换](https://ysysdzz.gitbooks.io/theartofjavaconcurrencyprogramming/content/ch1/1.1.3%20%E5%A6%82%E4%BD%95%E5%87%8F%E5%B0%91%E4%B8%8A%E4%B8%8B%E6%96%87%E5%88%87%E6%8D%A2.html)

[阿里面试题－如何减少上下文切换？](http://ifeve.com/question/%E5%A6%82%E4%BD%95%E5%87%8F%E5%B0%91%E4%B8%8A%E4%B8%8B%E6%96%87%E5%88%87%E6%8D%A2%EF%BC%9F/)

[Java线程上下文切换开销大小与线程数量的关系?](https://segmentfault.com/q/1010000011563690)

* any list
{:toc}