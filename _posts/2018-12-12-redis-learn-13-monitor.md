---
layout: post
title: Redis Learn-13-Monitor 监视器
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# 监视器 

通过执行 MONITOR 命令， 客户端可以将自己变为一个监视器， 实时地接收并打印出服务器当前处理的命令请求的相关信息：

```
redis> MONITOR
OK
1378822099.421623 [0 127.0.0.1:56604] "PING"
1378822105.089572 [0 127.0.0.1:56604] "SET" "msg" "hello world"
1378822109.036925 [0 127.0.0.1:56604] "SET" "number" "123"
1378822140.649496 [0 127.0.0.1:56604] "SADD" "fruits" "Apple" "Banana" "Cherry"
1378822154.117160 [0 127.0.0.1:56604] "EXPIRE" "msg" "10086"
1378822257.329412 [0 127.0.0.1:56604] "KEYS" "*"
1378822258.690131 [0 127.0.0.1:56604] "DBSIZE"
```

每当一个客户端向服务器发送一条命令请求时， 服务器除了会处理这条命令请求之外， 还会将关于这条命令请求的信息发送给所有监视器， 如图 24-1 所示。

![MONITOR](http://redisbook.com/_images/graphviz-0a684588293c799f804995f27a2dd6f9da407f8e.png)

# 成为监视器

发送 MONITOR 命令可以让一个普通客户端变为一个监视器， 该命令的实现原理可以用以下伪代码来实现：

```c
def MONITOR():

    # 打开客户端的监视器标志
    client.flags |= REDIS_MONITOR

    # 将客户端添加到服务器状态的 monitors 链表的末尾
    server.monitors.append(client)

    # 向客户端返回 OK
    send_reply("OK")
```

举个例子， 如果客户端 c10086 向服务器发送 MONITOR 命令， 那么这个客户端的 REDIS_MONITOR 标志会被打开， 并且这个客户端本身会被添加到 monitors 链表的表尾。

假设客户端 c10086 发送 MONITOR 命令之前， monitors 链表的状态如图 24-2 所示， 那么在服务器执行客户端 c10086 发送的 MONITOR 命令之后， monitors 链表将被更新为图 24-3 所示的状态。

![BEFORE_MONITOR](http://redisbook.com/_images/graphviz-be871c3776e6224a04c4091181bb5840704c054b.png)

![AFTER_MONITOR](http://redisbook.com/_images/graphviz-01c46b55b5adefb2527bf027a73b5e3c725e2255.png)

# 向监视器发送命令信息

服务器在每次处理命令请求之前， 都会调用 replicationFeedMonitors 函数， 由这个函数将被处理命令请求的相关信息发送给各个监视器。

以下是 replicationFeedMonitors 函数的伪代码定义， 函数首先根据传入的参数创建信息， 然后将信息发送给所有监视器：

```c
def replicationFeedMonitors(client, monitors, dbid, argv, argc):

    # 根据执行命令的客户端、当前数据库的号码、命令参数、命令参数个数等参数
    # 创建要发送给各个监视器的信息
    msg = create_message(client, dbid, argv, argc)

    # 遍历所有监视器
    for monitor in monitors:

        # 将信息发送给监视器
        send_message(monitor, msg)
```

举个例子， 假设服务器在时间 1378822257.329412 ， 根据 IP 为 127.0.0.1 、端口号为 56604 的客户端发送的命令请求， 对 0 号数据库执行命令 KEYS * ， 那么服务器将创建以下信息：

```
1378822257.329412 [0 127.0.0.1:56604] "KEYS" "*"
```

如果服务器 monitors 链表的当前状态如图 24-3 所示， 那么服务器会分别将信息发送给 c128 、 c256 、 c512 和 c10086 四个监视器， 如图 24-4 所示。

![monitors 链表](http://redisbook.com/_images/graphviz-9f7dd9796b33d69dd221559a21be656d30fec0d7.png)

# 重点回顾

客户端可以通过执行 MONITOR 命令， 将客户端转换成监视器， 接收并打印服务器处理的每个命令请求的相关信息。

当一个客户端从普通客户端变为监视器时， 该客户端的 REDIS_MONITOR 标识会被打开。

服务器将所有监视器都记录在 monitors 链表中。

每次处理命令请求时， 服务器都会遍历 monitors 链表， 将相关信息发送给监视器。

# 参考资料

[监视器](http://redisbook.com/preview/monitor/content.html)

[向监视器发送命令信息](http://redisbook.com/preview/monitor/propagate_command.html)

* any list
{:toc}