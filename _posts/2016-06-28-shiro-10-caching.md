---
layout: post
title: Shiro-10-caching 缓存
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 缓存

Shiro开发团队理解性能在许多应用程序中是至关重要的。

缓存是Shiro从第一天起就内置的一流功能，以确保安全操作保持尽可能快的速度。

然而，缓存作为一个概念是Shiro的基本部分，实现完整的缓存机制将超出安全框架的核心能力。

为此，Shiro的缓存支持基本上是一个抽象(包装)API，它将“位于”底层的生产缓存机制(例如Hazelcast、Ehcache、OSCache、Terracotta、Coherence、GigaSpaces、JBossCache等)之上。

这允许Shiro最终用户配置他们喜欢的任何缓存机制。

ps: 这个设计理念非常值得学习。

# 缓存API

Shiro有三个重要的缓存接口:

- CacheManager—所有缓存的主要管理器组件，它返回缓存实例。

- 缓存——维护键/值对

- 由希望接收和使用CacheManager实例的组件实现

CacheManager返回缓存实例，各种Shiro组件根据需要使用这些缓存实例来缓存数据。

任何Shiro实现CacheManagerAware的组件将自动接收配置的CacheManager，它可以用于获取缓存实例。

Shiro SecurityManager实现和所有AuthenticatingRealm和AuthorizingRealm实现实现了CacheManagerAware。

如果你在SecurityManager上设置了CacheManager，它会在实现CacheManagerAware的各个领域上设置它(OO委托)。

例如，在shiro.ini中:

shiro.ini CacheManager配置

```ini
securityManager.realms = $myRealm1, $myRealm2, ..., $myRealmN
...
cacheManager = my.implementation.of.CacheManager
...
securityManager.cacheManager = $cacheManager
# at this point, the securityManager and all CacheManagerAware
# realms have been set with the cacheManager instance
```

# 缓存管理器实现

Shiro提供了许多开箱即用的CacheManager实现，你可能会发现它们很有用，而不是你自己实现的。

## MemoryConstrainedCacheManager

MemoryConstrainedCacheManager是一种适合于单jvm生产环境的CacheManager实现。

它不是集群/分布式的，所以如果你的应用跨越多个JVM(例如，web应用运行在多个web服务器上)，并且你想要跨JVM访问缓存条目，你将需要使用分布式缓存实现。

MemoryConstrainedCacheManager管理MapCache实例，每个命名的缓存一个MapCache实例。

每个MapCache实例都有一个Shiro SoftHashMap支持，它可以根据应用程序的运行时内存约束/需求(通过利用JDK SoftReference实例)自动调整自身的大小。

因为MemoryConstrainedCacheManager可以根据应用程序的内存配置文件自动调整自身大小，所以在单jvm生产应用程序中使用它是安全的，也可以满足测试需求。

但是，它没有更高级的特性，如缓存条目生存时间或过期时间设置。对于这些更高级的缓存管理特性，您可能需要使用下面更高级的CacheManager。

MemoryConstrainedCacheManager shiro.ini配置示例

```ini
...
cacheManager = org.apache.shiro.cache.MemoryConstrainedCacheManager
...
securityManager.cacheManager = $cacheManager
```

# 授权缓存失效

最后请注意AuthorizingRealm有一个clearCachedAuthorizationInfo方法，子类可以调用该方法来清除缓存的特定帐户的authzInfo。

如果对应帐户的authz数据发生了更改(以确保下次authz检查将获取新数据)，则通常由自定义逻辑调用它。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

https://shiro.apache.org/reference.html

https://shiro.apache.org/session-management.html

* any list
{:toc}