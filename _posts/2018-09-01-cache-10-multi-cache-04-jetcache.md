---
layout: post
title:  Cache Travel-10-04-JetCache是一个基于Java的缓存系统封装，提供统一的API和注解来简化缓存的使用
date:  2018-09-01 12:24:42 +0800
categories: [Cache]
tags: [cache, redis, lru, sh]
published: true
---

# 手写 Redis 系列

[java从零手写实现redis（一）如何实现固定大小的缓存？](https://mp.weixin.qq.com/s/6J2K2k4Db_20eGU6xGYVTw)

[java从零手写实现redis（三）redis expire 过期原理](https://mp.weixin.qq.com/s/BWfBc98oLqhAPLN2Hgkwow)

[java从零手写实现redis（三）内存数据如何重启不丢失？](https://mp.weixin.qq.com/s/G41SRZQm1_0uQXBAGHAYbw)

[java从零手写实现redis（四）添加监听器](https://mp.weixin.qq.com/s/6pIG3l_wkXBwSuJvj_KwMA)

[java从零手写实现redis（五）过期策略的另一种实现思路](https://mp.weixin.qq.com/s/Atrd36UGds9_w_NFQDoEQg)

[java从零手写实现redis（六）AOF 持久化原理详解及实现](https://mp.weixin.qq.com/s/rFuSjNF43Ybxy-qBCtgasQ)

[java从零手写实现redis（七）LRU 缓存淘汰策略详解](https://mp.weixin.qq.com/s/X-OIqu_rgLskvbF2rZMP6Q)

[java从零开始手写redis（八）朴素 LRU 淘汰算法性能优化](https://mp.weixin.qq.com/s/H8gOujnlTinctjVQqW0ITA)

[java从零开始手写redis（九）LRU 缓存淘汰算法如何避免缓存污染](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-09-evict-lru-optimize2)

[java从零开始手写redis（十）缓存淘汰算法 LFU 最少使用频次](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-10-lfu)

[java从零开始手写redis（十一）缓存淘汰算法 COLOK 算法](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-11-clock)

[java从零开始手写redis（十二）过期策略如何实现随机 keys 淘汰](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-12-expire2)

[java从零开始手写redis（十三）redis渐进式rehash详解](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-13-redis-rehash)

[java从零开始手写redis（十四）JDK HashMap 源码解析](https://houbb.github.io/2018/09/12/java-hashmap)

[java从零开始手写redis（十四）JDK ConcurrentHashMap 源码解析](https://houbb.github.io/2018/09/12/java-concurrent-hashmap)

[java从零开始手写redis（十五）实现自己的 HashMap](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-15-write-hashmap)

[java从零开始手写redis（十六）实现渐进式 rehash map](https://houbb.github.io/2018/09/01/cache-09-cache-hand-write-16-rehash-map)

# 简介

JetCache是一个基于Java的缓存系统封装，提供统一的API和注解来简化缓存的使用。 

JetCache提供了比SpringCache更加强大的注解，可以原生的支持TTL、两级缓存、分布式自动刷新，还提供了Cache接口用于手工缓存操作。 

当前有四个实现，RedisCache、TairCache（此部分未在github开源）、CaffeineCache(in memory)和一个简易的LinkedHashMapCache(in memory)，要添加新的实现也是非常简单的。

全部特性:

- 通过统一的API访问Cache系统

- 通过注解实现声明式的方法缓存，支持TTL和两级缓存

- 通过注解创建并配置Cache实例

- 针对所有Cache实例和方法缓存的自动统计

- Key的生成策略和Value的序列化策略是可以配置的

- 分布式缓存自动刷新，分布式锁 (2.2+)

- 异步Cache API (2.2+，使用Redis的lettuce客户端时)

- Spring Boot支持

# 入门例子

## 创建缓存实例

通过 `@CreateCache` 注解创建一个缓存实例，默认超时时间是100秒

```java
@Autowired
private CacheManager cacheManager;

private Cache<Long, UserDO> userCache;

@PostConstruct
public void init() {
    QuickConfig qc = QuickConfig.newBuilder("userCache") // name用于统计信息展示名字
        .expire(Duration.ofSeconds(100))
        //.cacheType(CacheType.BOTH) // 创建一个两级缓存
        //.localLimit(100) // 本地缓存元素个数限制，只对CacheType.LOCAL和CacheType.BOTH有效
        //.syncLocal(true) // 两级缓存的情况下，缓存更新时发消息让其它JVM实例中的缓存失效，需要配置broadcastChannel才生效。
        .build();
    userCache = cacheManager.getOrCreateCache(qc);
}
```

用起来就像map一样：

```java
UserDO user = userCache.get(123L);
userCache.put(123L, user);
userCache.remove(123L);
```

## 创建方法缓存

使用 `@Cached` 方法可以为一个方法添加上缓存。

JetCache通过Spring AOP生成代理，来支持缓存功能。注解可以加在接口方法上也可以加在类方法上，但需要保证是个Spring bean。

```java
public interface UserService {
    @Cached(name="UserService.getUserById", expire = 3600)
    User getUserById(long userId);
}
```

## 基本配置（使用Spring Boot）

如果使用Spring Boot，可以按如下的方式配置（这里使用了jedis客户端连接redis，也可以使用lettuce客户端）。

### POM

```xml
<dependency>
    <groupId>com.alicp.jetcache</groupId>
    <artifactId>jetcache-starter-redis</artifactId>
    <version>${jetcache.latest.version}</version>
</dependency>
```

配置一个spring boot风格的application.yml文件，把他放到资源目录中

```yaml
jetcache:
  statIntervalMinutes: 15
  areaInCacheName: false
  local:
    default:
      type: linkedhashmap
      keyConvertor: fastjson
  remote:
    default:
      type: redis
      keyConvertor: fastjson2
      broadcastChannel: projectA
      valueEncoder: java
      valueDecoder: java
      poolConfig:
        minIdle: 5
        maxIdle: 20
        maxTotal: 50
      host: 127.0.0.1
      port: 6379
```

然后创建一个App类放在业务包的根下，EnableMethodCache，EnableCreateCacheAnnotation这两个注解分别激活Cached和CreateCache注解，其他和标准的Spring Boot程序是一样的。这个类可以直接main方法运行。

```java
package com.company.mypackage;

import com.alicp.jetcache.anno.config.EnableCreateCacheAnnotation;
import com.alicp.jetcache.anno.config.EnableMethodCache;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableMethodCache(basePackages = "com.company.mypackage")
@EnableCreateCacheAnnotation
public class MySpringBootApp {
    public static void main(String[] args) {
        SpringApplication.run(MySpringBootApp.class);
    }
}
```

## 未使用SpringBoot的配置方式

如果没有使用spring boot，可以按下面的方式配置（这里使用jedis客户端连接redis为例）。

```xml
<dependency>
    <groupId>com.alicp.jetcache</groupId>
    <artifactId>jetcache-anno</artifactId>
    <version>${jetcache.latest.version}</version>
</dependency>
<dependency>
    <groupId>com.alicp.jetcache</groupId>
    <artifactId>jetcache-redis</artifactId>
    <version>${jetcache.latest.version}</version>
</dependency>
```

配置了这个JetCacheConfig类以后，可以使用@CreateCache和@Cached注解。

```java
package com.company.mypackage;

import java.util.HashMap;
import java.util.Map;

import com.alicp.jetcache.anno.CacheConsts;
import com.alicp.jetcache.anno.config.EnableCreateCacheAnnotation;
import com.alicp.jetcache.anno.config.EnableMethodCache;
import com.alicp.jetcache.anno.support.GlobalCacheConfig;
import com.alicp.jetcache.anno.support.SpringConfigProvider;
import com.alicp.jetcache.embedded.EmbeddedCacheBuilder;
import com.alicp.jetcache.embedded.LinkedHashMapCacheBuilder;
import com.alicp.jetcache.redis.RedisCacheBuilder;
import com.alicp.jetcache.support.Fastjson2KeyConvertor;
import com.alicp.jetcache.support.JavaValueDecoder;
import com.alicp.jetcache.support.JavaValueEncoder;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.util.Pool;

@Configuration
@EnableMethodCache(basePackages = "com.company.mypackage")
@EnableCreateCacheAnnotation // deprecated in jetcache 2.7, 如果不用@CreateCache注解可以删除
@Import(JetCacheBaseBeans.class) //need since jetcache 2.7+
public class JetCacheConfig {

    @Bean
    public Pool<Jedis> pool(){
        GenericObjectPoolConfig pc = new GenericObjectPoolConfig();
        pc.setMinIdle(2);
        pc.setMaxIdle(10);
        pc.setMaxTotal(10);
        return new JedisPool(pc, "localhost", 6379);
    }

    //@Bean for jetcache <=2.6 
    //public SpringConfigProvider springConfigProvider() {
    //    return new SpringConfigProvider();
    //}

    @Bean
    public GlobalCacheConfig config(Pool<Jedis> pool){
    // public GlobalCacheConfig config(SpringConfigProvider configProvider, Pool<Jedis> pool){ // for jetcache <=2.5 
        Map localBuilders = new HashMap();
        EmbeddedCacheBuilder localBuilder = LinkedHashMapCacheBuilder
                .createLinkedHashMapCacheBuilder()
                .keyConvertor(FastjsonKeyConvertor.INSTANCE);
        localBuilders.put(CacheConsts.DEFAULT_AREA, localBuilder);

        Map remoteBuilders = new HashMap();
        RedisCacheBuilder remoteCacheBuilder = RedisCacheBuilder.createRedisCacheBuilder()
                .keyConvertor(Fastjson2KeyConvertor.INSTANCE)
                .valueEncoder(JavaValueEncoder.INSTANCE)
                .valueDecoder(JavaValueDecoder.INSTANCE)
                .broadcastChannel("projectA")
                .jedisPool(pool);
        remoteBuilders.put(CacheConsts.DEFAULT_AREA, remoteCacheBuilder);

        GlobalCacheConfig globalCacheConfig = new GlobalCacheConfig();
        // globalCacheConfig.setConfigProvider(configProvider); // for jetcache <= 2.5
        globalCacheConfig.setLocalCacheBuilders(localBuilders);
        globalCacheConfig.setRemoteCacheBuilders(remoteBuilders);
        globalCacheConfig.setStatIntervalMinutes(15);
        globalCacheConfig.setAreaInCacheName(false); 

        return globalCacheConfig;
    }
}
```

## 1、同其他开源框架的对比

| 核心功能       | JetCache（阿里）                        | J2Cache（OSChina）                    | L2Cache                              |
| -------------- | ------------------------------------ | ------------------------------------ | ------------------------------------ |
| 支持的缓存类型 | 一级缓存<br />二级缓存<br />混合缓存 | 一级缓存<br />二级缓存<br />混合缓存 | 一级缓存<br />二级缓存<br />混合缓存 |
| 解决的痛点问题 | 缓存击穿<br />缓存穿透               | 缓存击穿<br />缓存穿透               | 缓存击穿<br />缓存穿透               |
| 缓存一致性保证 | 支持                                 | 支持                                 | 支持                                 |
| 动态缓存配置   | 不支持                               | 不支持                               | 支持                                 |
| 自动热key探测  | 不支持                               | 不支持                               | 支持                                 |
| 缓存批量操作   | 不支持                               | 不支持                               | 支持                                 |
| 通用缓存层     | 不支持                               | 不支持                               | 支持                                 |
> 说明：上面表格的对比，数据正在整理中，后续会再校对一次。

- 从上面表格的对比可发现，`L2Cache` 的核心优势为三个点：`自动热key探测`、`缓存批量操作`、`通用缓存层`。
- 这三点优势是从实际业务开发中沉淀下来的能力，不仅解决了实现多级缓存的复杂性问题，还进一步屏蔽了业务维度的缓存操作的复杂性。
- 这样一来，原本需要资深开发者才能开发的功能，现在高级和中级开发者，甚至初级开发者都能轻松、高效、高质地进行开发。
- 如果在实际业务开发中，你也遇到开发难度高，难以维护，难以扩展的痛点问题，建议可以试试L2Cache。`反正接入成本低，试试又何妨？`

## 2、L2Cache 的二级缓存结构

1、L1：一级缓存，内存缓存，支持 Caffeine 和 Guava Cache。

2、L2：二级缓存，集中式缓存，支持 Redis。

3、混合缓存，指支持同时使用一级缓存和二级缓存。

由于大量的缓存读取会导致 L2 的网络成为整个系统的瓶颈，因此 L1 的目标是降低对 L2 的读取次数。避免使用独立缓存系统所带来的网络IO开销问题。L2 可以避免应用重启后导致的 L1数据丢失的问题，同时无需担心L1会增加太多的内存消耗，因为你可以设置 L1中缓存数据的数量。

说明：

L2Cache 满足CAP定理中的AP，也就是满足可用性和分区容错性，至于C(一致性)因为缓存的特性所以无法做到强一致性，只能尽可能的去做到一致性，保证最终的一致。

## 3、关键点

支持根据配置缓存类型来灵活的组合使用不同的Cache。

1、支持只使用一级缓存Caffeine 和 Guava Cache。

2、支持只使用二级缓存Redis。

3、支持同时使用一二级缓存Composite。

## 4、必知

若使用缓存，则必然可能出现不一致的情况。

也就是说，无法保证强一致性，只能保证最终一致性。

# 小结

https://github.com/xiaolyuh/layering-cache

https://github.com/xiaolyuh/layering-cache/wiki/%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86

* any list
{:toc}