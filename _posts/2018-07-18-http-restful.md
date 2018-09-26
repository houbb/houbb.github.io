---
layout: post
title:  Http RESTful
date:  2018-07-18 13:44:22 +0800
categories: [Http]
tags: [http, net]
published: true
---

# Http RESTful

## 命名

REST 这个词，是Roy Thomas Fielding在他2000年的[博士论文](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm)中提出的。

Fielding将他对互联网软件的架构原则，定名为REST，即Representational State Transfer的缩写。我对这个词组的翻译是"表现层状态转化"。

如果一个架构符合REST原则，就称它为RESTful架构。

要理解RESTful架构，最好的方法就是去理解Representational State Transfer这个词组到底是什么意思，它的每一个词代表了什么涵义。如果你把这个名称搞懂了，也就不难体会REST是一种什么样的设计。

## 资源（Resources）

REST的名称"表现层状态转化"中，省略了主语。"表现层"其实指的是"资源"（Resources）的"表现层"。

所谓"资源"，就是网络上的一个实体，或者说是网络上的一个具体信息。它可以是一段文本、一张图片、一首歌曲、一种服务，总之就是一个具体的实在。你可以用一个URI（统一资源定位符）指向它，每种资源对应一个特定的URI。要获取这个资源，访问它的URI就可以，因此URI就成了每一个资源的地址或独一无二的识别符。

所谓"上网"，就是与互联网上一系列的"资源"互动，调用它的URI。

## 表现层（Representation）

"资源"是一种信息实体，它可以有多种外在表现形式。我们把"资源"具体呈现出来的形式，叫做它的"表现层"（Representation）。

比如，文本可以用txt格式表现，也可以用HTML格式、XML格式、JSON格式表现，甚至可以采用二进制格式；图片可以用JPG格式表现，也可以用PNG格式表现。

URI只代表资源的实体，不代表它的形式。严格地说，有些网址最后的".html"后缀名是不必要的，因为这个后缀名表示格式，属于"表现层"范畴，而URI应该只代表"资源"的位置。它的具体表现形式，应该在HTTP请求的头信息中用Accept和Content-Type字段指定，这两个字段才是对"表现层"的描述。

## 状态转化（State Transfer）

访问一个网站，就代表了客户端和服务器的一个互动过程。在这个过程中，势必涉及到数据和状态的变化。

互联网通信协议HTTP协议，是一个无状态协议。这意味着，所有的状态都保存在服务器端。因此，如果客户端想要操作服务器，必须通过某种手段，让服务器端发生"状态转化"（State Transfer）。而这种转化是建立在表现层之上的，所以就是"表现层状态转化"。

客户端用到的手段，只能是HTTP协议。具体来说，就是HTTP协议里面，四个表示操作方式的动词：GET、POST、PUT、DELETE。

它们分别对应四种基本操作：GET用来获取资源，POST用来新建资源（也可以用于更新资源），PUT用来更新资源，DELETE用来删除资源。

## 综述

综合上面的解释，我们总结一下什么是RESTful架构：

（1）每一个URI代表一种资源；

（2）客户端和服务器之间，传递这种资源的某种表现层；

（3）客户端通过四个HTTP动词，对服务器端资源进行操作，实现"表现层状态转化"。

# 设计准则

与其他任何体系结构风格一样，REST也有自己的6个指导约束，如果接口需要被称为RESTful，那么这些约束必须得到满足。下面列出了这些原则。

## Client–server 

通过将用户界面关注与数据存储关注分离，我们改进了用户界面跨多个平台的可移植性，并通过简化服务器组件提高了可伸缩性。

## 无状态

从客户端到服务器的每个请求都必须包含理解请求所需的所有信息，并且不能利用服务器上的任何存储上下文。因此，会话状态完全保存在客户机上。

## 可缓存

缓存约束要求响应中的数据被隐式或显式地标记为可缓存或不可缓存。如果响应是可缓存的，那么客户机缓存就有权重用响应数据，以供以后的等效请求使用。

# 统一接口

将软件工程的通用性原理应用到组件接口上，简化了整个系统体系结构，提高了交互的可见性。

为了获得统一的接口，需要多个体系结构约束来指导组件的行为。REST由四个接口约束定义:资源标识;通过表示操纵资源;自描述信息;超媒体作为应用状态的引擎。

## 分层系统

分层系统风格允许体系结构由分层层组成，方法是约束组件行为，使每个组件不能“看到”与其交互的直接层之外的其他层。

## 随需应变代码(可选)

REST允许通过下载并以applet或脚本的形式执行代码来扩展客户端功能。这通过减少需要预先实现的特性的数量来简化客户端。

# 设计误区

RESTful架构有一些典型的设计误区。

## URI 包含动词

最常见的一种设计错误，就是URI包含动词。

**因为"资源"表示一种实体，所以应该是名词，URI不应该有动词，动词应该放在HTTP协议中**。

举例来说，某个URI是/posts/show/1，其中show是动词，这个URI就设计错了，正确的写法应该是/posts/1，然后用GET方法表示show。

如果某些动作是HTTP动词表示不了的，你就应该把动作做成一种资源。比如网上汇款，从账户1向账户2汇款500元，错误的URI是：

```
POST /accounts/1/transfer/500/to/2
```

正确的写法是把动词transfer改成名词transaction，资源不能是动词，但是可以是一种服务：

```
POST /transaction HTTP/1.1
Host: 127.0.0.1

from=1&to=2&amount=500.00
```


## URI 包含版本

至于这一点，是有争议的。

可以参考 [how-to-version-rest-uris](http://stackoverflow.com/questions/972226/how-to-version-rest-uris)

另一个设计误区，就是在URI中加入版本号：

```
http://www.example.com/app/1.0/foo

http://www.example.com/app/1.1/foo

http://www.example.com/app/2.0/foo
```

因为不同的版本，可以理解成同一种资源的不同表现形式，所以应该采用同一个URI。

版本号可以在HTTP请求头信息的Accept字段中进行区分（参见 [Versioning REST Services](http://www.informit.com/articles/article.aspx?p=1566460)）：

```
Accept: vnd.example-com.foo+json; version=1.0
Accept: vnd.example-com.foo+json; version=1.1
Accept: vnd.example-com.foo+json; version=2.0
```

# 常见问题

# 拓展阅读

[幂等性](https://houbb.github.io/2018/09/02/idempotency-patterns)

[Github Api 设计](https://developer.github.com/v3/)

[HTTP 常见错误码](https://httpstatuses.com/)

# 参考资料

[理解RESTful架构](http://www.ruanyifeng.com/blog/2011/09/restful.html)

[怎样用通俗的语言解释REST，以及RESTful？](https://www.zhihu.com/question/28557115)

[RESTful API](https://restfulapi.net/)

[设计准则](https://restfulapi.net/rest-architectural-constraints/)

[RESTful API 参考文献](https://github.com/aisuhua/restful-api-design-references)

* any list
{:toc}