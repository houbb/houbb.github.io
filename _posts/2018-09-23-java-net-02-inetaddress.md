---
layout: post
title:  Java Net-02-InetAddress
date:  2018-09-23 08:51:50 +0800
categories: [Java]
tags: [java, io, java-base, sf]
published: true
excerpt: Java 网络编程之 InetAddress
---

# 基础知识

## IP 地址

IP地址是由IP使用的32位或128位无符号数字，IP是一种较低级别的协议，UDP和TCP等协议都是在此基础上构建的。

IP地址体系结构由RFC 790:分配号、RFC 1918:私有internet的地址分配、RFC 2365:管理作用域的IP组播和RFC 2373: IP版本6寻址体系结构定义。

InetAddress的实例由IP地址和相应的主机名组成(取决于它是使用主机名构造的，还是已经执行了反向主机名解析)。

## 地址类型

### 单播

单个接口的标识符。

发送到单播地址的包被发送到由该地址标识的接口。

未指定的地址——也称为任何本地或通配符地址。它决不能分配给任何节点。它表示没有地址。

它的一个使用示例是bind的目标，它允许服务器在任何接口上接受客户机连接，以防服务器主机有多个接口。

未指定的地址不能用作IP包的目标地址。

环回地址——这是分配给环回接口的地址。任何发送到这个IP地址的内容都会循环出现，并成为本地主机上的IP输入。这个地址通常在测试客户端时使用。

### 多播

多播一组接口的标识符(通常属于不同的节点)。

发送到多播地址的包被发送到由该地址标识的所有接口。

## IP地址范围

链接本地地址被设计成用于在单个链路上寻址，用于诸如自动地址配置、邻居发现或不存在路由器等目的。

站点本地地址设计用于在不需要全局前缀的情况下在站点内部寻址。

全球地址在互联网上是唯一的。

## IP地址的文本表示

IP地址的文本表示是特定于地址族的。

IPv4地址格式请参考 [Inet4Address#格式](https://docs.oracle.com/javase/7/docs/api/java/net/Inet4Address.html#format);

IPv6地址格式，请参考 [Inet6Address#format](https://docs.oracle.com/javase/7/docs/api/java/net/Inet6Address.html#format)。

有两个系统属性影响IPv4和IPv6地址的使用。

## 主机名称解析

主机名到ip地址的解析是通过结合使用本地机器配置信息和网络命名服务(如域名系统(DNS)和网络信息服务(NIS))来完成的。

使用的特定命名服务默认情况下是本地机器配置的服务。对于任何主机名，都会返回其对应的IP地址。

反向名称解析意味着对于任何IP地址，都会返回与该IP地址关联的主机。

InetAddress类提供了将主机名解析为IP地址的方法，反之亦然。

## InetAddress缓存

InetAddress类有一个缓存，用于存储成功和失败的主机名解析。

默认情况下，在安装安全管理器时，为了防止DNS欺骗攻击，将永远缓存主机名解析为正数的结果。

如果没有安装安全管理器，默认行为是在有限的(依赖于实现的)时间内缓存条目。不成功的主机名解析的结果会缓存很短的时间(10秒)，以提高性能。

如果不需要默认行为，则可以将Java安全属性设置为不同的实时时间(TTL)值，以进行积极的缓存。同样，系统管理员可以在需要时配置不同的负缓存TTL值。

两个Java安全属性控制用于正负主机名解析缓存的TTL值:

- networkaddress.cache.ttl

指示从名称服务成功查找名称的缓存策略。该值指定为整数，以指示缓存成功查找所需的秒数。

默认设置是缓存特定于某个实现的时间段。值-1表示“永久缓存”。

- networkaddress.cache.negative。ttl(默认值:10)

指示从名称服务查找未成功名称的缓存策略。该值指定为整数，以指示为未成功查找缓存失败的秒数。

值为0表示“从不缓存”。值-1表示“永久缓存”。

# 代码示例

## 根据名字获取

- getByNameTest

```java
@Test
public void getByNameTest() throws UnknownHostException {
    InetAddress inetAddress = InetAddress.getByName("baidu.com");
    InetAddress inetAddress1 = InetAddress.getByName("220.181.57.216");

    System.out.println(inetAddress);
    System.out.println(inetAddress1);
}
```

- 日志

```
baidu.com/220.181.57.216
/220.181.57.216
```

## 获取所有信息

- getAllByNameTest

```java
@Test
public void getAllByNameTest() throws UnknownHostException {
    InetAddress[] inetAddress = InetAddress.getAllByName("baidu.com");
    System.out.println(Arrays.toString(inetAddress));
}
```

- 日志信息

```
[baidu.com/220.181.57.216, baidu.com/123.125.115.110]
```

## 获取本地地址

- getLocalHostTest

```java
@Test
public void getLocalHostTest() throws UnknownHostException {
    InetAddress localHost = InetAddress.getLocalHost();
    System.out.println(localHost);
}
```

- 日志

```
houbinbindeMacBook-Pro.local/192.168.1.103
```

# 参考资料

https://docs.oracle.com/javase/7/docs/api/java/net/InetAddress.html

https://blog.csdn.net/chenzheng_java/article/details/6248053

http://zzqrj.iteye.com/blog/544784

http://blog.51cto.com/androidguy/214818

https://openhome.cc/Gossip/JavaGossip-V2/InetAddress.htm

* any list
{:toc}