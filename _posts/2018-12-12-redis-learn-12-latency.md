---
layout: post
title: Redis Learn-12-latency
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---


# 慢操作的定位

在定位慢操作的时候，我们经常根据 [slowlog](https://houbb.github.io/2018/12/12/redis-learn-12-slow-log) 去定位

但是一个执行操作，如果是等待的时间过长，slowlog 是不进行记录的。

slowlog 仅仅记录动作的执行时间。

latency 就是为了解决这个问题而生的。

# Redis latency monitoring framework

Redis is often used in the context of demanding（严格的） use cases, where it serves a big amount of queries per second per instance, and at the same time, there are very strict latency（严格的延迟） requirements both for the average response time and for the worst case latency.

While Redis is an in memory system, it deals with the operating system in different ways, for example, in the context of persisting to disk. 

Moreover Redis implements a rich set of commands. 

Certain commands are fast and run in constant or logarithmic time, other commands are slower `O(N)` commands, that can cause latency spikes（延迟峰值）.

Finally Redis is single threaded: this is usually an advantage from the point of view of the amount of work it can perform per core, and in the latency figures it is able to provide, but at the same time it poses a challenge from the point of view of latency, since the single thread must be able to perform certain tasks incrementally, like for example keys expiration, in a way that does not impact the other clients that are served.

## 新特性的引入

For all these reasons, Redis 2.8.13 introduced a new feature called Latency Monitoring, that helps the user to check and troubleshoot（解决） possible latency problems. 


## 组成部分

Latency monitoring is composed of the following conceptual parts:

- Latency hooks that sample different latency sensitive code paths.

- Time series recording of latency spikes split by different event.

- Reporting engine to fetch raw data from the time series.

- Analysis engine to provide human readable reports and hints according to the measurements.

The remaining part of this document covers the latency monitoring subsystem details, 
however for more information about the general topic of Redis and latency, 
please read the Redis latency problems troubleshooting page in this documentation.

# Events and time series

Different monitored code paths have different names, and are called events（事件）. 

For example command is an event measuring latency spikes of possibly slow commands executions, while fast-command is the event name for the monitoring of the O(1) and O(log N) commands. 

Other events are less generic, and monitor a very specific operation performed by Redis. 

For example the fork event only monitors the time taken by Redis to execute the fork(2) system call.

A latency spike is an event that runs in more time than the configured latency threshold. 

There is a separated time series associated with every monitored event. 

## 时间序列工作原理

This is how the time series work:

Every time a latency spike happens, it is logged in the appropriate time series.

Every time series is composed of 160 elements.

Each element is a pair: an unix timestamp of the time the latency spike was measured, and the number of milliseconds the event took to executed.

Latency spikes for the same event happening in the same second are merged (by taking the maximum latency), so even if continuous latency spikes are measured for a given event, for example because the user set a very low threshold, at least 180 seconds of history are available.

For every element the all-time maximum latency is recorded.

每次发生延迟峰值时，都会记录在适当的时间序列中。

每个时间系列由160个元素组成。

每个元素都是一对：测量延迟峰值的时间的unix时间戳，以及事件执行所用的毫秒数。

在同一秒内发生的同一事件的延迟峰值被合并（通过采用最大延迟），因此即使针对给定事件测量连续延迟峰值，例如因为用户设置了非常低的阈值，至少180秒 历史可用。

对于每个元素，记录所有时间最大延迟。

# 启用 latency monitor

What is high latency for an use case, is not high latency for another. 

There are applications where all the queries must be served in less than 1 millisecond and applications where from time to time a small percentage of clients experiencing a 2 seconds latency is acceptable.

有些应用程序必须在不到1毫秒的时间内提供所有查询，并且有些应用程序可能会有一小部分客户端遇到2秒延迟。

## 阈值的设定

So the first step to enable the latency monitor is to set a latency threshold in milliseconds. 

Only events that will take more than the specified threshold will be logged as latency spikes. 

ps: 根据实际需求，一般单位是微秒。

The user should set the threshold according to its needs. 

## 例子

For example if for the requirements of the application based on Redis the maximum acceptable latency is 100 milliseconds, the threshold should be set to such a value in order to log all the events blocking the server for a time equal or greater to 100 milliseconds.

The latency monitor can easily be enabled at runtime in a production server with the following command:

```
CONFIG SET latency-monitor-threshold 100
```

By default monitoring is disabled (threshold set to 0), even if the actual cost of latency monitoring is near zero. 

However while the memory requirements of latency monitoring are very small, there is no good reason to raise the baseline memory usage of a Redis instance that is working well.

但是，虽然延迟监视的内存要求非常小，但没有充分的理由提高运行良好的Redis实例的基线内存使用率。

ps: 也就是虽然 monitor 使用的内存很小，但是如果 redis 运行良好，是没有必要开启这种监控的。


# 常见命令

## LATENCY

The user interface to the latency monitoring subsystem is the LATENCY command. 

Like many other Redis commands, LATENCY accept subcommands that modify the behavior of the command. 

The next sections document each subcommand.

## LATENCY LATEST

The LATENCY LATEST command reports the latest latency events logged. 

- 事件组成

Each event has the following fields:

- Event name.

- Unix timestamp of the latest latency spike for the event.

- Latest event latency in millisecond.

- All time maximum latency for this event.

All time does not really mean the maximum latency since the Redis instance was started, because it is possible to reset events data using LATENCY RESET as we'll see later.

### 例子

The following is an example output:

```
127.0.0.1:6379> debug sleep 1
OK
(1.00s)
127.0.0.1:6379> debug sleep .25
OK
127.0.0.1:6379> latency latest
1) 1) "command"
   2) (integer) 1405067976
   3) (integer) 251
   4) (integer) 1001
```

## LATENCY HISTORY event-name

The LATENCY HISTORY command is useful in order to fetch raw data from the event time series, as timestamp-latency pairs. 

The command will return up to 160 elements for a given event. 

An application may want to fetch raw data in order to perform monitoring, display graphs, and so forth.

### 例子

Example output:

```
127.0.0.1:6379> latency history command
1) 1) (integer) 1405067822
   2) (integer) 251
2) 1) (integer) 1405067941
   2) (integer) 1001
```

## LATENCY RESET [event-name ... event-name]

The LATENCY RESET command, if called without arguments, resets all the events, discarding the currently logged latency spike events, and resetting the maximum event time register.

It is possible to reset only specific events by providing the event names as arguments. 

The command returns the number of events time series that were reset during the command execution.

## LATENCY GRAPH event-name

Produces an ASCII-art style graph for the specified event:

### 例子

```
127.0.0.1:6379> latency reset command
(integer) 0
127.0.0.1:6379> debug sleep .1
OK
127.0.0.1:6379> debug sleep .2
OK
127.0.0.1:6379> debug sleep .3
OK
127.0.0.1:6379> debug sleep .5
OK
127.0.0.1:6379> debug sleep .4
OK
127.0.0.1:6379> latency graph command
command - high 500 ms, low 101 ms (all time high 500 ms)
--------------------------------------------------------------------------------
   #_
  _||
 _|||
_||||

11186
542ss
sss
```

- 解释说明

The vertical labels under each graph column represent the amount of seconds, minutes, hours or days ago the event happened. 

For example "15s" means that the first graphed event happened 15 seconds ago.

The graph is normalized in the min-max scale so that the zero (the underscore in the lower row) is the minimum, and a # in the higher row is the maximum.

The graph subcommand is useful in order to get a quick idea about the trend of a given latency event without using additional tooling, and without the need to interpret raw data as provided by LATENCY HISTORY.

## LATENCY DOCTOR

The LATENCY DOCTOR command is the most powerful analysis tool in the latency monitoring, and is able to provide additional statistical data like the average period between latency spikes, the median deviation, and an human readable analysis of the event. 

ps: 可以提供有效的建议信息，非常的强大。

For certain events, like fork, additional information is provided, like the rate at which the system forks processes.

This is the output you should post in the Redis mailing list if you are looking for help about Latency related issues.

### 例子

Example output:

```
127.0.0.1:6379> latency doctor

Dave, I have observed latency spikes in this Redis instance.
You don't mind talking about it, do you Dave?

1. command: 5 latency spikes (average 300ms, mean deviation 120ms,
   period 73.40 sec). Worst all time event 500ms.

I have a few advices for you:

- Your current Slow Log configuration only logs events that are
  slower than your configured latency monitor threshold. Please
  use 'CONFIG SET slowlog-log-slower-than 1000'.
- Check your Slow Log to understand what are the commands you are
  running which are too slow to execute. Please check
  http://redis.io/commands/slowlog for more information.
- Deleting, expiring or evicting (because of maxmemory policy)
  large objects is a blocking operation. If you have very large
  objects that are often deleted, expired, or evicted, try to
  fragment those objects into multiple smaller objects.
```

The doctor has erratic psychological（不稳定的心理） behaviors, so we recommend interacting with it carefully.

# 参考资料

[latency](https://redis.io/topics/latency-monitor)

* any list
{:toc}