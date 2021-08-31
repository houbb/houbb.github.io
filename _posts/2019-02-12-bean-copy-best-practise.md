---
layout: post
title: java 对象属性复制(BeanCopy)最佳实践
date:  2019-02-12 21:31:37 +0800
categories: [Java]
tags: [java, best-practise, sh]
published: true
excerpt: java 对象属性复制(BeanCopy)最佳实践
---

# 常见的属性赋值工具

Frameworks that ease bean mapping.

dOOv - Provides fluent API for typesafe domain model validation and mapping. It uses annotations, code generation and a type safe DSL to make bean validation and mapping fast and easy.

Dozer - Mapper that copies data from one object to another using annotations and API or XML configuration.

JMapper - Uses byte code manipulation for lightning-fast mapping. Supports annotations and API or XML configuration.

MapStruct - Code generator that simplifies mappings between different bean types, based on a convention-over-configuration approach.

ModelMapper - Intelligent object mapping library that automatically maps objects to each other.

Orika - JavaBean-mapping framework that recursively copies (among other capabilities) data from one object to another.

Selma - Annotation processor-based bean mapper.

参见项目 [awesome-java](https://github.com/akullpp/awesome-java)

## 个人整理

我原来(2018年)对比过这些工具，Dozer 是相对比较成熟的工具。

对于性能而言，直接通过 CGLIB 生成的 BeanCopier 性能比较好。

# 如何自定义一个自己的属性赋值工具？

满足常见的 BeanUtils.copyProperties(); 的便利性

可以指定 null 值是否赋值等等。

自己设计一个属性赋值框架。

# 拓展阅读

[java 浅拷贝，深度拷贝与属性复制](https://houbb.github.io/2019/01/09/java-deep-copy)

## 开源框架

- [mapstruct / mapstruct](https://github.com/mapstruct/mapstruct)

An annotation processor for generating type-safe bean mappers

# 参考资料

[Java的一个高性能快速深拷贝方法。Cloneable?](https://www.cnblogs.com/huaxingtianxia/p/5985913.html)

[CGLIB中BeanCopier源码实现](https://www.jianshu.com/p/f8b892e08d26)

* any list
{:toc}