---
layout: post
title: message 顺序性如何保证？
date: 2019-1-7 19:29:47 +0800
categories: [Distributed]
tags: [distributed, sh]
published: true
excerpt: message 顺序性如何保证？
---

# 问题

很多业务都需要考虑消息投递的顺序性：

单聊消息投递，保证发送方发送顺序与接收方展现顺序一致

群聊消息投递，保证所有接收方展现顺序一致

充值支付消息，保证同一个用户发起的请求在服务端执行序列一致

消息顺序性是分布式系统架构设计中非常难的问题，有什么常见优化实践呢？

# 折衷一：以客户端或者服务端的时序为准

不管什么情况，都需要一个标尺来衡量时序的先后顺序，可以根据业务场景，以客户端或者服务端的时间为准，例如：

邮件展示顺序，其实是以客户端发送时间为准的

画外音：发送方只要将邮件协议里的时间调整为1970年或者2970年，就可以在接收方收到邮件后一直“置顶”或者“置底”。

秒杀活动时间判断，肯定得以服务器的时间为准，不可能让客户端修改本地时间，就能够提前秒杀

# 折衷二：服务端生成单调递增id作为时序依据

对于严格时序的业务场景，可以利用单点写db的seq/auto_inc_id生成单调递增的id，来保证顺序性。

画外音：这个生成id的单点容易成为瓶颈。

# 折衷三：假如业务能接受误差不大的趋势递增id

消息发送、帖子发布时间、甚至秒杀时间都没有这么精准时序的要求：

同1s内发布的聊天消息时序乱了，没事

同1s内发布的帖子排序不对，没事

用1s内发起的秒杀，由于服务器多台之间时间有误差，落到A服务器的秒杀成功了，落到B服务器的秒杀还没开始，业务上也是可以接受的（用户感知不到）

所以，大部分业务，长时间趋势递增的时序就能够满足业务需求，非常短时间的时序误差一定程度上能够接受。

于是，可以始终分布式id生成算法来生成id，作为时序依据。

# 折衷四：利用单点序列化，可以保证多机相同时序

数据为了保证高可用，需要做到进行数据冗余，同一份数据存储在多个地方，怎么保证这些数据的修改消息是一致的呢？

“单点序列化”是可行的：

先在一台机器上序列化操作

再将操作序列分发到所有的机器，以保证多机的操作序列是一致的，最终数据是一致的

# 典型场景

## 典型场景一：数据库主从同步

