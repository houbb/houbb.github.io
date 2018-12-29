---
layout: post
title: 日志归档
date: 2018-12-29 13:17:49 +0800
categories: [Log]
tags: [log, sh]
published: true
excerpt: 日志归档
---

# 日志归档

## 应用场景

- 便于查阅

当日志的量比较大，而且长时间累计下来，全部放在一起就不利于查阅，就需要分类保存。

比如按照时间。

按照不同的包信息。

- 减小量

为了保证历史的日志信息，就要全部保存，量特别大，就需要压缩。

- 分布式中

分布式系统中，一个服务有多个负载均衡的服务。

如果日志不做总的汇总，一个个服务器查，太过于麻烦，效率极低。

现在主流是 kibana。

## 日志框架本身

很多日志本身就是自带归档的。

[log4j](https://houbb.github.io/2017/09/17/log4j)

[logback 配置](https://houbb.github.io/2018/11/19/logback-09-in-action)

[log4j2](https://houbb.github.io/2016/05/21/Log4j2)

## 日志查询的框架

[Kibana](https://houbb.github.io/2016/10/16/kibana)


# 日志归档的几个问题

## 日志归档谁来做？

机器自动去做，人负责抽样检查。

## 怎么做呢？

日志归档常用方法：

1. ftp 定是下载， 这种做法适合小文件且日志量不大，定是下载到指定服务器，缺点是重复传输，实时性差。

2. rsyslog 一类的程序，比较通用，但扩展不便。

3. rsync 定是同步，适合打文件同步，好于FTP，实时性差。


为了便于查询，可以将日志结合 [kafka]() 或者日志本身，结合日志收集器 [logstash](https://houbb.github.io/2016/10/16/logstash)、
[filebeta](https://houbb.github.io/2018/11/21/fishbeta)，

利用 [elasticsearch](https://houbb.github.io/2018/11/15/elasticsearch) 为日志信息建立索引，

利用 [kibana](https://houbb.github.io/2016/10/16/kibana) 对日志信息进行展现。

ps: 看起来最后日志使用起来很方便，但是引入了太多的中间件，加大了系统的复杂度。

# 直接存储到数据库

对于核心的信息，我们可以直接将日志存入 mongo 数据库。

[log4j2 和 mongo 数据库的结合](https://houbb.github.io/2017/05/31/mongodb-08-log4j2)

## 格式

规定好日志的规范。

这一层一定要封装在日志框架层，开发是不需要关心的。

# 参考资料

[利用批处理对日志归档](https://yq.aliyun.com/articles/477012)

[日志归档与数据挖掘](http://www.netkiller.cn/journal/log.html)



* any list
{:toc}