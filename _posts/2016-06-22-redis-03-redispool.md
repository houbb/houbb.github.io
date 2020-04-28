---
layout: post
title: Redis-03-redis 整合 spring 常见写法
date:  2016-10-23 09:35:04 +0800
categories: [SQL]
tags: [redis, cache, nosql]
published: true
---

# 背景

有时候我们需要使用 spring 整合 redis。

那应该怎么实现呢？

# 最简单的 jedis

## maven

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>3.2.0</version>
</dependency>
```

## 连接单点

以  aliyun redis 为例子。

```java
Jedis jedis = new Jedis("ALIYUNADDRESS.aliyuncs.com", 6379);
jedis.auth("PASSWORD");
```

## 连接集群

```java
// 指定配置信息
JedisPoolConfig config = new JedisPoolConfig();
config.setMaxTotal(60000);//设置最大连接数
config.setMaxIdle(1000); //设置最大空闲数
config.setMaxWaitMillis(3000);//设置超时时间
config.setTestOnBorrow(true);

//创建一个 JedisCluster 对象
Set<HostAndPort> nodes = new HashSet<>();
nodes.add(new HostAndPort("xxx.xxx.xxx.1", 6379));
nodes.add(new HostAndPort("xxx.xxx.xxx.2", 6379));
nodes.add(new HostAndPort("xxx.xxx.xxx.3", 6379));

//jedisCluster在系统中是单例的。
final String password = "PASSWORD";
JedisCluster jedisCluster = new JedisCluster(nodes, 3000, 3000, 10, password, config);
```

当然这里你可以采用 spring 的写法

# spring-data-redis 的写法

## maven 引入

```xml
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-redis</artifactId>
    <version>2.2.6.RELEASE</version>
</dependency>
```

## 代码编写

```java
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisClusterConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisNode;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import redis.clients.jedis.JedisPoolConfig;

import java.net.UnknownHostException;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class RedisConfig {

    @Value("${redis.address}")
    private String redisAddress;

    @Value("${redis.password}")
    private String password;

    @Value("${redis.timeout:5000}")
    private int timeout;

    @Value("${redis.maxRedirects:5}")
    private int maxRedirects;

    @Value("${redis.minIdle:20}")
    private int minIdle;

    @Value("${redis.maxIdle:100}")
    private int maxIdle;

    @Value("${redis.maxTotal:200}")
    private int maxTotal;

    @Value("${redis.maxWaitMillis:100000}")
    private int maxWaitMillis;

    @Value("${redis.ssl:false}")
    private boolean ssl;

    @Bean(value = "redisTemplate")
    public RedisTemplate<Object, Object> redisTemplate(@Qualifier("jedisConnectionFactory") RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<Object, Object> redisTemplate = new RedisTemplate<Object, Object>();
        redisTemplate.setConnectionFactory(redisConnectionFactory);
        return redisTemplate;
    }

    @Bean(value = "stringRedisTemplate")
    public StringRedisTemplate stringRedisTemplate(@Qualifier("jedisConnectionFactory")
            RedisConnectionFactory redisConnectionFactory)
            throws UnknownHostException {
        StringRedisTemplate template = new StringRedisTemplate();
        template.setConnectionFactory(redisConnectionFactory);
        return template;
    }

    @Bean(value = "jedisConnectionFactory")
    public JedisConnectionFactory jedisConnectionFactory() {
        JedisConnectionFactory jedisConnectionFactory;
        if (redisAddress.contains("redis.rds.aliyuncs.com")) {
            int index = redisAddress.lastIndexOf(':');
            String redisAddressNew = redisAddress.substring(0, index);
            int port = Integer.parseInt(redisAddress.substring(index + 1));

            jedisConnectionFactory = new JedisConnectionFactory();
            jedisConnectionFactory.setHostName(redisAddressNew);
            jedisConnectionFactory.setPort(port);
            jedisConnectionFactory.setPoolConfig(jedisPoolConfig());
        }else{
            RedisClusterConfiguration redisClusterConfiguration = new RedisClusterConfiguration();
            redisClusterConfiguration.setClusterNodes(getRedisTemplateAddress(redisAddress));
            redisClusterConfiguration.setMaxRedirects(maxRedirects);
            jedisConnectionFactory = new JedisConnectionFactory(redisClusterConfiguration, jedisPoolConfig());
        }
        jedisConnectionFactory.setTimeout(timeout);
        //设置密码
        jedisConnectionFactory.setPassword(password);
        if(ssl) {
            jedisConnectionFactory.setUseSsl(ssl);
        }
        return jedisConnectionFactory;
    }

    private JedisPoolConfig jedisPoolConfig() {
        JedisPoolConfig jedisPoolConfig = new JedisPoolConfig();
        jedisPoolConfig.setMaxTotal(maxTotal);
        jedisPoolConfig.setMinIdle(minIdle);
        jedisPoolConfig.setMaxIdle(maxIdle);
        jedisPoolConfig.setMaxWaitMillis(maxWaitMillis);
        return jedisPoolConfig;
    }

    private Set<RedisNode> getRedisTemplateAddress(String s) {
        Set<RedisNode> nodes = new HashSet<>();
        for (String hoststuff : s.split("(?:\\s|,)+")) {
            if ("".equals(hoststuff)) {
                continue;
            }

            int finalColon = hoststuff.lastIndexOf(':');
            if (finalColon < 1) {
                throw new IllegalArgumentException("Invalid server ``" + hoststuff
                        + "'' in list:  " + s);
            }
            String hostPart = hoststuff.substring(0, finalColon);
            String portNum = hoststuff.substring(finalColon + 1);
            nodes.add(new RedisNode(hostPart, Integer.parseInt(portNum)));
        }
        return nodes;
    }
}
```

## 优缺点

这种代码的写法是可以兼容多种连接方式。

缺点就在于 spring-data-redis 对 spring 和 jedis 的版本有一定的要求。

对于历史包袱比较重的写法，有时候我们想引入这个整个调试的过程将会异常痛苦。

所以可以根据实际情况选择较为简单的写法。

# 直接整合 jedisPool 的写法

## maven 

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>3.2.0</version>
</dependency>
```

spring 的依赖一般，根据项目已有的引入即可。

## 配置

```xml
<bean id="jedisPoolConfig" class="redis.clients.jedis.JedisPoolConfig">
    <property name="maxTotal" value="${redis.maxTotal}"/>
    <property name="minIdle" value="${redis_minIdle}"/>
    <property name="maxIdle" value="${redis_maxIdle}"/>
    <property name="maxWaitMillis" value="${redis_maxWaitMillis}"/>
</bean>
<bean id="jedisPool" class="redis.clients.jedis.JedisPool">
    <!--(final GenericObjectPoolConfig poolConfig, final String host, int port, int timeout, final String password)-->
    <constructor-arg index="0" ref="jedisPoolConfig"/>
    <constructor-arg index="1" value="${redis_host}"/>
    <constructor-arg index="2" value="${redis_port:6379}"/>
    <constructor-arg index="3" value="${redis_timeout:5000}"/>
    <constructor-arg index="4" value="${redis_password}"/>
</bean>
```

这里的初始化也可以替换为基于 name 的等都可以。

根据自己的实际需求选择即可。

* any list
{:toc}