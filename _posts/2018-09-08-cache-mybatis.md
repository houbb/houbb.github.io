---
layout: post
title:  Mybatis Cache
date:  2018-09-08 11:11:06 +0800
categories: [Cache]
tags: [cache, mybatis, sh]
published: true
excerpt: Mybatis 一级缓存，二级缓存详解。
---

# Mybatis 缓存

## 概念

MyBatis的缓存分为一级缓存和二级缓存，两种缓存的缓存粒度是一样的，都是对应一条sql查询语句，但是二者的生命周期是不一样的，一级缓存的生命周期是SqlSession对象的使用期间，随着SqlSession对象的死亡而消失；

二级缓存的生命周期是同 MyBatis 应用一样长的。

# 一级缓存

[官方配置](http://www.mybatis.org/mybatis-3/configuration.html#settings)

## 开启情况

默认情况下是没有开启缓存的,除了局部的 session 缓存。

ps: 最坑的是，这个 session 级别的缓存还是无法关闭的。


# 二级缓存

[二级缓存](http://www.mybatis.org/mybatis-3/zh/sqlmap-xml.html#cache)

## 开启方式

要开启二级缓存,你需要在你的 SQL 映射文件中添加一行:

```xml
<cache/>
```

字面上看就是这样。这个简单语句的效果如下:

- 映射语句文件中的所有 select 语句将会被缓存。

- 映射语句文件中的所有 insert,update 和 delete 语句会刷新缓存。

- 缓存会使用 Least Recently Used(LRU,最近最少使用的)算法来收回。

- 根据时间表(比如 no Flush Interval,没有刷新间隔), 缓存不会以任何时间顺序 来刷新。

- 缓存会存储列表集合或对象(无论查询方法返回什么)的 1024 个引用。

- 缓存会被视为是 read/write(可读/可写) 的缓存,意味着对象检索不是共享的,而且可以安全地被调用者修改,而不干扰其他调用者或线程所做的潜在修改。

## 配置的调整

当然上述都有默认参数，我们可以根据自己的需要进行相应的调整。

```xml
<cache
  eviction="FIFO"
  flushInterval="60000"
  size="512"
  readOnly="true"/>
```

| 序号 | 参数 | 说明 | 默认值 |
|:---|:---|:---|:---|
| 1 | eviction | 收回策略 | LRU |
| 2 | flushInterval | 刷新间隔 | 默认情况是不设置,也就是没有刷新间隔,缓存仅仅调用语句时刷新。 |
| 3 | size | 指缓存多少个对象 | 1024 |
| 4 | readOnly | 是否只读。如果为true，则所有相同的sql语句返回的是同一个对象（有助于提高性能，但并发操作同一条数据时，可能不安全），如果设置为false，则相同的sql，后面访问的是cache的clone副本。|  false |

### 收回策略

- LRU – 最近最少使用的:移除最长时间不被使用的对象。

- FIFO – 先进先出:按对象进入缓存的顺序来移除它们。

- SOFT – 软引用:移除基于垃圾回收器状态和软引用规则的对象。

- WEAK – 弱引用:更积极地移除基于垃圾收集器状态和弱引用规则的对象。


# 自定义缓存

你也可以通过实现你自己的缓存或为其他第三方缓存方案 创建适配器来完全覆盖缓存行为。

ps: 实际使用的时候，一般都在 service 层做缓存，不在 mybatis 这一层做缓存。

```xml
<cache type="com.domain.something.MyCustomCache"/>
```

## 接口

type 属性指定的类必须实现 `org.mybatis.cache.Cache` 接口。

```java
public interface Cache {
  String getId();
  int getSize();
  void putObject(Object key, Object value);
  Object getObject(Object key);
  boolean hasKey(Object key);
  Object removeObject(Object key);
  void clear();
}
```

## 配置

要配置你的缓存, 简单和公有的 JavaBeans 属性来配置你的缓存实现, 而且是通过 cache 元素来传递属性。

比如, 下面代码会在你的缓存实现中调用一个称为 `setCacheFile(String file)` 的方法:

```xml
<cache type="com.domain.something.MyCustomCache">
  <property name="cacheFile" value="/tmp/my-custom-cache.tmp"/>
</cache>
```

可以使用所有简单类型作为 JavaBeans 的属性,MyBatis 会进行转换。 

也可以使用 placeholder(eg: `${cache.file}` ) 去定义配置。

## select 的缓存配置

```xml
<select
  flushCache="false"
  useCache="true"/>
```

| 序号 | 参数 | 说明 | 默认值 |
|:---|:---|:---|:---|
| 1 | flushCache | 将其设置为 true，任何时候只要语句被调用，都会导致本地缓存和二级缓存都会被清空 | false |
| 2 | useCache | 将其设置为 true，将会导致本条语句的结果被二级缓存 | 对 select 元素为 true |

- 最佳实践

设置 `flushCache=true;` 保证一个 sqlSession 中的数据都是最新的。

不要使用 mybatis 的二级缓存。

- localCacheScope

还有一种针对同一 session 会出现查询问题的解决方式：

`localCacheScope=STATEMENT;`

MyBatis 利用本地缓存机制（Local Cache）防止循环引用（circular references）和加速重复嵌套查询。 
默认值为 SESSION，这种情况下会缓存一个会话中执行的所有查询。 
若设置值为 STATEMENT，本地会话仅用在语句执行上，对相同 SqlSession 的不同调用将不会共享数据。

- 历史教训

[MyBatis 事务操作中一级缓存带来的坑](http://tanchao90.com/mybatis-cache-pit/)

## 钩子函数

从3.4.2版本开始，MyBatis已经支持在所有属性设置完毕以后可以调用一个初始化方法。如果你想要使用这个特性，请在你的自定义缓存类里实现 `org.apache.ibatis.builder.InitializingObject` 接口。

- InitializingObject

```java
public interface InitializingObject {
  void initialize() throws Exception;
}
```

# 参照缓存

这个特殊命名空间的唯一缓存会被使用或者刷新相同命名空间内的语句。

也许将来的某个时候,你会想在命名空间中共享相同的缓存配置和实例。

在这样的 情况下你可以使用 `cache-ref` 元素来引用另外一个缓存。

```xml
<cache-ref namespace="com.someone.application.data.SomeMapper"/>
```

# 拓展阅读

[mybatis](https://houbb.github.io/2016/07/27/mybatis)

[mybatis-plus](https://houbb.github.io/2018/08/19/mybatis-plus)

# mybatis 缓存实战

![mybatis 缓存实战](https://houbb.github.io/2018/09/08/cache-mybatis-in-action)

# 参考资料

- mybatis

[聊聊 MyBatis 缓存机制](https://tech.meituan.com/mybatis_cache.html)

[Mybatis 3.0 缓存功能的使用](https://www.cnblogs.com/yjmyzz/p/use-cache-in-mybatis.html)

[Mybatis 缓存功能配置](https://www.cnblogs.com/jabnih/p/5705565.html)

[mybatis 缓存机制](https://www.zhihu.com/question/40718470)

[MyBatis实战缓存机制设计与原理解析](https://mp.weixin.qq.com/s/YaM87e9WxSeUH-4sg0qq0w)

- 陷阱

[去除 mybatis 二级缓存](http://blog.51cto.com/1008610086/1431219)

[Mybatis Local Cache陷阱](https://segmentfault.com/a/1190000008207977)

- source code

[源码解读 MyBatis 的缓存](https://www.cnblogs.com/fangjian0423/p/mybatis-cache.html)

* any list
{:toc}