![数据库主从同步](https://mmbiz.qpic.cn/mmbiz_png/YrezxckhYOxgwjQ40cYZ5kboF3ibrNVScND55fzKHkV98QRHK1GH6CpLqEWTkwAQDMx6Dq9ibQdPYLU7SibAz0oog/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

数据库的主从架构，上游分别发起了op1,op2,op3三个操作，主库master来序列化所有的SQL写操作op3,op1,op2，然后把相同的序列发送给从库slave执行，以保证所有数据库数据的一致性，就是利用“单点序列化”这个思路。

## 典型场景二：GFS中文件的一致性

![GFS中文件的一致性](https://mmbiz.qpic.cn/mmbiz_jpg/YrezxckhYOxTAk0N76J2iaXWDNXlxhkpQjGGm9lOhiaYcicLdecsEsaCXwKSA7zb24hQUHYOquibsia7icwWv3LyPLiaA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

GFS(Google File System)为了保证文件的可用性，一份文件要存储多份，在多个上游对同一个文件进行写操作时，也是由一个主chunk-server先序列化写操作，再将序列化后的操作发送给其他chunk-server，来保证冗余文件的数据一致性的。

# 单对单聊天，怎么保证发送顺序与接收顺序一致呢？

单人聊天的需求，发送方A依次发出了msg1，msg2，msg3三个消息给接收方B，这三条消息能否保证显示时序的一致性（发送与显示的顺序一致）？

方案设计思路如下：

（1）如果利用服务器单点序列化时序，可能出现服务端收到消息的时序为msg3，msg1，msg2，就会与发出序列不一致。

（2）业务上不需要全局消息一致，只需要对于同一个发送方A，ta发给B的消息时序一致，常见优化方案，在A往B发出的消息中，加上发送方A本地的一个绝对时序，来表示接收方B的展现时序。

```
msg1{sender:A, seq:10, receiver:B, msg:content1}

msg2{sender:A, seq:20, receiver:B, msg:content2}

msg3{sender:A, seq:30, receiver:B, msg:content3}
```

![单对单聊天](https://mmbiz.qpic.cn/mmbiz_png/YrezxckhYOxgwjQ40cYZ5kboF3ibrNVScZrrhWpjsMQ9s6wdf8BgodTbsTC3GWIC3ib1sRPyW3z26tgoOxg3QxmA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

可能存在问题是：如果接收方B先收到msg3，msg3会先展现，后收到msg1和msg2后，会展现在msg3的前面。

# 群聊消息，怎么保证各接收方收到顺序一致？

群聊消息的需求，N个群友在一个群里聊，怎么保证所有群友收到的消息显示时序一致？

方案设计思路如下：

（1）假设和单聊消息一样，利用发送方的seq来保证时序，因为发送方不单点，seq无法统一生成，可能存在不一致。

（2）于是，可以利用服务器的单点做序列化。

![群聊消息](https://mmbiz.qpic.cn/mmbiz_png/YrezxckhYOxgwjQ40cYZ5kboF3ibrNVScsWzr8Ez2ibibTnLR0CRM5aVcTW4PHS4bBmCsrwtH0gUHnOh0Ks2kAgNg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

如上图，此时群聊的发送流程为：

（1）sender1发出msg1，sender2发出msg2；

（2）msg1和msg2经过接入集群，服务集群；

（3）service层到底层拿一个唯一seq，来确定接收方展示时序；

（4）service拿到msg2的seq是20，msg1的seq是30；

（5）通过投递服务讲消息给多个群友，群友即使接收到msg1和msg2的时间不同，但可以统一按照seq来展现；

这个方法能实现，所有群友的消息展示时序相同。

缺点是，生成全局递增序列号的服务很容易成为系统瓶颈。

## 还有没有进一步的优化方法呢？ 

群消息其实也不用保证全局消息序列有序，而只要保证一个群内的消息有序即可，这样的话，“id串行化”就成了一个很好的思路。

![进一步的优化方法](https://mmbiz.qpic.cn/mmbiz_png/YrezxckhYOxgwjQ40cYZ5kboF3ibrNVScs8xKHzbL4L5W922Vy1rI3BhKxSCd3icYTfb6T0Rb7uibCaKsx5zw7XSw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

这个方案中，service层不再需要去一个统一的后端拿全局seq，而是在service连接池层面做细小的改造，保证一个群的消息落在同一个service上，这个service就可以用本地seq来序列化同一个群的所有消息，保证所有群友看到消息的时序是相同的。

此时利用本地时钟来生成seq就凑效了，是不是很巧妙？

# 总结

（1）要“有序”，先得有衡量“有序”的标尺，可以是客户端标尺，可以是服务端标尺；

（2）大部分业务能够接受大范围趋势有序，小范围误差；绝对有序的业务，可以借助服务器绝对时序的能力；

（3）单点序列化，是一种常见的保证多机时序统一的方法，典型场景有db主从一致，gfs多文件一致；

（4）单对单聊天，只需保证发出的时序与接收的时序一致，可以利用客户端seq；

（5）群聊，只需保证所有接收方消息时序一致，需要利用服务端seq，方法有两种，一种单点绝对时序，另一种id串行化；

# 参考资料

[消息顺序性为何这么难？](https://mp.weixin.qq.com/s/wF-jqn9QZAC8qsof3aAPoQ)

* any list
{:toc}

