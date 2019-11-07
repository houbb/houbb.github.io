---
layout: post
title: Java IOC-02-spring beans 之 BeanFactory
date:  2019-11-06 11:18:30 +0800
categories: [Java]
tags: [java, ioc, spring, sh]
published: true
---

# 设计架构理念

微内核，插件式。

spring 的所有一切，都是建立在 spring-beans 这一座坚实的地基之上的。

# BeanFactory

## 是什么

BeanFactory是访问bean容器的根接口，它是一个bean容器的基本客户端视图。

## 重要的子接口

beanFactory有四个重要的子接口：

### SimpleJndiBeanFactory

SimpleJndiBeanFactory 是spring beanFactory接口的基于jndi的简单实现。

不支持枚举bean定义，故不需要实现ListableBeanFactory接口。

这个bean工厂可以解析制定名称的jndi名称，在J2EE应用中，jndi名称的命名空间为"java:/comp/env/".

这个bean工厂主要和 spring 的 CommonAnnotationBeanPostProcessor 联合使用。

### ListableBeanFactory

ListableBeanFactory是beanFactory接口的扩展接口，它可以枚举所有的bean实例，而不是客户端通过名称一个一个的查询得出所有的实例。

要预加载所有的bean定义的beanfactory可以实现这个接口来。

该接口定义了访问容器中Bean基本信息的若干方法，如查看Bean的个数、获取某一类型Bean的配置名、查看容器中是否包括某一Bean等方法

### HierarchicalBeanFactory 

是一个bean factory 子接口实现，可以作为层次结构的一部分。

相对应的 bean Factory 方法 setParentBeanFactory 允许在一个可配置beanfactory中设置它们的父bean factory。

### AutowireCapableBeanFactory

beanFactory 接口的扩展实现，假如它们想要对已经存在的bean暴露它的功能，实现它就能实现自动装配功能。

定义了将容器中的Bean按某种规则（如按名字匹配、按类型匹配等）进行自动装配的方法；


### ConfigurableBeanFactory

HierarchicalBeanFactory的子接口ConfigurableBeanFactory是一个配置接口，大部分beanFactory实现了这个接口。

这个接口提供了对一个beanfactory进行配置的便利方法，加上beanFactory接口的客户端方法。

增强了IoC容器的可定制性，它定义了设置类装载器、属性编辑器、容器初始化后置处理器等方法

### ConfigurableListableBeanFactory 

它同时继承了ListableBeanFactory，AutowireCapableBeanFactory和ConfigurableBeanFactory，提供了对bean定义的分析和修改的便利方法，同时也提供了对单例的预实例化。

# 小结：

1. beanFactory有四个子接口，添加了四种不同的能力，分别是：

SimpleJndiBeanFactory：支持jndi。

AutowireCapableBeanFactory：支持自动装配。

HierarchicalBeanFactory：支持层次结构，ConfigurableListableBeanFactory 实现了 HierarchicalBeanFactory，提供了可配置功能。

ListableBeanFactory：支持枚举。

2. bean经过两次进化，到了DefaultListableBeanFactory，完善了bean容器的功能。

DefaultListableBeanFactory实现了AbstractAutowireCapableBeanFactory,ConfigurableListableBeanFactory, BeanDefinitionRegistry, Serializable等多个接口。

3. 最终进化：

XmlBeanFactory 通过从xml文件中读取bean的定义和依赖。


# 参考资料

## 资源访问

[spring resources 设计](https://www.cnblogs.com/davidwang456/archive/2013/03/21/2972916.html)

[classLoader 与 class 加载文件信息区别](https://blog.csdn.net/feeltouch/article/details/83796764)

TODO: 这两个后续整理为单独的一篇博客。

作为属性加载。

## spring beans

[BeanFactory 进化史](https://www.cnblogs.com/davidwang456/p/4152241.html)

* any list
{:toc}
