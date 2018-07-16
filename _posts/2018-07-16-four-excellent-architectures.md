---
layout: post
title:  Four excellent architectures
date:  2018-07-16 16:38:00 +0800
categories: [Design]
tags: [design]
published: true
---

# 四种优秀架构

> [你应该知道的四种优秀架构](https://www.jdon.com/46117)

# Clean 架构

> [Clean 架构](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html)

# DCI 架构

> [DCI 架构](https://www.artima.com/articles/dci_vision.html)

DCI是对象的Data数据, 对象使用的Context场景, 对象的Interaction交互行为三者简称， DCI是一种特别关注行为的模式(可以对应GoF行为模式)，
而MVC模式是一种结构性模式，DCI可以使用演员场景表演来解释，某个实体在某个场景中扮演包公，实施包公升堂行为；典型事例是银行帐户转帐，转帐这个行为按照DDD很难划分到帐号对象中，它是跨两个帐号实例之间的行为，我们可以看成是帐号这个实体(PPT，见四色原型)在转帐这个场景，实施了钞票划转行为，这种新的角度更加贴近需求和自然，结合四色原型 DDD和DCI可以一步到位将需求更快地分解落实为可运行的代码，是国际上软件领域的一场革命。

# 领域驱动设计(DDD:Domain-Driven Design)

领域驱动设计对于成功交付和维护CQRS的系统非常重要。 DDD作为一项战略方针，允许将复杂的问题域划分为单独的块（称为有界上下文），虽然有很多方式如：不同的心智Mental模式，组织政治，域语言学等也是这样做，但是DDD建立了一个有界的心智mental模式，这样商务人士也可以理解，程序员也可以很容易地在代码中实现。 

CQRS，作为一种战术办法，是实现DDD建模领域的最佳途径之一。事实上，它就是因为这个目标而诞生在这个世界上。

[领域驱动](https://www.jdon.com/ddd.html)

> [ddd-cqrs-leaven-v20](https://prezi.com/akrfq7jyau8w/ddd-cqrs-leaven-v20/)

# 六边形架构

允许应用程序都是由用户，程序，自动化测试或批处理脚本驱动的，在事件驱动和数据库环境下被开发和隔离测试。

一个事件从外面世界到达一个端口，特定技术的适配器将其转换成可用的程序调用或消息，并将其传递给应用程序。

该应用程序是可以无需了解输入设备的性质(调用者是哪个)。

当应用程序有结果需要发出时，它会通过一个端口适配器发送它，这个适配器会创建接收技术（人类或自动）所需的相应信号。

该应用程序与在它各方面的适配器形成语义良性互动，但是实际上不知道适配器的另一端的谁在处理任务。

> [六边形架构](http://alistair.cockburn.us/Hexagonal+architecture)

* any list
{:toc}