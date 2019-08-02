---
layout: post
title: Redis Learn-35-bigkey 与 lazy free
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, in-action, sh]
published: false
---


# 处理bigkey

bigkey是指key对应的value所占的内存空间比较大。

例如一个字符串类 型的value可以最大存到512MB，一个列表类型的value最多可以存储232-1个元素。

如果按照数据结构来细分的话，一般分为字符串类型bigkey和非字符串类型bigkey。

## 危害

bigkey的危害体现在三个方面：

## 内存空间不均匀（平衡）：

例如在Redis Cluster中，bigkey会造成节点的内存空间使用不均匀。

## 超时阻塞：

由于Redis单线程的特性，操作bigkey比较耗时，也就意味着阻塞Redis可能性增大。

## 网络拥塞：

每次获取bigkey产生的网络流量较大，假设一个bigkey为1MB，每秒访问量为1000，那么每秒产生1000MB的流量，对于普通的千兆网卡（按照字节算是128MB/s）的服务器来说简直是灭顶之灾，而且一般服务器会采用单机多实例的方式来部署，也就是说一个bigkey可能会对其他实例造成影响，其后果不堪设想。图12-3演示了网络带宽bigkey占用的瞬间。

## 如何发现

`redis-cli --bigkeys` 可以命令统计bigkey的分布。

但是在生产环境中，开发和运维人员更希望自己可以定义bigkey的大小，而且更希望找到真正的bigkey都有哪些，这样才可以去定位、解决、优化问题。

判断一个key是否为bigkey，只需要执行 `debug object key` 查看serializedlength属性即可，它表示key对应的value序列化之后的字节数，

例如我们执行如下操作：

```
127.0.0.1:6379> debug object key
Value at:0x7fc06c1b1430 refcount:1 encoding:raw serializedlength:1256350 lru:11686193
lru_seconds_idle:20
```

可以发现serializedlength=11686193字节，约为1M，同时可以看到encoding是raw，也就是字符串类型。

那么可以通过strlen来看一下字符串的字节数为2247394字节，约为2MB：

```
127.0.0.1:6379> strlen key
(integer) 2247394
```

serializedlength不代表真实的字节大小，它返回对象使用RDB编码序列化后的长度，值会偏小，但是对于排查bigkey有一定辅助作用，因为不是每种数据结构都有类似strlen这样的方法。

## 实际生产的操作方式

在实际生产环境中发现bigkey的两种方式如下：

### 被动收集：

许多开发人员确实可能对bigkey不了解或重视程度不够，但是这种bigkey一旦大量访问，很可能就会带来命令慢查询和网卡跑满问题，开发人员通过对异常的分析通常能找到异常原因可能是bigkey，这种方式虽然不是被笔者推荐的，但是在实际生产环境中却大量存在，建议修改Redis客户端，当抛出异常时打印出所操作的key，方便排bigkey问题。


### 主动检测：

scan+debug object：如果怀疑存在bigkey，可以使用scan命令渐进的扫描出所有的key，分别计算每个key的serializedlength，找到对应bigkey进行相应的处理和报警，这种方式是比较推荐的方式。

## 如何删除

因为 redis 是单线程的，删除比较大的 keys 就会阻塞其他的请求。

# lazy free




# 参考资料

[从实现角度看redis lazy free的使用和注意事项](https://www.jianshu.com/p/47243770be53)

* any list
{:toc}