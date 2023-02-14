---
layout: post
title: spring 源码分析之概览-overview
date:  2023-02-13 +0800
categories: [source-code]
tags: [java, spring, source-code, sh]
published: true
---

# 前言

之前一直想系统的拜读一下 spring 的源码，看看它到底是如何吸引身边的大神们对它的设计赞不绝口，虽然每天工作很忙，每天下班后总感觉脑子内存溢出，想去放松一下，但总是以此为借口，恐怕会一直拖下去。所以每天下班虽然有些疲惫，但还是按住自己啃下这块硬骨头。

spring 源码这种东西真的是一回生二回熟，第一遍会被各种设计模式和繁杂的方法调用搞得晕头转向，不知道看到的这些方法调用的是哪个父类的实现（IoC 相关的类图实在太复杂咯，继承体系又深又广），但当你耐下心来多走几遍，会发现越看越熟练，每次都能 get 到新的点。

另外，对于第一次看 spring 源码的同学，建议先在 B 站上搜索相关视频看一下，然后再结合计文柯老师的《spring 技术内幕》深入理解，最后再输出自己的理解（写博文或部门内部授课）加强印象。

首先对于我们新手来说，还是从我们最常用的两个 IoC 容器开始分析，这次我们先分析 FileSystemXmlApplicationContext 这个 IoC 容器的具体实现，ClassPathXmlApplicationContext 留着下次讲解。

（
PS：可以结合我 GitHub 上对 Spring 框架源码的翻译注释一起看，会更有助于各位同学的理解。
地址：
spring-beans https://github.com/AmyliaY/spring-beans-reading

spring-context https://github.com/AmyliaY/spring-context-reading
）

# 参考资料

https://github.com/doocs/source-code-hunter/blob/main/docs/Spring/IoC/1%E3%80%81BeanDefinition%E7%9A%84%E8%B5%84%E6%BA%90%E5%AE%9A%E4%BD%8D%E8%BF%87%E7%A8%8B.md

* any list
{:toc}