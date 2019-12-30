---
layout: post
title: Docker learn-09-Docker 基本原理 Linux Namespace
date:  2019-12-18 10:50:21 +0800
categories: [Devpos]
tags: [docker, windows, devops, sh]
published: true
---

# Docker 

时下最热的技术莫过于Docker了，很多人都觉得Docker是个新技术，其实不然，Docker除了其编程语言用go比较新外，其实它还真不是个新东西，也就是个新瓶装旧酒的东西，所谓的The New “Old Stuff”。

ps: 这里也可以发现我们平时对于新技术的一直追求，其实只是因为**没有掌握其核心原理而已**。

Docker和Docker衍生的东西用到了很多很酷的技术，我会用几篇文章来把这些技术给大家做个介绍，希望通过这些文章大家可以自己打造一个山寨版的docker。

## 碎片化

当然，文章的风格一定会尊重时下的“流行”——我们再也没有整块整块的时间去看书去专研，而我们只有看微博微信那样的碎片时间（那怕我们有整块的时间，也被那些在手机上的APP碎片化了）。

所以，这些文章的风格必然坚持“马桶风格”（希望简单到占用你拉一泡屎就时间，而且你还不用动脑子，并能学到些东西）

废话少说，我们开始。先从Linux Namespace开始。

ps: 其实我们每天都有整块的时间，我感觉作者这里是明显的讽刺。

不过博客就应该这样循循善诱，深入浅出。

# Linux Namespace

## 简介

Linux Namespace是Linux提供的一种内核级别环境隔离的方法。

不知道你是否还记得很早以前的Unix有一个叫chroot的系统调用（通过修改根目录把用户jail到一个特定目录下），chroot提供了一种简单的隔离模式：

chroot内部的文件系统无法访问外部的内容。

Linux Namespace在此基础上，提供了对UTS、IPC、mount、PID、network、User等的隔离机制。

举个例子，我们都知道，Linux下的超级父亲进程的PID是1，所以，同chroot一样，如果我们可以把用户的进程空间jail到某个进程分支下，并像chroot那样让其下面的进程 看到的那个超级父进程的PID为1，于是就可以达到资源隔离的效果了（不同的PID namespace中的进程无法看到彼此）

ps: 因为没有 linux 相关知识基础，学习起来比较吃力，暂时停止学习。

# 参考资料

[DOCKER基础技术：LINUX NAMESPACE（上）](https://coolshell.cn/articles/17010.html)

[DOCKER基础技术：LINUX NAMESPACE（下）](https://coolshell.cn/articles/17029.html)

# 拓展阅读

[code shell docker 系列博客](https://coolshell.cn/tag/docker)

* any list
{:toc}