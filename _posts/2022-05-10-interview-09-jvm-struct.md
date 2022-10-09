---
layout: post
title:  JVM 常见面试题之 java 内存结构
date:  2022-05-10 09:22:02 +0800
categories: [Interview]
tags: [interview, jvm, sh]
published: true
---

# 系列目录

[spring 常见面试题](https://houbb.github.io/2022/05/10/interview-01-spring)

[spring-boot 常见面试题](https://houbb.github.io/2022/05/10/interview-02-springboot)

[redis 常见面试题](https://houbb.github.io/2022/05/10/interview-04-redis)

[mysql 常见面试题](https://houbb.github.io/2022/05/10/interview-05-mysql)

[mq 常见面试题](https://houbb.github.io/2022/05/10/interview-07-mq)

[rpc/dubbo 常见面试题](https://houbb.github.io/2022/05/10/interview-06-dubbo)

[ZooKeeper 面试题](https://houbb.github.io/2022/05/10/interview-08-zookeeper)

[JVM 常见面试题之双亲委派](https://houbb.github.io/2022/05/10/interview-09-jvm-classloader)

[JVM 常见面试题之 GC 垃圾回收](https://houbb.github.io/2022/05/10/interview-09-jvm-gc)

[JVM 常见面试题之 java 内存结构](https://houbb.github.io/2022/05/10/interview-09-jvm-struct)

[JVM 常见面试题之 java 内存结构2](https://houbb.github.io/2022/05/10/interview-11-java-jvm)

[【面试】mybatis 常见面试题汇总](https://houbb.github.io/2022/05/10/interview-03-mybatis)

[面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2022/05/10/interview-10-repeat)

[java 基础之 event 事件机制](https://houbb.github.io/2022/05/10/interview-11-java-basic-event)

[Reflection-01-java 反射机制](https://houbb.github.io/2018/07/01/reflection-01-overview)

[distributed 分布式相关专题汇总](https://houbb.github.io/2022/05/10/interview-11-java-distribute)

[web 常见面试题](https://houbb.github.io/2022/05/10/interview-11-java-web)

[其他常见面试题](https://houbb.github.io/2022/05/10/interview-12-other)

# 前言

大家好，我是老马。

GC 在面试中频率也比较高，对常见问题进行整理，便于平时查阅收藏。

#  java 内存结构

JVM的内存结构分为 本地接口库 、运行时数据区、执行引擎 三部分。

![内存结构](https://rjc.oss-cn-chengdu.aliyuncs.com/imgs/20210902100629.png)

JVM内存结构和JMM（Java memory model）是两回事，JMM定义了Java 虚拟机(JVM)在计算机内存(RAM)中的工作方式。

JVM是整个计算机虚拟模型，所以JMM是隶属于JVM的。


## 本地接口库

一些供Java程序调用的native方法存放在此处。

## 执行引擎

包括解释器、JIT（即时编译器）、GC。

## 运行时数据区

运行时数据区分为 线程共享区域和 线程私有区域 ,其中共享区域有 元空间（方法区）、堆 ，线程私有空间有 程序计数器、本地方法栈、虚拟机栈。

共享区域会有线程安全问题，而私有区域不会有。

![运行时数据区](https://rjc.oss-cn-chengdu.aliyuncs.com/imgs/20210902101422.png)

## 本地方法栈和虚拟机栈

![本地方法栈和虚拟机栈](https://rjc.oss-cn-chengdu.aliyuncs.com/imgs/20210902101452.png)

栈空间都是线程私有的，本地方法栈和虚拟机栈都会抛出StackOverflowError 栈溢出 和OutOfMemoryError 内存溢出异常。

本地方法栈：虚拟机调用native方法需要的栈空间。
虚拟机栈：程序调用Java方法需要的栈空间。

栈帧的结构：

1. 局部变量表：局部变量表中存储了基本数据类型（boolean、byte、char、short、int、float、long、double）的局部变量（包括参数）、和对象的引用（String、数组、对象等），但是不存储对象的内容。局部变量表所需的内存空间在编译期间完成分配，在方法运行期间不会改变局部变量表的大小。

2. 操作数栈：Java没有寄存器，操作数栈用来传递参数以完成计算。

如下面方法：

```java
public static int add(int a,int b){
        int c=0;
        c=a+b;
        return c;
}
	
```

压栈的步骤如下：

```
0:   iconst_0 // 0压栈
1:   istore_2 // 弹出int，存放于局部变量2
2:   iload_0  // 把局部变量0压栈
3:   iload_1 // 局部变量1压栈
4:   iadd      //弹出2个变量，求和，结果压栈
5:   istore_2 //弹出结果，放于局部变量2
6:   iload_2  //局部变量2压栈
7:   ireturn   //返回
```

动态链接：小对象（一般几十个bytes），在没有逃逸的情况下，可以直接分配在栈上

返回地址

## 堆

堆是Java虚拟机所管理的内存中最大的一块，几乎所有的对象实例都分配在堆上（栈上可能会分配不逃逸的对象）。

会发生oom异常。

![heap](https://rjc.oss-cn-chengdu.aliyuncs.com/imgs/20210902101539.png)

JVM内存划分为堆内存和非堆内存，堆内存分为年轻代（Young Generation）、老年代（Old Generation），新生代和老年代默认比列为1:2，非堆内存就一个永久代（Permanent Generation）。

年轻代又分为Eden和Survivor区。Survivor区由FromSpace和ToSpace组成。

Eden区占大容量，Survivor两个区占小容量，默认比例是8:1:1。

堆内存用途：存放的是对象，垃圾收集器就是收集这些对象，然后根据GC算法回收。

非堆内存用途：永久代，也称为方法区，存储程序运行时长期存活的对象，比如类的元数据、方法、常量、属性等。

在JDK1.8版本废弃了永久代，替代的是元空间（MetaSpace），元空间与永久代上类似，都是方法区的实现，他们最大区别是：**元空间并不在JVM中，而是使用本地内存**。

元空间有注意有两个参数：

MetaspaceSize ：初始化元空间大小，控制发生GC阈值

MaxMetaspaceSize ： 限制元空间大小上限，防止异常占用过多物理内存

```
堆大小：–Xms、-Xmx
新生代和老年代比例：–XX:NewRatio
Eden : from : to ： –XX:SurvivorRatio 
元空间：-XX:MetaspaceSize 、-XX:MaxMetaspaceSize 
```

# 分代概念

新生成的对象首先放到年轻代Eden区，当Eden空间满了，触发Minor GC，存活下来的对象移动到Survivor0区，Survivor0区满后触发执行Minor GC，Survivor0区存活对象移动到Suvivor1区，这样保证了一段时间内总有一个survivor区为空。

经过多次Minor GC仍然存活的对象移动到老年代。

老年代存储长期存活的对象，占满时会触发Major GC=Full GC，GC期间会停止所有线程等待GC完成，所以对响应要求高的应用尽量减少发生Major GC，避免响应超时。

Minor GC ： 清理年轻代

Major GC ： 清理老年代

Full GC ： 清理整个堆空间，包括年轻代和永久代甚至是方法区

所有GC都会停止应用所有线程。

## 为什么分代

将对象根据存活概率进行分类，对存活时间长的对象，放到固定区，从而减少扫描垃圾时间及GC频率。针对分类进行不同的垃圾回收算法，对算法扬长避短。

## 为什么survivor分为两块相等大小的幸存空间？

主要为了解决碎片化。

如果内存碎片化严重，也就是两个对象占用不连续的内存，已有的连续内存不够新对象存放，就会触发GC。

## 常量池的迁移

JDK1.6时字符串常量池、运行时常量、类常量都放在方法区，1.7时为了后面移除永久代就开始做准备把字符串常量池移动到了堆中，1.8时又把运行时常量和类常量移动到了元空间。

## 为什么移除永久代

因为永久代是Hotspot独有的概念，Hotspot的jdk使用永久代实现了JVM规范中的方法区，但是其他jdk没有这个概念，而且**永久代很难找到一个合适的配置值，太小容易oom，太大又浪费空间**，使用native memory实现可以实现在程序运行时自动调校为“合适的大小”。

当然更重要的还是为了融合Hotspot的JVM和Jrockit VM。

ps: 为了成为标准，让大家一起整合。

## 元空间

存放了运行时常量和类常量，默认情况下，class metadata的分配仅受限于可用的native memory总量。

## 程序计数器

线程私有，实现为cpu的寄存器，用来储存当前线程指令的执行位置，当运行的java方法时才有内容，运行的本地方法时为空。

# 参考资料

https://www.zhihu.com/question/293352546/answer/2453569556

https://zardfans.com/2021/09/02/JVM%E5%86%85%E5%AD%98%E7%BB%93%E6%9E%84/

https://zhuanlan.zhihu.com/p/38348646

https://www.cnblogs.com/ityouknow/p/5610232.html

https://pdai.tech/md/java/jvm/java-jvm-struct.html

https://cloud.tencent.com/developer/article/1698363

https://segmentfault.com/a/1190000020909659

https://segmentfault.com/a/1190000040580395

https://www.modb.pro/db/242151

https://blog.csdn.net/fuzhongmin05/article/details/78169044

https://juejin.cn/post/6844903969349697543


* any list
{:toc}