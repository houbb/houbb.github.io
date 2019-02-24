---
layout: post
title:  Reflection-01-java 反射机制
date:  2018-07-01 17:07:11 +0800
categories: [Java]
tags: [java, reflect]
published: true
---

# java 反射机制

Java的反射机制使得它可以在运行时检查类、接口、字段、方法，而在编译时并不不知道它们的名称。也可以通过反射实例化新的对象，调用方法，get/set字段的值。

Java的反射机制非常强大而且非常有用。对实例而言，在运行时可以映射对象到数据库中的表，就和 Butterfly Persistence 做的一样。或者，在运行时将脚本中的语句映射到真实对象上的方法调用，就和 Butterfly Container 在解析它的配置脚本时做的一样。

在互联网上已经有很多关于Java反射的教程了。然而，包括Sun公司提供的在内，大多数Java反射教程都只涉及了Java反射的表面和Java反射机制的可能性。

本教程将比我之前看到的大多数教程更深层次的触及Java的反射机制。我将解释Java反射的基本知识，包括如何使用数组、注解、泛型、动态代理、类的动态加载和重新加载。也会告诉你该如何做一些比较具体的事情，如读取类的所有getter方法，或者访问类的私有字段和方法。本教程也会澄清一些在运行时哪些泛型信息可用的困惑。有些人声称，所有的泛型信息在运行时都丢失了。这中理解是不对的。

本教程将基于Java 6介绍Java的反射机制。

# 反射入门例子

在这里有一个快速使用Java反射的例子展示了使用反射时的样子：

在这个例子中得到了MyObject的Class对象。这个例子通过Class对象获取了MyObject类中的方法列表，并且迭代打印出了各个方法的方法名。

这一切究竟是如何工作将在整个教程的剩余部分中进一步阐述（在其他文章中）。

# 参考资料

http://tutorials.jenkov.com/java-reflection/index.html

http://www.cnblogs.com/penghongwei/p/3299688.html

