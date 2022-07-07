---
layout: post
title:  java 封神技能树
date:  2023-01-01 +0800
categories: [Java]
tags: [java, skill, sh]
published: true
---

# 盘古计划

就像每一位读书的人一样，书单都有读过的书和没读过的书。

下面就整理一份自己知道的相对完整的技能树列表。

后期将通过不断完善这个清单，来提升个人的技能。

这个列表看起来很多，实际上确实很多。

不过 80% 的知识个人已经学习过了，但是有一些需要继续深入学习。

自己没学过的要保持对知识的渴望，全部查缺补漏。

我称之为这次差缺补漏环节为【盘古计划】。希望自己在学习完之后，可以开天辟地，让知识体系清晰起来。


# 授权系列

shiro

spring-session

spring security

sso

auth2

ums-用户管理系统

pms-权限管理系统

审批流-用于权限/角色添加申请

分布式/单机任务调度系统

authing 三方校验服务

# 数据库系统

jdbc-oracle

jdbc-sqlserver

metadata

jdbc

jdbc-pool

sql 注入攻击

mybatis

explain

发展路线：

（1）代码生成

（2）元数据管理

（3）元数据文档生成

（4）基本的 crud，类似于 jpa

进阶：

手写 h2=>mysql

# 面向对象

- 什么是面向对象

