---
layout: post
title:  Spring Aop
date:  2018-07-23 11:31:38 +0800
categories: [Java]
tags: [java, bytecode, spring, sf]
published: false
---

# Spring Aop

AOP（Aspect Orient Programming），作为面向对象编程的一种补充，广泛应用于处理一些具有横切性质的系统级服务，如事务管理、安全检查、缓存、对象池管理等。

AOP 实现的关键就在于 AOP 框架自动创建的 AOP 代理，AOP 代理则可分为静态代理和动态代理两大类，其中静态代理是指使用 AOP 框架提供的命令进行编译，从而在编译阶段就可生成 AOP 代理类，因此也称为编译时增强；
而动态代理则在运行时借助于 JDK 动态代理、CGLIB 等在内存中“临时”生成 AOP 动态代理类，因此也被称为运行时增强。


# Aop 的作用

让只要修改一个地方即可，不管整个系统中有多少地方调用了该方法，程序无须修改这些地方，只需修改被调用的方法即可——通过这种方式，大大降低了软件后期维护的复杂度。

AOP 专门用于处理系统中分布于各个模块（不同方法）中的交叉关注点的问题，
在 Java EE 应用中，常常通过 AOP 来处理一些具有横切性质的系统级服务，如事务管理、安全检查、缓存、对象池管理等，AOP 已经成为一种非常常用的解决方案。

# Aspectj

[AspectJ](https://www.eclipse.org/aspectj/) 是 Java 语言的一个 AOP 实现，
其主要包括两个部分：第一个部分定义了如何表达、定义 AOP 编程中的语法规范，通过这套语言规范，
我们可以方便地用 AOP 来解决 Java 语言中存在的交叉关注点问题；另一个部分是工具部分，包括编译器、调试工具等。



# 参考资料

https://www.ibm.com/developerworks/cn/java/j-lo-springaopcglib/index.html

https://blog.csdn.net/javazejian/article/details/56267036

* any list
{:toc}