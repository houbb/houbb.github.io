---
layout: post
title: 分布式 Session 共享的解决方案
date:  2018-09-26 13:56:24 +0800
categories: [Web]
tags: [web, session, distributed, sh]
published: true
---

# Session 共享

## 背景

随着互联网的日益壮大,网站的pv和uv成线性或者指数倍的增加.单服务器单数据库早已经不能满足实际需求。

目前大多数大型网站的服务器都采用了分布式服务集群的部署方式，所谓集群，就是让一组计算机服务器协同工作，解决大并发,大数据量瓶颈问题。

但是在服务集群中，session共享往往是一个比较头疼的问题。

因为session是在服务器端保存的，如果用户跳转到其他服务器的话，session就会丢失，一般情况下，session不可跨服务器而存在。于是就有了分布式系统的session共享问题。

## 解决方案

Session共享有多种解决方法，常用的有四种：客户端Cookie保存、服务器间Session同步、使用集群管理Session、把Session持久化到数据库。

下面分别就这四种方案进行介绍和比较。

# 客户端 Cookie 保存

## 解决方案

以 cookie 加密的方式保存在客户端。

## 优点

优点是减轻服务器端的压力，每次session信息被写在客服端,然后经浏览器再次提交到服务器。即使两次请求在集群中的两台服务器上完成，也可以到达session共享。

这种解决方法的优点是session信息不用存放在服务器端，大大减轻了服务器的压力。

另一个优点是一个session中的两次或多次请求可以在一个集群中的多个服务器上完成，可以避免单点故障。

目前，淘宝是采用的这种解决方案。

## 缺点

一是传递cookie时，http信息头的长度限制使我们只能够在cookie中存入一部分用户信息；

二是需要额外地做session信息加密的工作；

第三，如果采用这种方式，每次访问网站二级域名时都会在http信息头中带有这些以cookie形式存储的session信息，会占用一定的带宽；

最后，由于这种方式是在客户端进行信息存储，用户完全可以禁用cookie或删除cookie，不是很可靠。

## 个人想法

[JWT](https://houbb.github.io/2018/03/25/jwt) 就很好的解决了上面的问题。

# 服务器间 Session 同步

使用主-从服务器的架构，当用户在主服务器上登录后，通过脚本或者守护进程的方式，将session信息传递到各个从服务器中，这样，用户访问其它的从服务器时，就可以读到session信息。

缺点：比如速度慢、不稳定等，另外，如果session信息传递是主->从单向的，会有一些风险，比如主服务器down了，其它服务器无法获得session信息

# 使用集群统一管理 Session

## 介绍说明

提供一个群集保存session共享信息。

其他应用统统把自己的session信息存放到session集群服务器组。当应用系统需要session信息的时候直接到session群集服务器上读取。目前大多都是使用Memcache来对Session进行存储。

以Memcache来实现Session共享的方式目前比较流行的有两种实现方案，下面主要对这两种方案进行介绍。

当然也可以使用 Redis 来实现。

## 使用 Filter 方式

此方式使用过滤器的方式重新对httpRequest 对象进行了包装，并加入memcached客户端,

此方式的优点是：使用简单，把过滤器配置进去即可，另外比较灵活，因为它是在客户端实现的，配置比较灵活,而且服务器无关，你可以在任何支持servlet的容器上部署。

## memcached-session-manager（MSM）

memcached-session-manager，俗称MSM，是一个用于解决分布式tomcat环境下session共享的问题的开源解决方案。

它的实现原理为以tomcat插件的方式部署在服务器，修改了servlet容器代码中的session相关代码，使其连接memcached，在memcached中创建和更新session。

MSM拥有如下特性：

- 支持Tomcat6、Tomcat7

- 支持黏性、非黏性Session

- 无单一故障点

- 可处理tomcat故障转移

- 可处理memcached故障转移

- 插件式session序列化

- 允许异步保存session，以提升响应速度

- 只有当session有修改时，才会将session写回memcached

- MX管理&监控

MSM(memcached-session-manager) 支持tomcat6 和tomcat7 ，利用 Value（Tomcat 阀）对Request进行跟踪。Request请求到来时，从memcached加载session，Request请求结束时，将tomcat session更新至memcached，以达到session共享之目的， 支持 sticky  和 non-sticky 模式。

- 优点

优点：开发者不用考虑session共享的问题了,可以专注于程序开发，像正常使用session那样使用就完事了。不用显示编写代码，只需要对服务器进行配置即可使用。

- 缺点

缺点：如果你想改变session策略的话，必须重新部署每个服务器的servlet容器。

可参见：[memcached-session-manager](https://code.google.com/archive/p/memcached-session-manager/)

# 持久化到数据库

## 介绍说明

这种共享session的方式即将session信息存入数据库中，其它应用可以从数据库中查出session信息。

目前采用这种方案时所使用的数据库一般为mysql。

利用数据库共享session的方案有一定的实用性，但也有如下缺点

## 缺点

首先session的并发读写在数据库中完成，对mysql的性能要求比较高；

其次，我们需要额外地实现session淘汰逻辑代码，即定时从数据库表中更新和删除session信息，增加了工作量

# 拓展阅读

[JWT](https://houbb.github.io/2018/03/25/jwt)

[Spring Session](https://houbb.github.io/2018/09/26/spring-session)

# 参考资料

[Session共享实现方案调研](http://chenzhou123520.iteye.com/blog/1647186)

[Tomcat多实例Session共享的原理](https://zhuanlan.zhihu.com/p/20945322)

[用Nginx+Redis实现session共享的均衡负载](https://segmentfault.com/a/1190000004708640)

[搭建Nginx（负载均衡）+Redis（Session共享）+Tomcat集群](https://www.cnblogs.com/zhengbin/p/5488570.html)

* any list
{:toc}