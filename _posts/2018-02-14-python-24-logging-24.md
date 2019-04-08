---
layout: post
title: Python-24-logging 日志处理
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, log, sh]
published: true
---

# 日志的作用

作为一名 java 程序员，我深知日志的重要性。

为问题的排查和问题的追踪提供了高效而优雅的方式。

下面来一起看一下 python 的日志处理吧。

ps: 本文暂时不仔细研究每一个配置的信息，在使用中慢慢学习。毕竟 python 的 logging 和 java 的各种日志卷框架思想非常类似。

# logging

## 标准模块简介

[logging](https://docs.python.org/zh-cn/3/library/logging.html#module-logging) 模块提供功能齐全且灵活的日志记录系统。

在最简单的情况下，日志消息被发送到文件或 sys.stderr

## 入门例子

```py
import logging
logging.debug('Debugging information')
logging.info('Informational message')
logging.warning('Warning:config file %s not found', 'server.conf')
logging.error('Error occurred')
logging.critical('Critical error -- shutting down')
```

产生的日志如下：

```
WARNING:root:Warning:config file server.conf not found
ERROR:root:Error occurred
CRITICAL:root:Critical error -- shutting down
```

默认情况下，informational 和 debugging 消息被压制，输出会发送到标准错误流。

其他输出选项包括将消息转发到电子邮件，数据报，套接字或 HTTP 服务器。

新的过滤器可以根据消息优先级选择不同的路由方式：DEBUG，INFO，WARNING，ERROR，和 CRITICAL。

日志系统可以直接从 Python 配置，也可以从用户配置文件加载，以便自定义日志记录而无需更改应用程序。

## 日志级别

日志记录级别的数值在下表中给出。

如果你想要定义自己的级别，并且需要它们具有相对于预定义级别的特定值，那么这些内容可能是你感兴趣的。

如果你定义具有相同数值的级别，它将覆盖预定义的值; 预定义的名称丢失。

```
级别	数值
CRITICAL	50
ERROR	40
WARNING	30
INFO	20
DEBUG	10
NOTSET	0
```

# loguru

看了一下，也许是 python 的官方 logging 包做的比较好吧，pyhton 的框架选择并不多。

loguru 就是一个例子。

## 快速开始

### 安装

```
pip install loguru
```

### 入门例子

```
>>> from loguru import logger
>>> logger.debug("That's it, beautiful and simple logging!")
2019-04-08 18:57:23.462 | DEBUG    | __main__:<module>:1 - That's it, beautiful and simple logging!
```

## 其他

这个框架还提供了其他一系列灵活的方法。

可以参见 [https://github.com/Delgan/loguru](https://github.com/Delgan/loguru)。


# logbook

也是一款开源，非常优秀的日志框架。

## 简介

[Logbook](https://logbook.readthedocs.io/en/stable/index.html#) is a logging system for Python that replaces the standard library’s logging module. It was designed with both complex and simple applications in mind and the idea to make logging fun:

## 快速入门

```py
>>> from logbook import Logger, StreamHandler
>>> import sys
>>> StreamHandler(sys.stdout).push_application()
>>> log = Logger('Logbook')
>>> log.info('Hello, World!')
[2015-10-05 18:55:56.937141] INFO: Logbook: Hello, World!
```

## 个人感觉

我觉得这个框架做的没有 loguru 优雅。

# 参考资料

![https://blog.csdn.net/chengxuyuan997/article/details/81627210](https://blog.csdn.net/chengxuyuan997/article/details/81627210)

- github

[loguru](https://github.com/Delgan/loguru)

- other

[Python之日志处理（logging模块）](https://www.cnblogs.com/yyds/p/6901864.html)

* any list
{:toc}