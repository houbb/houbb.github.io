---
layout: post
title:  ActiveMQ Communication Mode
date:  2018-08-25 14:44:28 +0800
categories: [MQ]
tags: [mq, java, jms, sf]
published: true
---


# JMS

Java消息服务（Java Message Service，JMS）应用程序接口是一个Java平台中关于面向消息中间件（MOM）的API，用于在两个应用程序之间，或分布式系统中发送消息，进行异步通信。Java消息服务是一个与具体平台无关的API，绝大多数MOM提供商都对JMS提供支持。

Java消息服务的规范包括两种消息模式，点对点和发布者／订阅者。许多提供商支持这一通用框架因此，程序员可以在他们的分布式软件中实现面向消息的操作，这些操作将具有不同面向消息中间件产品的可移植性。

Java消息服务支持同步和异步的消息处理，在某些场景下，异步消息是必要的；在其他场景下，异步消息比同步消息操作更加便利。

Java消息服务支持面向事件的方法接收消息，事件驱动的程序设计现在被广泛认为是一种富有成效的程序设计范例，程序员们都相当熟悉。

在应用系统开发时，Java消息服务可以推迟选择面对消息中间件产品，也可以在不同的面对消息中间件切换。

## 基础流程

按照JMS的规范，我们首先需要获得一个JMS connection factory，通过这个connection factory来创建connection。

在这个基础之上我们再创建session, destination, producer和consumer。

因此主要的几个步骤如下：

1. 获得JMS connection factory. 通过我们提供特定环境的连接信息来构造factory。

2. 利用factory构造JMS connection

3. 启动connection

4. 通过connection创建JMS session.

5. 指定JMS destination.

6. 创建JMS producer或者创建JMS message并提供destination.

7. 创建JMS consumer或注册JMS message listener.

8. 发送和接收JMS message.

9. 关闭所有JMS资源，包括connection, session, producer, consumer等。


# 发布订阅模式

发布订阅模式有点类似于我们日常生活中订阅报纸。

每年到年尾的时候，邮局就会发一本报纸集合让我们来选择订阅哪一个。

在这个表里头列了所有出版发行的报纸，那么对于我们每一个订阅者来说，我们可以选择一份或者多份报纸。

比如北京日报、潇湘晨报等。那么这些个我们订阅的报纸，就相当于发布订阅模式里的topic。

有很多个人订阅报纸，也有人可能和我订阅了相同的报纸。

那么，在这里，相当于我们在同一个topic里注册了。对于一份报纸发行方来说，它和所有的订阅者就构成了一个1对多的关系。

这种关系如下图所示：

![2018-08-28-pub-sub.jpg](https://raw.githubusercontent.com/houbb/resource/master/img/jms/2018-08-28-pub-sub.jpg)

## publisher

publisher 是属于发布信息的一方，它通过定义一个或者多个 topic，然后给这些 topic 发送消息。




# 参考资料

- jms

https://zh.wikipedia.org/wiki/Java%E6%B6%88%E6%81%AF%E6%9C%8D%E5%8A%A1

https://www.cnblogs.com/chenpi/p/5559349.html

http://howtodoinjava.com/jms/jms-java-message-service-tutorial/

https://docs.oracle.com/javaee/6/tutorial/doc/bncdr.html

[spring-jms](https://spring.io/guides/gs/messaging-jms/)

- activemq

http://activemq.apache.org/how-should-i-implement-request-response-with-jms.html

https://blog.csdn.net/wilsonke/article/details/42776057



* any list
{:toc}