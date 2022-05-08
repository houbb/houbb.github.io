---
layout: post
title: JDK17 新特性详解，2021-09-14 正式发布
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# switch 新增模式（预览版）

使用 switch 表达式和语句的模式匹配以及对模式语言的扩展来增强 Java 编程语言。

将模式匹配扩展到 switch 允许针对多个模式测试表达式，每个模式都有特定的操作，以便可以简洁安全地表达复杂的面向数据的查询。

基于 JDK16 instanceof 模式匹配（最终版）优化升级 switch 使用方法，先回忆下JDK16 模式匹配（最终版）

```java
if (obj instanceof String s) {
   // 直接使用 s拼接字符串
   s += "heihei"; 
} else if (obj instanceof Integer i){
   // 直接使用i进行整型逻辑运算
   i += 1;
}
```

switch 可直接用 instanceof 模式匹配选择（需要提前考虑 null 判断）

```java
Object o;
switch (o) {
    case null      -> System.out.println("首先判断对象是否为空，走空指针逻辑等后续逻辑");
    case String s  -> System.out.println("判断是否为字符串，s:" + s);
    case record p  -> System.out.println("判断是否为Record类型: " + p.toString());
    case int[] arr -> System.out.println("判断是否为数组，展示int数组的长度" + ia.length);
    case Integer i -> System.out.println("判断是否为Intger对象,i:" + i);
    case Student s   -> System.out.println("判断是否为具体学生对象，student:" + s.toString());
    case UserCommonService -> System.out.println("判断是否为普通用户实现类，然后走普通用户逻辑");
    case UserVipService    -> System.out.println("判断是否为vip用户实现类，然后走vip用户逻辑");
    default   -> System.out.println("Something else");
}
```

# Realed class 密封类（最终版）

密封类和接口限制哪些其他类或接口可以扩展或实现它们。

```java
public sealed interface Shape{
    final class Planet implements Shape {}
    final class Star   implements Shape {}
    final class Comet  implements Shape {}
}
```

```java
public abstract sealed class Test{
    final class A extends Test {}
    final class B extends Test {}
    final class C extends Test {}
}
```

# 随机数增强

为伪随机数生成器 (PRNG) 提供新的接口类型和实现，包括可跳转的 PRNG 和额外的一类可拆分 PRNG 算法 (LXM)。

# 浮点运算更加严格

简化数字敏感库开发，包括 java.lang.Math 和 java.lang.StrictMath（对开发无实际意义）

# Parallel GC 默认启用

Parallel GC 默认启用自适应并行处理，并行 GC 确定 java.lang.ref.Reference 在垃圾收集期间用于处理实例的最佳线程数。

默认 - XX:ParallelRedProcEnabled: true。

在有多个线程可用于垃圾收集的机器上，明显改善了垃圾收集暂停的阶段，如果遇到垃圾收集暂停增加的情况，可以通过 -XX:ParallelRedProcEnabled 在命令行上指定到原始行为

# 增强 TreeMap

增强 [JDK-8176894](https://bugs.openjdk.java.net/browse/JDK-8176894)（TreeMap 没有对 putIfAbsent()、computeIfAbsent()、computeIfPresent()、compute() 方法的专门实现。默认实现经常导致两次树遍历，这会损害性能）

# 弃用 Socket 实现工厂机制

弃用并最终删除用于为 java.net 包中的套接字类型静态配置系统范围工厂 的 API 点

具体如下：

```java
//* 方法： 
static void ServerSocket.setSocketFactory (SocketImplFactory fac) 
static void Socket.setSocketImplFactory (SocketImplFactory fac) 
static void DatagramSocket.setDatagramSocketImplFactory (DatagramSocketImplFactory fac) 

//* Types 
java. net SocketImplFactory 
java.net DatagramSocketImplFactory 
```

也可以弃用 java.net SocketImplFactory 和 DatagramSocketImplFactory 类型 ，因为它们的唯一用途与上述工厂有关 设置方法。

# 统一日志支持异步日志刷新

为了避免在使用统一日志的线程中出现不希望的延迟，用户现在可以请求统一日志系统以异步模式运行。

通过传递命令行选项来完成的 -Xlog:async。

在异步日志模式下，日志站点将所有日志消息排入缓冲区。

独立线程负责将它们刷新到相应的输出。中间缓冲区是有界的。缓冲区耗尽时，将丢弃排队消息。

可以使用命令行选项控制中间缓冲区的大小 `-XX:AsyncLogBufferSize=<bytes>`。

# 新增 java.time.InstantSource

java.time.InstantSource 引入了一个新界面。这个接口是一个抽象 java.time.Clock，只关注当前时刻，不涉及时区。

# javadoc 工具

新的 “新 API” 页面和改进的 “弃用” 页面，JavaDoc 现在可以生成一个页面，总结最近 API 的变化。

要包含的最新版本列表是使用 --since 命令行选项指定的。

这些值用于查找 @since 要包含在新页面上的具有匹配标签的声明。该 --since-label 命令行选项提供了 “新 API” 页面的标题文本使用。

参考 [JDK-8263468](https://bugs.openjdk.java.net/browse/JDK-8263468)

# 参考资料

https://my.oschina.net/mdxlcj/blog/5261402

* any list
{:toc}