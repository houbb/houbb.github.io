---
layout: post
title: Resilience4j
date: 2018-11-29 07:32:26 +0800
categories: [Distributed]
tags: [distributed, sh]
published: true
excerpt: Resilience4j-Netflix Hystrix 的替代者
---

# Resilience4j

[Resilience4j](https://github.com/resilience4j/resilience4j) 是一个轻量级容错库，受Netflix Hystrix启发，但专为Java 8和函数式编程而设计。

轻量级，因为库只使用Vavr（以前称为Javaslang），它没有任何其他外部库依赖项。

相比之下，Netflix Hystrix对Archaius具有编译依赖性，Archaius具有更多外部库依赖性，例如Guava和Apache Commons Configuration。

使用Resilience4j，你不必全押，你可以选择你需要的东西。

# 其他

Hystrix 已经**停止更新**了。(2018-11-29)

* any list
{:toc}