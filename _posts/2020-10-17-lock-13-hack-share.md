---
layout: post
title:  锁专题（13）使用 @sun.misc.Contended 避免伪共享
date:  2020-10-17 16:15:55 +0800
categories: [Lock]
tags: [lock, concurrency, sf]
published: true
---

# 什么是伪共享

缓存系统中是以缓存行（cache line）为单位存储的。

缓存行是2的整数幂个连续字节，一般为32-256个字节。最常见的缓存行大小是64个字节。

当多线程修改互相独立的变量时，如果这些变量共享同一个缓存行，就会无意中影响彼此的性能，这就是**伪共享**。

缓存行上的写竞争是运行在SMP系统中并行线程实现可伸缩性最重要的限制因素。

有人将伪共享描述成无声的性能杀手，因为从代码中很难看清楚是否会出现伪共享。

为了让可伸缩性与线程数呈线性关系，就必须确保不会有两个线程往同一个变量或缓存行中写。

两个线程写同一个变量可以在代码中发现。

为了确定互相独立的变量是否共享了同一个缓存行，就需要了解缓存行和对象的内存布局。

- 伪共享的例子

![输入图片说明](https://images.gitee.com/uploads/images/2020/1108/124541_12c811d1_508704.png "屏幕截图.png")

假设在核心1上运行的线程想更新变量X，同时核心2上的线程想要更新变量Y。

不幸的是，这两个变量在同一个缓存行中。

每个线程都要去竞争缓存行的所有权来更新变量。

如果核心1获得了所有权，缓存子系统将会使核心2中对应的缓存行失效。

当核心2获得了所有权然后执行更新操作，核心1就要使自己对应的缓存行失效。

这会来来回回的经过L3缓存，大大影响了性能。

如果互相竞争的核心位于不同的插槽，就要额外横跨插槽连接，问题可能更加严重。

# 避免伪共享

假设有一个类中，只有一个 long 类型的变量：

```java
public final static class VolatileLong {
    public volatile long value = 0L;
}
```

这时定义一个VolatileLong类型的数组，然后让多个线程同时并发访问这个数组，这时可以想到，在多个线程同时处理数据时，数组中的多个VolatileLong对象可能存在同一个缓存行中，通过上文可知，这种情况就是伪共享。

## 避免方式

怎么样避免呢？

在Java 7之前，可以在属性的前后进行padding，例如：

```java
public final static class VolatileLong {
    volatile long p0, p1, p2, p3, p4, p5, p6;
    public volatile long value = 0;
    volatile long q0, q1, q2, q3, q4, q5, q6;
}
```

通过Java对象内存布局文章中结尾对padding的分析可知，由于都是long类型的变量，这里就是按照声明的顺序分配内存，那么这可以保证在同一个缓存行中只有一个VolatileLong对象。

这里有一个问题：据说Java7优化了无用字段，会使这种形式的补位无效，但经过测试，无论是在JDK 1.7 还是 JDK 1.8中，这种形式都是有效的。

网上有关伪共享的文章基本都是来自Martin的两篇博客，这种优化方式也是在他的博客中提到的。

但国内的文章貌似根本就没有验证过而直接引用了此观点，这也确实迷惑了一大批同学！

在Java 8中，提供了 `@sun.misc.Contended` 注解来避免伪共享，原理是在使用此注解的对象或字段的前后各增加128字节大小的padding，使用2倍于大多数硬件缓存行的大小来避免相邻扇区预取导致的伪共享冲突。

具体可以参考 http://mail.openjdk.java.net/pipermail/hotspot-dev/2012-November/007309.html。

# JEP-142: Reduce Cache Contention on Specified Fields

我们来一起看一下这封邮件的内容。

在与Doug Lea，Dave Dice和其他人进行一些内部讨论之后，我希望征求有关实施的初步反馈

JEP-142，又名 `@Contended`：http://openjdk.java.net/jeps/142

初始版本的webrev在这里：

http://shipilev.net/pub/jdk/hotspot/contended/webrev-2/

## 实施概述

当前，Hotspot 正在布局这些字段以优化内存占用量，自由地重新排列字段，以满足字段的对齐要求并缩小间隙。

我们利用相同的基础结构来免除打包中的特定字段，并将它们以稀疏偏移量推到密集打包块的外面，自然地组成了适当的填充。

为了划分适合此类填充的特定类和/或字段，我们使用了新的 `@Contended` 注解。 

批注的运行时发现重用了一些特定于JSR292批注的John（？）代码。

此批注的行为如下：

### A. 将 class 标记为 @Contended：

```java
@Contended
public static class ContendedTest2 {
    private Object plainField1;
    private Object plainField2;
    private Object plainField3;
    private Object plainField4;
}
```

使整个字段块都可以从两侧填充：

（下面是新跟踪的输出 -XX: + PrintFieldLayout）

```
TestContended$ContendedTest2: field layout
    Entire class is marked contended
     @140 --- instance fields start ---
     @140 "plainField1" Ljava.lang.Object;
     @144 "plainField2" Ljava.lang.Object;
     @148 "plainField3" Ljava.lang.Object;
     @152 "plainField4" Ljava.lang.Object;
     @288 --- instance fields end ---
     @288 --- instance ends ---
```

请注意，我们使用128字节（大多数硬件上缓存行大小的两倍）来调整相邻扇区的预取器，从而将错误共享冲突扩展到两条缓存行。


### B. 声明在 Field 上

```java
public static class ContendedTest1 {
    @Contended
    private Object contendedField1;
    private Object plainField1;
    private Object plainField2;
    private Object plainField3;
    private Object plainField4;
}
```

...将字段移出密集块并有效地应用填充：

```
TestContended$ContendedTest1: field layout
     @ 12 --- instance fields start ---
     @ 12 "plainField1" Ljava.lang.Object;
     @ 16 "plainField2" Ljava.lang.Object;
     @ 20 "plainField3" Ljava.lang.Object;
     @ 24 "plainField4" Ljava.lang.Object;
     @156 "contendedField1" Ljava.lang.Object; (contended, group = 0)
     @288 --- instance fields end ---
     @288 --- instance ends ---
```

### C.标记多个字段将填充每个字段

```java
public static class ContendedTest4 {
    @Contended
    private Object contendedField1;
    @Contended
    private Object contendedField2;
    private Object plainField3;
    private Object plainField4;
}
```

...对两个字段都使用单独的填充：

```
 TestContended$ContendedTest4: field layout
     @ 12 --- instance fields start ---
     @ 12 "plainField3" Ljava.lang.Object;
     @ 16 "plainField4" Ljava.lang.Object;
     @148 "contendedField1" Ljava.lang.Object; (contended, group = 0)
     @280 "contendedField2" Ljava.lang.Object; (contended, group = 0)
     @416 --- instance fields end ---
     @416 --- instance ends ---
```

## 争用组

在某些情况下，您希望将正在争用但不是成对的其他所有字段分开。

对于某些同时更新两个字段的代码来说，这是很平常的事情。

虽然用 `@Contended` 标记都足够了，但我们可以通过在它们之间不使用填充来优化内存占用。

为了划分这些组，我们在注释中使用了参数来描述争用组的等效类。

```java
public static class ContendedTest5 {
    @Contended("updater1")
    private Object contendedField1;
    @Contended("updater1")
    private Object contendedField2;
    @Contended("updater2")
    private Object contendedField3;
    private Object plainField5;
    private Object plainField6;
}
```

...的布局为：

```
   TestContended$ContendedTest5: field layout
     @ 12 --- instance fields start ---
     @ 12 "plainField5" Ljava.lang.Object;
     @ 16 "plainField6" Ljava.lang.Object;
     @148 "contendedField1" Ljava.lang.Object; (contended, group = 12)
     @152 "contendedField2" Ljava.lang.Object; (contended, group = 12)
     @284 "contendedField3" Ljava.lang.Object; (contended, group = 15)
     @416 --- instance fields end ---
     @416 --- instance ends ---
```

注意 `$contendedField1` 和 `$contendedField2` 从所有内容中填充

其他，但彼此仍然密密麻麻。

该代码至少在经过一些微测试的Linux x86-64上有效。

没有 `@Contended` 的字段的布局不会受到影响，因此，这大概是一个安全的更改。

我将尝试使用JPRT针对此实现进行更多测试，但同时感谢您对设计，API和实现草案进行审查...

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[Java8使用 @sun.misc.Contended 避免伪共享](https://www.jianshu.com/p/c3c108c3dcfd)

* any list
{:toc}