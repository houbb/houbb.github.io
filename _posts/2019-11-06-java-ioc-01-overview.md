---
layout: post
title: Java IOC-00-ioc 是什么
date:  2019-11-06 11:18:30 +0800
categories: [Java]
tags: [java, ioc, sh]
published: true
---

# IOC 框架

[spring-framework](https://spring.io/projects/spring-framework) 和 [google guice](https://github.com/google/guice)

# IOC 是什么

控制反转（Inversion of Control，缩写为IoC），是面向对象编程中的一种设计原则，可以用来减低计算机代码之间的耦合度。

其中最常见的方式叫做依赖注入（Dependency Injection，简称DI）。

通过控制反转，对象在被创建的时候，由一个调控系统内所有对象的外界实体，将其所依赖的对象的引用传递给它。

也可以说，依赖被注入到对象中。

# Ioc 有什么用？

看完上面的解释你一定没有理解什么是 Ioc，因为是第一次看见上面的话也觉得云里雾里。

不过通过上面的描述我们可以大概的了解到，使用IoC的目的是为了解耦。

也就是说IoC 是解耦的一种方法。

我们知道Java 是一门面向对象的语言，在 Java 中 Everything is Object，我们的程序就是由若干对象组成的。

当我们的项目越来越大，合作的开发者越来越多的时候，我们的类就会越来越多，类与类之间的引用就会成指数级的增长。

如下图所示：

![ioc-mess](https://segmentfault.com/img/remote/1460000013000748?w=370&h=240)


这样的工程简直就是灾难，如果我们引入 Ioc 框架。

由框架来维护类的生命周期和类之间的引用。

我们的系统就会变成这样：

![ioc-well](https://segmentfault.com/img/remote/1460000013000749?w=370&h=247)

这个时候我们发现，我们类之间的关系都由 IoC 框架负责维护类，同时将类注入到需要的类中。

也就是类的使用者只负责使用，而不负责维护。把专业的事情交给专业的框架来完成。大大的减少开发的复杂度。

用一个类比来理解这个问题。

Ioc 框架就是我们生活中的房屋中介，首先中介会收集市场上的房源，分别和各个房源的房东建立联系。

当我们需要租房的时候，并不需要我们四处寻找各类租房信息。

我们直接找房屋中介，中介就会根据你的需求提供相应的房屋信息。

大大提升了租房的效率，减少了你与各类房东之间的沟通次数。

# Spring 的 IoC 是怎么实现的

了解Spring框架最直接的方法就阅读Spring的源码。

但是Spring的代码抽象的层次很高，且处理的细节很多。

对于大多数人来说不是太容易理解。

## 主要流程

我读了Spirng的源码以后以我的理解做一个总结, Spirng IoC 主要是以下几个步骤。

1. 初始化 IoC 容器。

2. 读取配置文件。

3. 将配置文件转换为容器识别对的数据结构（这个数据结构在Spring中叫做 BeanDefinition） 

4. 利用数据结构依次实例化相应的对象

5. 注入对象之间的依赖关系

# spring-beans 包简介

spring beans下面有如下源文件包：

```
org.springframework.beans, 包含了操作java bean的接口和类。
org.springframework.beans.annotation, 支持包，提供对java 5注解处理bean样式的支持。
org.springframework.beans.factory, 实现spring轻量级IoC容器的核心包。
org.springframework.beans.factory.access, 定位和获取bean工程的辅助工具类。
org.springframework.beans.factory.access.el,从统一样式的EL 获取spring beanFactory的支持类
org.springframework.beans.factory.annotation, 配置基于注解驱动的bean的支持包。
org.springframework.beans.factory.config, bean工厂的SPI接口和配置相关的处理类。
org.springframework.beans.factory.parsing, bean definition解析的支持基础类
org.springframework.beans.factory.serviceloader, jdk1.6 ServiceLoader基础类的支持包。
org.springframework.beans.factory.support,org.springframework.beans.factory包的支持类
org.springframework.beans.factory.wiring, 一种决定一个bean实例的元数据的机制。
org.springframework.beans.factory.xml, 包含了一个基于xml的beanFactory实现，也包含一个标准的spring-beans的dtd
org.springframework.beans.propertyeditors, 属性编辑器，用来将string类型的值转换为object类型，例如：java.util.Properties
org.springframework.beans.support,org.springframework.beans的支持包，像：一组bean的排序和保持工具类等。
```

# 小结

最核心的知识，往往就在我们身边，我们一直以为非常熟悉，实际上又非常陌生。

要善于从平常的工作生活中学习新的知识。

温故而知新，可以为师矣。

# 参考资料

[Spring 框架的设计理念与设计模式分析](https://www.ibm.com/developerworks/cn/java/j-lo-spring-principle/)

[徒手撸框架--实现IoC](https://segmentfault.com/a/1190000013000743)

[spring 及其源码分析](https://www.cnblogs.com/davidwang456/category/805707.html)

[spring beans源码解读之--总结篇](https://www.cnblogs.com/davidwang456/p/4213652.html)

* any list
{:toc}
