---
layout: post
title: Java 对象占用内存大小的一些方法
date:  2019-2-26 09:48:47 +0800
categories: [Java]
tags: [java, java-base, jvm, sh]
published: true
---

# 业务背景

最近在做 leetcode 相关的练习题，想知道一个程序的耗时和内存消耗情况。

耗时相对比较简单，但是内存消耗整体看下来就会比较麻烦。

# 简单思路

```java
Runtime r = Runtime.getRuntime(); 
r.gc(); 
long startMem = r.freememory(); // 开始时的剩余内存 
//  你的代码……
long orz = startMem - r.freememory(); // 剩余内存 现在
```

其实这里的 GC 没啥效果，因为本身就只是建议而已。

而且经过个人实际测试，这种方式不是很准确。

# 计算对象内存占用

## 基本知识

学习一下 Instrumentation

也可以使用别人封装好的工具包。

ps: 此处可以简化一下，把核心功能提取出来。便于后期使用。

## 计算方式

在启动Java进程的时候把上文中写好的这个agent作为参数放进去,然后getObjectSize()方法可获取单个对象的大小，我们自己再通过反射逐个成员，对其进行getObjectSize()，然后所有的size求和。

最后，还要知道的一点知识是：

一个实例化的对象在内存中需要存储的信息包括：

    对象的头部(对象的GC信息，hash值，类定义引用等)

    对象的成员变量: 包括基本数据类型和引用。 如成员变量是一个引用, 引用了其他对象，被引用的对象内存另外计算。

对象大小分为:

    自身的大小(Shadow heap size)

    所引用的对象的大小(Retained heap size)。

基本数据类型大小如下:

```
type    size(bits)    bytes
boolean    8          1
byte         8          1
char         16        2
short       16        2
int           32        4
long         64        8
float         32        4
double      64        8
```

# 使用工具包

## maven 导入

```xml
<dependency>
      <groupId>org.apache.lucene</groupId>
      <artifactId>lucene-core</artifactId>
      <version>4.0.0</version>
</dependency>
```

## 使用

```java
//计算指定对象及其引用树上的所有对象的综合大小，单位字节
long RamUsageEstimator.sizeOf(Object obj)
 
//计算指定对象本身在堆空间的大小，单位字节
long RamUsageEstimator.shallowSizeOf(Object obj)
 
//计算指定对象及其引用树上的所有对象的综合大小，返回可读的结果，如：2KB
String RamUsageEstimator.humanSizeOf(Object obj)
```

# 拓展阅读


# 参考资料

[如何看一段JAVA代码耗了多少内存](https://blog.csdn.net/luminji/article/details/76795178)

[Instrumentation 新功能](https://www.ibm.com/developerworks/cn/java/j-lo-jse61/index.html)

[Troubleshooting Memory Issues in Java Applications](https://devcenter.heroku.com/articles/java-memory-issues)

[How do I check CPU and Memory Usage in Java?](https://stackoverflow.com/questions/74674/how-do-i-check-cpu-and-memory-usage-in-java)

[About Java Memory Usage](https://docs.oracle.com/en/database/oracle/oracle-database/19/jjdev/about-Java-memory-usage.html#GUID-D660F569-3654-4C5F-9D25-5D5A3E05E9AD)

[MemoryUsage](https://docs.oracle.com/javase/8/docs/api/java/lang/management/MemoryUsage.html)

[Memory Usage](https://coderanch.com/t/731378/java/Memory-Usage)

[Java Memory Management](https://dzone.com/articles/java-memory-management)

* any list
{:toc}