[面向对象与面向过程 && 面向对象的三大基本特征(封装/继承/多态)](https://houbb.github.io/2020/07/19/java-basic-01-what-is-oo)

[其他编程范式](https://houbb.github.io/2020/07/19/java-basic-02-what-is-pp)

- 面向对象的基本原则

[open close 开闭原则](https://houbb.github.io/2017/03/14/design-pattern-33-open-close)

[LSP 里氏替换原则](https://houbb.github.io/2017/03/14/design-pattern-34-lsp)

[依赖倒置原则（Dependence Inversion Principle，DIP）](https://houbb.github.io/2017/03/14/design-pattern-35-dip)

[单一职责原则（Single Responsibility Principle，SRP）](https://houbb.github.io/2017/03/14/design-pattern-36-srp)

[接口隔离原则（Interface Segregation Principle，ISP）](https://houbb.github.io/2017/03/14/design-pattern-37-isp)

[迪米特法则（Law of Demeter，LoD）](https://houbb.github.io/2017/03/14/design-pattern-38-lod)

[合成复用原则（Composite Reuse Principle，CRP）](https://houbb.github.io/2017/03/14/design-pattern-39-crp)

- 值传递

[为什么说 Java 中只有值传递](https://houbb.github.io/2020/07/19/basic-03-value-pass-ref-pass)

# 基本数据类型

[8种基本数据类型详解](https://houbb.github.io/2020/07/19/java-basic-04-basic-type)

整型中byte、short、int、long的取值范围

自动拆装箱 自动拆装箱

如何正确定义接口的返回值(boolean/Boolean)类型及命名(success/Success)

什么是浮点型？什么是单精度和双精度？

为什么不能用浮点型表示金额？

## String

[String 字符串详解](https://houbb.github.io/2020/07/19/java-basic-05-string)

字符串的不可变性

String的长度限制

JDK 6和JDK 7中substring的原理及区别

replaceFirst、replaceAll、replace区别

String、StringBuilder和StingBuffer之间的区别与联系

String对“+”的重载

字符串拼接的几种方式和区别

String.valueOf和Integer.toString的区别

switch对String的支持

字符串池、Integer的缓存机制

常量池（运行时常量池、Class常量池）

intern

# Java中各种关键字

[native](https://houbb.github.io/2020/07/19/java-basic-06-native)

[transient](https://houbb.github.io/2018/09/13/java-transient)

[volatile](https://houbb.github.io/2018/07/27/jmm-05-volatile)

[synchronized](https://houbb.github.io/2018/07/25/java-concurrency-09-sync)

[final](https://houbb.github.io/2018/07/29/jmm-08-final)

[try...catch.finally](https://houbb.github.io/2019/04/16/java-base-try-catch-finally)

[static](https://houbb.github.io/2018/08/30/java-static)

[instanceof](https://houbb.github.io/2020/07/19/java-basic-07-instanceof)

# 枚举

枚举的用法

枚举的实现

枚举与单例

Enum类

Java枚举如何比较

switch对枚举的支持

枚举的序列化如何实现

枚举的线程安全性问题

# IO

字符流、字节流

输入流、输出流

字节流和字符流之间的相互转换

同步、异步

阻塞、非阻塞

Linux 5种IO模型

BIO、NIO和AIO的区别

三种IO的用法与原理

netty


# 反射

什么是反射

反射有什么作用

Class类

java.lang.reflect.*


# 注解

元注解

自定义注解

Java中常用注解使用

注解与反射的结合

如何自定义一个注解？


# 动态代理

静态代理

动态代理

动态代理和反射的关系

动态代理的几种实现方式

AOP


# 序列化

什么是序列化与反序列化

Java如何实现序列化与反序列化

Serializable 和 Externalizable 有何不同

为什么需要序列化

serialVersionUID

为什么serialVersionUID不能随便改

transient

序列化底层原理

序列化如何破坏单例模式

为什么说序列化并不安全


protobuf

fastjson

# 异常

Error和Exception

异常类型

异常相关关键字

正确处理异常

自定义异常

异常链

try-with-resources

finally和return的执行顺序


# 时间处理

时区

冬令时和夏令时

时间戳

Java中时间API(Java 8)

格林威治时间

CET、UTC、GMT、CST几种常见时间的含义和关系

SimpleDateFormat的线程安全性问题

Java 8中的时间处理

如何在东八区的计算机上获取美国时间

yyyy和YYYY有什么区别？


# 泛型

什么是泛型

类型擦除

泛型带来的问题

泛型中K T V E ？ object等的含义

泛型各种用法

限定通配符和非限定通配符

上下界限定符extends 和 super

List和原始类型List之间的区别?

List<?>和List之间的区别是什么?

# 单元测试

junit

junit和Spring的结合

junit5

mock

mockito

junit-perf

jmeter

data-factory

junit-gen-plugin

断言

测试覆盖率（全量+增量）


# 正则表达式

java.lang.util.regex.*

常用的Java工具库

apache-commons

google-guava

netty

# API&SPI

API

API和SPI的关系和区别

如何定义SPI

SPI的实现原理

# 编码方式

什么是ASCII？

Unicode

有了Unicode为啥还需要UTF-8

UTF8、UTF16、UTF32区别

有了UTF8为什么还需要GBK？

GBK、GB2312、GB18030之间的区别

URL编解码

Big Endian和Little Endian

如何解决乱码问题


# 语法糖

Java中语法糖原理、解语法糖

常见语法糖原理：switch 支持 String 与枚举、泛型、自动装箱与拆箱、方法变长参数、枚举、内部类、条件编译、 断言、数值字面量、for-each、try-with-resource、Lambda表达式、本地变量类型推断、record

---------------------------------------------
# 集合类

Collection和Collections的区别

常用集合类的使用

Set和List区别

ArrayList和LinkedList和Vector的区别

SynchronizedList和Vector的区别

Set如何保证元素不重复

HashMap、HashTable、ConcurrentHashMap区别

Java 8中Map相关的红黑树的引用背景、原理等

HashMap的容量、扩容、hash等原理

Java 8中stream相关用法

Apache集合处理工具类的使用

不同版本的JDK中HashMap的实现的区别以及原因

Arrays.asList获得的List使用时需要注意什么

Collection如何迭代

Enumeration和Iterator区别

如何在遍历的同时删除ArrayList中的元素

fail-fast 和 fail-safe

CopyOnWriteArrayList

ConcurrentSkipListMap

## Java 8

lambda表达式

Stream API

时间API

函数式编程

## 阅读源代码

String

Integer

Long

Enum

BigDecimal

ThreadLocal

ClassLoader & URLClassLoader

ArrayList & LinkedList

HashMap & LinkedHashMap & TreeMap & CouncurrentHashMap

HashSet & LinkedHashSet & TreeSet

-------------------------------------------

# Java并发编程

并发与并行

什么是并发

什么是并行

并发与并行的区别

线程

线程与进程的区别

线程的实现

线程的状态

线程优先级

线程调度

多线程如何Debug

守护线程

创建线程的多种方式

继承Thread类创建线程

实现Runnable接口创建线程

通过Callable和FutureTask创建线程

通过线程池创建线程

线程池

自己设计线程池

submit() 和 execute()

线程池原理

为什么不允许使用Executors创建线程池

线程安全

什么是线程安全

多级缓存和一致性问题

CPU时间片和原子性问题

指令重排和有序性问题

线程安全和内存模型的关系

happens-before

as-if-serial

锁

可重入锁

阻塞锁

乐观锁与悲观锁

数据库相关锁机制

分布式锁

无锁

CAS

CAS的ABA问题

锁优化

偏向锁

轻量级锁

重量级锁

锁消除

锁粗化

自旋锁

死锁

什么是死锁

死锁的原因

如何避免死锁

写一个死锁的程序

死锁问题如何排查

synchronized

synchronized是如何实现的？

synchronized和lock之间关系

不使用synchronized如何实现一个线程安全的单例

synchronized和原子性

synchronized和可见性

synchronized和有序性

volatile

编译器指令重排和CPU指令重排

volatile的实现原理

内存屏障

volatile和原子性

volatile和可见性

volatile和有序性

有了symchronized为什么还需要volatile

线程相关方法

start & run

sleep & wait

notify & notifyAll

ThreadLocal

ThreadLocal 原理

ThreadLocal 底层的数据结构

写代码解决生产者消费者问题

并发包

同步容器与并发容器

## 源码

Thread

Runnable

Callable

ReentrantLock

ReentrantReadWriteLock

Atomic*

Semaphore

CountDownLatch

ConcurrentHashMap

Executors

-----------------------------------------------------


# JMS

什么是Java消息服务

JMS消息传送模型

JMX

java.lang.management.*

javax.management.*

mq

rabbitmq

手写一个简易版本 mq

-----------------------------------------------------

# 底层篇

JVM

平台无关性

Java如何实现的平台无关性的

JVM还支持哪些语言

JVM内存结构

运行时数据区域

运行时数据区哪些是线程独享

堆和栈区别

方法区在不同版本JDK中的位置

堆外内存

TLAB

Java中的对象一定在堆上分配吗？

垃圾回收

GC算法：标记清除、引用计数、复制、标记压缩、分代回收、增量式回收

GC参数

对象存活的判定

垃圾收集器（CMS、G1、ZGC、Epsilon）

JVM参数及调优

-Xmx

-Xmn

-Xms

Xss

-XX:SurvivorRatio

-XX:PermSize

-XX:MaxPermSize

-XX:MaxTenuringThreshold

Java对象模型

oop-klass

对象头

HotSpot

即时编译器

编译优化

Java内存模型

计算机内存模型

缓存一致性

MESI协议

可见性

原子性

顺序性

happens-before

as-if-serial

内存屏障

synchronized

volatile

final

锁

虚拟机性能监控与故障处理工具

jps

jstack

jmap

jstat

jconsole

jinfo

jhat

javap

btrace

TProfiler

Arthas

类加载机制

classLoader

类加载过程是线程安全的吗？

类加载过程

双亲委派（破坏双亲委派）

模块化（jboss modules、osgi、jigsaw）

打包工具

jar、jlink、jpackage

编译与反编译

什么是编译

什么是反编译

编译工具：javac

反编译工具：javap 、jad 、CRF

JIT

JIT优化（逃逸分析、栈上分配、标量替换、锁优化）


ps: JVM 系列整理 + 手写 gc 算法

## 进阶篇

Java底层知识

字节码

class文件格式

CAFEBABE

位运算

用位运算实现加、减、乘、除、取余

------------------------------------------------------------------------------------------------


# 设计模式

## 设计模式的六大原则

开闭原则

里氏代换原则

依赖倒转原则

接口隔离原则

迪米特法则（最少知道原则）

合成复用原则

## 创建型设计模式

单例模式

抽象工厂模式

建造者模式

工厂模式

原型模式

结构型设计模式

适配器模式

桥接模式

装饰模式

组合模式

外观模式

享元模式

代理模式

行为型设计模式

模版方法模式

命令模式

迭代器模式

观察者模式

中介者模式

备忘录模式

解释器模式

状态模式

策略模式

责任链模式

访问者模式

单例的七种写法

懒汉——线程不安全

懒汉——线程安全

饿汉

饿汉——变种

静态内部类

枚举

双重校验锁

为什么推荐使用枚举实现单例？

三种工厂模式的区别及联系

简单工厂、工厂方法、模板工厂

会使用常用设计模式

适配器模式

策略模式

模板方法模式

观察者模式

外观模式

代理模式

不用synchronized和lock，实现线程安全的单例模式

nio和reactor设计模式

Spring中用到了哪些设计模式

# 网络编程知识

## 常用协议

tcp、udp、http、https

用Java实现FTP、SMTP协议

OSI七层模型

每一层的主要协议

TCP/UDP

三次握手与四次关闭

流量控制和拥塞控制

tcp粘包与拆包

TCP/IP

IPV4

IPV6

HTTP

http/1.0 http/1.1 http/2之间的区别

http和https的区别

http中 get和post区别

常见的web请求返回的状态码

404、302、301、500分别代表什么

用Java写一个简单的静态文件的HTTP服务器

http/2

Java RMI，Socket，HttpClient

cookie 与 session

cookie被禁用，如何实现session

了解nginx和apache服务器的特性并搭建一个对应的服务器

进程间通讯的方式

什么是CDN？如果实现？

## DNS

什么是DNS

记录类型:A记录、CNAME记录、AAAA记录等

域名解析

根域名服务器

DNS污染

DNS劫持

公共DNS：114 DNS、Google DNS、OpenDNS

代理

反向代理

正向代理

反向代理服务器



# 框架知识

Servlet

生命周期

线程安全问题

filter和listener

web.xml中常用配置及作用

Hibernate

什么是OR Mapping

Hibernate的缓存机制

Hibernate的懒加载

Hibernate/Ibatis/MyBatis之间的区别

MyBatis

Mybatis缓存机制

#{}和${}的区别

mapper中传递多个参数

Mybatis动态sql

Mybatis的延迟加载

Spring

Bean的初始化

AOP原理

实现Spring的IOC

spring四种依赖注入方式

Spring MVC

什么是MVC

Spring mvc与Struts mvc的区别

Spring Boot

Spring Boot 2.0

起步依赖

自动配置

Spring Boot的starter原理

自己实现一个starter

为什么Spring Boot可以通过main启动web项目

## 手写框架

rpc  DONE

spring ioc DONE

spring mvc ING

mybatis DONE

mq TODO

h2-database TODO


# 鉴权

Spring Security

shiro

sso

jwt

session

cookie

## 手写

privileage DONE

privileage-admin  待整理

# Spring Cloud

TODO: 待学习整理

服务发现与注册：Eureka、Zookeeper、Consul

负载均衡：Feign、Spring Cloud Loadbalance

服务配置：Spring Cloud Config

服务限流与熔断：Hystrix

服务链路追踪：Dapper

服务网关、安全、消息

----------------------------------------------

# 应用服务器知识

JBoss

tomcat

jetty

Weblogic


## 手写

手写 tomcat

手写 netty

# 工具

git & svn

maven & gradle

git技巧

分支合并

冲突解决

提交回滚

maven技巧

依赖树

依赖仲裁

Intellij IDEA

常用插件：Maven Helper、FindBugs-IDEA、阿里巴巴代码规约检测、GsonFormat、Lombok plugin、.ignore、Mybatis plugin


## 进阶

手写 maven 插件 DONE



# 新技术

## Java 9

Jigsaw

Jshell

Reactive Streams

## Java 10

局部变量类型推断

G1的并行Full GC

ThreadLocal握手机制

## Java 11

ZGC

Epsilon

增强var

## Java 12

Switch 表达式

## Java 13

Text Blocks

Dynamic CDS Archives

## Java 14

Java打包工具

更有价值的NullPointerException

record类型

# 其他进阶

响应式编程

Spring Boot 2.0

http/2

http/3

性能优化

使用单例

使用Future模式

使用线程池

选择就绪

减少上下文切换

减少锁粒度

数据压缩

结果缓存

Stream并行流

GC调优

JVM内存分配调优

SQL调优

线上问题分析

dump

线程Dump

内存Dump

gc情况

dump获取及分析工具

jstack

jstat

jmap

jhat

Arthas

dump分析死锁

dump分析内存泄露

自己编写各种outofmemory，stackoverflow程序

HeapOutOfMemory

Young OutOfMemory

MethodArea OutOfMemory

ConstantPool OutOfMemory

DirectMemory OutOfMemory

Stack OutOfMemory Stack OverFlow

Arthas

jvm相关

class/classloader相关

monitor/watch/trace相关

options

管道

后台异步任务

常见问题解决思路

内存溢出

线程死锁

类加载冲突

load飙高

CPU利用率飙高

慢SQL

使用工具尝试解决以下问题，并写下总结

当一个Java程序响应很慢时如何查找问题

当一个Java程序频繁FullGC时如何解决问题

如何查看垃圾回收日志

当一个Java应用发生OutOfMemory时该如何解决

如何判断是否出现死锁

如何判断是否存在内存泄露

使用Arthas快速排查Spring Boot应用404/401问题

使用Arthas排查线上应用日志打满问题

利用Arthas排查Spring Boot应用NoSuchMethodError

编译原理知识

编译与反编译

Java代码的编译与反编译

Java的反编译工具

javap

jad

CRF

即时编译器

编译器优化

# 操作系统知识

Linux的常用命令

find、grep、ps、cp、move、tar、head、tail、netstat、lsof、tree、wget、curl、ping、ssh、echo、free、top

进程间通信

服务器性能指标

load

CPU利用率

内存使用情况

qps

rt

进程同步

生产者消费者问题

哲学家就餐问题

读者写者问题

缓冲区溢出

分段和分页

虚拟内存与主存

虚拟内存管理

换页算法

# 数据库知识

MySql 执行引擎

MySQL 执行计划

如何查看执行计划

如何根据执行计划进行SQL优化

索引

Hash索引&B树索引

普通索引&唯一索引

聚集索引&非聚集索引

覆盖索引

最左前缀原则

索引下推

索引失效

回表

SQL优化

数据库事务和隔离级别

事务的ACID

事务的隔离级别与读现象

事务能不能实现锁的功能

编码方式

utf8

utf8mb4

为什么不要在数据库中使用utf8编码

行数统计

count(1)、count(*)、count(字段)的区别

为什么建议使用count(*)

数据库锁

共享锁、排它锁

行锁、表锁

乐观锁、悲观锁

使用数据库锁实现乐观锁

Gap Lock、Next-Key Lock

连接

内连接

左连接

右连接

数据库主备搭建

log

binlog

redolog

## 进阶

分布式：基于 Binlog 的解析，主从同步，高可用 etc


# 内存数据库

h2

分库分表

读写分离

常用的nosql数据库

redis

memcached

分别使用数据库锁、NoSql实现分布式锁

性能调优

数据库连接池

# 简单的数据结构

栈

队列

链表

数组

哈希表

栈和队列的相同和不同之处

栈通常采用的两种存储结构

两个栈实现队列，和两个队列实现栈

树

二叉树

字典树

平衡树

排序树

B树

B+树

R树

多路树

红黑树

堆

大根堆

小根堆

图

有向图

无向图

拓扑


# 算法

ps: 主要是排序+查询

稳定的排序算法

冒泡排序

插入排序

鸡尾酒排序

桶排序

计数排序

归并排序

原地归并排序

二叉排序树排序

鸽巢排序

基数排序

侏儒排序

图书馆排序

块排序

不稳定的排序算法

选择排序

希尔排序

Clover排序算法

梳排序

堆排序

平滑排序

快速排序

内省排序

耐心排序

时间复杂度&空间复杂度

如何计算时间复杂度和空间复杂度

常用排序算法的时间复杂度

深度优先和广度优先搜索

全排列

贪心算法

KMP算法

hash算法

海量数据处理

分治

hash映射

堆排序

双层桶划分

Bloom Filter

bitmap

数据库索引

mapreduce等


# 大数据知识

搜索

Solr

Lucene

ElasticSearch

流式计算

Storm

Spark

Flink

Hadoop，离线计算

HDFS

MapReduce

分布式日志收集

flume

kafka

logstash

数据挖掘

mahout


# 网络安全知识

XSS

XSS的防御

CSRF

注入攻击

SQL注入

XML注入

CRLF注入

文件上传漏洞

加密与解密

对称加密

非对称加密

哈希算法

加盐哈希算法

加密算法

MD5

SHA1

DES

AES

RSA

DSA

彩虹表

DDOS攻击

DOS攻击

DDOS攻击

memcached为什么可以导致DDos攻击

什么是反射型DDoS

如何通过Hash碰撞进行DOS攻击

SSL、TLS，HTTPS

脱库、洗库、撞库

## web 安全 系列

DONE

# 分布式

分布式与集群

数据一致性

服务治理

服务降级

分布式理论

2PC

3PC

CAP

BASE

分布式协调 Zookeeper

基本概念

常见用法

ZAB算法

脑裂

分布式事务

本地事务&分布式事务

可靠消息最终一致性

最大努力通知

TCC

Dubbo

服务注册

服务发现

服务治理

分布式数据库

怎样打造一个分布式数据库

什么时候需要分布式数据库

mycat

otter

HBase

分布式文件系统

mfs

fastdfs

分布式缓存

缓存一致性

缓存命中率

缓存冗余

限流降级

熔断器模式

Hystrix

Sentinal

resilience4j

分布式算法

拜占庭问题与算法

2PC

3PC

共识算法

Paxos 算法与 Raft 算法

ZAB算法

领域驱动设计

实体、值对象

聚合、聚合根

限界上下文

DDD如何分层

充血模型和贫血模型

DDD和微服务有什么关系


# 微服务

SOA

康威定律

ServiceMesh

sidecar

Docker & Kubernets

Spring Boot

Spring Cloud


# 高并发

分库分表

横向拆分与水平拆分

分库分表后的分布式事务问题

CDN技术

消息队列

RabbitMQ、RocketMQ、ActiveMQ、Kafka

各个消息队列的对比

多线程+无锁


# 高可用

双机架构

主备复制

主从复制

主主复制

异地多活

高性能

高性能数据库

读写分离

分库分表


# 高性能

缓存

缓存穿透

缓存雪崩

缓存热点

负载均衡

PPC、TPC


# 日志篇

logback

log4j

log4j2

实现原理  DONE

# 监控

监控什么
CPU
内存
磁盘I/O
网络I/O等
监控手段
进程监控
语义监控
机器资源监控
数据波动
监控数据采集
日志
埋点
Dapper

## 手写 

手写 APM 监控


# 负载均衡

负载均衡分类

二层负载均衡

三层负载均衡

四层负载均衡

七层负载均衡

负载均衡工具

LVS

Nginx

HAProxy

负载均衡算法

静态负载均衡算法：轮询，比率，优先权

动态负载均衡算法: 最少连接数,最快响应速度，观察方法，预测法，动态性能分配，动态服务器补充，服务质量，服务类型，规则模式。

# DNS

DNS原理

DNS的设计

CDN

数据一致性

# 扩展篇

PS: 了解即可。

云计算

IaaS

SaaS

PaaS

虚拟化技术

openstack

Serverlsess

搜索引擎

Solr

Lucene

Nutch

Elasticsearch

权限管理

Shiro

区块链

哈希算法

Merkle树

公钥密码算法

共识算法

Raft协议

Paxos 算法与 Raft 算法

拜占庭问题与算法

消息认证码与数字签名

比特币

挖矿

共识机制

闪电网络

侧链

热点问题

分叉

以太坊

超级账本

人工智能

数学基础

机器学习

人工神经网络

深度学习

应用场景

常用框架

TensorFlow

DeepLearning4J

IoT

量子计算

AR & VR

# 一些值得学习的技术

云原生学习 + CLOUD

ES Lucene

AI 深度学习

- 比特币 

《精通比特币》

《从区块链到信用社会》

《区块链原理设计与应用》

IOT

Security  安全


# 其他语言

Groovy

Kotlin

Python

Go

NodeJs

Swift

Rust

# 工具

[jetbrains-agent.zip](https://github.com/houbb/resource/files/5156552/jetbrains-agent.zip)

# 基础

数据结构

算法

设计模式    Done

JVM     Done

# 框架

SpringBoot

SpringCloud=SpringBoot+RPC+...

Shiro

OAuth2

- 通讯

WebSocket

t-io

# 工具

抓包: Fiddler

接口测试：[Postman](https://houbb.github.io/2018/11/28/web-api-ci)

[Lombok](https://houbb.github.io/2018/08/01/lombok)

# 并发

Thread Done
 
手写线程池 Done

Executor 框架  Done

Fork/Join Done

# 网络通讯

协议    Done

Socket  Done

Netty/Mina  Doing 

# 服务器

JBoss

Tomcat

Jetty

Nginx

F5

# 数据的存储

## 缓存

Redis 

Guava Cache 

Bloom Filter

## 数据库

数据库的原理+手写

数据库索引

数据的存储：列式存储+数据仓库

Oracle/SQL Server 

MySQL 深入学习

## 内存性数据库

H2

## NoSQL

Mongo

# 文件服务器

存储大量内存的文件

# 查询引擎

查询引擎：ES+luenece

Solr

# 分布式框架

## RPC

- 负载均衡

- 服务的发现

## MQ

手写 MQ 

# Devops

Test 相关：Junit

VSC 相关：Git/Svn

CI 相关:    Jenkines

Maven 相关：手写 maven 插件

QA: Sonar/Alibaba

自动化测试+部署+编程?

文档：Swagger2/idoc

虚拟化：Docker/K8

# 分布式相关

## 理论

CAP 

hash

一致性

分布式事物

分布式 ID

分布式数据一致性

负载均衡

## 数据库

DRDS

TIDB

Hadoop

## 大数据计算

Flink

# 最新技术

AI

Bit-coin

BIG-DATA

Cloud

5G


# 开源项目研读

快速开发平台  renren-fast

IM: SpringBootLayIM

秒杀：miaosha


# 职业规划

- 自媒体

引流+推广

- 全栈

页面设计+产品业务知识

# 拓展阅读

[java 书籍]()

# 参考资料

http://www.cnblogs.com/gbin1/p/7456428.html

https://blog.csdn.net/justloveyou_/article/details/69055978

http://www.sohu.com/a/192117748_99994950

http://www.sohu.com/a/193220998_99994950

https://mp.weixin.qq.com/s/uRZQ7I7kEmxuDsEO7BjzQQ

https://mp.weixin.qq.com/s/f_JtoVGNSwkJt_h2fEAtWg

# 架构师之路

> [架构师之路](https://mp.weixin.qq.com/s/CPUaB60pue0Zf3fUL9xqvw)

# 参考资料

[Java 工程师成神之路](https://juejin.im/post/5e93c34be51d4546cf778291)

* any list
{:toc}